"use client";

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { connectRepository, fetchRepositories } from "../actions";
import { toast } from "sonner";
import { SUBSCRIPTION_QUERY_KEY } from "@/features/payment/hooks";

export const useRepositoryHooks = () => {
  return useInfiniteQuery({
    queryKey: ["repositories"],
    queryFn: async ({ pageParam = 1 }) => {
      const data = await fetchRepositories(pageParam, 10);
      return data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 10) {
        return undefined;
      } else {
        return allPages.length + 1;
      }
    },
    staleTime: 1000 * 60 * 3, // 3 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes cache
  });
};

export const useConnectRepository = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn : async (data: { owner: string; repo: string; githubId: number }) =>
    await connectRepository(data.owner, data.repo, data.githubId),
    onSuccess: () => {
      toast.success("Repository connected successfully");
      queryClient.invalidateQueries({ queryKey: ["repositories"] });
      // Invalidate subscription data to update usage stats
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_QUERY_KEY });
    },
    onError: (error) => {
      toast.error("Failed to connect repository");
      console.error("Connect repository error:", error);
    }
  })

};
