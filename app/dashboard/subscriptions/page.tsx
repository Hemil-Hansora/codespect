"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useSubscription, useSyncSubscription } from "@/features/payment/hooks";
import { checkout, customer } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import {
  Check,
  CreditCard,
  ExternalLink,
  Github,
  LayoutDashboard,
  Loader2,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import React, { useEffect, useState, useRef, Suspense } from "react";
import { toast } from "sonner";

const PLAN_FEATURES = {
  free: [
    { name: "Up to 5 repositories", included: true },
    { name: "Basic AI code review", included: true },
    { name: "Up to 5 reviews per repository", included: true },
    { name: "Community support", included: true },
    { name: "Advanced analytics", included: false },
    { name: "Priority support", included: false },
  ],
  pro: [
    { name: "Unlimited repositories", included: true },
    { name: "Advanced AI code review", included: true },
    { name: "Unlimited reviews per repository", included: true },
    { name: "Priority support", included: true },
    { name: "Advanced analytics", included: true },
    { name: "Email support", included: true },
  ],
};

// Skeleton component for loading state
const SubscriptionSkeleton = () => (
  <div className="space-y-6">
    <Card className="border-border/60">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </CardContent>
    </Card>

    <div className="grid gap-6 md:grid-cols-2">
      {[1, 2].map((i) => (
        <Card key={i} className="border-border/60">
          <CardHeader>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-10 w-24 mt-4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map((j) => (
                <div key={j} className="flex gap-3">
                  <Skeleton className="size-5 rounded-full shrink-0" />
                  <Skeleton className="h-5 w-full" />
                </div>
              ))}
            </div>
            <Skeleton className="h-10 w-full mt-6" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

const SubscriptionPage = () => {
  const [checkLoading, setCheckLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const success = searchParams.get("success");
  const hasSynced = useRef(false);

  const { data, isLoading, error, refetch, isRefetching } = useSubscription();
  const syncMutation = useSyncSubscription();

  // Handle successful checkout redirect - sync subscription status
  useEffect(() => {
    if (success === "true" && !hasSynced.current) {
      hasSynced.current = true;
      
      const syncAndRefresh = async () => {
        toast.promise(
          (async () => {
            // Wait a bit for webhook to be processed
            await new Promise((resolve) => setTimeout(resolve, 2000));
            
            // Sync subscription status from Polar
            let result = await syncMutation.mutateAsync();
            
            // If not active yet, retry after a longer delay (webhook might be slow)
            if (result.success && result.status !== "ACTIVE") {
              await new Promise((resolve) => setTimeout(resolve, 3000));
              result = await syncMutation.mutateAsync();
            }
            
            if (!result.success) {
              throw new Error(result.message || "Sync failed");
            }
            
            // Clear the success param from URL to prevent re-sync on refresh
            router.replace("/dashboard/subscriptions", { scroll: false });
            
            return result;
          })(),
          {
            loading: "Syncing subscription status...",
            success: "Subscription updated successfully!",
            error: "Failed to sync subscription. Try the refresh button.",
          }
        );
      };
      
      syncAndRefresh();
    }
  }, [success, syncMutation, router]);

  if (error) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4 text-center animate-in fade-in duration-500 px-4">
        <div className="rounded-full bg-destructive/10 p-4 shadow-lg shadow-destructive/5">
          <CreditCard className="size-10 text-destructive" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold tracking-tight">
            Failed to load subscription data
          </h3>
          <p className="text-muted-foreground max-w-sm">
            We couldn't fetch your subscription details. Please check your connection and try again.
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()} className="mt-2 text-foreground">
          <RefreshCcw className="mr-2 size-4" />
          Try Again
        </Button>
      </div>
    );
  }

  // Not loading, but no data yet (e.g. auth check pending or data is null)
  if (!isLoading && !data?.user) {
    return (
      <div className="flex h-[80vh] items-center justify-center flex-col gap-4">
        <p className="text-muted-foreground">Please sign in to view your subscription.</p>
      </div>
    );
  }

  const currentTier = data?.user?.subscriptionTier;
  const isPro = currentTier === "PRO";
  const isActive = data?.user?.subscriptionStatus === "ACTIVE";

  const handleSync = async () => {
    toast.promise(
      syncMutation.mutateAsync(),
      {
        loading: "Syncing subscription status...",
        success: (result) => result.message || "Subscription status synchronized.",
        error: "Failed to synchronize subscription.",
      }
    );
  };

  const handleUpgrade = async () => {
    try {
      setCheckLoading(true);
      await checkout({
        slug: "CodeSpect",
        customerEmail: data?.user?.email,
      });
    } catch (error) {
      console.error("Error initiating checkout:", error);
      toast.error("Failed to initiate checkout. Please try again.");
    } finally {
      setCheckLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setPortalLoading(true);
      await customer.portal();
    } catch (error) {
      console.error("Error opening customer portal:", error);
      toast.error("Failed to open billing portal.");
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden animate-in fade-in duration-500">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between border-b border-border/40 bg-background/80 backdrop-blur-xl py-4 px-4 md:px-6 lg:px-8 z-20">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <CreditCard className="size-5 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">Subscription Plan</h1>
          </div>
          <p className="text-muted-foreground text-xs md:text-sm hidden md:block max-w-lg">
            Manage your plan, limits, and billing details.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(isRefetching || syncMutation.isPending) && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
          <Button
            variant="outline"
            size="icon"
            onClick={handleSync}
            className={cn("shrink-0 bg-background/50 text-foreground", syncMutation.isPending && "animate-spin text-primary")}
            disabled={syncMutation.isPending}
            title="Sync subscription status"
          >
            <RefreshCcw className="size-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-8 max-w-400 mx-auto w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {isLoading ? (
          <SubscriptionSkeleton />
        ) : (
          <>
            {success === "true" && (
              <Alert className="border-primary/20 bg-primary/5 text-primary">
                <Check className="size-4" />
                <AlertDescription>
                  Your subscription has been updated successfully. Changes may take a few minutes to reflect.
                </AlertDescription>
              </Alert>
            )}

            {/* Usage Stats - Only show if data is available */}
            {data?.limits && (
              <Card className="border-border/60 shadow-sm bg-muted/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-5">
                   <LayoutDashboard className="size-24" />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="size-4 text-primary" /> Current Usage
                  </CardTitle>
                  <CardDescription>
                    Tracking usage against your current plan limits.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium flex items-center gap-2">
                           <Github className="size-3.5 text-muted-foreground" /> Repositories
                        </span>
                        <span className={cn(
                          "text-xs font-mono font-medium px-2 py-0.5 rounded-full border",
                          data.limits.repository.canAdd 
                            ? "bg-primary/10 text-primary border-primary/20" 
                            : "bg-destructive/10 text-destructive border-destructive/20"
                        )}>
                          {data.limits.repository.current} / {data.limits.repository.limit ?? "∞"}
                        </span>
                      </div>
                      <Progress
                        className={cn(
                          "h-2",
                          !data.limits.repository.canAdd &&
                            "bg-destructive/20 [&>div]:bg-destructive",
                        )}
                        value={
                          data.limits.repository.limit
                            ? Math.min(
                                (data.limits.repository.current /
                                  data.limits.repository.limit) *
                                  100,
                                100,
                              )
                            : 0
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        {data.limits.repository.canAdd 
                          ? "You can connect more repositories." 
                          : "Limit reached. Upgrade to connect more."}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                         <span className="text-sm font-medium flex items-center gap-2">
                           <ShieldCheck className="size-3.5 text-muted-foreground" /> Review Capacity
                        </span>
                         {isPro ? (
                            <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary gap-1">
                               <Zap className="size-3 fill-primary" /> PRO
                            </Badge>
                         ) : (
                            <Badge variant="outline" className="text-foreground">Free Tier</Badge>
                         )}
                      </div>
                      <div className="p-3 rounded-lg border border-border/50 bg-background/50 text-sm text-muted-foreground">
                        {isPro
                          ? "You have unlimited AI reviews per repository."
                          : "Limited to 5 AI reviews per repository on the Free plan."}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pricing Plans */}
            <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
              {/* Free Plan */}
              <Card className={cn(
                "flex flex-col border-border/60 transition-all duration-300 hover:border-border hover:shadow-md h-full bg-background",
                !isPro && "border-primary/50 shadow-sm ring-1 ring-primary/20"
              )}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">Free Plan</CardTitle>
                      <CardDescription className="mt-1.5">
                        Essentials for individual developers.
                      </CardDescription>
                    </div>
                    {!isPro && <Badge variant="secondary" className="text-secondary-foreground">Current</Badge>}
                  </div>
                  <div className="mt-6 flex items-baseline">
                    <span className="text-4xl font-bold tracking-tight">$0</span>
                    <span className="text-muted-foreground ml-1">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="space-y-3 pt-2 text-sm">
                    {PLAN_FEATURES.free.map((feature) => (
                      <div key={feature.name} className="flex items-start gap-3">
                        {feature.included ? (
                          <div className="mt-1 rounded-full bg-primary/10 p-0.5">
                            <Check className="size-3 text-primary" />
                          </div>
                        ) : (
                          <div className="mt-1 rounded-full bg-muted p-0.5">
                             <X className="size-3 text-muted-foreground" />
                          </div>
                        )}
                        <span
                          className={cn(
                            !feature.included && "text-muted-foreground line-through opacity-80"
                          )}
                        >
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="pt-4 border-t border-border/40 bg-muted/5">
                   <Button 
                      className="w-full text-foreground" 
                      variant="outline" 
                      disabled={!isPro}
                   >
                    {!isPro ? "Your Current Plan" : "Downgrade to Free"}
                  </Button>
                </CardFooter>
              </Card>

              {/* Pro Plan */}
              <Card className={cn(
                "flex flex-col transition-all duration-300 relative overflow-hidden h-full border-border/60 hover:shadow-lg",
                isPro && "border-primary shadow-sm bg-primary/5 dark:bg-primary/5 ring-1 ring-primary/20"
              )}>
                {/* Popular Badge decoration */}
                <div className="absolute top-0 right-0 -mt-2 -mr-2 size-24 bg-primary/10 rounded-full blur-2xl" />
                
                <CardHeader className="pb-4 relative">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        Pro Plan
                        {!isPro && <Badge className="bg-primary/90 hover:bg-primary text-primary-foreground border-0">Recommended</Badge>}
                      </CardTitle>
                      <CardDescription className="mt-1.5">
                        For power users who need more capacity.
                      </CardDescription>
                    </div>
                    {isPro && <Badge variant="default" className="bg-primary text-primary-foreground hover:bg-primary/90">Current</Badge>}
                  </div>
                  <div className="mt-6 flex items-baseline">
                    <span className="text-4xl font-bold tracking-tight">$29.99</span>
                    <span className="text-muted-foreground ml-1">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4 relative">
                  <div className="space-y-3 pt-2 text-sm">
                    {PLAN_FEATURES.pro.map((feature) => (
                      <div key={feature.name} className="flex items-start gap-3">
                        <div className="mt-1 rounded-full bg-primary/20 p-0.5">
                            <Check className="size-3 text-primary" />
                        </div>
                        <span className="font-medium text-foreground/90">
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="pt-4 border-t border-border/40 bg-muted/5 relative">
                  {isPro && isActive ? (
                    <Button
                      className="w-full cursor-pointer shadow-sm text-foreground"
                      variant="outline"
                      disabled={portalLoading}
                      onClick={handleManageSubscription}
                    >
                      {portalLoading ? (
                        <>
                          <Loader2 className="mr-2 size-4 animate-spin" />
                          Opening Portal...
                        </>
                      ) : (
                        <>
                          Manage Subscription
                          <ExternalLink className="ml-2 size-4" />
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      className={cn("w-full cursor-pointer shadow-lg shadow-primary/20 hover:shadow-primary/30 text-primary-foreground")}
                      disabled={checkLoading}
                      variant="default" // Uses primary color
                      onClick={handleUpgrade}
                    >
                      {checkLoading ? (
                        <>
                          <Loader2 className="mr-2 size-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                           <Zap className="mr-2 size-4 fill-current" /> Upgrade to Pro
                        </>
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </div>
            
            <div className="text-center text-xs text-muted-foreground max-w-2xl mx-auto pt-6 pb-2">
              <p>
                Payments are securely processed by Stripe. You can cancel your subscription at any time.
                By subscribing, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Wrap with Suspense for useSearchParams support during static generation
export default function SubscriptionPageWrapper() {
  return (
    <Suspense fallback={<SubscriptionSkeleton />}>
      <SubscriptionPage />
    </Suspense>
  );
}
