import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { currentUser } from "@clerk/nextjs/server";
import { AppSidebar } from "@/components/chat/app-sidebar";
import { DataStreamProvider } from "@/components/chat/data-stream-provider";
import { ChatShell } from "@/components/chat/shell";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ActiveChatProvider } from "@/hooks/use-active-chat";
import { db } from "@/lib/db/index";
import { user as userTable } from "@/lib/db/schema";

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
  const [clerkUser, cookieStore] = await Promise.all([
    currentUser(),
    cookies(),
  ]);

  if (!clerkUser) return <>{children}</>;

  const email = clerkUser.emailAddresses?.[0]?.emailAddress ?? "";

  // Query DB directly for fresh role — no cache
  const [dbUser] = await db
    .select({ id: userTable.id, role: userTable.role })
    .from(userTable)
    .where(eq(userTable.email, email))
    .limit(1);

  const role = dbUser?.role;

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
    id: dbUser.id,
    email,
    name: clerkUser.fullName,
    image: clerkUser.imageUrl,
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
