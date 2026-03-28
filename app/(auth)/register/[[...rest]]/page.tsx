"use client";

import { SignUp } from "@clerk/nextjs";
import { BookOpenIcon, GraduationCapIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Page() {
  const [role, setRole] = useState<"student" | "staff" | null>(null);

  const handlePickRole = (picked: "student" | "staff") => {
    localStorage.setItem("pending_role", picked);
    setRole(picked);
  };

  if (!role) {
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            First, tell us how you'll use the platform
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            className="group flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-card p-6 text-center transition-all hover:border-blue-500/40 hover:shadow-md"
            onClick={() => handlePickRole("student")}
            type="button"
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 transition-colors group-hover:bg-blue-500/20">
              <GraduationCapIcon className="size-6" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">I'm a Student</h2>
              <p className="mt-1 text-[12px] text-muted-foreground">
                Get support & book appointments
              </p>
            </div>
          </button>

          <button
            className="group flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-card p-6 text-center transition-all hover:border-emerald-500/40 hover:shadow-md"
            onClick={() => handlePickRole("staff")}
            type="button"
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 transition-colors group-hover:bg-emerald-500/20">
              <BookOpenIcon className="size-6" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">I'm a Mentor / Advisor</h2>
              <p className="mt-1 text-[12px] text-muted-foreground">
                Share availability & help students
              </p>
            </div>
          </button>
        </div>

        <p className="text-center text-[13px] text-muted-foreground">
          Already have an account?{" "}
          <Link
            className="text-foreground underline-offset-4 hover:underline"
            href="/login"
          >
            Sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        className="self-start text-[13px] text-muted-foreground hover:text-foreground"
        onClick={() => {
          localStorage.removeItem("pending_role");
          setRole(null);
        }}
        type="button"
      >
        &larr; Change role
      </button>
      <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-1 text-[12px]">
        {role === "student" ? (
          <>
            <GraduationCapIcon className="size-3.5 text-blue-500" />
            Signing up as Student
          </>
        ) : (
          <>
            <BookOpenIcon className="size-3.5 text-emerald-500" />
            Signing up as Mentor / Advisor
          </>
        )}
      </div>
      <SignUp />
    </div>
  );
}
