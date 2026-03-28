import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { disconnectGoogle } from "@/lib/google";

export async function POST() {
  const session = await getAuth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await disconnectGoogle(session.user.id);
  return NextResponse.json({ success: true });
}
