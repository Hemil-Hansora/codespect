"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for trying out CodeSpect on personal projects.",
    features: [
      "Up to 5 repositories",
      "Up to 5 reviews per repository",
      "GitHub PR comments",
      "Codebase context (RAG)",
      "Review history dashboard",
    ],
    cta: "Start Free",
    ctaLoggedIn: "Go to Dashboard",
    href: "/login",
    hrefLoggedIn: "/dashboard",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$29.99",
    period: "/month",
    description: "For teams and developers who ship frequently.",
    features: [
      "Unlimited repositories",
      "Unlimited reviews per repository",
      "GitHub PR comments",
      "Codebase context (RAG)",
      "Review history dashboard",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
    ctaLoggedIn: "Upgrade to Pro",
    href: "/login",
    hrefLoggedIn: "/dashboard/subscriptions",
    highlight: true,
  },
];

export function PricingSection() {
  const { data: session } = useSession();

  return (
    <section id="pricing" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free. Upgrade when you need more.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid gap-8 lg:grid-cols-2 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col ${
                plan.highlight
                  ? "border-primary/50 bg-gradient-to-b from-primary/5 to-transparent shadow-xl shadow-primary/10"
                  : "border-border/50 bg-card/50"
              }`}
            >
              {/* {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-lg">
                    <Sparkles className="h-3 w-3" />
                    Most Popular
                  </span>
                </div>
              )} */}

              <CardHeader className="pb-0">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-muted-foreground">{plan.period}</span>
                  )}
                </div>
                <CardDescription className="mt-2">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                <ul className="mt-6 space-y-3 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                      <span className="text-sm text-muted-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  size="lg"
                  variant={plan.highlight ? "default" : "outline"}
                  className={`mt-8 w-full ${
                    plan.highlight ? "shadow-lg shadow-primary/20" : ""
                  }`}
                >
                  <Link href={session ? plan.hrefLoggedIn : plan.href}>
                    {session ? plan.ctaLoggedIn : plan.cta}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* What counts as a review */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            <strong className="text-foreground">What counts as a review?</strong>{" "}
            A review is triggered when a pull request is opened or updated
            (synchronized). Each PR event consumes one review from your limit.
          </p>
        </div>
      </div>
    </section>
  );
}
