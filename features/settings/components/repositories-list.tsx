

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
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon, Github01Icon, LinkSquare01Icon } from "@hugeicons/core-free-icons";
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
      <Card className="border-none shadow-none bg-transparent p-0 h-full flex flex-col">
        <CardHeader className="px-0 pt-0 pb-4 space-y-1 shrink-0">
          <CardTitle>Connected Repositories</CardTitle>
          <CardDescription>
            Manage the repositories connected to CodeSpect.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 flex-1">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 animate-pulse border rounded-md p-3"
              >
                <div className="h-8 w-8 bg-muted rounded-md" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-none bg-transparent p-0 h-full flex flex-col">
      <CardHeader className="px-0 pt-0 pb-4 flex flex-row items-center justify-between space-y-0 shrink-0">
        <div className="space-y-1">
          <CardTitle>Connected Repositories</CardTitle>
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
                className="h-8 text-xs text-destructive hover:text-destructive border-border"
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

      <CardContent className="p-0 flex-1 min-h-0">
        {!repositories || repositories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-75 text-center border rounded-lg border-dashed bg-muted/30">
            <p className="text-muted-foreground text-sm mb-4">
              No repositories connected yet.
            </p>
            <Button variant="outline" size="sm" asChild>
              <a href="/dashboard/repositories">Connect Repository</a>
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-full w-full pr-4">
            <div className="space-y-3 pb-4">
              {repositories.map((repo) => (
                <div
                  key={repo.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-muted/30 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                    
                        <HugeiconsIcon icon={Github01Icon} className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-sm truncate">
                          {repo.fullName}
                        </h3>
                      </div>
                      <Badge
                        variant="secondary"
                        className="mt-1 h-5 gap-1 px-1.5 font-normal text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        Connected
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      asChild
                    >
                      <a href={repo.url} target="_blank" rel="noreferrer">
                        <HugeiconsIcon icon={LinkSquare01Icon} className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive h-7 w-7"
                        >
                          <HugeiconsIcon icon={Delete02Icon} className="h-3.5 w-3.5" />
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
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
