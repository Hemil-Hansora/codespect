"use client";
import { useTheme } from "next-themes";
import { ActivityCalendar } from "react-activity-calendar";
import { useContributionStates } from "../hooks";
import { Spinner } from "@/components/ui/spinner";
import { GitCommit } from "lucide-react";

export const ContributionGraph = () => {
  const { theme } = useTheme();
  const { data, isLoading } = useContributionStates();

  if (isLoading) {
    return (
      <div className="flex flex-col w-full items-center justify-center p-8 gap-3 min-h-[200px]">
        <Spinner className="h-6 w-6 text-primary" />
        <div className="text-sm text-muted-foreground animate-pulse">
          Loading contribution data...
        </div>
      </div>
    );
  }

  if (!data || !data.contributions.length) {
    return (
      <div className="flex flex-col w-full items-center justify-center p-8 min-h-[200px] border border-dashed rounded-lg bg-muted/20">
        <GitCommit className="h-10 w-10 text-muted-foreground/50 mb-2" />
        <div className="text-muted-foreground font-medium">
          No contribution data available
        </div>
        <div className="text-xs text-muted-foreground/70 mt-1">
          Make some commits to see your activity graph
        </div>
      </div>
    );
  }
  return (
    <div className="w-full flex flex-col items-center gap-6">
      <div className="w-full flex items-center justify-between px-2">
         <div className="text-sm text-muted-foreground">
            Yearly Activity
         </div>
         <div className="text-sm text-muted-foreground bg-muted/40 px-3 py-1 rounded-full border border-border/50">
            <span className="font-semibold text-foreground">{data.totalContributions} </span>
            contributions in the last year
        </div>
      </div>
      
      <div className="w-full overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex justify-center min-w-max ">
          <ActivityCalendar
            data={data.contributions}
            colorScheme={theme === "dark" ? "dark" : "light"}
            blockSize={12}
            blockMargin={4}
            fontSize={12}
            showWeekdayLabels
            showTotalCount={false}
            theme={{
              light: ["hsl(0, 0%, 92%)", "#e11d48"], // Using approximate primary color hex
              dark: ["#1e293b", "#e11d48"], // Using approximate primary color hex
            }}
            style={{
                color: 'var(--muted-foreground)'
            }}
          />
        </div>
      </div>
    </div>
  );
};
