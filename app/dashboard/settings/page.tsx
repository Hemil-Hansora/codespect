"use client";

import { ProfileForm } from "@/features/settings/components/profile-form";
import { RepositoriesList } from "@/features/settings/components/repositories-list";
import { Settings } from "lucide-react";

const SettingPage = () => {
  return (
    <div className="flex min-h-full flex-col animate-in fade-in duration-500">
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

      <div className="flex-1 grid min-h-0 grid-cols-1 lg:grid-cols-[minmax(20rem,26rem)_1fr] xl:grid-cols-[minmax(22rem,30rem)_1fr]">
        {/* Left Side - Profile Form */}
        <div className="min-w-0 border-b border-border/40 bg-background/50 p-4 sm:p-6 lg:border-r lg:border-b-0 lg:p-8">
          <ProfileForm />
        </div>

        {/* Right Side - Repositories List */}
        <div className="min-w-0 bg-muted/5 p-4 sm:p-6 lg:p-8">
          <RepositoriesList />
        </div>
      </div>
    </div>
  );
};

export default SettingPage;
