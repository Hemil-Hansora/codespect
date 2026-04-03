"use client";

import { ProfileForm } from "@/features/settings/components/profile-form";
import { RepositoriesList } from "@/features/settings/components/repositories-list";
import { Settings } from "lucide-react";

const SettingPage = () => {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden animate-in fade-in duration-500">
      <div className="shrink-0 flex items-center justify-between border-b border-border/40 bg-background/80 backdrop-blur-xl py-4 px-4 md:px-6 lg:px-8 z-20">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Settings className="size-5 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">Settings</h1>
          </div>
          <p className="text-muted-foreground text-xs md:text-sm hidden md:block max-w-lg">
            Manage your profile information and connected repositories.
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side - Profile Form */}
        <div className="w-full lg:w-100 xl:w-120 p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-border/40 overflow-y-auto shrink-0 bg-background/50">
           <ProfileForm />
        </div>
        
        {/* Right Side - Repositories List */}
        <div className="flex-1 p-6 lg:p-8 bg-muted/5 min-w-0 overflow-hidden flex flex-col">
           <RepositoriesList />
        </div>
      </div>
    </div>
  );
};

export default SettingPage;
