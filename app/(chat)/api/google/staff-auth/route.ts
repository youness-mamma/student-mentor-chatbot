import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { getGoogleAuthUrl } from "@/lib/google";

export async function GET(request: Request) {
  const session = await getAuth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const staffId = url.searchParams.get("staffId");

  if (!staffId) {
    return NextResponse.json({ error: "staffId required" }, { status: 400 });
  }

  const origin = url.origin;
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const redirectUri = `${origin}${base}/api/google/staff-callback`;

  // Pass staffId as state so we can link tokens to the right staff record
  const authUrl = getGoogleAuthUrl(redirectUri, staffId);

  return NextResponse.redirect(authUrl);
}
