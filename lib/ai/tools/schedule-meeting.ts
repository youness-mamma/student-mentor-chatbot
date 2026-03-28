import { tool } from "ai";
import { z } from "zod";
import type { AppSession } from "@/lib/auth";
import { getValidAccessToken } from "@/lib/google";

const CALENDAR_API = "https://www.googleapis.com/calendar/v3";

type ScheduleMeetingProps = {
  session: AppSession;
};

export const scheduleMeeting = ({ session }: ScheduleMeetingProps) =>
  tool({
    description:
      "Schedule a Google Calendar event with a Google Meet video link. Use this when the user wants to schedule a meeting, mentoring session, study group, or any video call. The user must have connected their Google Calendar first.",
    inputSchema: z.object({
      summary: z.string().describe("Title of the meeting"),
      description: z
        .string()
        .optional()
        .describe("Description or agenda for the meeting"),
      date: z
        .string()
        .describe(
          "Date of the meeting in YYYY-MM-DD format, e.g. 2026-03-28"
        ),
      startTime: z
        .string()
        .describe("Start time in HH:MM format (24h), e.g. 14:00"),
      endTime: z
        .string()
        .describe("End time in HH:MM format (24h), e.g. 15:00"),
      attendees: z
        .array(z.string())
        .optional()
        .describe("List of attendee email addresses"),
    }),
    execute: async ({ summary, description, date, startTime, endTime, attendees }) => {
      const accessToken = await getValidAccessToken(session.user.id);

      if (!accessToken) {
        return {
          error:
            "Google Calendar is not connected. Please connect it first from the user menu in the sidebar.",
        };
      }

      const startDateTime = `${date}T${startTime}:00`;
      const endDateTime = `${date}T${endTime}:00`;

      const event = {
        summary,
        description: description ?? "",
        start: { dateTime: startDateTime, timeZone: "UTC" },
        end: { dateTime: endDateTime, timeZone: "UTC" },
        attendees: attendees?.map((email) => ({ email })) ?? [],
        conferenceData: {
          createRequest: {
            requestId: crypto.randomUUID(),
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
      };

      const res = await fetch(
        `${CALENDAR_API}/calendars/primary/events?conferenceDataVersion=1`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Calendar create error:", errorText);
        return { error: "Failed to create the meeting. Please try again." };
      }

      const created = await res.json();

      const meetLink = created.conferenceData?.entryPoints?.find(
        (e: { entryPointType: string }) => e.entryPointType === "video"
      )?.uri;

      return {
        success: true,
        summary: created.summary,
        date,
        startTime,
        endTime,
        meetLink: meetLink ?? "No Meet link generated",
        calendarLink: created.htmlLink,
        attendees: attendees ?? [],
      };
    },
  });
