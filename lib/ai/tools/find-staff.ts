import { tool } from "ai";
import { z } from "zod";
import { getStaffByCategory } from "@/lib/db/staff-queries";

export const findStaff = () =>
  tool({
    description:
      "Find available staff members by problem category. Use this once you've identified the student's problem category (academic, psychological, administrative, or career).",
    inputSchema: z.object({
      category: z
        .enum(["academic", "psychological", "administrative", "career"])
        .describe("The category of the student's problem"),
    }),
    execute: async ({ category }) => {
      const staffMembers = await getStaffByCategory(category);

      if (staffMembers.length === 0) {
        return {
          found: false,
          message: `No staff members are currently available for ${category} support. Please try again later or contact the front desk.`,
        };
      }

      return {
        found: true,
        staff: staffMembers.map((s) => ({
          id: s.id,
          name: s.name,
          role: s.role,
          department: s.department,
          contactMethod: s.contactMethod,
          bio: s.bio,
          hasCalendar: !!s.googleRefreshToken,
        })),
      };
    },
  });
