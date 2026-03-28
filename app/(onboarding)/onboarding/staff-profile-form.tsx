"use client";

import { ArrowLeftIcon, CalendarIcon, CheckCircleIcon } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const categories = [
  { value: "academic", label: "Academic (Professor / Tutor)" },
  { value: "psychological", label: "Psychological (Counselor / Psychologist)" },
  { value: "administrative", label: "Administrative (Officer / Assistant)" },
  { value: "career", label: "Career (Advisor / Coordinator)" },
] as const;

const contactMethods = [
  { value: "video-call", label: "Video Call (Google Meet)" },
  { value: "in-person", label: "In Person" },
  { value: "messaging", label: "Messaging" },
] as const;

export function StaffProfileForm() {
  const router = useRouter();
  const { signOut } = useClerk();
  const searchParams = useSearchParams();
  const googleStatus = searchParams.get("google");

  const [step, setStep] = useState<"profile" | "calendar" | "done">(
    googleStatus === "connected" ? "done" : "profile"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [staffId, setStaffId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    role: "",
    category: "" as string,
    contactMethod: "video-call" as string,
    department: "",
    bio: "",
  });

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/onboarding/staff-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const data = await res.json();
        setStaffId(data.id);
        setStep("calendar");
      } else {
        setError("Failed to save profile. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection.");
    }
    setLoading(false);
  };

  const handleConnectCalendar = () => {
    window.location.href = `/api/google/staff-auth?staffId=${staffId}`;
  };

  if (step === "done" || googleStatus === "connected") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="mx-auto w-full max-w-md px-6 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircleIcon className="size-8 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-semibold">You're all set!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your profile is ready. Students can now find you and book
            appointments.
          </p>
          <button
            className="mt-6 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            onClick={() => router.push("/staff/dashboard")}
            type="button"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (step === "calendar") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="mx-auto w-full max-w-md px-6 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-blue-500/10">
            <CalendarIcon className="size-8 text-blue-500" />
          </div>
          <h1 className="text-2xl font-semibold">Connect your Calendar</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Connect your Google Calendar so students can see your availability
            and book appointments with you.
          </p>
          <button
            className="mt-6 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            onClick={handleConnectCalendar}
            type="button"
          >
            Connect Google Calendar
          </button>
          <button
            className="mt-3 w-full rounded-lg border border-border px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground"
            onClick={() => setStep("done")}
            type="button"
          >
            Skip for now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background">
      <div className="mx-auto w-full max-w-lg px-6">
        <button
          className="mb-6 flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
          onClick={() => signOut({ redirectUrl: "/register" })}
          type="button"
        >
          <ArrowLeftIcon className="size-3.5" />
          Back to sign up
        </button>
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Set up your profile
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Students will see this information when booking with you
          </p>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-destructive/10 px-4 py-2 text-center text-[13px] text-destructive">
            {error}
          </p>
        )}
        <form className="space-y-4" onSubmit={handleSubmitProfile}>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium">
              Full Name
            </label>
            <input
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Dr. Sarah Mitchell"
              required
              value={form.name}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium">
              Your Role / Title
            </label>
            <input
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              placeholder="Professor of Mathematics"
              required
              value={form.role}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium">
              Category
            </label>
            <select
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
              value={form.category}
            >
              <option value="">Select a category...</option>
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium">
              Preferred Contact Method
            </label>
            <select
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
              onChange={(e) =>
                setForm({ ...form, contactMethod: e.target.value })
              }
              value={form.contactMethod}
            >
              {contactMethods.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium">
              Department
            </label>
            <input
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              placeholder="Mathematics Department"
              value={form.department}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium">
              Bio
            </label>
            <textarea
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Tell students how you can help them..."
              rows={3}
              value={form.bio}
            />
          </div>

          <button
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            disabled={loading || !form.name || !form.role || !form.category}
            type="submit"
          >
            {loading ? "Saving..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
