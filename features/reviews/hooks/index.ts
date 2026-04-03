import { useQuery } from "@tanstack/react-query";
import { getReviews } from "../actions";

export const useReviews = () => {
  return useQuery({
    queryKey: ["reviews"],
    queryFn: async () => await getReviews(),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes cache
  });
};
