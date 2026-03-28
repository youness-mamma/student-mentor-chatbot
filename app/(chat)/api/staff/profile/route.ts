import { NextResponse } from "next/server";
import { eq, or } from "drizzle-orm";
import { getAuth } from "@/lib/auth";
import { db } from "@/lib/db/index";
import { staff, user as userTable } from "@/lib/db/schema";

export async function GET() {
  const session = await getAuth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify user has staff role
  const [dbUser] = await db
    .select({ role: userTable.role })
    .from(userTable)
    .where(eq(userTable.id, session.user.id))
    .limit(1);

  if (dbUser?.role !== "staff") {
    return NextResponse.json({ staff: null });
  }

  // Look up by userId first, fall back to email for pre-existing records
  let [staffMember] = await db
    .select()
    .from(staff)
    .where(eq(staff.userId, session.user.id))
    .limit(1);

  // If not found by userId, try email and auto-link
  if (!staffMember) {
    [staffMember] = await db
      .select()
      .from(staff)
      .where(eq(staff.email, session.user.email))
      .limit(1);

    if (staffMember) {
      await db
        .update(staff)
        .set({ userId: session.user.id, updatedAt: new Date() })
        .where(eq(staff.id, staffMember.id));
    }
  }

  if (!staffMember) {
    return NextResponse.json({ staff: null });
  }

  return NextResponse.json({
    staff: {
      id: staffMember.id,
      name: staffMember.name,
      role: staffMember.role,
      category: staffMember.category,
      department: staffMember.department,
      contactMethod: staffMember.contactMethod,
      bio: staffMember.bio,
      hasCalendar: !!staffMember.googleRefreshToken,
    },
  });
}
