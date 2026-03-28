import { Suspense } from "react";
import { Toaster } from "sonner";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Toaster
        position="top-center"
        theme="system"
        toastOptions={{
          className:
            "!bg-card !text-foreground !border-border/50 !shadow-[var(--shadow-float)]",
        }}
      />
      <Suspense fallback={<div className="flex min-h-dvh items-center justify-center"><p className="text-sm text-muted-foreground">Loading...</p></div>}>
        {children}
      </Suspense>
    </>
  );
}
