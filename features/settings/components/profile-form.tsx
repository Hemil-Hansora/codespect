"use client";

import React, { useEffect, useState } from "react";
import { useProfile, useProfileUpdate } from "../hooks";
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
    <Card className="border shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-lg">Profile Settings</CardTitle>
        <CardDescription>
          Manage your personal information and preferences.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-4 pb-4 border-b">
            <Avatar className="h-20 w-20 border-2 border-border shadow-sm">
              <AvatarImage src={user?.image!} alt={name} />
              <AvatarFallback className="bg-primary/5 text-primary text-xl font-medium">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base truncate">{name || 'User'}</h3>
              <p className="text-sm text-muted-foreground truncate">{email}</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-medium"
              >
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isUpdating || isLoading}
                placeholder="Enter your full name"
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium"
              >
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isUpdating || isLoading}
                placeholder="Enter your email"
                className="h-10"
              />
            </div>
          </div>
        </form>
      </CardContent>

      <CardFooter className="border-t bg-muted/50">
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={isUpdating || isLoading}
          size="default"
          className="w-full sm:w-auto"
        >
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving Changes...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
