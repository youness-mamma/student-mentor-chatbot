import "server-only";

import { and, eq } from "drizzle-orm";
import { db } from "./index";
import { staff, type Staff } from "./schema";

export type StaffCategory =
  | "academic"
  | "psychological"
  | "administrative"
  | "career";

export async function getStaffByCategory(
  category: StaffCategory
): Promise<Staff[]> {
  return db
    .select()
    .from(staff)
    .where(and(eq(staff.category, category), eq(staff.isActive, true)));
}

export async function getStaffById(id: string): Promise<Staff | null> {
  const [result] = await db
    .select()
    .from(staff)
    .where(eq(staff.id, id))
    .limit(1);

  return result ?? null;
}

export async function getAllStaff(): Promise<Staff[]> {
  return db.select().from(staff).where(eq(staff.isActive, true));
}

export async function updateStaffGoogleTokens(
  staffId: string,
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
  }
) {
  await db
    .update(staff)
    .set({
      googleAccessToken: tokens.accessToken,
      googleRefreshToken: tokens.refreshToken,
      googleTokenExpiresAt: tokens.expiresAt,
      updatedAt: new Date(),
    })
    .where(eq(staff.id, staffId));
}

export async function getValidStaffAccessToken(
  staffMember: Staff
): Promise<string | null> {
  if (!staffMember.googleAccessToken || !staffMember.googleRefreshToken) {
    return null;
  }

  // If token expires in less than 5 minutes, refresh
  if (
    staffMember.googleTokenExpiresAt &&
    staffMember.googleTokenExpiresAt.getTime() - Date.now() < 5 * 60 * 1000
  ) {
    return refreshStaffToken(staffMember);
  }

  return staffMember.googleAccessToken;
}

async function refreshStaffToken(staffMember: Staff): Promise<string | null> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLOUD_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLOUD_SECRET_KEY!,
      refresh_token: staffMember.googleRefreshToken!,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) return null;

  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };

  const expiresAt = new Date(Date.now() + data.expires_in * 1000);

  await updateStaffGoogleTokens(staffMember.id, {
    accessToken: data.access_token,
    refreshToken: staffMember.googleRefreshToken!,
    expiresAt,
  });

  return data.access_token;
}
