import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { getOnboardingStatus } from "@/lib/onboarding";
import { StaffDashboardClient } from "./dashboard-client";

export default async function StaffDashboardPage() {
  const session = await getAuth();
  if (!session?.user) redirect("/login");

  const status = await getOnboardingStatus(session.user.id);

  if (!status.complete) {
    redirect("/onboarding");
  }

  if (status.role !== "staff") {
    redirect("/");
  }

  return <StaffDashboardClient />;
}
