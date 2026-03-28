import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "./db/index";
import { user } from "./db/schema";

export type AppSession = {
  user: {
    id: string;
    email: string;
    role: string | null;
  };
};

type CacheEntry = {
  id: string;
  email: string;
  role: string | null;
  cachedAt: number;
};

// Cache with 60s TTL to prevent stale data
const CACHE_TTL = 60_000;
const userCache = new Map<string, CacheEntry>();

export async function getAuth(): Promise<AppSession | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const cached = userCache.get(userId);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL) {
    return { user: { id: cached.id, email: cached.email, role: cached.role } };
  }

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress;
  if (!email) return null;

  const dbUser = await getOrCreateDbUser(email);
  userCache.set(userId, {
    id: dbUser.id,
    email,
    role: dbUser.role,
    cachedAt: Date.now(),
  });

  return { user: { id: dbUser.id, email, role: dbUser.role } };
}

export function clearUserCacheByDbId(dbUserId: string) {
  for (const [key, value] of userCache.entries()) {
    if (value.id === dbUserId) {
      userCache.delete(key);
    }
  }
}

async function getOrCreateDbUser(
  email: string
): Promise<{ id: string; role: string | null }> {
  const existing = await db
    .select({ id: user.id, role: user.role })
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  const [created] = await db
    .insert(user)
    .values({ email, password: null })
    .returning({ id: user.id, role: user.role });

  return created;
}
