// composables/useUserQueries.js
import { useQuery, useQueryClient } from "@tanstack/vue-query";
import userProfileService from "@/services/userProfileService";
import { useAuthStore } from "@/stores/authStore";

export const useUserQueries = () => {
  const authStore = useAuthStore();
  const queryClient = useQueryClient();

  const useProfileQuery = () => {
    return useQuery({
      queryKey: ["user", "profile"],
      queryFn: async () => {
        const result = await userProfileService.getProfile();
        if (!result.success) throw new Error(result.error);
        return result.data;
      },
      enabled: !!authStore.isAuthenticated,
      staleTime: 5 * 60 * 1000,
    });
  };

  const useAddressesQuery = () => {
    return useQuery({
      queryKey: ["user", "addresses"],
      queryFn: async () => {
        const result = await userProfileService.getAddresses();
        if (!result.success) throw new Error(result.error);
        return result.data.addresses?.list || [];
      },
      enabled: !!authStore.isAuthenticated,
      staleTime: 5 * 60 * 1000,
    });
  };

  // ✅ RETURN queryClient, bukan function wrapper
  return {
    useProfileQuery,
    useAddressesQuery,
    queryClient, // Export client langsung
  };
};