import type { Metadata } from "next";
import {
  LandingNav,
  HeroSection,
  SocialProofSection,
  FeaturesSection,
  HowItWorksSection,
  PricingSection,
  FaqSection,
  FooterSection,
} from "@/components/landing";

export const metadata: Metadata = {
  title: "CodeSpect - AI Code Reviews for GitHub PRs",
  description:
    "Automated AI code reviews that understand your codebase. Get context-aware feedback on every pull request. Free to start.",
  openGraph: {
    title: "CodeSpect - AI Code Reviews for GitHub PRs",
    description:
      "Automated AI code reviews that understand your codebase. Get context-aware feedback on every pull request.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeSpect - AI Code Reviews for GitHub PRs",
    description:
      "Automated AI code reviews that understand your codebase. Get context-aware feedback on every pull request.",
  },
};

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <LandingNav />
      <HeroSection />
      <SocialProofSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <FaqSection />
      <FooterSection />
    </main>
  );
}
