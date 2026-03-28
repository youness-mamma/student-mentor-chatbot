import "server-only";

import { eq, or } from "drizzle-orm";
import { db } from "./db/index";
import { user as userTable, staff as staffTable } from "./db/schema";

export type OnboardingStatus =
  | { complete: true; role: "student" }
  | { complete: true; role: "staff"; staffId: string }
  | { complete: false; step: "choose-role" }
  | { complete: false; step: "staff-profile" };

export async function getOnboardingStatus(
  userId: string
): Promise<OnboardingStatus> {
  const [dbUser] = await db
    .select({ role: userTable.role, email: userTable.email })
    .from(userTable)
    .where(eq(userTable.id, userId))
    .limit(1);

  if (!dbUser) {
    return { complete: false, step: "choose-role" };
  }

  // No role chosen — check if a pre-existing staff record matches by email
  if (!dbUser.role) {
    const [existingStaff] = await db
      .select({ id: staffTable.id })
      .from(staffTable)
      .where(eq(staffTable.email, dbUser.email))
      .limit(1);

    if (existingStaff) {
      await Promise.all([
        db.update(staffTable).set({ userId }).where(eq(staffTable.id, existingStaff.id)),
        db.update(userTable).set({ role: "staff", updatedAt: new Date() }).where(eq(userTable.id, userId)),
      ]);
      return { complete: true, role: "staff", staffId: existingStaff.id };
    }

    return { complete: false, step: "choose-role" };
  }

  if (dbUser.role === "student") {
    return { complete: true, role: "student" };
  }

  // Staff: check if profile exists
  const [staffProfile] = await db
    .select({ id: staffTable.id, userId: staffTable.userId })
    .from(staffTable)
    .where(or(eq(staffTable.userId, userId), eq(staffTable.email, dbUser.email)))
    .limit(1);

  if (!staffProfile) {
    return { complete: false, step: "staff-profile" };
  }

  // Auto-link if staff record found by email but userId not set
  if (!staffProfile.userId) {
    await db.update(staffTable).set({ userId }).where(eq(staffTable.id, staffProfile.id));
  }

  return { complete: true, role: "staff", staffId: staffProfile.id };
}

export async function setUserRole(userId: string, role: "student" | "staff") {
  await db
    .update(userTable)
    .set({ role, updatedAt: new Date() })
    .where(eq(userTable.id, userId));
}
