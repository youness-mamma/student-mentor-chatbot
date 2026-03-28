"use client";

import { ArrowLeftIcon, BookOpenIcon, GraduationCapIcon } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function ChooseRole() {
  const router = useRouter();
  const { signOut } = useClerk();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auto-apply role from localStorage (set during sign-up)
  useEffect(() => {
    const pendingRole = localStorage.getItem("pending_role");

    if (pendingRole === "student" || pendingRole === "staff") {
      localStorage.removeItem("pending_role");
      submitRole(pendingRole);
    } else {
      setLoading(false);
    }
  }, []);

  const submitRole = async (role: "student" | "staff") => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/onboarding/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      if (res.ok) {
        localStorage.removeItem("pending_role");
        if (role === "student") {
          window.location.href = "/";
        } else {
          router.refresh();
        }
      } else {
        setError("Something went wrong. Please try again.");
        setLoading(false);
      }
    } catch {
      setError("Network error. Please check your connection.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Setting up your account...</p>
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
            Welcome to Student Assistant
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            How would you like to use this platform?
          </p>
        </div>

        {error && (
          <p className="mb-2 rounded-lg bg-destructive/10 px-4 py-2 text-center text-[13px] text-destructive">
            {error}
          </p>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            className="group flex flex-col items-center gap-4 rounded-xl border border-border/60 bg-card p-8 text-center transition-all hover:border-blue-500/40 hover:shadow-md disabled:opacity-50"
            disabled={loading}
            onClick={() => submitRole("student")}
            type="button"
          >
            <div className="flex size-14 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 transition-colors group-hover:bg-blue-500/20">
              <GraduationCapIcon className="size-7" />
            </div>
            <div>
              <h2 className="text-base font-semibold">I'm a Student</h2>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Get help with academics, mental health, admin issues, or career
                guidance
              </p>
            </div>
          </button>

          <button
            className="group flex flex-col items-center gap-4 rounded-xl border border-border/60 bg-card p-8 text-center transition-all hover:border-emerald-500/40 hover:shadow-md disabled:opacity-50"
            disabled={loading}
            onClick={() => submitRole("staff")}
            type="button"
          >
            <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 transition-colors group-hover:bg-emerald-500/20">
              <BookOpenIcon className="size-7" />
            </div>
            <div>
              <h2 className="text-base font-semibold">
                I'm a Mentor / Advisor
              </h2>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Professor, counselor, or advisor — share your availability and
                help students
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
