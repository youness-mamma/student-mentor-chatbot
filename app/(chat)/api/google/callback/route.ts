import { NextResponse } from "next/server";
import { exchangeCodeForTokens, saveGoogleTokens } from "@/lib/google";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const userId = url.searchParams.get("state");

  if (!code || !userId) {
    return NextResponse.redirect(new URL("/?google=error", request.url));
  }

  try {
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    const redirectUri = `${url.origin}${base}/api/google/callback`;

    const tokens = await exchangeCodeForTokens(code, redirectUri);
    await saveGoogleTokens(userId, tokens);

    return NextResponse.redirect(new URL("/?google=connected", request.url));
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return NextResponse.redirect(new URL("/?google=error", request.url));
  }
}
