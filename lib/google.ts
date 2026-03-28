import "server-only";

import { eq } from "drizzle-orm";
import { db } from "./db/index";
import { googleToken } from "./db/schema";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLOUD_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLOUD_SECRET_KEY!;
const SCOPES = ["https://www.googleapis.com/auth/calendar"];

export function getGoogleAuthUrl(redirectUri: string, state: string) {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCodeForTokens(
  code: string,
  redirectUri: string
) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to exchange code: ${error}`);
  }

  return res.json() as Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }>;
}

export async function saveGoogleTokens(
  userId: string,
  tokens: { access_token: string; refresh_token: string; expires_in: number }
) {
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

  const existing = await db
    .select({ id: googleToken.id })
    .from(googleToken)
    .where(eq(googleToken.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(googleToken)
      .set({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(googleToken.userId, userId));
  } else {
    await db.insert(googleToken).values({
      userId,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt,
    });
  }
}

export async function getValidAccessToken(
  userId: string
): Promise<string | null> {
  const [token] = await db
    .select()
    .from(googleToken)
    .where(eq(googleToken.userId, userId))
    .limit(1);

  if (!token) return null;

  // If token expires in less than 5 minutes, refresh it
  if (token.expiresAt.getTime() - Date.now() < 5 * 60 * 1000) {
    return refreshAccessToken(userId, token.refreshToken);
  }

  return token.accessToken;
}

async function refreshAccessToken(
  userId: string,
  refreshToken: string
): Promise<string | null> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) return null;

  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };
  const expiresAt = new Date(Date.now() + data.expires_in * 1000);

  await db
    .update(googleToken)
    .set({
      accessToken: data.access_token,
      expiresAt,
      updatedAt: new Date(),
    })
    .where(eq(googleToken.userId, userId));

  return data.access_token;
}

export async function isGoogleConnected(userId: string): Promise<boolean> {
  const [token] = await db
    .select({ id: googleToken.id })
    .from(googleToken)
    .where(eq(googleToken.userId, userId))
    .limit(1);

  return !!token;
}

export async function disconnectGoogle(userId: string) {
  await db.delete(googleToken).where(eq(googleToken.userId, userId));
}
