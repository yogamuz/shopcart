// stores/authStore.js - Fixed version (minimal changes)
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { authService } from "@/services/authService";
import { queryClient } from "@/main.js";

export const useAuthStore = defineStore("auth", () => {
  // State
  const user = ref(JSON.parse(localStorage.getItem("user") || "null"));
  const accessToken = ref(null);
  const isLoading = ref(false);
  const error = ref(null);
  const isInitializing = ref(false);
  const lastVerified = ref(localStorage.getItem("lastVerified") || null);

  // Getters
  const isAuthenticated = computed(() => !!user.value && !!accessToken.value);
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

  const isTokenNearExpiry = () => {
    if (!accessToken.value) return true;

    try {
      // Decode JWT tanpa verify (hanya baca payload)
      const base64Url = accessToken.value.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(window.atob(base64));

      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      const twoMinutes = 2 * 60 * 1000;

      return expiryTime - now < twoMinutes;
    } catch (err) {
      console.warn("Failed to decode token:", err);
      return true; // Assume expired if can't decode
    }
  };

  // ✅ FIX: Helper untuk validasi refresh cookie dengan value check
  const hasValidRefreshCookie = () => {
    if (typeof document === "undefined") return false;
    
    const cookies = document.cookie.split(";");
    return cookies.some(cookie => {
      const trimmed = cookie.trim();
      
      // Check if it's a refresh token cookie
      if (trimmed.startsWith("refreshToken=") || trimmed.startsWith("refresh_token=")) {
        // ✅ FIX: Extract and validate the value
        const cookieValue = trimmed.split("=")[1];
        return cookieValue && cookieValue.length > 10; // Must have actual value
      }
      
      return false;
    });
  };

  // Actions
  const setAuth = userData => {


    const { accessToken: token, ...userDataOnly } = userData;

    user.value = userDataOnly;
    accessToken.value = token;
    error.value = null;

    if (userDataOnly) {
      localStorage.setItem("user", JSON.stringify(userDataOnly));
      localStorage.setItem("lastVerified", Date.now().toString());
      lastVerified.value = Date.now().toString();

    }
  };

  const clearAuth = () => {
    user.value = null;
    accessToken.value = null;
    error.value = null;
    isInitializing.value = false;
    lastVerified.value = null;

    localStorage.removeItem("user");
    localStorage.removeItem("lastVerified");

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

  // Auth Methods

  const login = async credentials => {
    try {
      setLoading(true);
      clearError();

      const response = await authService.login(credentials);

      if (response.success) {
        setAuth({
          ...response.user,
          accessToken: response.accessToken,
        });

        try {
          await queryClient.clear();
        } catch (err) {
          console.warn("Failed to clear cache on login:", err);
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
        });

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
      isInitializing.value = false;

      // Clear seller profile store FIRST before clearing auth
      try {
        const { useSellerProfileStore } = await import("@/stores/sellerProfileStore");
        const sellerProfileStore = useSellerProfileStore();
        sellerProfileStore.clearProfile();
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
      } catch (err) {
        console.warn("Failed to clear query cache:", err);
      }

      // Logout API call (best effort)
      try {
        await authService.logout();
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

  let refreshPromise = null;
const refreshToken = async () => {
  if (refreshPromise) {
    return refreshPromise;
  }

  try {
    // Skip refresh if token still valid
    if (accessToken.value && !isTokenNearExpiry() && isVerificationFresh()) {
      return true;
    }


    // ✅ FIX: Just call refresh, backend validates refresh cookie
    // No client-side cookie check needed
    refreshPromise = authService.refresh();
    const response = await refreshPromise;

    if (response.success) {

      setAuth({
        ...response.user,
        accessToken: response.accessToken,
      });

      return true;
    }

    return false;
  } catch (err) {
    const isNetworkError = !err.status || err.code === "ECONNABORTED" || err.code === "ERR_NETWORK";

    if (err.status === 400 || err.status === 401) {
      clearAuth();
    } else if (isNetworkError) {
      console.warn("⚠️ Network error on refresh - keeping session:", err.message);
      return false;
    } else {
      console.warn("⚠️ Refresh error:", err);
      return false;
    }

    return false;
  } finally {
    refreshPromise = null;
  }
};

  const verifyToken = async (force = false) => {
    if (!force && isVerificationFresh()) {
      return { success: true, user: user.value };
    }

    // Check in-memory token
    if (!accessToken.value) {
      return false;
    }

    try {
      setLoading(true);
      clearError();

      const response = await authService.verify();

      if (response.success) {

        // CRITICAL FIX: Verify endpoint doesn't return accessToken, keep existing token
        setAuth({
          ...response.user,
          accessToken: accessToken.value, // Keep existing token!
        });

        return { success: true, user: user.value };
      }

      throw new Error(response.message || "Token verification failed");
    } catch (err) {

      if (err.status === 401 || err.status === 403) {
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

  const canSkipInitialization = () => {
    // Only skip if just logged out
    if (sessionStorage.getItem("justLoggedOut")) {
      sessionStorage.removeItem("justLoggedOut");
      return true;
    }

    return false;
  };

  let initializePromise = null;

const initialize = async () => {
  if (initializePromise) {
    return initializePromise;
  }

  if (isInitializing.value) {
    return;
  }

  if (canSkipInitialization()) {
    return;
  }

  isInitializing.value = true;

  initializePromise = (async () => {
    try {

      // Load user from localStorage FIRST
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          user.value = JSON.parse(storedUser);
        } catch (e) {
          console.warn("⚠️  Failed to parse stored user:", e);
          localStorage.removeItem("user");
        }
      }

      
      if (storedUser) {
        
        const refreshed = await refreshToken();

        if (refreshed) {
          await new Promise(resolve => setTimeout(resolve, 100));
          return;
        } else {
          clearAuth();
        }
      } else {
        // No stored user = guest mode or first time
      }

    } catch (err) {
      console.error("❌ Init error:", err);
      
      if (err.status === 401 || err.status === 403) {
        clearAuth();
      } else if (!err.isNetworkError) {
        console.warn("⚠️  Unknown error - clearing auth to be safe");
        clearAuth();
      } else {
        console.warn("📡 Network error - keeping session for retry");
      }
    } finally {
      isInitializing.value = false;
      initializePromise = null;

    }
  })();

  return initializePromise;
};

  const ensureTokenReady = async (maxWait = 5000) => {
    const startTime = Date.now();

    while (!accessToken.value && Date.now() - startTime < maxWait) {
      if (isInitializing.value) {
        await new Promise(resolve => setTimeout(resolve, 100));
      } else {
        // Initialization done but no token
        break;
      }
    }

    const waitTime = Date.now() - startTime;


    return !!accessToken.value;
  };

  return {
    // State
    user,
    accessToken,
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
    ensureTokenReady,
    isTokenNearExpiry,
  };
});