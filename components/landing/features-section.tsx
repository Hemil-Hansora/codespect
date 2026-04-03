import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MessageSquareCode,
  Brain,
  History,
  GitFork,
  Gauge,
  Moon,
} from "lucide-react";

const features = [
  {
    icon: MessageSquareCode,
    title: "GitHub PR Review Comments",
    description:
      "Automatically posts detailed code reviews as comments on your pull requests when they're opened or updated.",
  },
  {
    icon: Brain,
    title: "Codebase Context (RAG)",
    description:
      "Indexes your repository and retrieves relevant code context using embeddings and vector search for smarter reviews.",
  },
  {
    icon: History,
    title: "Review History Dashboard",
    description:
      "Track all your AI reviews in one place. See status (pending, completed, failed) and access full review details.",
  },
  {
    icon: GitFork,
    title: "Repository Connect & Management",
    description:
      "Connect and disconnect repositories with one click. Webhooks are created automatically for PR events.",
  },
  {
    icon: Gauge,
    title: "Plans & Limits",
    description:
      "Start free with 5 repositories and 5 reviews each. Upgrade to Pro for unlimited repos and reviews.",
  },
  {
    icon: Moon,
    title: "Dark Mode Ready UI",
    description:
      "Beautiful interface that adapts to your preference. Toggle between light and dark themes seamlessly.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need for{" "}
            <span className="text-primary">smarter code reviews</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            CodeSpect integrates directly with your GitHub workflow to deliver
            intelligent, context-aware reviews on every PR.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <Card
              key={title}
              className="group border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
            >
              <CardHeader>
                <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
