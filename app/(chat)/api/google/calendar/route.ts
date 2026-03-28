import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { getValidAccessToken } from "@/lib/google";

const CALENDAR_API = "https://www.googleapis.com/calendar/v3";

// GET — list upcoming events
export async function GET() {
  const session = await getAuth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accessToken = await getValidAccessToken(session.user.id);
  if (!accessToken) {
    return NextResponse.json(
      { error: "Google Calendar not connected" },
      { status: 403 }
    );
  }

  const now = new Date().toISOString();
  const params = new URLSearchParams({
    timeMin: now,
    maxResults: "20",
    singleEvents: "true",
    orderBy: "startTime",
  });

  const res = await fetch(
    `${CALENDAR_API}/calendars/primary/events?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!res.ok) {
    const error = await res.text();
    console.error("Calendar API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }

  const data = await res.json();
  return NextResponse.json(data.items ?? []);
}

// POST — create event with Google Meet
export async function POST(request: Request) {
  const session = await getAuth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accessToken = await getValidAccessToken(session.user.id);
  if (!accessToken) {
    return NextResponse.json(
      { error: "Google Calendar not connected" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { summary, description, startTime, endTime, attendees } = body;

  if (!summary || !startTime || !endTime) {
    return NextResponse.json(
      { error: "summary, startTime, and endTime are required" },
      { status: 400 }
    );
  }

  const event = {
    summary,
    description: description ?? "",
    start: { dateTime: startTime, timeZone: "UTC" },
    end: { dateTime: endTime, timeZone: "UTC" },
    attendees: attendees?.map((email: string) => ({ email })) ?? [],
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
    const error = await res.text();
    console.error("Calendar create error:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }

  const created = await res.json();

  return NextResponse.json({
    id: created.id,
    summary: created.summary,
    htmlLink: created.htmlLink,
    meetLink: created.conferenceData?.entryPoints?.find(
      (e: { entryPointType: string }) => e.entryPointType === "video"
    )?.uri,
    start: created.start,
    end: created.end,
  });
}
