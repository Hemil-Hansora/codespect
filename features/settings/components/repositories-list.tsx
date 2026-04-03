"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Mail, Loader2, Save } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfile, useProfileUpdate } from "../hooks";

export const ProfileForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const { data: user, isLoading, isError } = useProfile();
  const { mutate, isPending: isUpdating } = useProfileUpdate();

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({ name, email });
  };

  const getInitials = (name: string) => {
    return name?.slice(0, 2).toUpperCase() || "CS";
  };

  return (
    <Card className="border-none shadow-none bg-transparent p-0">
      <CardHeader className="px-0 pt-0 pb-6 space-y-1">
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>
          Manage your personal information and preferences.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            <div className="shrink-0 flex items-center gap-4">
              <Avatar className="h-20 w-20 border-2 border-border shadow-sm">
                <AvatarImage src={user?.image!} alt={name} />
                <AvatarFallback className="bg-primary/5 text-primary text-xl font-medium">
                  {getInitials(name)}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1 space-y-4 w-full">
              <div className="grid gap-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="name"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isUpdating || isLoading}
                    className="h-9 bg-background focus:ring-1"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="email"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isUpdating || isLoading}
                    className="h-9 bg-background focus:ring-1"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isUpdating || isLoading}
                  size="sm"
                  variant="default"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
