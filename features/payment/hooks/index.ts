import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSubscriptionData, syncSubscriptionStatus } from "../actions";

export const SUBSCRIPTION_QUERY_KEY = ["subscription-data"] as const;

export const useSubscription = () => {
  return useQuery({
    queryKey: SUBSCRIPTION_QUERY_KEY,
    queryFn: async () => await getSubscriptionData(),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes cache
  });
};

export const useSyncSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => await syncSubscriptionStatus(),
    onSuccess: () => {
      // Invalidate and refetch subscription data after successful sync
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_QUERY_KEY });
    },
  });
};

export const useInvalidateSubscription = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_QUERY_KEY });
  };
};
