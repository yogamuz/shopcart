// stores/sellerProfileStore.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { sellerProfileService } from "@/services/sellerProfileService";
import { useAuthStore } from "@/stores/authStore";

export const useSellerProfileStore = defineStore("sellerProfile", () => {
  // State
  const profile = ref(null);
  const isLoading = ref(false);
  const isCreating = ref(false);
  const isUpdating = ref(false);
  const isUploadingLogo = ref(false);
  const isUploadingBanner = ref(false);
  const uploadProgress = ref(0);
  const error = ref(null);
  const lastFetchedUserId = ref(null); // Track which user's profile is loaded
  const activeRequestId = ref(null);
  // Getters
  const hasProfile = computed(() => !!profile.value);

  const storeName = computed(() => profile.value?.storeName || "");

  const storeSlug = computed(() => profile.value?.storeSlug || "");

  const profileCompleteness = computed(() => {
    if (!profile.value) return 0;

    let completedFields = 0;
    const totalFields = 10;

    // Required fields
    if (profile.value.storeName) completedFields++;
    if (profile.value.description) completedFields++;
    if (profile.value.logo) completedFields++;
    if (profile.value.banner) completedFields++;

    // Contact fields
    if (profile.value.contact?.phone) completedFields++;
    if (profile.value.contact?.email) completedFields++;

    // Address fields
    if (profile.value.address?.street) completedFields++;
    if (profile.value.address?.city) completedFields++;
    if (profile.value.address?.province) completedFields++;
    if (profile.value.address?.postalCode) completedFields++;

    return Math.round((completedFields / totalFields) * 100);
  });

  // Actions
  const setProfile = profileData => {
    const authStore = useAuthStore();
    const currentUserId = authStore.user?._id || authStore.user?.id;

    // Only update if the profile belongs to the current user
    if (currentUserId) {
      profile.value = profileData;
      lastFetchedUserId.value = currentUserId;
      error.value = null;
      console.log("✅ Profile set for user:", currentUserId);
    }
  };

  const clearProfile = () => {
    profile.value = null;
    error.value = null;
    lastFetchedUserId.value = null;
    isLoading.value = false;
    isCreating.value = false;
    isUpdating.value = false;
    isUploadingLogo.value = false;
    isUploadingBanner.value = false;
    uploadProgress.value = 0;
    console.log("🧹 Seller profile cleared");
  };

  const setError = err => {
    error.value = {
      message: err.message || "An error occurred",
      status: err.status || 500,
      errors: err.errors || [],
    };
  };

  const clearError = () => {
    error.value = null;
  };

  /**
   * Validate token before fetch
   * ✅ ADDED: Ensure token is ready before making request
   */
  const validateTokenReady = async () => {
    const authStore = useAuthStore();

    // Check if we have user with token
    if (!authStore.user?.accessToken) {
      console.log("⚠️ No access token available");
      return false;
    }

    // Give axios interceptor time to set headers
    await new Promise(resolve => setTimeout(resolve, 50));

    return true;
  };

  const fetchProfile = async (force = false) => {
    const authStore = useAuthStore();
    const currentUserId = authStore.user?._id || authStore.user?.id;

    if (!currentUserId) {
      console.log("❌ No user ID - cannot fetch profile");
      clearProfile();
      return null;
    }

    // ✅ CRITICAL: Validate token is ready
    const tokenReady = await validateTokenReady();
    if (!tokenReady) {
      console.log("⚠️ Token not ready - skipping fetch");
      return null;
    }

    // Check if already loaded
    if (!force && profile.value && lastFetchedUserId.value === currentUserId) {
      console.log("✅ Profile already loaded for current user");
      return profile.value;
    }

    // Clear old profile if user changed
    if (lastFetchedUserId.value && lastFetchedUserId.value !== currentUserId) {
      console.log("🔄 User changed - clearing old profile");
      clearProfile();
    }

    // ✅ PERBAIKAN: Generate unique request ID
    const requestId = `${currentUserId}-${Date.now()}`;
    activeRequestId.value = requestId;

    try {
      isLoading.value = true;
      clearError();

      console.log("🔍 Fetching profile:", requestId);
      const response = await sellerProfileService.getProfile();

      // ✅ TAMBAH: Debug full response
      console.log("🔍 Full response:", response);
      console.log("🔍 Response.data:", response.data);
      console.log("🔍 Response.data.userId:", response.data?.userId);

      if (activeRequestId.value !== requestId) {
        console.log("⚠️ Request cancelled:", requestId);
        return null;
      }

      const stillCurrentUser = authStore.user?._id || authStore.user?.id;
      if (currentUserId !== stillCurrentUser) {
        console.log("⚠️ User changed during request - discarding");
        return null;
      }

      // ✅ CRITICAL: Validate response userId matches
      if (response.success && response.data) {
        console.log("🔍 Response validation - response.data:", response.data);
        console.log("🔍 Type of response.data:", typeof response.data);
        console.log("🔍 Keys in response.data:", Object.keys(response.data));

        const responseUserId = response.data.userId || response.data.owner?.id;

        console.log("🔍 Extracted responseUserId:", responseUserId);
        console.log("🔍 Expected currentUserId:", currentUserId);

        if (responseUserId !== currentUserId) {
          console.error("❌ Profile userId mismatch!");
          console.error("  Expected:", currentUserId);
          console.error("  Got:", responseUserId);
          return null;
        }

        setProfile(response.data);
        console.log("✅ Profile fetched:", requestId);
        return response.data;
      }

      profile.value = null;
      return null;
    } catch (err) {
      console.error("❌ Fetch error:", err);

      // Check if request is still active
      if (activeRequestId.value !== requestId) {
        return null;
      }

      if (err.status === 404) {
        profile.value = null;
      } else {
        setError(err);
      }

      return null;
    } finally {
      // Only clear loading if this request is still active
      if (activeRequestId.value === requestId) {
        isLoading.value = false;
      }
    }
  };

  // ✅ TAMBAH: Method untuk cancel request
  const cancelActiveRequest = () => {
    if (activeRequestId.value) {
      console.log("🚫 Cancelling active request:", activeRequestId.value);
      activeRequestId.value = null;
    }
  };

  /**
   * Create seller profile
   * ✅ FIXED: Added user validation to prevent race conditions
   */
  const createProfile = async profileData => {
    const authStore = useAuthStore();
    const currentUserId = authStore.user?._id || authStore.user?.id;

    if (!currentUserId) {
      throw new Error("User not authenticated");
    }

    // ✅ Track this request
    const requestUserId = currentUserId;

    try {
      isCreating.value = true;
      clearError();

      console.log("🏪 Creating profile for user:", currentUserId);
      const response = await sellerProfileService.createProfile(profileData);

      // ✅ CRITICAL: Validate user hasn't changed during request
      const stillCurrentUser = authStore.user?._id || authStore.user?.id;
      if (requestUserId !== stillCurrentUser) {
        console.log("⚠️ User changed during create - discarding result");
        return null;
      }

      if (response.success && response.data) {
        // ✅ Verify owner matches
        const profileOwnerId = response.data.owner?.id || response.data.userId;
        if (profileOwnerId && profileOwnerId !== requestUserId) {
          console.error("❌ Created profile owner mismatch!");
          return null;
        }

        setProfile(response.data);
        console.log("✅ Profile created successfully");
        return response.data;
      }

      throw new Error(response.message || "Failed to create profile");
    } catch (err) {
      console.error("❌ Create profile error:", err);

      // Only set error if still same user
      const stillCurrentUser = authStore.user?._id || authStore.user?.id;
      if (requestUserId === stillCurrentUser) {
        setError(err);
      }
      throw err;
    } finally {
      // Only clear loading if still same user
      const stillCurrentUser = authStore.user?._id || authStore.user?.id;
      if (requestUserId === stillCurrentUser) {
        isCreating.value = false;
      }
    }
  };

  /**
   * Update seller profile
   * Real-time update without page refresh
   * ✅ FIXED: Added user validation to prevent race conditions
   */
  const updateProfile = async updates => {
    const authStore = useAuthStore();
    const currentUserId = authStore.user?._id || authStore.user?.id;

    if (!currentUserId) {
      throw new Error("User not authenticated");
    }

    if (!profile.value) {
      throw new Error("No profile to update");
    }

    // ✅ Track this request
    const requestUserId = currentUserId;

    try {
      isUpdating.value = true;
      clearError();

      console.log("🔄 Updating profile for user:", currentUserId);
      const response = await sellerProfileService.updateProfile(updates);

      // ✅ CRITICAL: Validate user hasn't changed during request
      const stillCurrentUser = authStore.user?._id || authStore.user?.id;
      if (requestUserId !== stillCurrentUser) {
        console.log("⚠️ User changed during update - discarding result");
        return null;
      }

      if (response.success && response.data) {
        // ✅ Verify owner matches
        const profileOwnerId = response.data.owner?.id || response.data.userId;
        if (profileOwnerId && profileOwnerId !== requestUserId) {
          console.error("❌ Updated profile owner mismatch!");
          return null;
        }

        // Real-time update - immediately reflect changes
        setProfile(response.data);
        console.log("✅ Profile updated successfully");
        return response.data;
      }

      throw new Error(response.message || "Failed to update profile");
    } catch (err) {
      console.error("❌ Update profile error:", err);

      // Only set error if still same user
      const stillCurrentUser = authStore.user?._id || authStore.user?.id;
      if (requestUserId === stillCurrentUser) {
        setError(err);
      }
      throw err;
    } finally {
      // Only clear loading if still same user
      const stillCurrentUser = authStore.user?._id || authStore.user?.id;
      if (requestUserId === stillCurrentUser) {
        isUpdating.value = false;
      }
    }
  };

  /**
   * Upload logo with real-time progress
   * ✅ FIXED: Added user validation to prevent race conditions
   */
  const uploadLogo = async file => {
    const authStore = useAuthStore();
    const currentUserId = authStore.user?._id || authStore.user?.id;

    if (!currentUserId) {
      throw new Error("User not authenticated");
    }

    if (!profile.value) {
      throw new Error("No profile to update");
    }

    // ✅ Track this request
    const requestUserId = currentUserId;

    try {
      isUploadingLogo.value = true;
      uploadProgress.value = 0;
      clearError();

      console.log("📸 Uploading logo for user:", currentUserId);

      const response = await sellerProfileService.uploadLogo(file, progressEvent => {
        // ✅ Only update progress if still same user
        const stillCurrentUser = authStore.user?._id || authStore.user?.id;
        if (requestUserId === stillCurrentUser) {
          uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        }
      });

      // ✅ CRITICAL: Validate user hasn't changed during upload
      const stillCurrentUser = authStore.user?._id || authStore.user?.id;
      if (requestUserId !== stillCurrentUser) {
        console.log("⚠️ User changed during logo upload - discarding result");
        return null;
      }

      if (response.success && response.data) {
        // ✅ Verify owner matches
        const profileOwnerId = response.data.owner?.id || response.data.userId;
        if (profileOwnerId && profileOwnerId !== requestUserId) {
          console.error("❌ Uploaded logo profile owner mismatch!");
          return null;
        }

        // Real-time update - immediately show new logo
        setProfile(response.data);
        console.log("✅ Logo uploaded successfully");
        return response.data;
      }

      throw new Error(response.message || "Failed to upload logo");
    } catch (err) {
      console.error("❌ Upload logo error:", err);

      // Only set error if still same user
      const stillCurrentUser = authStore.user?._id || authStore.user?.id;
      if (requestUserId === stillCurrentUser) {
        setError(err);
      }
      throw err;
    } finally {
      // Only clear loading if still same user
      const stillCurrentUser = authStore.user?._id || authStore.user?.id;
      if (requestUserId === stillCurrentUser) {
        isUploadingLogo.value = false;
        uploadProgress.value = 0;
      }
    }
  };

  /**
   * Upload banner with real-time progress
   * ✅ FIXED: Added user validation to prevent race conditions
   */
  const uploadBanner = async file => {
    const authStore = useAuthStore();
    const currentUserId = authStore.user?._id || authStore.user?.id;

    if (!currentUserId) {
      throw new Error("User not authenticated");
    }

    if (!profile.value) {
      throw new Error("No profile to update");
    }

    // ✅ Track this request
    const requestUserId = currentUserId;

    try {
      isUploadingBanner.value = true;
      uploadProgress.value = 0;
      clearError();

      console.log("📸 Uploading banner for user:", currentUserId);

      const response = await sellerProfileService.uploadBanner(file, progressEvent => {
        // ✅ Only update progress if still same user
        const stillCurrentUser = authStore.user?._id || authStore.user?.id;
        if (requestUserId === stillCurrentUser) {
          uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        }
      });

      // ✅ CRITICAL: Validate user hasn't changed during upload
      const stillCurrentUser = authStore.user?._id || authStore.user?.id;
      if (requestUserId !== stillCurrentUser) {
        console.log("⚠️ User changed during banner upload - discarding result");
        return null;
      }

      if (response.success && response.data) {
        // ✅ Verify owner matches
        const profileOwnerId = response.data.owner?.id || response.data.userId;
        if (profileOwnerId && profileOwnerId !== requestUserId) {
          console.error("❌ Uploaded banner profile owner mismatch!");
          return null;
        }

        // Real-time update - immediately show new banner
        setProfile(response.data);
        console.log("✅ Banner uploaded successfully");
        return response.data;
      }

      throw new Error(response.message || "Failed to upload banner");
    } catch (err) {
      console.error("❌ Upload banner error:", err);

      // Only set error if still same user
      const stillCurrentUser = authStore.user?._id || authStore.user?.id;
      if (requestUserId === stillCurrentUser) {
        setError(err);
      }
      throw err;
    } finally {
      // Only clear loading if still same user
      const stillCurrentUser = authStore.user?._id || authStore.user?.id;
      if (requestUserId === stillCurrentUser) {
        isUploadingBanner.value = false;
        uploadProgress.value = 0;
      }
    }
  };

  /**
   * Archive profile
   */
  const archiveProfile = async () => {
    const authStore = useAuthStore();
    const currentUserId = authStore.user?._id || authStore.user?.id;

    if (!currentUserId) {
      throw new Error("User not authenticated");
    }

    try {
      isUpdating.value = true;
      clearError();

      console.log("📦 Archiving profile for user:", currentUserId);
      const response = await sellerProfileService.archiveProfile();

      if (response.success && response.data) {
        setProfile(response.data);
        console.log("✅ Profile archived successfully");
        return response.data;
      }

      throw new Error(response.message || "Failed to archive profile");
    } catch (err) {
      console.error("❌ Archive profile error:", err);
      setError(err);
      throw err;
    } finally {
      isUpdating.value = false;
    }
  };

  /**
   * Restore profile
   */
  const restoreProfile = async () => {
    const authStore = useAuthStore();
    const currentUserId = authStore.user?._id || authStore.user?.id;

    if (!currentUserId) {
      throw new Error("User not authenticated");
    }

    try {
      isUpdating.value = true;
      clearError();

      console.log("♻️ Restoring profile for user:", currentUserId);
      const response = await sellerProfileService.restoreProfile();

      if (response.success && response.data) {
        setProfile(response.data);
        console.log("✅ Profile restored successfully");
        return response.data;
      }

      throw new Error(response.message || "Failed to restore profile");
    } catch (err) {
      console.error("❌ Restore profile error:", err);
      setError(err);
      throw err;
    } finally {
      isUpdating.value = false;
    }
  };

  /**
   * Delete profile
   */
  const deleteProfile = async () => {
    const authStore = useAuthStore();
    const currentUserId = authStore.user?._id || authStore.user?.id;

    if (!currentUserId) {
      throw new Error("User not authenticated");
    }

    try {
      isLoading.value = true;
      clearError();

      console.log("🗑️ Deleting profile for user:", currentUserId);
      const response = await sellerProfileService.deleteProfile();

      if (response.success) {
        clearProfile();
        console.log("✅ Profile deleted successfully");
        return true;
      }

      throw new Error(response.message || "Failed to delete profile");
    } catch (err) {
      console.error("❌ Delete profile error:", err);
      setError(err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    // State
    profile,
    isLoading,
    isCreating,
    isUpdating,
    isUploadingLogo,
    isUploadingBanner,
    uploadProgress,
    error,

    // Getters
    hasProfile,
    storeName,
    storeSlug,
    profileCompleteness,

    // Actions
    setProfile,
    clearProfile,
    setError,
    clearError,
    fetchProfile,
    createProfile,
    updateProfile,
    uploadLogo,
    uploadBanner,
    archiveProfile,
    restoreProfile,
    deleteProfile,
    cancelActiveRequest,
  };
});
