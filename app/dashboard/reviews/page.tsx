"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useReviews } from "@/features/reviews/hooks";
import { formatDistanceToNow } from "date-fns";
import {
  Bot,
  CheckCircle2,
  Clock,
  ExternalLink,
  Github,
  GitPullRequest,
  MessageSquareText,
  RefreshCcw,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

const ReviewPage = () => {
  const { data: reviews, isLoading, isError, refetch, isRefetching } =
    useReviews();

  const handleRefresh = async () => {
    toast.promise(refetch(), {
      loading: "Refreshing reviews...",
      success: "Reviews refreshed successfully",
      error: "Failed to refresh reviews",
    });
  };

  if (isError) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4 text-center animate-in fade-in duration-500 px-4">
        <div className="rounded-full bg-destructive/10 p-4 shadow-lg shadow-destructive/5">
          <Bot className="size-10 text-destructive" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold tracking-tight">
            Failed to load reviews
          </h3>
          <p className="text-muted-foreground max-w-sm">
            We couldn't fetch your code review history. Please check your
            connection and try again.
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh} className="mt-2">
          <RefreshCcw className="mr-2 size-4" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen animate-in fade-in duration-500">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-background/80 backdrop-blur-xl border-b border-border/40 py-4 px-4 md:px-6 lg:px-8">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Bot className="size-5 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">Review History</h1>
          </div>
          <p className="text-muted-foreground text-xs md:text-sm hidden md:block max-w-2xl">
            Track and manage your AI-powered code reviews. View feedback details,
            status, and improvements for your pull requests.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            className={cn(
              "shrink-0 bg-background/50 border-input hover:bg-accent hover:text-accent-foreground transition-all duration-300",
              isRefetching && "animate-spin text-primary border-primary/50",
            )}
            disabled={isRefetching}
            title="Refresh reviews"
          >
            <RefreshCcw className="size-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className=" md:p-6 lg:p-8 space-y-2 max-w-[1600px] w-full mx-auto">
        {isLoading ? (
          <div className="grid gap-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-border/60">
                <CardHeader className="pb-3 border-b border-border/10">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                       <Skeleton className="h-5 w-48" />
                       <Skeleton className="h-5 w-20" />
                    </div>
                    <Skeleton className="h-4 w-32" />
                  </div>
                </CardHeader>
                <CardContent className="pt-4 pb-4">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : reviews?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border/60 rounded-xl bg-card/50 animate-in zoom-in-95 duration-500">
            <div className="rounded-full bg-primary/10 p-5 mb-5 ring-1 ring-primary/20">
              <GitPullRequest className="size-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold tracking-tight">
              No reviews found
            </h3>
            <p className="text-muted-foreground max-w-sm mt-2 mb-8 leading-relaxed">
              When you connect a repository and open a pull request, your AI
              reviews will appear here automatically.
            </p>
            <Button
              asChild
              className="shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30"
            >
              <Link href="/dashboard/repositories">
                <Github className="mr-2 size-4" />
                Connect Repositories
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {reviews?.map((review) => (
              <Card
                key={review.id}
                className="group flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/60"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2 w-full min-w-0">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 w-full min-w-0">
                        <CardTitle
                          className="text-base font-semibold truncate hover:text-primary transition-colors cursor-pointer min-w-0 flex-1 block"
                          title={review.prTitle}
                        >
                          <Link
                            href={review.prURL}
                            target="_blank"
                            className="block truncate"
                          >
                            {review.prTitle}
                          </Link>
                        </CardTitle>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] h-5 px-1.5 font-normal shadow-none shrink-0",
                            review.status === "COMPLETED" &&
                              "bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
                            review.status === "PENDING" &&
                              "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
                            review.status === "FAILED" &&
                              "bg-destructive/10 text-destructive border-destructive/20",
                          )}
                        >
                          {review.status === "COMPLETED" && (
                            <CheckCircle2 className="size-3 mr-1" />
                          )}
                          {review.status === "FAILED" && (
                            <XCircle className="size-3 mr-1" />
                          )}
                          {review.status === "PENDING" && (
                            <Clock className="size-3 mr-1" />
                          )}
                          {review.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Github className="size-3" />
                          {review.repository.name}
                        </span>
                        <span>•</span>
                        <span>#{review.prNumber}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 pb-3">
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      <Bot className="size-3.5" />
                      AI Summary
                    </div>
                    <div className="text-sm text-muted-foreground line-clamp-3 leading-relaxed relative">
                      <ReactMarkdown >
                        {review.review || "No review content available."}
                      </ReactMarkdown>
                     
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1">
                      <Clock className="size-3.5" />
                      <span>
                        {formatDistanceToNow(new Date(review.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-3 pb-3 border-t bg-muted/20">
                  <div className="flex w-full items-center justify-between gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-primary h-8 px-2"
                      asChild
                    >
                      <Link
                        href={review.prURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs"
                      >
                        <ExternalLink className="size-3.5" />
                        GitHub
                      </Link>
                    </Button>

                    <Button
                      size="sm"
                      className="h-8 text-xs font-medium w-28 bg-primary text-primary-foreground shadow-sm hover:shadow-primary/25"
                      asChild
                    >
                      <Link href={review.prURL} target="_blank">
                        <MessageSquareText className="size-3.5 mr-1.5" />
                        Full Review
                      </Link>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewPage;
