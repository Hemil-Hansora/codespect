

"use client";

import { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Github, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useConnectedRepositories, useDisconnectAllRepositories, useDisconnectRepository } from "../hooks";


export const RepositoriesList = () => {
  const [disconnectedAllOpen, setDisconnectedAllOpen] = useState(false);
  const { data: repositories, isLoading, isError } = useConnectedRepositories();
  const {
    mutateAsync,
    isPending: isDisconnecting,
    isError: isDisconnectError,
  } = useDisconnectRepository();
  const { mutateAsync: disconnectAll, isPending: isDisconnectingAll } =
    useDisconnectAllRepositories();

  if (isLoading) {
    return (
      <Card className="border shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-lg">Connected Repositories</CardTitle>
          <CardDescription>
            Manage the repositories connected to CodeSpect.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 animate-pulse border rounded-lg p-4"
              >
                <div className="h-10 w-10 bg-muted rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 bg-muted rounded" />
                  <div className="h-3 w-1/3 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border shadow-sm flex flex-col">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-lg">Connected Repositories</CardTitle>
          <CardDescription>
            Manage your connected repositories and AI review settings.
          </CardDescription>
        </div>
        {repositories && repositories.length > 0 && (
          <AlertDialog
            open={disconnectedAllOpen}
            onOpenChange={setDisconnectedAllOpen}
          >
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isDisconnectingAll}
                className="text-destructive hover:text-destructive shrink-0"
              >
                Disconnect All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Disconnect All Repositories?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will disconnect all {repositories.length} of your
                  connected repositories. AI reviews will stop immediately.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive hover:bg-destructive/90"
                  onClick={async () => await disconnectAll()}
                >
                  {isDisconnectingAll ? "Disconnecting..." : "Disconnect All"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardHeader>

      <CardContent className="flex-1 min-h-0 pb-6">
        {!repositories || repositories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg bg-muted/20">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Github className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-base mb-1">No repositories connected</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              Connect your GitHub repositories to enable AI-powered code reviews.
            </p>
            <Button variant="default" size="default" asChild>
              <a href="/dashboard/repositories">Connect Repository</a>
            </Button>
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            {repositories.map((repo) => (
              <div
                key={repo.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="h-10 w-10 rounded-lg bg-muted/50 flex items-center justify-center shrink-0 border">
                    <Github className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-sm truncate mb-1">
                      {repo.fullName}
                    </h3>
                    <Badge
                      variant="secondary"
                      className="h-5 gap-1.5 px-2 font-normal text-xs text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      Connected
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 shrink-0"
                    asChild
                  >
                    <a href={repo.url} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive h-8 w-8 shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Disconnect Repository?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This will disconnect <strong>{repo.fullName}</strong>.
                          AI reviews will stop for this repository.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive hover:bg-destructive/90"
                          onClick={async () => {
                            await mutateAsync(repo.id);
                          }}
                          disabled={isDisconnecting}
                        >
                          {isDisconnecting
                            ? "Disconnecting..."
                            : "Disconnect"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
