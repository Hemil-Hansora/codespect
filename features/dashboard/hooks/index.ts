"use client"
import { useQuery } from "@tanstack/react-query"
import { getContributionStates, getDashboardStats, getMonthlyActivity } from "../actions"

export const useDashboard = () => {
    return useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => await getDashboardStats(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes cache
    })
}

export const useMonthlyActivity = () => {
    return useQuery({
        queryKey: ['monthly-activity'],
        queryFn: async () => await getMonthlyActivity(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes cache
    })
}

export const useContributionStates = () => {
    return useQuery({
        queryKey: ['contribution-graph'],
        queryFn: async () => await getContributionStates(),
        staleTime: 1000 * 60 * 10, // 10 minutes - contribution data rarely changes
        gcTime: 1000 * 60 * 30, // 30 minutes cache
    })
}