"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What GitHub permissions are required?",
    answer:
      "CodeSpect requires read access to your repositories and pull requests to analyze code changes. We also need permission to create webhooks for listening to PR events and to post comments on pull requests. You can review and revoke access at any time from your GitHub settings.",
  },
  {
    question: "How are reviews triggered?",
    answer:
      "Reviews are automatically triggered when a pull request is opened or when new commits are pushed to an existing PR (synchronized event). CodeSpect listens for these webhook events and initiates the review pipeline automatically—no manual action required.",
  },
  {
    question: "Does CodeSpect comment directly on my PRs?",
    answer:
      "Yes. Once the AI review is complete, CodeSpect posts the review as a comment on your GitHub pull request. You'll see suggestions, notes, and context-aware feedback directly in the PR conversation thread.",
  },
  {
    question: 'What is indexed for "codebase context"?',
    answer:
      "CodeSpect indexes relevant content and code snippets from your repository to provide context-aware reviews. This includes function signatures, class definitions, and usage patterns. The indexed data is stored as embeddings in a vector database for efficient retrieval during reviews.",
  },
  {
    question: "What happens when I hit Free plan limits?",
    answer:
      "When you reach the limit of 5 repositories or 5 reviews per repository on the Free plan, you'll see an upgrade prompt. You can either upgrade to Pro for unlimited access or disconnect a repository to connect a new one. Existing reviews remain accessible in your dashboard.",
  },
  {
    question: "Can I disconnect a repository?",
    answer:
      "Yes. You can connect and disconnect repositories at any time from your dashboard. When disconnected, the webhook is removed and no new reviews will be triggered for that repository. Your review history is preserved.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="py-20 sm:py-28 bg-muted/20 border-t border-border/40">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to know about CodeSpect.
          </p>
        </div>

        {/* FAQ Accordion */}
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border-border/50"
            >
              <AccordionTrigger className="text-left text-foreground hover:text-primary">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
