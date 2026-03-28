import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { getOnboardingStatus } from "@/lib/onboarding";
import { ChooseRole } from "./choose-role";
import { StaffProfileForm } from "./staff-profile-form";

export default async function OnboardingPage() {
  const session = await getAuth();
  if (!session?.user) redirect("/login");

  const status = await getOnboardingStatus(session.user.id);

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
