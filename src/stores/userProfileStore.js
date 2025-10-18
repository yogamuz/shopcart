// stores/userProfileStore.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import userProfileService from "@/services/userProfileService";
import { useAuthStore } from "@/stores/authStore";
import { useQueryClient } from "@tanstack/vue-query";

export const useUserProfileStore = defineStore("userProfile", () => {
  // State
  const profile = ref(null);
  const addresses = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const uploadProgress = ref(0);
  const isUploading = ref(false);

  // Getters (computed)
  const hasProfile = computed(() => profile.value !== null);

  const fullName = computed(() => {
    if (!profile.value) return "User";
    return userProfileService.getFullName(profile.value.firstName, profile.value.lastName);
  });

  const initials = computed(() => {
    if (!profile.value) return "U";
    return userProfileService.getInitials(profile.value.firstName, profile.value.lastName);
  });

  const defaultAddress = computed(() => {
    return addresses.value.find(addr => addr.isDefault) || addresses.value[0] || null;
  });

  const formattedPhone = computed(() => {
    if (!profile.value?.phone) return "";
    return userProfileService.formatPhone(profile.value.phone);
  });

  const avatarUrl = computed(() => {
    // Handle both possible structures for backward compatibility
    if (profile.value?.avatar) {
      // If avatar is a string (direct URL)
      if (typeof profile.value.avatar === "string") {
        return profile.value.avatar;
      }
      // If avatar is an object with url property
      if (profile.value.avatar.url) {
        return profile.value.avatar.url;
      }
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

    // Check required fields
    requiredFields.forEach(field => {
      if (profile.value[field]) completedFields++;
    });

    // Check optional fields
    optionalFields.forEach(field => {
      if (field === "avatar" && profile.value.avatar?.url) {
        completedFields++;
      } else if (profile.value[field]) {
        completedFields++;
      }
    });

    // Check address
    if (addresses.value.length > 0) completedFields++;

    return Math.round((completedFields / totalFields) * 100);
  });

const lastSeen = computed(() => {
  if (!profile.value?.user?.lastSeen) return null;
  return new Date(profile.value.user.lastSeen);
});

const lastSeenFormatted = computed(() => {
  if (!lastSeen.value) return 'Never';
  
  const now = new Date();
  const diff = now - lastSeen.value;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return lastSeen.value.toLocaleDateString();
});

  // Actions
  const clearError = () => {
    error.value = null;
  };

  const setLoading = isLoading => {
    loading.value = isLoading;
  };

  const setError = errorMessage => {
    error.value = errorMessage;
  };

  /**
   * Fetch user profile
   */
const fetchProfile = async (forceRefresh = false) => {
  if (!forceRefresh && profile.value && !loading.value) {
    return { success: true, data: { profile: profile.value } };
  }

  if (loading.value && !forceRefresh) return;

  try {
    setLoading(true);
    clearError();

    const result = await userProfileService.getProfile();

    if (result.success) {
      profile.value = result.data.profile;

      // ✅ FIX: Cek apakah response include addresses
      if (result.data.addresses?.list) {
        // Backend return addresses → langsung set
        addresses.value = result.data.addresses.list;
      } else {
        // Backend tidak return addresses → perlu fetch terpisah
      }

      return result;
    }
  } catch (err) {
    console.error("Error fetching profile:", err);
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

  /**
   * Create user profile
   */
  const createProfile = async profileData => {
    try {
      setLoading(true);
      clearError();

      // Validate data before sending
      const validation = userProfileService.validateProfile(profileData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(", "));
      }

      const result = await userProfileService.createProfile(profileData);

      if (result.success) {
        profile.value = result.data.profile;

        // Update addresses if they exist
        if (result.data.profile?.addresses) {
          addresses.value = result.data.profile.addresses.list || [];
        }

        return result;
      }
    } catch (err) {
      console.error("Error creating profile:", err);
      setError(err.message || "Failed to create profile");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update user profile
   */
  const updateProfile = async profileData => {
    try {
      setLoading(true);
      clearError();

      const validation = userProfileService.validateProfile(profileData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(", "));
      }

      const result = await userProfileService.updateProfile(profileData);

      if (result.success) {
        // ✅ TAMBAHKAN: Deep clone untuk force reactivity
        profile.value = JSON.parse(JSON.stringify(result.data.profile));


        if (result.data.profile?.addresses) {
          addresses.value = result.data.profile.addresses.list || [];
        }

        return result;
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message || "Failed to update profile");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete user account
   */
  const deleteAccount = async () => {
    try {
      setLoading(true);
      clearError();

      const result = await userProfileService.deleteAccount();

      if (result.success) {
        // Clear all data
        profile.value = null;
        addresses.value = [];

        // Also logout from auth store
        const authStore = useAuthStore();
        await authStore.logout();

        return result;
      }
    } catch (err) {
      console.error("Error deleting account:", err);
      setError(err.message || "Failed to delete account");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Upload avatar with progress tracking
   */
  const uploadAvatar = async (file, queryClient = null) => {
    try {
      isUploading.value = true;
      uploadProgress.value = 0;
      clearError();

      // Validate file
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

      const result = await userProfileService.uploadAvatar(file, progressEvent => {
        uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      });


      if (result.success) {
        const profileData = result.data.profile;

        if (profileData) {
          if (profile.value) {
            profile.value = {
              ...profile.value,
              ...profileData,
            };
          } else {
            profile.value = profileData;
          }

        }

        // ✅ Invalidate query jika queryClient tersedia
        if (queryClient) {
          await queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
        }

        return result;
      }
    } catch (err) {
      console.error("Error uploading avatar:", err);
      setError(err.message || "Failed to upload avatar");
      throw err;
    } finally {
      isUploading.value = false;
      uploadProgress.value = 0;
    }
  };

  /**
   * Remove avatar
   */
  const removeAvatar = async (queryClient = null) => {
    try {
      setLoading(true);
      clearError();

      const result = await userProfileService.removeAvatar();


      if (result.success) {
        const profileData = result.data.profile;

        if (profileData) {
          if (profile.value) {
            profile.value = {
              ...profile.value,
              ...profileData,
            };
          } else {
            profile.value = profileData;
          }

        }

        // ✅ Invalidate query jika queryClient tersedia
        if (queryClient) {
          await queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
        }

        return result;
      }
    } catch (err) {
      console.error("Error removing avatar:", err);
      setError(err.message || "Failed to remove avatar");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Upgrade to seller
   */
  const upgradeToSeller = async () => {
    try {
      setLoading(true);
      clearError();

      const result = await userProfileService.upgradeToSeller();

      if (result.success) {
        // Update user role di auth store
        const authStore = useAuthStore();
        if (authStore.user) {
          authStore.user.role = "seller";
        }

        return result;
      }
    } catch (err) {
      console.error("Error upgrading to seller:", err);
      setError(err.message || "Failed to upgrade to seller");
      throw err;
    } finally {
      setLoading(false);
    }
  };
  /**
   * Fetch user addresses
   */
const fetchAddresses = async (forceRefresh = false) => {
  // ✅ Skip jika sudah ada addresses dari profile response
  if (!forceRefresh && addresses.value.length > 0 && !loading.value) {
    return { success: true, data: { addresses: { list: addresses.value } } };
  }

  try {
    setLoading(true);
    clearError();

    const result = await userProfileService.getAddresses();

    if (result.success) {
      addresses.value = result.data.addresses?.list || [];
        return result;
    }
  } catch (err) {
    console.error("Error fetching addresses:", err);
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



  /**
   * Add new address
   */
  const addAddress = async addressData => {
    try {
      setLoading(true);
      clearError();

      const validation = userProfileService.validateAddress(addressData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(", "));
      }

      const result = await userProfileService.addAddress(addressData);

      if (result.success) {
        // ✅ HAPUS: Jangan invalidate di sini
        // await fetchAddresses(); // ❌ REMOVE
        // const { invalidateAddresses } = useUserQueries(); // ❌ REMOVE
        // invalidateAddresses(); // ❌ REMOVE

        return result;
      }
    } catch (err) {
      console.error("Error adding address:", err);
      setError(err.message || "Failed to add address");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update address by index
   */
  const updateAddress = async (addressIndex, addressData) => {
    try {
      setLoading(true);
      clearError();

      const result = await userProfileService.updateAddress(addressIndex, addressData);

      if (result.success) {
        // GANTI LOGIC INI:
        // Jika isDefault berubah, refresh semua addresses
        if (addressData.isDefault !== undefined) {
          await fetchAddresses(); // Refresh all addresses
        } else {
          // Update hanya address yang berubah
          if (result.data.updatedAddress) {
            const index = parseInt(addressIndex);
            if (addresses.value[index]) {
              addresses.value[index] = result.data.updatedAddress;
            }
          }
        }

        return result;
      }
    } catch (err) {
      console.error("Error updating address:", err);
      setError(err.message || "Failed to update address");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Remove address by index
   */
  const removeAddress = async addressIndex => {
    try {
      setLoading(true);
      clearError();

      const result = await userProfileService.removeAddress(addressIndex);

      if (result.success) {
        // Remove from local array
        addresses.value.splice(parseInt(addressIndex), 1);

        // Update indices for remaining addresses
        addresses.value = addresses.value.map((addr, index) => ({
          ...addr,
          index,
        }));

        return result;
      }
    } catch (err) {
      console.error("Error removing address:", err);
      setError(err.message || "Failed to remove address");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Set default address by index
   */
  const setDefaultAddress = async addressIndex => {
    try {
      setLoading(true);
      clearError();

      const result = await userProfileService.setDefaultAddress(addressIndex);

      if (result.success) {
        // Update local addresses - set all to false, then set selected to true
        addresses.value = addresses.value.map((addr, index) => ({
          ...addr,
          isDefault: index === parseInt(addressIndex),
        }));

        return result;
      }
    } catch (err) {
      console.error("Error setting default address:", err);
      setError(err.message || "Failed to set default address");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset store to initial state
   */
  const $reset = () => {
    profile.value = null;
    addresses.value = [];
    loading.value = false;
    error.value = null;
    uploadProgress.value = 0;
    isUploading.value = false;
  };

  /**
   * Initialize store (fetch profile and addresses)
   */
const initialize = async () => {
  try {
    // 1. Fetch profile dulu
    await fetchProfile(true);

    // 2. Cek apakah addresses sudah di-set dari profile response
    if (addresses.value.length === 0) {
      // Belum ada addresses → fetch terpisah
      await fetchAddresses(true);
    }
    // Jika sudah ada, skip fetch addresses terpisah

  } catch (err) {
    console.error("Error initializing profile store:", err);
  }
};

  return {
    // State
    profile,
    addresses,
    loading,
    error,
    uploadProgress,
    isUploading,

    // Getters
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
