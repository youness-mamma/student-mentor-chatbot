import { tool } from "ai";
import { z } from "zod";
import type { AppSession } from "@/lib/auth";
import { getValidAccessToken } from "@/lib/google";

const CALENDAR_API = "https://www.googleapis.com/calendar/v3";

type RescheduleMeetingProps = {
  session: AppSession;
};

export const rescheduleMeeting = ({ session }: RescheduleMeetingProps) =>
  tool({
    description:
      "Reschedule an existing Google Calendar event to a new date/time. Use listEvents first to find the event ID, then use this tool to change its time. Can also update the title or description.",
    inputSchema: z.object({
      eventId: z
        .string()
        .describe("The Google Calendar event ID (get this from listEvents)"),
      date: z
        .string()
        .describe("New date in YYYY-MM-DD format"),
      startTime: z
        .string()
        .describe("New start time in HH:MM format (24h)"),
      endTime: z
        .string()
        .describe("New end time in HH:MM format (24h)"),
      summary: z
        .string()
        .optional()
        .describe("New title (leave empty to keep the current title)"),
      description: z
        .string()
        .optional()
        .describe("New description (leave empty to keep the current one)"),
    }),
    execute: async ({ eventId, date, startTime, endTime, summary, description }) => {
      const accessToken = await getValidAccessToken(session.user.id);

      if (!accessToken) {
        return {
          error:
            "Google Calendar is not connected. Please connect it first from the user menu in the sidebar.",
        };
      }

      const updates: Record<string, unknown> = {
        start: { dateTime: `${date}T${startTime}:00`, timeZone: "UTC" },
        end: { dateTime: `${date}T${endTime}:00`, timeZone: "UTC" },
      };

      if (summary) updates.summary = summary;
      if (description) updates.description = description;

      // First verify the event exists
      const getRes = await fetch(
        `${CALENDAR_API}/calendars/primary/events/${encodeURIComponent(eventId)}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!getRes.ok) {
        return {
          error: `Event not found (ID: ${eventId}). Use listEvents to find the correct event ID.`,
        };
      }

      const res = await fetch(
        `${CALENDAR_API}/calendars/primary/events/${encodeURIComponent(eventId)}?conferenceDataVersion=1`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Calendar reschedule error:", errorText);
        return { error: "Failed to reschedule the event. Make sure the event ID is correct." };
      }

      const updated = await res.json();

      const meetLink = updated.conferenceData?.entryPoints?.find(
        (e: { entryPointType: string }) => e.entryPointType === "video"
      )?.uri;

      return {
        success: true,
        summary: updated.summary,
        date,
        startTime,
        endTime,
        meetLink: meetLink ?? null,
        calendarLink: updated.htmlLink,
      };
    },
  });
