"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Sparkles, Terminal } from "lucide-react";
import React from "react";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background overflow-hidden flex flex-col h-screen">
        <header className="flex sticky top-0 z-10 h-16 shrink-0 items-center justify-between gap-2 border-b border-border/40 bg-background/80 backdrop-blur-md px-4 transition-all ease-linear">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground transition-colors" />
            <Separator orientation="vertical" className="mr-2 h-4 bg-border" />

            {/* <div className="flex items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-muted/50 cursor-default">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 ring-1 ring-primary/20">
                <Terminal className="h-3.5 w-3.5 text-primary" />
              </div>
              <h1 className="text-sm font-semibold text-foreground tracking-tight">
                Dashboard
              </h1>
            </div> */}
          </div>

          {/* <div className="flex items-center gap-2">
            <div 
              className="hidden md:flex items-center gap-1.5 rounded-full bg-primary/5 px-3 py-1 text-xs font-medium text-primary ring-1 ring-primary/10 transition-all hover:bg-primary/10 hover:ring-primary/20 cursor-help" 
              title="AI Code Reviewer Active"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Engine Active</span>
            </div>
          </div> */}
        </header>

        <div className="flex-1 overflow-auto relative scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* Subtle background gradient for depth using theme colors */}
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,var(--tw-gradient-stops))] from-primary/5 via-background to-background opacity-60 pointer-events-none" />
          
          <div className="mx-auto max-w-7xl w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayout;
