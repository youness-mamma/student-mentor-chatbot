import { tool } from "ai";
import { z } from "zod";
import type { AppSession } from "@/lib/auth";
import { getStaffById, getValidStaffAccessToken } from "@/lib/db/staff-queries";

const CALENDAR_API = "https://www.googleapis.com/calendar/v3";

type BookAppointmentProps = {
  session: AppSession;
};

export const bookAppointment = ({ session }: BookAppointmentProps) =>
  tool({
    description:
      "Book an appointment with a staff member. Creates a calendar event on the staff member's Google Calendar and includes a Google Meet link for video calls. Use this after the student picks a time slot from getStaffAvailability.",
    inputSchema: z.object({
      staffId: z.string().describe("The staff member's ID"),
      date: z.string().describe("Appointment date in YYYY-MM-DD format"),
      startTime: z.string().describe("Start time in HH:MM format (24h)"),
      endTime: z.string().describe("End time in HH:MM format (24h)"),
      reason: z
        .string()
        .describe("Brief reason for the appointment (e.g. 'Academic support - struggling with math')"),
    }),
    execute: async ({ staffId, date, startTime, endTime, reason }) => {
      const staffMember = await getStaffById(staffId);

      if (!staffMember) {
        return { error: "Staff member not found." };
      }

      const accessToken = await getValidStaffAccessToken(staffMember);

      if (!accessToken) {
        return {
          error: `Cannot book automatically — ${staffMember.name} hasn't connected their calendar. Contact them at ${staffMember.email}.`,
        };
      }

      const studentEmail = session.user.email;

      const event: Record<string, unknown> = {
        summary: `Student Appointment — ${reason}`,
        description: `Appointment booked via Student Assistant.\n\nStudent: ${studentEmail}\nReason: ${reason}\nStaff: ${staffMember.name} (${staffMember.role})`,
        start: { dateTime: `${date}T${startTime}:00`, timeZone: "UTC" },
        end: { dateTime: `${date}T${endTime}:00`, timeZone: "UTC" },
        attendees: [
          { email: staffMember.email },
          { email: studentEmail },
        ],
      };

      // Add Google Meet for video-call contact method
      if (staffMember.contactMethod === "video-call") {
        event.conferenceData = {
          createRequest: {
            requestId: crypto.randomUUID(),
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        };
      }

      const url =
        staffMember.contactMethod === "video-call"
          ? `${CALENDAR_API}/calendars/primary/events?conferenceDataVersion=1`
          : `${CALENDAR_API}/calendars/primary/events`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Booking error:", errorText);
        return { error: "Failed to book the appointment. Please try again." };
      }

      const created = await res.json();

      const meetLink = created.conferenceData?.entryPoints?.find(
        (e: { entryPointType: string }) => e.entryPointType === "video"
      )?.uri;

      return {
        success: true,
        staffName: staffMember.name,
        staffRole: staffMember.role,
        date,
        startTime,
        endTime,
        contactMethod: staffMember.contactMethod,
        meetLink: meetLink ?? null,
        calendarLink: created.htmlLink,
        staffEmail: staffMember.email,
      };
    },
  });
