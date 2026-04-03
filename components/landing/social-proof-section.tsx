import { GitPullRequest, Users, Shield } from "lucide-react";

export function SocialProofSection() {
  return (
    <section className="border-y border-border/40 bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
          {/* Trust statements */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4 text-primary" />
              <span>Built for teams who ship weekly</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <GitPullRequest className="h-4 w-4 text-secondary" />
              <span>Works with GitHub pull requests</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-accent" />
              <span>Secure OAuth authentication</span>
            </div>
          </div>

          {/* Placeholder logo pills */}
          <div className="flex items-center gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-8 w-16 rounded-md bg-muted/50 border border-border/40"
                aria-hidden="true"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
