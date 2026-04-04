import { GitPullRequest, Users, Shield, Zap, Star, TrendingUp } from "lucide-react";

const trustIndicators = [
  {
    icon: Users,
    text: "Built for teams who ship weekly",
    color: "text-primary",
  },
  {
    icon: GitPullRequest,
    text: "Works with GitHub pull requests",
    color: "text-primary",
  },
  {
    icon: Shield,
    text: "Secure OAuth authentication",
    color: "text-primary",
  },
];


export function SocialProofSection() {
  return (
    <section className="relative border-y border-border/40 bg-gradient-to-b from-muted/30 via-muted/10 to-transparent">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-40" />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 lg:gap-12">
            {trustIndicators.map(({ icon: Icon, text, color }) => (
              <div
                key={text}
                className="group flex items-center gap-2.5 rounded-lg px-4 py-2 transition-all hover:bg-card/50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <span className="text-sm font-medium text-foreground/90">
                  {text}
                </span>
              </div>
            ))}
          </div>

        
          {/* Additional Badge */}
          <div className="flex items-center justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-foreground backdrop-blur-sm">
              <div className="flex h-2 w-2 items-center justify-center">
                <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </div>
              <span>Trusted by developers worldwide</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
