import { NextResponse } from "next/server";
import { eq, or } from "drizzle-orm";
import { getAuth, clearUserCacheByDbId } from "@/lib/auth";
import { db } from "@/lib/db/index";
import { staff, user as userTable } from "@/lib/db/schema";

export async function POST(request: Request) {
  const session = await getAuth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, role, category, contactMethod, department, bio } = body;

  if (!name || !role || !category) {
    return NextResponse.json(
      { error: "name, role, and category are required" },
      { status: 400 }
    );
  }

  // Set user role to staff
  await db
    .update(userTable)
    .set({ role: "staff", updatedAt: new Date() })
    .where(eq(userTable.id, session.user.id));

  clearUserCacheByDbId(session.user.id);

  // Check if staff profile already exists (by userId or email)
  const [existing] = await db
    .select({ id: staff.id })
    .from(staff)
    .where(
      or(
        eq(staff.userId, session.user.id),
        eq(staff.email, session.user.email)
      )
    )
    .limit(1);

  if (existing) {
    // Link to user if not already linked
    await db
      .update(staff)
      .set({ userId: session.user.id, updatedAt: new Date() })
      .where(eq(staff.id, existing.id));
    return NextResponse.json({ success: true, id: existing.id });
  }

  // Create staff profile
  try {
    const [created] = await db
      .insert(staff)
      .values({
        userId: session.user.id,
        name,
        email: session.user.email,
        role,
        category,
        contactMethod: contactMethod ?? "video-call",
        department: department || null,
        bio: bio || null,
      })
      .returning({ id: staff.id });

    return NextResponse.json({ success: true, id: created.id });
  } catch (error) {
    // Handle duplicate key (race condition on double-submit)
    const [fallback] = await db
      .select({ id: staff.id })
      .from(staff)
      .where(eq(staff.email, session.user.email))
      .limit(1);

    if (fallback) {
      await db
        .update(staff)
        .set({ userId: session.user.id })
        .where(eq(staff.id, fallback.id));
      return NextResponse.json({ success: true, id: fallback.id });
    }

    return NextResponse.json(
      { error: "Failed to create profile" },
      { status: 500 }
    );
  }
}
