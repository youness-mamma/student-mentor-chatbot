"use client";

import {
  CalendarIcon,
  ChevronUp,
  LinkIcon,
  MonitorIcon,
  MoonIcon,
  SunIcon,
  UnlinkIcon,
} from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import type { AppUser } from "@/components/chat/app-sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

function emailToHue(email: string): number {
  let hash = 0;
  for (const char of email) {
    hash = char.charCodeAt(0) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

export function SidebarUserNav({ user }: { user: AppUser }) {
  const { signOut } = useClerk();
  const { setTheme, theme } = useTheme();
  const [googleConnected, setGoogleConnected] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/google/status`)
      .then((res) => res.json())
      .then((data) => setGoogleConnected(data.connected))
      .catch(() => {});
  }, []);

  const handleGoogleConnect = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/google/auth`;
  };

  const handleGoogleDisconnect = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/google/disconnect`, {
      method: "POST",
    });
    setGoogleConnected(false);
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              className="h-8 px-2 rounded-lg bg-transparent text-sidebar-foreground/70 transition-colors duration-150 hover:text-sidebar-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              data-testid="user-nav-button"
            >
              {user.image ? (
                <img
                  alt=""
                  className="size-5 shrink-0 rounded-full ring-1 ring-sidebar-border/50"
                  src={user.image}
                />
              ) : (
                <div
                  className="size-5 shrink-0 rounded-full ring-1 ring-sidebar-border/50"
                  style={{
                    background: `linear-gradient(135deg, oklch(0.35 0.08 ${emailToHue(user.email)}), oklch(0.25 0.05 ${emailToHue(user.email) + 40}))`,
                  }}
                />
              )}
              <span className="truncate text-[13px]" data-testid="user-email">
                {user.email}
              </span>
              <ChevronUp className="ml-auto size-3.5 text-sidebar-foreground/50" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-popper-anchor-width) rounded-lg border border-border/60 bg-card/95 backdrop-blur-xl shadow-[var(--shadow-float)]"
            data-testid="user-nav-menu"
            side="top"
          >
            <DropdownMenuLabel className="text-[11px] font-normal text-muted-foreground">
              Theme
            </DropdownMenuLabel>
            <DropdownMenuItem
              className="cursor-pointer text-[13px]"
              onSelect={() => setTheme("light")}
            >
              <SunIcon className="mr-2 size-3.5" />
              Light
              {theme === "light" && <span className="ml-auto text-[11px] text-muted-foreground">✓</span>}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer text-[13px]"
              onSelect={() => setTheme("dark")}
            >
              <MoonIcon className="mr-2 size-3.5" />
              Dark
              {theme === "dark" && <span className="ml-auto text-[11px] text-muted-foreground">✓</span>}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer text-[13px]"
              onSelect={() => setTheme("system")}
            >
              <MonitorIcon className="mr-2 size-3.5" />
              System
              {theme === "system" && <span className="ml-auto text-[11px] text-muted-foreground">✓</span>}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-[11px] font-normal text-muted-foreground">
              Integrations
            </DropdownMenuLabel>
            {googleConnected ? (
              <DropdownMenuItem
                className="cursor-pointer text-[13px]"
                onSelect={handleGoogleDisconnect}
              >
                <UnlinkIcon className="mr-2 size-3.5" />
                Disconnect Google Calendar
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                className="cursor-pointer text-[13px]"
                onSelect={handleGoogleConnect}
              >
                <CalendarIcon className="mr-2 size-3.5" />
                Connect Google Calendar
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild data-testid="user-nav-item-auth">
              <button
                className="w-full cursor-pointer text-[13px]"
                onClick={() => signOut({ redirectUrl: "/" })}
                type="button"
              >
                Sign out
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
