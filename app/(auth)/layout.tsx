import { GraduationCapIcon } from "lucide-react";
import { Suspense } from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary">
            <GraduationCapIcon className="size-5.5 text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="text-lg font-semibold tracking-tight">
              Student Assistant
            </h1>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>
        </div>
        <Suspense>{children}</Suspense>
      </div>
    </div>
  );
}
