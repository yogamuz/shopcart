// stores/authStore.js - Race-free auth store
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { authService } from "@/services/authService";
import { queryClient } from "@/main.js";

// Platform detection
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const useAuthStore = defineStore("auth", () => {
  // ========== STATE ==========
  const user = ref(null);
  const accessToken = ref(null);
  const isLoading = ref(false);
  const error = ref(null);
  const isInitialized = ref(false);

  // Single-flight locks
  let refreshPromise = null;
  let initializePromise = null;

  // COMPUTED
  const isAuthenticated = computed(() => !!user.value && !!accessToken.value);
  const userRole = computed(() => user.value?.role || null);
  const isUser = computed(() => userRole.value === "user");
  const isSeller = computed(() => userRole.value === "seller");
  const isAdmin = computed(() => userRole.value === "admin");
  const hasRole = computed(() => role => userRole.value === role);
  const hasAnyRole = computed(() => roles => roles.includes(userRole.value));

  // ========== HELPERS ==========

  const decodeToken = token => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(window.atob(base64));
    } catch {
      return null;
    }
  };

  const isTokenExpired = token => {
    const payload = decodeToken(token);
    if (!payload || !payload.exp) return true;

    const now = Math.floor(Date.now() / 1000);
    return now >= payload.exp;
  };

  const isTokenNearExpiry = (token, bufferSeconds = 120) => {
    const payload = decodeToken(token);
    if (!payload || !payload.exp) return true;

    const now = Math.floor(Date.now() / 1000);
    return payload.exp - now < bufferSeconds;
  };

  // Mobile: localStorage for refresh token persistence
  const saveRefreshTokenMobile = token => {
    if (isMobile() && token) {
      localStorage.setItem("refreshToken", token);
    }
  };

  const getRefreshTokenMobile = () => {
    if (isMobile()) {
      return localStorage.getItem("refreshToken");
    }
    return null;
  };

  const clearRefreshTokenMobile = () => {
    if (isMobile()) {
      localStorage.removeItem("refreshToken");
    }
  };

  // ========== ACTIONS ==========

  const setAuth = userData => {
    const { accessToken: token, refreshToken: refToken, ...userDataOnly } = userData;

    user.value = userDataOnly;
    accessToken.value = token;
    error.value = null;

    // Mobile: save refresh token
    if (refToken) {
      saveRefreshTokenMobile(refToken);
    }
  };

  const clearAuth = () => {
    user.value = null;
    accessToken.value = null;
    error.value = null;
    isInitialized.value = false;

    clearRefreshTokenMobile();

    try {
      queryClient.clear();
    } catch (err) {
      console.warn("Failed to clear query cache:", err);
    }
  };

  const setError = err => {
    error.value = err;
  };

  const clearError = () => {
    error.value = null;
  };

  const setLoading = loading => {
    isLoading.value = loading;
  };

  // ========== AUTH METHODS ==========

  const login = async credentials => {
    try {
      setLoading(true);
      clearError();

      const response = await authService.login(credentials);

      if (response.success) {
        setAuth({
          ...response.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        });

        try {
          await queryClient.clear();
        } catch (err) {
          console.warn("Failed to clear cache on login:", err);
        }

        try {
          const { useUserProfileStore } = await import("@/stores/userProfileStore");
          const profileStore = useUserProfileStore();
          await profileStore.fetchProfile(true);
        } catch (err) {
          console.warn("Failed to fetch profile after login:", err);
        }

        try {
          const { useCartStore } = await import("@/stores/cartStore");
          const cartStore = useCartStore();
          await cartStore.initializeCart();
          console.log("✅ Cart initialized after login");
        } catch (err) {
          console.warn("⚠️ Failed to initialize cart after login:", err);
        }

        return { success: true, user: user.value };
      }

      throw new Error(response.message || "Login failed");
    } catch (err) {
      setError(err.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async userData => {
    try {
      setLoading(true);
      clearError();

      const response = await authService.register(userData);

      if (response.success) {
        setAuth({
          ...response.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        });

        try {
          const { useUserProfileStore } = await import("@/stores/userProfileStore");
          const profileStore = useUserProfileStore();
          await profileStore.fetchProfile(true);
        } catch (err) {
          console.warn("Failed to fetch profile after register:", err);
        }

        try {
          const { useCartStore } = await import("@/stores/cartStore");
          const cartStore = useCartStore();
          await cartStore.initializeCart();
          console.log("✅ Cart initialized after register");
        } catch (err) {
          console.warn("⚠️ Failed to initialize cart after register:", err);
        }

        return { success: true, user: user.value };
      }

      throw new Error(response.message || "Registration failed");
    } catch (err) {
      setError(err.message || "Registration failed");

      if (err.errors && Array.isArray(err.errors)) {
        const formattedErrors = {};
        err.errors.forEach(error => {
          if (error.path) {
            formattedErrors[error.path] = error.msg;
          }
        });
        throw { ...err, formattedErrors };
      }

      throw err;
    } finally {
      setLoading(false);
    }
  };

const logout = async () => {
    try {
      setLoading(true);

      // 1. Clear user profile store first
      try {
        const { useUserProfileStore } = await import("@/stores/userProfileStore");
        const userProfileStore = useUserProfileStore();
        userProfileStore.clearProfile();
      } catch (err) {
        console.warn("⚠️ Failed to clear user profile:", err);
      }

      // 2. Clear seller profile if exists
      try {
        const { useSellerProfileStore } = await import("@/stores/sellerProfileStore");
        const sellerProfileStore = useSellerProfileStore();
        sellerProfileStore.clearProfile();
      } catch (err) {
        console.warn("⚠️ Failed to clear seller profile:", err);
      }

      // 3. ✅ FIX: Clear cart on logout
      try {
        const { useCartStore } = await import("@/stores/cartStore");
        const cartStore = useCartStore();
        cartStore.resetCart();
        console.log("✅ Cart cleared on logout");
      } catch (err) {
        console.warn("⚠️ Failed to clear cart:", err);
      }

      // 4. Logout API call (best effort) - do this BEFORE clearing auth
      try {
        await authService.logout();
      } catch (err) {
        console.warn("⚠️ Logout API call failed (non-blocking):", err);
      }

      // 5. Clear auth state
      clearAuth();

      // 6. Clear query cache
      try {
        await queryClient.clear();
      } catch (err) {
        console.warn("⚠️ Failed to clear query cache:", err);
      }

      return { success: true };
    } catch (err) {
      console.error("❌ Logout error:", err);
      // Even if error, still clear local state
      clearAuth();
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async () => {
    // Single-flight: return existing promise if already running
    if (refreshPromise) {
      return refreshPromise;
    }

    refreshPromise = (async () => {
      try {
        // Skip if token still valid and not near expiry
        if (accessToken.value && !isTokenNearExpiry(accessToken.value)) {
          return true;
        }

        ("🔄 Refreshing access token...");

        // Mobile: include refresh token in request body
        const payload = {};
        if (isMobile()) {
          const mobileRefreshToken = getRefreshTokenMobile();
          if (mobileRefreshToken) {
            payload.refreshToken = mobileRefreshToken;
          }
        }

        const response = await authService.refresh();

        if (response.success) {
          setAuth({
            ...response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          });

          return true;
        }

        console.error("❌ Refresh failed: Invalid response");
        return false;
      } catch (err) {
        console.error("❌ Refresh error:", err);

        // ✅ TAMBAHAN: Handle 429 - Rate limit
        if (err.status === 429) {
          console.warn("⚠️ Rate limit hit - keeping current token");
          return false; // Return false tapi TIDAK logout
        }

        // Only logout on explicit auth failure (401, 403)
        if (err.status === 401 || err.status === 403) {
          clearAuth();
          return false;
        }

        // Network errors: keep session, allow retry
        const isNetworkError = !err.status || err.code === "ECONNABORTED" || err.code === "ERR_NETWORK";
        if (isNetworkError) {
          console.warn("⚠️ Network error on refresh - keeping session for retry");
          return false;
        }

        // Unknown errors: log but don't logout (defensive)
        console.warn("⚠️ Unknown refresh error - keeping session");
        return false;
      } finally {
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  };

  // ========== VERIFY TOKEN ==========

  const verifyToken = async () => {
    // Don't verify if no token
    if (!accessToken.value) {
      return false;
    }

    // Skip if token not expired
    if (!isTokenExpired(accessToken.value)) {
      return { success: true, user: user.value };
    }

    try {
      setLoading(true);
      clearError();

      const response = await authService.verify();

      if (response.success) {
        // Verify doesn't return accessToken, keep existing
        setAuth({
          ...response.user,
          accessToken: accessToken.value,
        });

        return { success: true, user: user.value };
      }

      throw new Error(response.message || "Token verification failed");
    } catch (err) {
      console.error("❌ Verify error:", err);

      // Only logout on explicit auth failure
      if (err.status === 401 || err.status === 403) {
        clearAuth();
      }

      return false;
    } finally {
      setLoading(false);
    }
  };

  const initialize = async () => {
    // Single-flight: return existing promise if already running
    if (initializePromise) {
      return initializePromise;
    }

    // Already initialized
    if (isInitialized.value) {
      return;
    }

    initializePromise = (async () => {
      try {
        // Mobile: try to restore from localStorage refresh token
        if (isMobile()) {
          const mobileRefreshToken = getRefreshTokenMobile();
          if (mobileRefreshToken) {
            const refreshed = await refreshToken();

            if (refreshed) {
              console.log("✅ Session restored");

              // ✅ FIX: Initialize cart after session restore
              try {
                const { useCartStore } = await import("@/stores/cartStore");
                const cartStore = useCartStore();
                await cartStore.initializeCart();
                console.log("✅ Cart initialized after session restore");
              } catch (err) {
                console.warn("⚠️ Failed to initialize cart after restore:", err);
              }
            } else {
              console.log("❌ Session restore failed");
              clearAuth();
            }
          }
        }

        // Desktop/Web: try refresh (uses HTTP-only cookie)
        const refreshed = await refreshToken();

        if (refreshed) {
        } else {
          clearAuth();
        }
      } catch (err) {
        console.error("❌ Initialize error:", err);

        // On initialization error, clear to be safe
        clearAuth();
      } finally {
        isInitialized.value = true;
        initializePromise = null;
      }
    })();

    return initializePromise;
  };

  const requestPasswordReset = async email => {
    try {
      setLoading(true);
      clearError();

      const response = await authService.requestPasswordReset(email);
      return response;
    } catch (err) {
      setError(err.message || "Password reset request failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email, otp, newPassword) => {
    try {
      setLoading(true);
      clearError();

      const response = await authService.resetPassword(email, otp, newPassword);
      return response;
    } catch (err) {
      setError(err.message || "Password reset failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (currentPassword, newPassword, confirmPassword) => {
    try {
      setLoading(true);
      clearError();

      const response = await authService.changePassword(currentPassword, newPassword, confirmPassword);

      if (response.success) {
        return { success: true, message: response.message };
      }

      throw new Error(response.message || "Failed to change password");
    } catch (err) {
      console.error("❌ Change password error:", err);
      setError(err.message || "Failed to change password");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const checkUsernameAvailability = async username => {
    try {
      clearError();

      const response = await authService.checkUsernameAvailability(username);
      return response;
    } catch (err) {
      setError(err.message || "Unable to check username availability");
      throw err;
    }
  };

  return {
    // State
    user,
    accessToken,
    isLoading,
    error,
    isInitialized,

    // Computed
    isAuthenticated,
    userRole,
    isUser,
    isSeller,
    isAdmin,
    hasRole,
    hasAnyRole,

    // Actions
    setAuth,
    clearAuth,
    setError,
    clearError,
    setLoading,

    // Auth Methods
    login,
    register,
    logout,
    refreshToken,
    verifyToken,
    initialize,

    // Password Management
    requestPasswordReset,
    resetPassword,
    changePassword,
    checkUsernameAvailability,

    // Utility
    isTokenNearExpiry: () => (accessToken.value ? isTokenNearExpiry(accessToken.value) : true),
  };
});
