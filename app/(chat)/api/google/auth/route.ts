import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { getGoogleAuthUrl } from "@/lib/google";

export async function GET(request: Request) {
  const session = await getAuth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const origin = new URL(request.url).origin;
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const redirectUri = `${origin}${base}/api/google/callback`;

  const authUrl = getGoogleAuthUrl(redirectUri, session.user.id);

  return NextResponse.redirect(authUrl);
}
