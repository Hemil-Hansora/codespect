"use client";

import { useSession } from "@/lib/auth-client";

import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLogo } from "./ui/brand-logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { CreditCard, Github, LayoutDashboard, Bot, Settings as SettingsIcon, Sparkles, LogOut, Moon, Settings, Sun } from "lucide-react";

export const AppSidebar = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  const navigationItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      Icon: LayoutDashboard,
    },
    {
      title: "Repositories",
      url: "/dashboard/repositories",
      Icon: Github,
    },
    {
      title: "AI Reviews",
      url: "/dashboard/reviews",
      Icon: Bot,
    },
    {
      title: "Billing",
      url: "/dashboard/subscriptions",
      Icon: CreditCard,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      Icon: SettingsIcon,
    },
  ];

  const isActive = (url: string) => {
    if (url === "/dashboard") return pathname === "/dashboard";
    return pathname === url || pathname?.startsWith(url + "/");
  };

  if (!mounted || !session) return null;

  const user = session.user;
  const userName = user?.name || user?.email?.split("@")[0] || "User";
  const userEmail = user?.email || "";
  const userIntials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const avatarSrc = user?.image || "";

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border bg-sidebar h-full"
    >
      <SidebarHeader className="border-b border-sidebar-border/50 bg-sidebar pb-4 pt-5 transition-all duration-300 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:border-none">
        <div className="px-3 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
          <div className="group-data-[collapsible=icon]:hidden">
            <BrandLogo
              href="/dashboard"
              iconClassName="size-8 rounded-md shadow-lg shadow-primary/20"
              textClassName="text-lg text-sidebar-foreground"
            />
          </div>
          <div className="hidden group-data-[collapsible=icon]:inline-flex">
            <BrandLogo
              href="/dashboard"
              withText={false}
              iconClassName="size-8 rounded-xl shadow-md"
            />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4 group-data-[collapsible=icon]:px-0">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2 transition-all duration-300 group-data-[collapsible=icon]:hidden">
            Platform
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5 group-data-[collapsible=icon]:gap-2 group-data-[collapsible=icon]:items-center">
              {navigationItems.map(({ title, url, Icon }) => {
                const active = isActive(url);
                return (
                  <SidebarMenuItem
                    key={title}
                    className="group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center"
                  >
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={title}
                      className="group/item h-10 w-full rounded-md px-3 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:shadow-md data-[active=true]:shadow-primary/20 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center"
                    >
                      <Link href={url} className="flex items-center gap-3">

            <Icon  className={`${
                            active
                              ? "text-primary-foreground"
                              : "text-muted-foreground group-hover/item:text-sidebar-accent-foreground"
                          } transition-colors`} />

                        <span className="font-medium group-data-[collapsible=icon]:hidden">
                          {title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto group-data-[collapsible=icon]:hidden">
          <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/20 p-4 mx-2">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">
                Pro Plan
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Get unlimited AI reviews and advanced insights.
            </p>
            <button className="w-full rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors">
              Upgrade Now
            </button>
          </div>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/50 p-2 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:border-t-0">
        <SidebarMenu className="group-data-[collapsible=icon]:items-center">
          <SidebarMenuItem className="group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="group w-full data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 rounded-xl transition-all group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:bg-sidebar-accent/50"
                >
                  <Avatar className="h-8 w-8 rounded-lg ring-1 ring-border/30 transition-all">
                    <AvatarImage src={avatarSrc} alt={userName} />
                    <AvatarFallback className="rounded-lg bg-sidebar-accent text-sidebar-foreground font-medium">
                      {userIntials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden transition-all duration-300 ease-in-out">
                    <span className="truncate font-semibold text-foreground group-data-[state=open]:text-sidebar-accent-foreground ">
                      {userName}
                    </span>
                    <span className="truncate text-xs text-muted-foreground group-data-[state=open]:text-sidebar-accent-foreground">
                      {userEmail}
                    </span>
                  </div>
                  <Settings className="ml-auto size-4 shrink-0 text-muted-foreground group-data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden transition-all duration-300" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl border-border bg-popover text-popover-foreground shadow-xl"
                side="right"
                align="end"
                sideOffset={8}
              >
                <div className="flex items-center gap-3 p-3 border-b border-border/50">
                  <Avatar className="h-9 w-9 rounded-lg border border-border/50">
                    <AvatarImage src={avatarSrc} alt={userName} />
                    <AvatarFallback className="rounded-lg">
                      {userIntials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold text-foreground">
                      {userName}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {userEmail}
                    </span>
                  </div>
                </div>

                <div className="p-1">
                  <DropdownMenuItem
                    className="cursor-pointer gap-2 rounded-lg focus:bg-accent focus:text-accent-foreground"
                    onClick={() =>
                      setTheme(theme === "dark" ? "light" : "dark")
                    }
                  >
                    {theme === "dark" ? (
                      <Sun className="h-4 w-4 hover:text-accent-foreground" />
                    ) : (
                      <Moon className="h-4 w-4 hover:text-accent-foreground" />
                    )}
                    <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-border/50" />

                  <DropdownMenuItem
                    className="cursor-pointer gap-2 rounded-lg text-destructive focus:bg-destructive/10 focus:text-destructive"
                    asChild
                  >
                    <div className="flex w-full items-center">
                      <LogOut className="h-4 w-4 mr-2 hover:text-destructive" />
                      <span>Log Out</span>
                    </div>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
