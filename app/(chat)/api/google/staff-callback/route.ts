import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { exchangeCodeForTokens } from "@/lib/google";
import { getStaffById, updateStaffGoogleTokens } from "@/lib/db/staff-queries";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const staffId = url.searchParams.get("state");

  if (!code || !staffId) {
    return NextResponse.redirect(new URL("/onboarding?google=error", request.url));
  }

  // Validate the staff record belongs to the authenticated user
  const session = await getAuth();
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const staffRecord = await getStaffById(staffId);
  if (!staffRecord || (staffRecord.userId && staffRecord.userId !== session.user.id)) {
    return NextResponse.redirect(new URL("/onboarding?google=error", request.url));
  }

  try {
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    const redirectUri = `${url.origin}${base}/api/google/staff-callback`;

    const tokens = await exchangeCodeForTokens(code, redirectUri);

    await updateStaffGoogleTokens(staffId, {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
    });

    return NextResponse.redirect(new URL("/onboarding?google=connected", request.url));
  } catch (error) {
    console.error("Staff Google OAuth callback error:", error);
    return NextResponse.redirect(new URL("/onboarding?google=error", request.url));
  }
}
