import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db/index";
import { user as userTable } from "@/lib/db/schema";
import { getOnboardingStatus } from "@/lib/onboarding";
import { ChooseRole } from "./choose-role";
import { StaffProfileForm } from "./staff-profile-form";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress;
  if (!email) redirect("/login");

  // Find or create DB user — bypass auth cache
  let [dbUser] = await db
    .select({ id: userTable.id })
    .from(userTable)
    .where(eq(userTable.email, email))
    .limit(1);

  if (!dbUser) {
    const [created] = await db
      .insert(userTable)
      .values({ email, password: null })
      .returning({ id: userTable.id });
    dbUser = created;
  }

  const status = await getOnboardingStatus(dbUser.id);

  if (status.complete && status.role === "student") {
    redirect("/");
  }

  if (status.complete && status.role === "staff") {
    redirect("/staff/dashboard");
  }

  if (status.step === "choose-role") {
    return <ChooseRole />;
  }

  if (status.step === "staff-profile") {
    return <StaffProfileForm />;
  }

  return null;
}
