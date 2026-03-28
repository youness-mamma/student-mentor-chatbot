import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { isGoogleConnected } from "@/lib/google";

export async function GET() {
  const session = await getAuth();
  if (!session?.user) {
    return NextResponse.json({ connected: false });
  }

  const connected = await isGoogleConnected(session.user.id);
  return NextResponse.json({ connected });
}
