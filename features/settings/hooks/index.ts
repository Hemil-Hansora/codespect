"use client";


import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateUserProfile } from "../actions";
import { currentUser } from "@/features/auth/actions";
import { disconnectAllRepositories, disconnectRepository, getConnenctedRepositories } from "@/features/github";

export const useProfileUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name?: string; email?: string }) =>
      await updateUserProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["user-profile"],
      });
      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update profile");
      console.error("Error updating profile", error);
    },
  });
};

export const useProfile = () => {
  return useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => await currentUser(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useConnectedRepositories = () => {
  return useQuery({
    queryKey: ["connected-repositories"],
    queryFn: async () => await getConnenctedRepositories(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useDisconnectRepository = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (repoId: number) => await disconnectRepository(repoId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["connected-repositories"],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard-stats"],
      })
      toast.success("Repository disconnected successfully");
    },
    onError: (error) => {
      toast.error("Failed to disconnect repository");
      console.error("Error disconnecting repository", error);
    },
  });
};

export const useDisconnectAllRepositories = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => await disconnectAllRepositories(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["connected-repositories"],
      });
       queryClient.invalidateQueries({
        queryKey: ["dashboard-stats"],
      })
      toast.success("All repositories disconnected successfully");
    },
    onError: (error) => {
      toast.error("Failed to disconnect all repositories");
      console.error("Error disconnecting all repositories", error);
    },
  });
};