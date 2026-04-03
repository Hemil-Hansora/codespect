"use client";

import { ProfileForm } from "@/features/settings/components/profile-form";
import { RepositoriesList } from "@/features/settings/components/repositories-list";
import { Settings } from "lucide-react";

const SettingPage = () => {
  return (
    <div className="flex flex-col w-full min-h-full">
      {/* Header Section */}
      <div className="sticky top-0 z-10 shrink-0 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Manage your profile and connected repositories
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 w-full">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left Side - Profile Form */}
            <div className="lg:col-span-2">
              <ProfileForm />
            </div>
            
            {/* Right Side - Repositories List */}
            <div className="lg:col-span-3">
              <RepositoriesList />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingPage;
