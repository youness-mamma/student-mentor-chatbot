import { tool } from "ai";
import { z } from "zod";
import { getStaffById, getValidStaffAccessToken } from "@/lib/db/staff-queries";

const CALENDAR_API = "https://www.googleapis.com/calendar/v3";

export const getStaffAvailability = () =>
  tool({
    description:
      "Get a staff member's available time slots from their Google Calendar. Use this after finding a staff member with findStaff, to show the student when they can book.",
    inputSchema: z.object({
      staffId: z
        .string()
        .describe("The staff member's ID from findStaff results"),
      date: z
        .string()
        .optional()
        .describe(
          "Specific date to check in YYYY-MM-DD format. Defaults to today and the next 5 days."
        ),
    }),
    execute: async ({ staffId, date }) => {
      const staffMember = await getStaffById(staffId);

      if (!staffMember) {
        return { error: "Staff member not found." };
      }

      const accessToken = await getValidStaffAccessToken(staffMember);

      if (!accessToken) {
        return {
          staffName: staffMember.name,
          contactMethod: staffMember.contactMethod,
          error:
            "This staff member hasn't connected their calendar. Please contact them directly via " +
            staffMember.contactMethod +
            " at " +
            staffMember.email,
        };
      }

      // Query free/busy for the next 5 days (or specific date)
      const startDate = date ? new Date(`${date}T08:00:00Z`) : new Date();
      const endDate = date
        ? new Date(`${date}T18:00:00Z`)
        : new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

      const freeBusyRes = await fetch(
        `${CALENDAR_API}/freeBusy`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            timeMin: startDate.toISOString(),
            timeMax: endDate.toISOString(),
            items: [{ id: "primary" }],
          }),
        }
      );

      if (!freeBusyRes.ok) {
        return { error: "Failed to check calendar availability." };
      }

      const freeBusyData = await freeBusyRes.json();
      const busySlots =
        freeBusyData.calendars?.primary?.busy ?? [];

      // Generate available 1-hour slots (9am-5pm) excluding busy times
      // Limit to 3 days to keep the response concise
      const grouped: Record<string, string[]> = {};
      const checkStart = date ? new Date(`${date}T00:00:00Z`) : new Date();
      const checkDays = date ? 1 : 3;

      for (let d = 0; d < checkDays; d++) {
        const dayDate = new Date(checkStart);
        dayDate.setDate(dayDate.getDate() + d);
        const dayStr = dayDate.toISOString().split("T")[0];

        for (let hour = 9; hour < 17; hour++) {
          const slotStart = new Date(`${dayStr}T${String(hour).padStart(2, "0")}:00:00Z`);
          const slotEnd = new Date(`${dayStr}T${String(hour + 1).padStart(2, "0")}:00:00Z`);

          if (slotStart < new Date()) continue;

          const isBusy = busySlots.some(
            (busy: { start: string; end: string }) => {
              const busyStart = new Date(busy.start);
              const busyEnd = new Date(busy.end);
              return slotStart < busyEnd && slotEnd > busyStart;
            }
          );

          if (!isBusy) {
            if (!grouped[dayStr]) grouped[dayStr] = [];
            grouped[dayStr].push(
              `${String(hour).padStart(2, "0")}:00 - ${String(hour + 1).padStart(2, "0")}:00`
            );
          }
        }
      }

      const totalSlots = Object.values(grouped).reduce(
        (sum, slots) => sum + slots.length,
        0
      );

      return {
        staffName: staffMember.name,
        staffRole: staffMember.role,
        contactMethod: staffMember.contactMethod,
        availability: grouped,
        totalSlots,
        instruction:
          "Present this as a short summary. Show max 3-4 slots per day. If there are many slots, say 'and X more'. Ask the student to pick ONE slot.",
      };
    },
  });
