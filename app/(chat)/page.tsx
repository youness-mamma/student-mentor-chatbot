import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db/index";
import { user as userTable } from "@/lib/db/schema";
import { getOnboardingStatus } from "@/lib/onboarding";

export default async function Page() {
  await connection();
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress;
  if (!email) redirect("/login");

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

  if (!status.complete) {
    redirect("/onboarding");
  }

  if (status.role === "staff") {
    redirect("/staff/dashboard");
  }

  return null;
}
