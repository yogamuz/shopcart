// stores/authStore.js - Optimized version (less API calls)
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { authService } from "@/services/authService";
import { queryClient } from "@/main.js";

export const useAuthStore = defineStore("auth", () => {
  // State
  const user = ref(JSON.parse(localStorage.getItem("user") || "null"));
  const isLoading = ref(false);
  const error = ref(null);
  const isInitializing = ref(false);
  const lastVerified = ref(localStorage.getItem("lastVerified") || null);

  // Getters
  const isAuthenticated = computed(() => !!user.value);
  const userRole = computed(() => user.value?.role || null);
  const isUser = computed(() => userRole.value === "user");
  const isSeller = computed(() => userRole.value === "seller");
  const isAdmin = computed(() => userRole.value === "admin");
  const hasRole = computed(() => role => userRole.value === role);
  const hasAnyRole = computed(() => roles => roles.includes(userRole.value));

  // Helper: Check if verification is still fresh (5 menit)
  const isVerificationFresh = () => {
    if (!lastVerified.value) return false;
    const fiveMinutes = 5 * 60 * 1000;
    return Date.now() - parseInt(lastVerified.value) < fiveMinutes;
  };

  // Actions
  const setAuth = userData => {
    user.value = userData;
    error.value = null;

    // Simpan user ke localStorage untuk persist after refresh
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("lastVerified", Date.now().toString());
      lastVerified.value = Date.now().toString();
    }
  };

  const clearAuth = () => {
    user.value = null;
    error.value = null;
    isInitializing.value = false;
    lastVerified.value = null;

    localStorage.removeItem("user");
    localStorage.removeItem("lastVerified");

    // Clear TanStack Query cache
    try {
      const queryClient = useQueryClient();
      queryClient.clear();
    } catch (err) {
      console.warn("Failed to clear query cache:", err);
    }

    try {
      queryClient.clear(); // ✅ Langsung pakai imported queryClient
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

  // Auth Methods

  const login = async credentials => {
    try {
      setLoading(true);
      clearError();

      const response = await authService.login(credentials);

      if (response.success) {
        const userData = {
          ...response.user,
          accessToken: response.accessToken,
        };

        setAuth(userData);

        try {
          await queryClient.clear(); // ✅ Langsung pakai imported queryClient
        } catch (err) {
          console.warn("Failed to clear cache on login:", err);
        }

        return { success: true, user: userData };
      }

      throw new Error(response.message || "Login failed");
    } catch (err) {
      setError(err.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fixed register method in authStore.js
  const register = async userData => {
    try {
      setLoading(true);
      clearError();

      const response = await authService.register(userData);

      if (response.success) {
        // FIXED: Store the access token along with user data
        const userDataWithToken = {
          ...response.user,
          accessToken: response.accessToken, // Add this line
        };

        setAuth(userDataWithToken);
        return { success: true, user: userDataWithToken };
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
  // Replace the existing logout method with this:

  const logout = async () => {
    try {
      setLoading(true);
      isInitializing.value = false;

      // ✅ CRITICAL: Clear seller profile store FIRST before clearing auth
      try {
        const { useSellerProfileStore } = await import("@/stores/sellerProfileStore");
        const sellerProfileStore = useSellerProfileStore();
        sellerProfileStore.clearProfile();
        console.log("✅ Seller profile cleared");
      } catch (err) {
        console.warn("Failed to clear seller profile:", err);
      }

      // Clear auth state
      const tempUser = user.value;
      clearAuth();

      // Mark that user just logged out
      sessionStorage.setItem("justLoggedOut", "true");

      // Clear TanStack Query cache
      try {
        await queryClient.clear();
        console.log("✅ Cache cleared after logout");
      } catch (err) {
        console.warn("Failed to clear query cache:", err);
      }

      // Logout API call (best effort)
      try {
        await authService.logout();
        console.log(`✅ User ${tempUser?.username} logged out successfully`);
      } catch (err) {
        console.warn("Logout API call failed (non-blocking):", err);
      }
    } catch (err) {
      console.warn("Logout error:", err);
    } finally {
      setLoading(false);

      if (typeof window !== "undefined" && window.$router) {
        window.$router.push("/login");
      }
    }
  };
  // Fixed refreshToken method in authStore.js
  const refreshToken = async () => {
    try {
      // FIXED: Add better checking before attempting refresh
      // Skip refresh jika tidak ada indikasi token atau fresh verification
      if (!user.value && !isVerificationFresh()) {
        console.log("No user or fresh verification - skipping refresh");
        return false;
      }

      // FIXED: Check if we have cookies before attempting refresh
      if (typeof document !== "undefined") {
        const hasCookies = document.cookie
          .split(";")
          .some(cookie => cookie.trim().startsWith("refreshToken=") || cookie.trim().startsWith("refresh_token="));

        if (!hasCookies && !user.value) {
          console.log("No refresh token cookie found - skipping refresh");
          return false;
        }
      }

      console.log("🔄 Attempting token refresh...");
      const response = await authService.refresh();

      if (response.success) {
        console.log("✅ Token refresh successful");
        // Store the access token along with user data
        const userData = {
          ...response.user,
          accessToken: response.accessToken,
        };

        setAuth(userData);
        return true;
      }

      console.log("❌ Refresh response not successful:", response);
      return false;
    } catch (err) {
      // FIXED: Better error handling - don't log if expected failure
      if (err.status === 400 || err.status === 401) {
        console.log("🔄 Refresh token expired or invalid - clearing auth");
        clearAuth();
      } else {
        console.warn("Token refresh failed:", err);
      }
      return false;
    }
  };

  // Fixed verifyToken method in authStore.js
  const verifyToken = async (force = false) => {
    // Skip verification jika masih fresh dan tidak dipaksa
    if (!force && isVerificationFresh()) {
      console.log("Verification still fresh - skipping");
      return { success: true, user: user.value };
    }

    // FIXED: Skip verify if no access token available
    if (!user.value?.accessToken) {
      console.log("No access token available - skipping verify");
      return false;
    }

    try {
      setLoading(true);
      clearError();

      console.log("🔍 Verifying access token...");
      const response = await authService.verify();

      if (response.success) {
        console.log("✅ Token verification successful");
        // Store the access token if provided in response
        const userData = response.accessToken
          ? { ...response.user, accessToken: response.accessToken }
          : { ...response.user, accessToken: user.value.accessToken }; // Keep existing token

        setAuth(userData);
        return { success: true, user: userData };
      }

      throw new Error(response.message || "Token verification failed");
    } catch (err) {
      console.log("🔍 Token verification failed:", err.message);

      // FIXED: Only clear auth if it's actually invalid, not network error
      if (err.status === 401 || err.status === 403) {
        console.log("🔍 Access token invalid - clearing auth");
        clearAuth();
      }

      return false;
    } finally {
      setLoading(false);
    }
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

  /**
 * Change password
 */
const changePassword = async (currentPassword, newPassword, confirmPassword) => {
  try {
    setLoading(true);
    clearError();

    console.log("🔐 Changing password...");
    const response = await authService.changePassword(
      currentPassword,
      newPassword,
      confirmPassword
    );

    if (response.success) {
      console.log("✅ Password changed successfully");
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

  // Fixed initialize method - ADD THIS AFTER LINE 290
  const initialize = async () => {
    if (isInitializing.value) {
      console.log("Already initializing - skipping");
      return;
    }

    // Skip initialize jika user baru logout
    if (sessionStorage.getItem("justLoggedOut")) {
      sessionStorage.removeItem("justLoggedOut");
      console.log("Skipping auth init - user just logged out");
      return;
    }

    isInitializing.value = true;

    try {
      console.log("🚀 Initializing auth state...");

      // Jika ada user di localStorage dan verification masih fresh
      if (user.value && isVerificationFresh()) {
        console.log("✅ Using cached auth state (still fresh)");
        return;
      }

      const hasStoredUser = user.value != null;
      const hasLastVerified = lastVerified.value != null;

      let hasCookies = false;
      if (typeof document !== "undefined") {
        hasCookies = document.cookie
          .split(";")
          .some(cookie => cookie.trim().startsWith("refreshToken=") || cookie.trim().startsWith("refresh_token="));
      }

      // If no indication of previous session, stay in guest mode
      if (!hasStoredUser && !hasLastVerified && !hasCookies) {
        console.log("✅ No previous session found - staying in guest mode");
        return;
      }

      // If we have user but verification expired, try to verify first
      if (hasStoredUser && user.value?.accessToken) {
        console.log("🔍 Stored user found - token ready");

        // ✅ CRITICAL: Ensure token propagates to axios
        await new Promise(resolve => setTimeout(resolve, 100));

        console.log("📌 Token propagated to axios interceptor");
        return;
      }

      // Only try refresh if we have some indication of valid session
      if (hasCookies || hasLastVerified) {
        console.log("🔄 Trying to refresh token...");
        const refreshed = await refreshToken();

        // Di akhir initialize function, SEBELUM finally
        if (refreshed) {
          console.log("✅ Token refresh successful");
          await new Promise(resolve => setTimeout(resolve, 100));

          // ✅ TAMBAH: Log token status
          console.log("📌 Token ready:", {
            hasUser: !!user.value,
            hasToken: !!user.value?.accessToken,
          });

          return;
        } else {
          console.log("❌ Token refresh failed - clearing auth state");
          clearAuth();
        }
      } else {
        console.log("❌ No refresh token available - clearing auth state");
        clearAuth();
      }
    } catch (err) {
      console.warn("Auth initialization failed:", err);
      clearAuth();
    } finally {
      isInitializing.value = false;
      console.log("🏁 Auth initialization complete");
    }
  };

  return {
    // State
    user,
    isLoading,
    error,

    // Getters
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
    requestPasswordReset,
    resetPassword,
    changePassword,
    checkUsernameAvailability,
    initialize,
  };
});
