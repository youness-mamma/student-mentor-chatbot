import { cookies } from "next/headers";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { AppSidebar } from "@/components/chat/app-sidebar";
import { DataStreamProvider } from "@/components/chat/data-stream-provider";
import { ChatShell } from "@/components/chat/shell";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ActiveChatProvider } from "@/hooks/use-active-chat";
import { getAuth } from "@/lib/auth";

const toasterProps = {
  position: "top-center" as const,
  theme: "system" as const,
  toastOptions: {
    className:
      "!bg-card !text-foreground !border-border/50 !shadow-[var(--shadow-float)]",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="flex h-dvh bg-sidebar" />}>
      <LayoutContent>{children}</LayoutContent>
    </Suspense>
  );
}

async function LayoutContent({ children }: { children: React.ReactNode }) {
  const [session, cookieStore] = await Promise.all([getAuth(), cookies()]);

  if (!session?.user) return <>{children}</>;

  const { role } = session.user;

  // No role yet or staff — render without chat sidebar
  if (!role || role === "staff") {
    return (
      <DataStreamProvider>
        <Toaster {...toasterProps} />
        {children}
      </DataStreamProvider>
    );
  }

  // Student — full chat layout
  const isCollapsed = cookieStore.get("sidebar_state")?.value !== "true";

  const user = {
    id: session.user.id,
    email: session.user.email,
    name: null as string | null,
    image: null as string | null,
  };

  return (
    <DataStreamProvider>
      <SidebarProvider defaultOpen={!isCollapsed}>
        <AppSidebar user={user} />
        <SidebarInset>
          <Toaster {...toasterProps} />
          <Suspense fallback={<div className="flex h-dvh" />}>
            <ActiveChatProvider>
              <ChatShell />
            </ActiveChatProvider>
          </Suspense>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </DataStreamProvider>
  );
}
