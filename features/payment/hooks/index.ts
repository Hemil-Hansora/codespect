import { useQuery } from "@tanstack/react-query";
import { getSubscriptionData, syncSubscriptionStatus } from "../actions";

export const useSubscription = () => {
  return useQuery({
    queryKey: ["subscription-data"],
    queryFn: async () => await getSubscriptionData(),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes cache
  });
};

export const useSyncSubscription = () => {
  return useQuery({
    queryKey: ["sync-subscription"],
    queryFn: async () => await syncSubscriptionStatus(),
    staleTime: 0, // Always fresh for sync operations
  });
};
