import { tool } from "ai";
import { z } from "zod";
import type { AppSession } from "@/lib/auth";
import { getValidAccessToken } from "@/lib/google";

const CALENDAR_API = "https://www.googleapis.com/calendar/v3";

type ListEventsProps = {
  session: AppSession;
};

export const listEvents = ({ session }: ListEventsProps) =>
  tool({
    description:
      "List upcoming Google Calendar events. Use this when the user wants to see their schedule, find a specific event, or before rescheduling a meeting. Returns event IDs needed for rescheduling.",
    inputSchema: z.object({
      maxResults: z
        .number()
        .optional()
        .default(10)
        .describe("Number of events to return (default 10)"),
      query: z
        .string()
        .optional()
        .describe("Search term to filter events by title"),
    }),
    execute: async ({ maxResults, query }) => {
      const accessToken = await getValidAccessToken(session.user.id);

      if (!accessToken) {
        return {
          error:
            "Google Calendar is not connected. Please connect it first from the user menu in the sidebar.",
        };
      }

      const now = new Date().toISOString();
      const params = new URLSearchParams({
        timeMin: now,
        maxResults: String(maxResults ?? 10),
        singleEvents: "true",
        orderBy: "startTime",
      });

      if (query) {
        params.set("q", query);
      }

      const res = await fetch(
        `${CALENDAR_API}/calendars/primary/events?${params}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!res.ok) {
        return { error: "Failed to fetch events." };
      }

      const data = await res.json();
      const events = (data.items ?? []).map(
        (e: {
          id: string;
          summary?: string;
          start?: { dateTime?: string; date?: string };
          end?: { dateTime?: string; date?: string };
          htmlLink?: string;
          conferenceData?: {
            entryPoints?: { entryPointType: string; uri: string }[];
          };
        }) => ({
          id: e.id,
          title: e.summary ?? "(No title)",
          start: e.start?.dateTime ?? e.start?.date,
          end: e.end?.dateTime ?? e.end?.date,
          calendarLink: e.htmlLink,
          meetLink: e.conferenceData?.entryPoints?.find(
            (ep) => ep.entryPointType === "video"
          )?.uri,
        })
      );

      return { events, count: events.length };
    },
  });
