// composables/useSellerProfile.js
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useSellerProfileStore } from "@/stores/sellerProfileStore";

/**
 * Composable for seller profile management
 * Provides reactive state and methods from the store
 */
export const useSellerProfile = () => {
  const store = useSellerProfileStore();

  // Extract reactive refs from store
  const {
    profile,
    isLoading,
    isCreating,
    isUpdating,
    isUploadingLogo,
    isUploadingBanner,
    uploadProgress,
    error,
    hasProfile,
    storeName,
    storeSlug,
    profileCompleteness,
  } = storeToRefs(store);

  // Extract actions from store
  const {
    fetchProfile,
    createProfile,
    updateProfile,
    uploadLogo,
    uploadBanner,
    archiveProfile,
    restoreProfile,
    deleteProfile,
    clearProfile,
    clearError,
  } = store;

  // Computed error states for easier template usage
  const profileError = computed(() => {
    if (!error.value) return null;
    return error.value;
  });
    const profileLogo = computed(() => {
    return profile.value?.logo || null;
  });

  const createError = computed(() => {
    if (!error.value || !isCreating.value) return null;
    return error.value;
  });

  const updateError = computed(() => {
    if (!error.value || !isUpdating.value) return null;
    return error.value;
  });

  const uploadError = computed(() => {
    if (!error.value || (!isUploadingLogo.value && !isUploadingBanner.value)) return null;
    return error.value;
  });
  

  return {
    // State
    profile,
    isLoading,
    isLoadingProfile: isLoading,
    isCreating,
    isUpdating,
    isUploadingLogo,
    isUploadingBanner,
    uploadProgress,
    error,

    // Computed
    hasProfile,
    storeName,
    storeSlug,
    profileCompleteness,
    profileError,
    createError,
    updateError,
    uploadError,
    profileLogo,

    // Actions
    fetchProfile,
    createProfile,
    updateProfile,
    uploadLogo,
    uploadBanner,
    archiveProfile,
    restoreProfile,
    deleteProfile,
    clearProfile,
    clearError,
  };
};