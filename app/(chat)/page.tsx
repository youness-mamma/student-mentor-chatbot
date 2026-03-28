import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { getOnboardingStatus } from "@/lib/onboarding";

export default async function Page() {
  const session = await getAuth();
  if (!session?.user) return null;

  const status = await getOnboardingStatus(session.user.id);

  if (!status.complete) {
    redirect("/onboarding");
  }

  if (status.role === "staff") {
    redirect("/staff/dashboard");
  }

  // Student with completed onboarding — render chat
  return null;
}
