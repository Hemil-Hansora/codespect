"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { ContributionGraph } from "@/features/dashboard/components/contribution-graph";
import { useDashboard, useMonthlyActivity } from "@/features/dashboard/hooks";
import {
  Bot,
  GitBranch,
  GitCommitHorizontal,
  GitPullRequestArrow,
  LayoutDashboard,
  Sparkles,
  Zap,
} from "lucide-react";
import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function DashboardPage() {
  const {
    data: stats,
    isLoading: isDashboardLoading,
    error: dashboardError,
  } = useDashboard();
  const {
    data: monthlyActivity,
    isLoading: isMonthlyActivityLoading,
    error: monthlyActivityError,
  } = useMonthlyActivity();

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden animate-in fade-in duration-500">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between border-b border-border/40 bg-background/80 backdrop-blur-xl py-3 px-4 md:px-6 lg:px-8 z-20">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="size-5 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">Dashboard</h1>
          </div>
          <p className="text-muted-foreground text-xs md:text-sm hidden md:block max-w-lg">
            Welcome back! Here's an overview of your coding activity and AI-powered insights.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-5 lg:p-6 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Repositories"
            icon={GitBranch}
            value={stats?.totalRepo || 0}
            subtitle="Connected Repositories"
            loading={isDashboardLoading}
            delay={0}
          />
          <StatsCard
            title="Total Commits"
            icon={GitCommitHorizontal}
            value={stats?.totalCommits || 0}
            subtitle="In the last year"
            loading={isDashboardLoading}
            delay={100}
          />
          <StatsCard
            title="Pull Requests"
            icon={GitPullRequestArrow}
            value={stats?.totalPRs || 0}
            subtitle="All time"
            loading={isDashboardLoading}
            delay={200}
          />
          <StatsCard
            title="AI Reviews"
            icon={Bot}
            value={stats?.totalAIReviews || 0}
            subtitle="Generated Reviews"
            loading={isDashboardLoading}
            delay={300}
            highlight
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-border/50 shadow-sm transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Activity Overview
            </CardTitle>
            <CardDescription>
              Monthly breakdown of commits, PRs, and AI reviews.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {isMonthlyActivityLoading ? (
              <div className="h-[350px] w-full flex items-center justify-center">
                <Spinner className="text-primary" />
              </div>
            ) : (
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyActivity || []} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="var(--muted-foreground)" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      dy={10}
                    />
                    <YAxis 
                      stroke="var(--muted-foreground)" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip
                      cursor={{ fill: 'var(--muted)', opacity: 0.1 }}
                      contentStyle={{
                        backgroundColor: "var(--popover)",
                        borderColor: "var(--border)",
                        borderRadius: "var(--radius)",
                        boxShadow: "var(--shadow-md)",
                        color: "var(--popover-foreground)",
                      }}
                      itemStyle={{ color: "var(--foreground)" }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }} 
                      iconType="circle"
                    />
                    <Bar
                      dataKey="commits"
                      name="Commits"
                      fill="var(--chart-1)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                    <Bar
                      dataKey="prs"
                      name="Pull Requests"
                      fill="var(--chart-2)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                    <Bar
                      dataKey="review"
                      name="AI Reviews"
                      fill="var(--chart-3)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3 border-border/50 shadow-sm transition-all hover:shadow-md flex flex-col overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Contribution Graph</CardTitle>
            <CardDescription>
              Your visualization of coding frequency directly from Git.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center p-6 bg-card/50 overflow-x-hidden">
             <ContributionGraph />
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}

const StatsCard = ({ title, icon: Icon, value, subtitle, loading, delay, highlight }: any) => {
  return (
    <Card 
      className={`border-border/50 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${
        highlight ? 'bg-primary/5 border-primary/20 ring-1 ring-primary/10' : 'bg-card'
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${highlight ? 'bg-primary/10 text-primary' : 'bg-muted/50 text-muted-foreground'}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight text-foreground">
          {loading ? <Spinner className="h-5 w-5 opacity-50" /> : value}
        </div>
        <div className="flex items-center text-xs text-muted-foreground mt-1">
          {highlight && <Sparkles className="h-3 w-3 mr-1 text-primary animate-pulse" />}
          {subtitle}
        </div>
      </CardContent>
    </Card>
  )
}
