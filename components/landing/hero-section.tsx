"use client";

import { Button } from "@/components/ui/button";
import {
  GitPullRequest,
  Brain,
  History,
  Zap,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";

const benefitChips = [
  { icon: GitPullRequest, label: "PR Comments" },
  { icon: Brain, label: "Codebase Context" },
  { icon: History, label: "Review History" },
  { icon: Zap, label: "Instant Feedback" },
  { icon: CheckCircle2, label: "Connect & Go" },
];

export function HeroSection() {
  const { data: session } = useSession();

  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom_right,var(--tw-gradient-stops))] from-secondary/5 via-transparent to-transparent" />

      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left: Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              AI code reviews that{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                understand
              </span>{" "}
              your codebase
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
              Get context-aware feedback on every GitHub pull request. CodeSpect
              indexes your codebase, understands your patterns, and delivers
              actionable reviews as PR comments—automatically.
            </p>

            {/* Benefit chips */}
            <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-2">
              {benefitChips.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/50 px-3 py-1.5 text-xs font-medium text-foreground backdrop-blur-sm transition-colors hover:bg-card"
                >
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  {label}
                </span>
              ))}
            </div>

            {/* CTAs - Show different content based on auth status */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              {session ? (
                <Button size="lg" asChild className="w-full sm:w-auto shadow-lg shadow-primary/20">
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button size="lg" asChild className="w-full sm:w-auto shadow-lg shadow-primary/20">
                    <Link href="/login">Log in with GitHub</Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="w-full sm:w-auto"
                  >
                    <a href="#how-it-works">See how it works</a>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Right: Mock UI Preview */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-3xl blur-2xl opacity-40" />
            <div className="relative rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl p-6 shadow-2xl">
              {/* Mock PR Review Card */}
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border/40">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    CodeSpect Review
                  </p>
                  <p className="text-xs text-muted-foreground">
                    on feat/user-auth • 2 min ago
                  </p>
                </div>
                <span className="ml-auto inline-flex items-center rounded-full bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent-foreground">
                  Completed
                </span>
              </div>

              {/* Mock Review Content */}
              <div className="space-y-4 font-mono text-sm">
                <div className="rounded-lg bg-muted/30 p-3 border-l-2 border-primary">
                  <p className="text-xs text-muted-foreground mb-1">
                    src/auth/session.ts:42
                  </p>
                  <p className="text-foreground">
                    <span className="text-primary font-semibold">Suggestion:</span>{" "}
                    Consider adding token expiry validation before refresh to prevent race conditions.
                  </p>
                </div>
                <div className="rounded-lg bg-muted/30 p-3 border-l-2 border-secondary">
                  <p className="text-xs text-muted-foreground mb-1">
                    src/auth/middleware.ts:18
                  </p>
                  <p className="text-foreground">
                    <span className="text-secondary font-semibold">Note:</span>{" "}
                    This pattern matches your existing auth flow in{" "}
                    <code className="text-xs bg-muted rounded px-1">utils/auth.ts</code>
                  </p>
                </div>
              </div>

              {/* Stats footer */}
              <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                <span>3 suggestions • 1 note</span>
                <span className="text-primary">View full review →</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
