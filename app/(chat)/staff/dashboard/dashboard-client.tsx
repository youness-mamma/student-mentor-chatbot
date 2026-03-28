"use client";

import { CalendarIcon, CheckCircleIcon, UserIcon } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { useEffect, useState } from "react";

type StaffProfile = {
  name: string;
  role: string;
  category: string;
  department: string | null;
  contactMethod: string;
  hasCalendar: boolean;
};

export function StaffDashboardClient() {
  const { signOut } = useClerk();
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/staff/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.staff) setProfile(data.staff);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border/50 px-6 py-4">
        <h1 className="text-lg font-semibold">Staff Dashboard</h1>
        <button
          className="rounded-lg border border-border px-3 py-1.5 text-[13px] text-muted-foreground hover:text-foreground"
          onClick={() => signOut({ redirectUrl: "/" })}
          type="button"
        >
          Sign out
        </button>
      </header>

      <main className="mx-auto w-full max-w-2xl px-6 py-10">
        {!loaded ? (
          <div className="text-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : !profile ? (
          <div className="text-center text-sm text-muted-foreground">
            No staff profile found. Please complete onboarding first.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-xl border border-border/60 bg-card p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500/10">
                  <UserIcon className="size-6 text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-base font-semibold">{profile.name}</h2>
                  <p className="text-[13px] text-muted-foreground">
                    {profile.role}
                    {profile.department && ` — ${profile.department}`}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-muted/30 px-4 py-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Category
                  </p>
                  <p className="mt-1 text-sm capitalize">{profile.category}</p>
                </div>
                <div className="rounded-lg bg-muted/30 px-4 py-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Contact Method
                  </p>
                  <p className="mt-1 text-sm capitalize">
                    {profile.contactMethod.replace("-", " ")}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-card p-6">
              <h3 className="text-sm font-semibold">Google Calendar</h3>
              {profile.hasCalendar ? (
                <div className="mt-3 flex items-center gap-2 text-sm text-emerald-500">
                  <CheckCircleIcon className="size-4" />
                  Connected — students can see your availability
                </div>
              ) : (
                <div className="mt-3">
                  <p className="text-[13px] text-muted-foreground">
                    Connect your calendar so students can book time with you.
                  </p>
                  <button
                    className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    onClick={() => {
                      // Need staffId — fetch it then redirect
                      fetch("/api/staff/profile")
                        .then((r) => r.json())
                        .then((d) => {
                          if (d.staff?.id) {
                            window.location.href = `/api/google/staff-auth?staffId=${d.staff.id}`;
                          }
                        });
                    }}
                    type="button"
                  >
                    <CalendarIcon className="size-4" />
                    Connect Google Calendar
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
