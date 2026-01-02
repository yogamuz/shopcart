// stores/userProfileStore.js - Fixed with proper reactive updates
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { userProfileService } from "@/services/userProfileService";
import { useAuthStore } from "@/stores/authStore";

export const useUserProfileStore = defineStore("userProfile", () => {
  // ========== STATE ==========
  const profile = ref(null);
  const addresses = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const uploadProgress = ref(0);
  const isUploading = ref(false);

  // ========== COMPUTED ==========
  const hasProfile = computed(() => profile.value !== null);

  const fullName = computed(() => {
    if (!profile.value) return "User";
    const first = profile.value.firstName || "";
    const last = profile.value.lastName || "";
    return `${first} ${last}`.trim() || "User";
  });

  const initials = computed(() => {
    if (!profile.value) return "U";
    const first = profile.value.firstName ? profile.value.firstName.charAt(0).toUpperCase() : "";
    const last = profile.value.lastName ? profile.value.lastName.charAt(0).toUpperCase() : "";
    return `${first}${last}` || "U";
  });

  const defaultAddress = computed(() => {
    return addresses.value.find(addr => addr.isDefault) || addresses.value[0] || null;
  });

  const formattedPhone = computed(() => {
    if (!profile.value?.phone) return "";
    const digits = profile.value.phone.replace(/\D/g, "");
    
    if (digits.startsWith("62")) {
      return `+62 ${digits.substring(2, 5)} ${digits.substring(5, 9)} ${digits.substring(9)}`;
    } else if (digits.startsWith("08")) {
      return `${digits.substring(0, 4)} ${digits.substring(4, 8)} ${digits.substring(8)}`;
    }
    
    return profile.value.phone;
  });

  const avatarUrl = computed(() => {
    if (!profile.value?.avatar) return null;
    
    if (typeof profile.value.avatar === "string") {
      return profile.value.avatar;
    }
    
    if (profile.value.avatar.url) {
      return profile.value.avatar.url;
    }
    
    return null;
  });

  const profileCompleteness = computed(() => {
    if (!profile.value) return 0;

    const requiredFields = ["firstName", "lastName", "phone"];
    const optionalFields = ["avatar", "dateOfBirth", "gender"];
    const addressFields = addresses.value.length > 0 ? ["address"] : [];

    const totalFields = requiredFields.length + optionalFields.length + addressFields.length;
    let completedFields = 0;

    requiredFields.forEach(field => {
      if (profile.value[field]) completedFields++;
    });

    optionalFields.forEach(field => {
      if (field === "avatar" && profile.value.avatar?.url) {
        completedFields++;
      } else if (profile.value[field]) {
        completedFields++;
      }
    });

    if (addresses.value.length > 0) completedFields++;

    return Math.round((completedFields / totalFields) * 100);
  });

  const lastSeen = computed(() => {
    if (!profile.value?.user?.lastSeen) return null;
    return new Date(profile.value.user.lastSeen);
  });

  const lastSeenFormatted = computed(() => {
    if (!lastSeen.value) return "Never";
    
    const now = new Date();
    const diff = now - lastSeen.value;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return lastSeen.value.toLocaleDateString();
  });

  // ========== ACTIONS ==========

  const clearError = () => {
    error.value = null;
  };

  const setLoading = (isLoading) => {
    loading.value = isLoading;
  };

  const setError = (errorMessage) => {
    error.value = errorMessage;
  };

  const clearProfile = () => {
    profile.value = null;
    addresses.value = [];
    error.value = null;
    loading.value = false;
  };

  // ✅ PERBAIKAN UTAMA: Fungsi fetchProfile yang lebih robust
  const fetchProfile = async (forceRefresh = false) => {
    // ✅ PERBAIKAN 1: Cek apakah sedang loading untuk prevent duplicate requests
    if (loading.value) {
      ;
      return { success: false, message: "Loading in progress" };
    }

    // ✅ PERBAIKAN 2: Skip jika ada data valid DAN tidak force refresh
    if (!forceRefresh && profile.value !== null && Object.keys(profile.value).length > 0) {
      ;
      return { success: true, data: profile.value };
    }

    try {
      ;
      setLoading(true);
      clearError();

      const response = await userProfileService.getProfile();

      if (response.success) {
        // ✅ PERBAIKAN 3: Pastikan data benar-benar di-set
        profile.value = response.data.profile;

        if (response.data.addresses?.list) {
          addresses.value = response.data.addresses.list;
        }

        ;
        return { success: true, data: profile.value };
      }
    } catch (err) {
      console.error("❌ Error fetching profile:", err);
      setError(err.message || "Failed to load profile");

      if (err.status === 404 || err.message?.includes("not found")) {
        profile.value = null;
        addresses.value = [];
        clearError();
      }

      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (profileData) => {
    try {
      setLoading(true);
      clearError();

      const response = await userProfileService.createProfile(profileData);

      if (response.success) {
        profile.value = response.data.profile;

        if (response.data.profile?.addresses) {
          addresses.value = response.data.profile.addresses.list || [];
        }

        return { success: true, data: profile.value };
      }
    } catch (err) {
      console.error("❌ Error creating profile:", err);
      setError(err.message || "Failed to create profile");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      clearError();

      const response = await userProfileService.updateProfile(profileData);

      if (response.success) {
        profile.value = response.data.profile;

        if (response.data.profile?.addresses) {
          addresses.value = response.data.profile.addresses.list || [];
        }

        return { success: true, data: profile.value };
      }
    } catch (err) {
      console.error("❌ Error updating profile:", err);
      setError(err.message || "Failed to update profile");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    try {
      setLoading(true);
      clearError();

      const response = await userProfileService.deleteAccount();

      if (response.success) {
        clearProfile();

        const authStore = useAuthStore();
        await authStore.logout();

        return { success: true };
      }
    } catch (err) {
      console.error("❌ Error deleting account:", err);
      setError(err.message || "Failed to delete account");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ========== AVATAR METHODS ==========

  const uploadAvatar = async (file) => {
    try {
      isUploading.value = true;
      uploadProgress.value = 0;
      clearError();

      if (!file) {
        throw new Error("Please select a file to upload");
      }

      const maxSize = 3 * 1024 * 1024; // 3MB
      if (file.size > maxSize) {
        throw new Error("File size must be less than 3MB");
      }

      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        throw new Error("Only JPEG, PNG, and WebP images are allowed");
      }

      const response = await userProfileService.uploadAvatar(file, (progressEvent) => {
        uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      });

      if (response.success) {
        profile.value = response.data.profile;
        return { success: true, data: profile.value };
      }
    } catch (err) {
      console.error("❌ Error uploading avatar:", err);
      setError(err.message || "Failed to upload avatar");
      throw err;
    } finally {
      isUploading.value = false;
      uploadProgress.value = 0;
    }
  };

  const removeAvatar = async () => {
    try {
      setLoading(true);
      clearError();

      const response = await userProfileService.removeAvatar();

      if (response.success) {
        profile.value = response.data.profile;
        return { success: true, data: profile.value };
      }
    } catch (err) {
      console.error("❌ Error removing avatar:", err);
      setError(err.message || "Failed to remove avatar");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ========== SELLER UPGRADE ==========

  const upgradeToSeller = async () => {
    try {
      setLoading(true);
      clearError();

      const response = await userProfileService.upgradeToSeller();

      if (response.success) {
        const authStore = useAuthStore();
        if (authStore.user) {
          authStore.user.role = "seller";
        }

        return { success: true };
      }
    } catch (err) {
      console.error("❌ Error upgrading to seller:", err);
      setError(err.message || "Failed to upgrade to seller");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ========== ADDRESS METHODS ==========

  const fetchAddresses = async (forceRefresh = false) => {
    // ✅ PERBAIKAN: Cek loading state
    if (loading.value) {
      ;
      return { success: false, message: "Loading in progress" };
    }

    if (!forceRefresh && addresses.value.length > 0) {
      ;
      return { success: true, data: addresses.value };
    }

    try {
      setLoading(true);
      clearError();

      const response = await userProfileService.getAddresses();

      if (response.success) {
        addresses.value = response.data.addresses?.list || [];
        return { success: true, data: addresses.value };
      }
    } catch (err) {
      console.error("❌ Error fetching addresses:", err);
      setError(err.message || "Failed to load addresses");

      if (err.status === 404 || err.message?.includes("not found")) {
        addresses.value = [];
        clearError();
      }

      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addAddress = async (addressData) => {
    try {
      setLoading(true);
      clearError();

      const response = await userProfileService.addAddress(addressData);

      if (response.success) {
        // Refresh addresses after add
        await fetchAddresses(true);
        return { success: true };
      }
    } catch (err) {
      console.error("❌ Error adding address:", err);
      setError(err.message || "Failed to add address");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateAddress = async (addressIndex, addressData) => {
    try {
      setLoading(true);
      clearError();

      const response = await userProfileService.updateAddress(addressIndex, addressData);

      if (response.success) {
        // Refresh addresses after update
        await fetchAddresses(true);
        return { success: true };
      }
    } catch (err) {
      console.error("❌ Error updating address:", err);
      setError(err.message || "Failed to update address");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeAddress = async (addressIndex) => {
    try {
      setLoading(true);
      clearError();

      const response = await userProfileService.removeAddress(addressIndex);

      if (response.success) {
        // Refresh addresses after remove
        await fetchAddresses(true);
        return { success: true };
      }
    } catch (err) {
      console.error("❌ Error removing address:", err);
      setError(err.message || "Failed to remove address");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const setDefaultAddress = async (addressIndex) => {
    try {
      setLoading(true);
      clearError();

      const response = await userProfileService.setDefaultAddress(addressIndex);

      if (response.success) {
        // Update locally
        addresses.value = addresses.value.map((addr, index) => ({
          ...addr,
          isDefault: index === parseInt(addressIndex),
        }));

        return { success: true };
      }
    } catch (err) {
      console.error("❌ Error setting default address:", err);
      setError(err.message || "Failed to set default address");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ========== INITIALIZATION ==========

  const initialize = async () => {
    try {
      await fetchProfile(true);

      if (addresses.value.length === 0) {
        await fetchAddresses(true);
      }
    } catch (err) {
      console.error("❌ Error initializing profile store:", err);
    }
  };

  const clearCache = () => {
    ;
    profile.value = null;
    addresses.value = [];
    error.value = null;
  };
  
  const $reset = () => {
    profile.value = null;
    addresses.value = [];
    loading.value = false;
    error.value = null;
    uploadProgress.value = 0;
    isUploading.value = false;
  };

  // ========== RETURN ==========

  return {
    // State
    profile,
    addresses,
    loading,
    error,
    uploadProgress,
    isUploading,

    // Computed
    hasProfile,
    fullName,
    initials,
    defaultAddress,
    formattedPhone,
    avatarUrl,
    profileCompleteness,
    lastSeen,
    lastSeenFormatted,

    // Actions
    clearError,
    setLoading,
    setError,
    clearProfile,
    clearCache,
    fetchProfile,
    createProfile,
    updateProfile,
    deleteAccount,
    uploadAvatar,
    removeAvatar,
    upgradeToSeller,
    fetchAddresses,
    addAddress,
    updateAddress,
    removeAddress,
    setDefaultAddress,
    initialize,
    $reset,
  };
});