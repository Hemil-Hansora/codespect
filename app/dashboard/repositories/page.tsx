"use client";

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
import { Input } from "@/components/ui/input";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useConnectRepository, useRepositoryHooks } from "@/features/repositories/hooks";
import {
  CheckCircle2,
  ExternalLink,
  GitFork,
  Github,
  Lock,
  RefreshCcw,
  Search,
  Star,
  Unlock,
  X,
} from "lucide-react";
import { RepositoryListSkeleton } from "@/features/repositories/components/repository-skeleton";

interface Repository {
  id: number;
  name: string;
  isConnected?: boolean;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  topics: string[];
  private?: boolean;
  forks_count?: number;
  updated_at?: string;
}

const RepositoryPage = () => {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useRepositoryHooks();
  const [searchQuery, setSearchQuery] = useState("");
  const [localConnectingId, setLocalConnectingId] = useState<number | null>(
    null,
  );

  const observerTarget = useRef<HTMLDivElement>(null);

  const { mutate: connectRepository } = useConnectRepository();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        threshold: 0.1,
      },
    );
    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }
    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleConnect = async (repo: Repository) => {
    setLocalConnectingId(repo.id);
    connectRepository(
      {
        owner: repo.full_name.split("/")[0],
        repo: repo.name,
        githubId: repo.id,
      },
      {
        onSuccess: () => {
          toast.success(`Successfully connected ${repo.name}`, {
            description: "AI-powered code reviews are now enabled for this repository.",
          });
        },
        onError: (error: { message: any; }) => {
          console.error('Error connecting repository:', error);
          toast.error(`Failed to connect ${repo.name}`, {
            description: error?.message || "Please try again later.",
          });
        },
        onSettled: () => setLocalConnectingId(null),
      },
    );
  };

  const allRepositories = (data?.pages.flatMap((page: any) => page) ||
    []) as Repository[];
  const filteredRepositories = allRepositories.filter(
    (repo) =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.full_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getLanguageColor = (language: string | null) => {
    if (!language) return "bg-gray-500";
    const colors: Record<string, string> = {
      TypeScript: "bg-blue-500",
      JavaScript: "bg-yellow-400",
      Python: "bg-green-500",
      Java: "bg-red-500",
      Go: "bg-cyan-500",
      Rust: "bg-orange-500",
      HTML: "bg-orange-600",
      CSS: "bg-blue-600",
    };
    return colors[language] || "bg-primary";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen animate-in fade-in duration-500">
        <div className="sticky top-0 z-20 flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-background/80 backdrop-blur-xl border-b border-border/40 py-4 px-4 md:px-6 lg:px-8">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Github className="size-5 text-primary" />
              <h1 className="text-xl font-bold tracking-tight">Repositories</h1>
            </div>
            <p className="text-muted-foreground text-xs md:text-sm hidden md:block max-w-lg">
              Select repositories to connect with CodeSpect for AI-powered
              reviews.
            </p>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-80 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <Input
                placeholder="Search repositories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9 bg-background/50 border-input focus:ring-primary/20 transition-all hover:border-primary/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              className={cn(
                "shrink-0 bg-background/50",
                isRefetching && "animate-spin",
              )}
              disabled={isRefetching}
              title="Refresh repositories"
            >
              <RefreshCcw className="size-4" />
            </Button>
          </div>
        </div>
        <div className="p-4 md:p-6 lg:p-8 space-y-8">
          <RepositoryListSkeleton />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <div className="rounded-full bg-destructive/10 p-4">
          <Github className="size-8 text-destructive" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Failed to load repositories</h3>
          <p className="text-muted-foreground max-w-sm">
            We couldn't fetch your repositories from GitHub. Please try again
            later.
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen animate-in fade-in duration-500">
      <div className="sticky top-0 z-20 flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-background/80 backdrop-blur-xl border-b border-border/40 py-4 px-4 md:px-6 lg:px-8">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Github className="size-5 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">Repositories</h1>
          </div>
          <p className="text-muted-foreground text-xs md:text-sm hidden md:block max-w-lg">
            Select repositories to connect with CodeSpect for AI-powered
            reviews.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <Input
              placeholder="Search repositories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9 bg-background/50 border-input focus:ring-primary/20 transition-all hover:border-primary/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            className={cn(
              "shrink-0 bg-background/50",
              isRefetching && "animate-spin",
            )}
            disabled={isRefetching}
            title="Refresh repositories"
          >
            <RefreshCcw className="size-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 md:p-6 lg:p-8 space-y-8">
        {filteredRepositories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border rounded-xl bg-card border-dashed animate-in zoom-in-95 duration-300">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <Search className="size-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">No repositories found</h3>
            <p className="text-muted-foreground max-w-sm mt-1 mb-4">
              We couldn't find any repositories matching "{searchQuery}".
            </p>
            {searchQuery && (
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredRepositories.map((repo) => (
              <Card
                key={repo.id}
                className={cn(
                  "group flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/60",
                  repo.isConnected &&
                    "border-primary/50 bg-primary/5 dark:bg-primary/5 shadow-sm",
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2 w-full min-w-0">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 w-full min-w-0">
                        <CardTitle
                          className="text-base font-semibold truncate hover:text-primary transition-colors cursor-pointer min-w-0 flex-1 block"
                          title={repo.name}
                        >
                          <Link
                            href={repo.html_url}
                            target="_blank"
                            className="block truncate"
                          >
                            {repo.name}
                          </Link>
                        </CardTitle>
                        <Badge
                          variant={repo.private ? "secondary" : "outline"}
                          className="text-[10px] h-5 px-1.5 font-normal shadow-none shrink-0"
                        >
                          {repo.private ? (
                            <Lock className="size-3 mr-1" />
                          ) : (
                            <Unlock className="size-3 mr-1" />
                          )}
                          {repo.private ? "Private" : "Public"}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-1 text-xs ">
                        {repo.full_name}
                      </CardDescription>
                    </div>
                    {repo.isConnected && (
                      <div className="rounded-full bg-green-500/15 p-1 text-green-600 dark:text-green-500 animate-in zoom-in spin-in-180 duration-500 shrink-0">
                        <CheckCircle2 className="size-4" />
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex-1 pb-3">
                  <p className="text-sm text-muted-foreground line-clamp-2 h-10 mb-4 leading-relaxed">
                    {repo.description || "No description provided."}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {repo.language && (
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "size-2.5 rounded-full ring-1 ring-background",
                            getLanguageColor(repo.language),
                          )}
                        />
                        <span className="font-medium">{repo.language}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1">
                      <Star className="size-3.5" />
                      <span>{repo.stargazers_count}</span>
                    </div>

                    {repo.forks_count !== undefined && (
                      <div className="flex items-center gap-1">
                        <GitFork className="size-3.5" />
                        <span>{repo.forks_count}</span>
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="pt-3 pb-3 border-t bg-muted/20">
                  <div className="flex  w-full items-center justify-between gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-primary h-8 px-2"
                      asChild
                    >
                      <Link
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs"
                      >
                        <ExternalLink className="size-3.5" />
                        GitHub
                      </Link>
                    </Button>

                    <Button
                      onClick={() => handleConnect(repo)}
                      disabled={
                        localConnectingId === repo.id || repo.isConnected
                      }
                      size="sm"
                      className={cn(
                        "h-8 text-xs font-medium transition-all w-28",
                        repo.isConnected
                          ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                          : "bg-primary text-primary-foreground shadow-sm hover:shadow-primary/25",
                      )}
                    >
                      {localConnectingId === repo.id ? (
                        <div className="flex items-center gap-1.5">
                          <span className="size-2.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Connecting
                        </div>
                      ) : repo.isConnected ? (
                        "Managed"
                      ) : (
                        "Connect"
                      )}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        <div className="py-8 flex justify-center w-full" ref={observerTarget}>
          {isFetchingNextPage ? (
            <div className="flex flex-col items-center gap-2">
              <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-muted-foreground">
                Loading more repositories...
              </span>
            </div>
          ) : !hasNextPage && allRepositories.length > 0 ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <div className="h-px w-12 bg-border" />
              <span>End of list</span>
              <div className="h-px w-12 bg-border" />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default RepositoryPage;
