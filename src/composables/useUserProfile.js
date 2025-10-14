// composables/useUserProfile.js
import { ref, computed, watch, nextTick } from 'vue';
import { useUserProfileStore } from '@/stores/userProfileStore';
import { useAuthStore } from '@/stores/authStore';
import { storeToRefs } from 'pinia';

export const useUserProfile = () => {
  // Get stores
  const profileStore = useUserProfileStore();
  const authStore = useAuthStore();

  // Extract reactive state from store
  const {
    profile,
    addresses,
    loading,
    error,
    uploadProgress,
    isUploading,
    hasProfile,
    fullName,
    initials,
    defaultAddress,
    formattedPhone,
    avatarUrl,
    profileCompleteness,
    lastSeen,
    lastSeenFormatted,
  } = storeToRefs(profileStore);

  // Local reactive state
  const isInitialized = ref(false);
  const lastRefresh = ref(null);
  const refreshInterval = ref(null);

  // Computed properties for UI helpers
  const isLoggedIn = computed(() => authStore.isAuthenticated);
  
  const profileStatus = computed(() => {
    if (!isLoggedIn.value) return 'not-logged-in';
    if (!hasProfile.value) return 'no-profile';
    if (profileCompleteness.value < 50) return 'incomplete';
    if (profileCompleteness.value < 80) return 'partial';
    return 'complete';
  });

  const canEditProfile = computed(() => {
    return isLoggedIn.value && !loading.value;
  });

  const hasAddresses = computed(() => {
    return addresses.value && addresses.value.length > 0;
  });

  const addressCount = computed(() => {
    return addresses.value ? addresses.value.length : 0;
  });

  const profileDisplayName = computed(() => {
    if (!profile.value) return authStore.user?.username || 'User';
    return fullName.value !== 'User' ? fullName.value : authStore.user?.username || 'User';
  });

  const profileInitials = computed(() => {
    if (initials.value !== 'U') return initials.value;
    const username = authStore.user?.username;
    if (username) {
      return username.substring(0, 2).toUpperCase();
    }
    return 'U';
  });

// Profile management methods
const initialize = async (forceRefresh = false) => {
  if (!isLoggedIn.value) {
    console.warn('Cannot initialize profile: user not logged in');
    return;
  }

  if (isInitialized.value && !forceRefresh && hasProfile.value && addresses.value.length > 0) {
    console.log('✅ Profile already initialized, addresses count:', addresses.value?.length);
    return;
  }

  try {
    // ✅ ALWAYS fetch both profile AND addresses explicitly
    await Promise.all([
      profileStore.fetchProfile(forceRefresh),
      profileStore.fetchAddresses()
    ]);
    
    console.log('✅ Profile initialized, addresses:', addresses.value);
    console.log('✅ Addresses count:', addresses.value?.length);
    
    isInitialized.value = true;
    lastRefresh.value = new Date();
  } catch (error) {
    console.error('Failed to initialize profile:', error);
  }
};
  const refresh = async () => {
    if (!isLoggedIn.value) return;
    
    try {
      await Promise.all([
        profileStore.fetchProfile(true),
        profileStore.fetchAddresses()
      ]);
      lastRefresh.value = new Date();
    } catch (error) {
      console.error('Failed to refresh profile:', error);
      throw error;
    }
  };

  const createProfile = async (profileData) => {
    if (!canEditProfile.value) {
      throw new Error('Cannot create profile at this time');
    }

    try {
      const result = await profileStore.createProfile(profileData);
      
      // Auto-refresh after successful creation
      await nextTick();
      await refresh();
      
      return result;
    } catch (error) {
      console.error('Failed to create profile:', error);
      throw error;
    }
  };

  const updateProfile = async (profileData) => {
    if (!canEditProfile.value) {
      throw new Error('Cannot update profile at this time');
    }

    try {
      const result = await profileStore.updateProfile(profileData);
      
      // Auto-refresh after successful update
      await nextTick();
      await refresh();
      
      return result;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  const saveProfile = async (profileData) => {
    if (!canEditProfile.value) {
      throw new Error('Cannot save profile at this time');
    }

    // Determine whether to create or update
    if (hasProfile.value) {
      return await updateProfile(profileData);
    } else {
      return await createProfile(profileData);
    }
  };

  const deleteAccount = async () => {
    if (!isLoggedIn.value) {
      throw new Error('Must be logged in to delete account');
    }

    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return false;
    }

    try {
      await profileStore.deleteAccount();
      return true;
    } catch (error) {
      console.error('Failed to delete account:', error);
      throw error;
    }
  };
const uploadAvatar = async (file, options = {}) => {
  if (!canEditProfile.value) {
    throw new Error('Cannot upload avatar at this time');
  }

  const maxSize = options.maxSize || 2 * 1024 * 1024;
  const allowedTypes = options.allowedTypes || ['image/jpeg', 'image/png', 'image/webp'];

  if (!file) {
    throw new Error('Please select a file to upload');
  }

  if (file.size > maxSize) {
    throw new Error(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
  }

  if (!allowedTypes.includes(file.type)) {
    const typeNames = allowedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ');
    throw new Error(`Only ${typeNames} images are allowed`);
  }

  try {
    const result = await profileStore.uploadAvatar(file);
    
    // Tunggu hingga state benar-benar ter-update
    await nextTick();
    
    // Log untuk debugging
    console.log('Upload completed, avatar URL:', avatarUrl.value);
    
    if (options.onSuccess) {
      options.onSuccess(result);
    }
    
    return result;
  } catch (error) {
    console.error('Failed to upload avatar:', error);
    
    if (options.onError) {
      options.onError(error);
    }
    
    throw error;
  }
};

  const removeAvatar = async () => {
    if (!canEditProfile.value) {
      throw new Error('Cannot remove avatar at this time');
    }

    if (!avatarUrl.value) {
      throw new Error('No avatar to remove');
    }

    try {
      return await profileStore.removeAvatar();
    } catch (error) {
      console.error('Failed to remove avatar:', error);
      throw error;
    }
  };

  const upgradeToSeller = async () => {
    if (!canEditProfile.value) {
      throw new Error('Cannot upgrade to seller at this time');
    }

    try {
      const result = await profileStore.upgradeToSeller();
      
      // Auto-refresh profile after successful upgrade
      await nextTick();
      await refresh();
      
      return result;
    } catch (error) {
      console.error('Failed to upgrade to seller:', error);
      throw error;
    }
  };

  // Address management methods
  const addAddress = async (addressData) => {
    if (!canEditProfile.value) {
      throw new Error('Cannot add address at this time');
    }

    try {
      const result = await profileStore.addAddress(addressData);
      return result;
    } catch (error) {
      console.error('Failed to add address:', error);
      throw error;
    }
  };

  const updateAddress = async (addressIndex, addressData) => {
    if (!canEditProfile.value) {
      throw new Error('Cannot update address at this time');
    }

    if (addressIndex < 0 || addressIndex >= addressCount.value) {
      throw new Error('Invalid address index');
    }

    try {
      const result = await profileStore.updateAddress(addressIndex, addressData);
      return result;
    } catch (error) {
      console.error('Failed to update address:', error);
      throw error;
    }
  };

  const removeAddress = async (addressIndex) => {
    if (!canEditProfile.value) {
      throw new Error('Cannot remove address at this time');
    }

    if (addressIndex < 0 || addressIndex >= addressCount.value) {
      throw new Error('Invalid address index');
    }

    if (!confirm('Are you sure you want to remove this address?')) {
      return false;
    }

    try {
      const result = await profileStore.removeAddress(addressIndex);
      return result;
    } catch (error) {
      console.error('Failed to remove address:', error);
      throw error;
    }
  };

const setDefaultAddress = async (addressIndex) => {
  if (!canEditProfile.value) {
    throw new Error('Cannot set default address at this time');
  }

  if (addressIndex < 0 || addressIndex >= addressCount.value) {
    throw new Error('Invalid address index');
  }

  try {
    // Pastikan mengirim body request yang valid (object kosong minimal)
    const result = await profileStore.setDefaultAddress(addressIndex);
    return result;
  } catch (error) {
    console.error('Failed to set default address:', error);
    throw error;
  }
};

  const getAddressById = (addressIndex) => {
    if (addressIndex < 0 || addressIndex >= addressCount.value) {
      return null;
    }
    return addresses.value[addressIndex];
  };

  const findAddressByLabel = (label) => {
    if (!hasAddresses.value) return null;
    return addresses.value.find(addr => 
      addr.label && addr.label.toLowerCase() === label.toLowerCase()
    );
  };

  // Utility methods
  const clearError = () => {
    profileStore.clearError();
  };

  const getProfileField = (fieldName, defaultValue = null) => {
    if (!profile.value) return defaultValue;
    return profile.value[fieldName] || defaultValue;
  };

  const hasProfileField = (fieldName) => {
    if (!profile.value) return false;
    const value = profile.value[fieldName];
    return value !== null && value !== undefined && value !== '';
  };

  // Format helpers
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country || 'Indonesia'}`;
  };

  const getAddressPreview = (address, maxLength = 50) => {
    const formatted = formatAddress(address);
    if (formatted.length <= maxLength) return formatted;
    return formatted.substring(0, maxLength - 3) + '...';
  };

  // Auto-refresh functionality
  const startAutoRefresh = (intervalMinutes = 30) => {
    if (refreshInterval.value) {
      clearInterval(refreshInterval.value);
    }

    refreshInterval.value = setInterval(async () => {
      if (isLoggedIn.value && isInitialized.value) {
        try {
          await refresh();
        } catch (error) {
          console.warn('Auto-refresh failed:', error);
        }
      }
    }, intervalMinutes * 60 * 1000);
  };

  const stopAutoRefresh = () => {
    if (refreshInterval.value) {
      clearInterval(refreshInterval.value);
      refreshInterval.value = null;
    }
  };

// Revisi watch - GANTI BAGIAN INI (sekitar baris 251-270)
watch(isLoggedIn, async (newValue, oldValue) => {
  console.log('🔍 isLoggedIn changed:', { from: oldValue, to: newValue });
  
  if (newValue && !isInitialized.value) {
    // Login baru → tunggu auth ready, baru initialize
    console.log('🔄 User logged in - waiting for auth ready...');
    
    // ✅ PERBAIKAN: Tunggu hingga token benar-benar ready
    await new Promise(resolve => setTimeout(resolve, 200));
    
    profileStore.$reset();
    isInitialized.value = false;
    lastRefresh.value = null;
    
    await initialize(true); // Force refresh
  } else if (!newValue) {
    // Logout → clear semua
    console.log('🔄 User logged out - clearing profile data...');
    isInitialized.value = false;
    lastRefresh.value = null;
    profileStore.$reset();
    stopAutoRefresh();
  }
}, { immediate: false });

  // Lifecycle cleanup
  const cleanup = () => {
    stopAutoRefresh();
  };

  return {
    // State
    profile,
    addresses,
    loading,
    error,
    uploadProgress,
    isUploading,
    isInitialized,
    lastRefresh,

    // Computed properties
    hasProfile,
    fullName,
    initials,
    defaultAddress,
    formattedPhone,
    avatarUrl,
    profileCompleteness,
    profileStatus,
    canEditProfile,
    hasAddresses,
    addressCount,
    profileDisplayName,
    profileInitials,
    lastSeen,
    lastSeenFormatted,

    // Profile methods
    initialize,
    refresh,
    createProfile,
    updateProfile,
    saveProfile,
    deleteAccount,

    // Avatar methods
    uploadAvatar,
    removeAvatar,

    // Address methods
    addAddress,
    updateAddress,
    removeAddress,
    upgradeToSeller,
    setDefaultAddress,
    getAddressById,
    findAddressByLabel,

    // Utility methods
    clearError,
    getProfileField,
    hasProfileField,
    formatAddress,
    getAddressPreview,

    // Auto-refresh
    startAutoRefresh,
    stopAutoRefresh,

    // Cleanup
    cleanup
  };
};