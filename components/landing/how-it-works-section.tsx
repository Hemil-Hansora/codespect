import { GitFork, Database, MessageSquare, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: GitFork,
    step: "01",
    title: "Connect your repository",
    description:
      "Authenticate with GitHub and connect your repositories. CodeSpect creates a webhook to listen for pull request events.",
  },
  {
    icon: Database,
    step: "02",
    title: "CodeSpect indexes your codebase",
    description:
      "We analyze and index your repository files using embeddings, enabling context-aware code understanding.",
  },
  {
    icon: MessageSquare,
    step: "03",
    title: "Get AI reviews on every PR",
    description:
      "Open or update a pull request. CodeSpect fetches the diff, retrieves relevant context, and posts a detailed review as a PR comment.",
  },
];

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="relative py-20 sm:py-28 bg-muted/20 border-y border-border/40"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How it works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to automated, context-aware code reviews.
          </p>
        </div>

        {/* Steps */}
        <div className="grid gap-8 lg:grid-cols-3">
          {steps.map(({ icon: Icon, step, title, description }, index) => (
            <div key={step} className="relative">
              {/* Connector arrow (desktop only) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 -right-4 z-10">
                  <ArrowRight className="h-8 w-8 text-border" />
                </div>
              )}

              <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                {/* Step number + icon */}
                <div className="relative mb-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-border/50">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-lg">
                    {step}
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
