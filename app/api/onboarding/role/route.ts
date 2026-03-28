import { NextResponse } from "next/server";
import { getAuth, clearUserCacheByDbId } from "@/lib/auth";
import { setUserRole } from "@/lib/onboarding";

export async function POST(request: Request) {
  const session = await getAuth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { role } = await request.json();

  if (role !== "student" && role !== "staff") {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  await setUserRole(session.user.id, role);
  clearUserCacheByDbId(session.user.id);

  return NextResponse.json({ success: true, role });
}
