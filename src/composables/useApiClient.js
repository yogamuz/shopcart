// composables/useApiClient.js - FIXED WITH AUTO REFRESH
import { ref } from "vue";
import axios from "axios";
import { logger } from "@/utils/logger";

const isLoading = ref(false);
const error = ref(null);

export const useApiClient = (token = null) => {
  const baseURL = import.meta.env.VITE_API_URL;

  // Create axios instance
  const apiClient = axios.create({
    baseURL,
    timeout: 10000,
    withCredentials: true, // Important for HTTP-only cookies
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Track if we're currently refreshing to avoid multiple refresh calls
  let isRefreshing = false;
  let failedQueue = [];

  const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });

    failedQueue = [];
  };

  /**
   * Helper: Better network error detection
   * Membedakan antara network error vs auth error
   */
  const isNetworkError = error => {
    if (!error.response) return true; // No response = network error
    if (error.code === "ECONNABORTED") return true; // Timeout
    if (error.code === "ENOTFOUND") return true; // DNS error
    return false;
  };

  /**
   * Helper: Check if refresh should be retried
   * Don't refresh jika network truly down
   */
  const shouldAttemptRefresh = error => {
    if (isNetworkError(error)) return false; // Network error, jangan retry
    if (error.response?.status === 401) return true; // Auth error, coba refresh
    if (error.response?.status === 403) return false; // Permission error, jangan retry
    return false;
  };

  apiClient.interceptors.request.use(
    async config => {
      isLoading.value = true;
      error.value = null;

      // Skip jika retry request
      if (config._isRetry && config.headers.Authorization) {
        return config;
      }

      try {
        const { useAuthStore } = await import("@/stores/authStore");
        const authStore = useAuthStore();

        // ✅ FIX: Check if token near expiry BEFORE making request
        if (authStore.accessToken && authStore.isTokenNearExpiry()) {
          const refreshed = await authStore.refreshToken();

          if (!refreshed) {
            console.warn("❌ Preemptive refresh failed - using old token");
          } else {
          }
        }

        const currentToken = authStore.accessToken;

        if (currentToken) {
          config.headers.Authorization = `Bearer ${currentToken}`;
          // ✅ Jangan log untuk setiap request, terlalu noise
          // logger.tokenSet(config.url);
        } else {
          logger.tokenMissing(config.url);
        }
      } catch (err) {
        console.warn("Request interceptor error:", err);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }

      return config;
    },
    error => {
      isLoading.value = false;
      return Promise.reject(error);
    }
  );

  apiClient.interceptors.response.use(
    response => {
      isLoading.value = false;
      return response.data;
    },
    async error => {
      const originalRequest = error.config;
      isLoading.value = false;

      const isRefreshRequest = originalRequest.url?.includes("/refresh");
      const isVerifyRequest = originalRequest.url?.includes("/verify");
      const isNetworkError = !error.response || error.code === "ECONNABORTED";

      // ✅ FIX: 401 handler dengan better error detection
      if (error.response?.status === 401 && !originalRequest._retry) {
        const needsRefresh = error.response?.data?.needsRefresh;

        // ✅ FIX: Detect network error lebih baik
        const isNetworkError =
          !error.response ||
          error.code === "ECONNABORTED" ||
          error.code === "ERR_NETWORK" ||
          error.message?.includes("Network Error");

        if (isNetworkError) {
          logger.warn("Network error - not attempting refresh");
          const apiError = {
            status: 0,
            message: "Network error. Check your connection.",
            isNetworkError: true,
          };
          error.value = apiError;
          return Promise.reject(apiError);
        }

        // ✅ FIX: Only refresh if backend explicitly says so
        if (needsRefresh) {
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then(token => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                originalRequest._retry = true;
                return apiClient(originalRequest);
              })
              .catch(err => Promise.reject(err));
          }

          isRefreshing = true;

          try {
            const { useAuthStore } = await import("@/stores/authStore");
            const authStore = useAuthStore();

            logger.tokenRefresh("Refreshing token...");
            const refreshed = await authStore.refreshToken();

            if (refreshed && authStore.accessToken) {
              logger.tokenRefreshSuccess();

              const newToken = authStore.accessToken;
              processQueue(null, newToken);

              await new Promise(resolve => setTimeout(resolve, 50));

              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              originalRequest._retry = true;

              return apiClient(originalRequest);
            } else {
              logger.tokenRefreshFailed("Token refresh returned false");
              processQueue(new Error("Refresh failed"), null);

              // ✅ FIX: Jangan logout jika network error
              if (!error.isNetworkError) {
                await authStore.logout();

                if (typeof window !== "undefined" && window.$router) {
                  window.$router.push("/login");
                }
              }

              return Promise.reject(error);
            }
          } catch (refreshError) {
            logger.tokenRefreshFailed(refreshError);
            processQueue(refreshError, null);

            // ✅ FIX: Check if network error before logout
            const isRefreshNetworkError =
              !refreshError.status || refreshError.code === "ECONNABORTED" || refreshError.code === "ERR_NETWORK";

            if (!isRefreshNetworkError) {
              try {
                const { useAuthStore } = await import("@/stores/authStore");
                await useAuthStore().logout();
              } catch (e) {
                logger.warn("Logout failed:", e);
              }
            }

            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        } else {
          // ✅ FIX: 401 tanpa needsRefresh - tapi check network dulu
          if (!isNetworkError) {
            const { useAuthStore } = await import("@/stores/authStore");
            await useAuthStore().logout();

            if (typeof window !== "undefined" && window.$router) {
              window.$router.push("/login");
            }
          }

          return Promise.reject(error);
        }
      }

      // Standard error formatting (unchanged)
      const apiError = {
        status: error.response?.status || 0,
        message: error.response?.data?.message || error.message || "Request failed",
        errors: error.response?.data?.errors || [],
        data: error.response?.data || null,
        code: error.code,
        isNetworkError: isNetworkError,
      };

      // Status-specific messages
      switch (error.response?.status) {
        case 401:
          if (isRefreshRequest) {
            apiError.message = "Refresh token expired";
          } else if (isVerifyRequest) {
            apiError.message = "Access token expired";
          } else {
            apiError.message = "Unauthorized. Please login.";
          }
          break;
        case 403:
          apiError.message = "Forbidden. No permission.";
          break;
        case 404:
          apiError.message = "Resource not found.";
          break;
        case 422:
          apiError.message = "Validation failed.";
          break;
        case 500:
          apiError.message = "Server error. Try again.";
          break;
        default:
          if (isNetworkError) {
            apiError.message = "Network error. Check connection.";
          }
      }

      error.value = apiError;
      return Promise.reject(apiError);
    }
  );

  // HTTP Methods (unchanged)
  const get = async (url, config = {}) => {
    try {
      return await apiClient.get(url, config);
    } catch (err) {
      throw err;
    }
  };

  const post = async (url, data = null, config = {}) => {
    try {
      return await apiClient.post(url, data, config);
    } catch (err) {
      throw err;
    }
  };

  const put = async (url, data = null, config = {}) => {
    try {
      return await apiClient.put(url, data, config);
    } catch (err) {
      throw err;
    }
  };

  const patch = async (url, data = null, config = {}) => {
    try {
      return await apiClient.patch(url, data, config);
    } catch (err) {
      throw err;
    }
  };

  const del = async (url, config = {}) => {
    try {
      return await apiClient.delete(url, config);
    } catch (err) {
      throw err;
    }
  };

  // Utility methods
  const setAuthToken = newToken => {
    if (newToken) {
      apiClient.defaults.headers.Authorization = `Bearer ${newToken}`;
    } else {
      delete apiClient.defaults.headers.Authorization;
    }
  };

  const clearError = () => {
    error.value = null;
  };
  const getWithDebug = async (url, config = {}) => {
    logger.apiRequest(url, config); // ← GANTI console.log

    try {
      const response = await apiClient.get(url, config);
      logger.apiSuccess(url, response); // ← GANTI console.log
      return response;
    } catch (err) {
      logger.apiError(url, err); // ← GANTI console.error
      throw err;
    }
  };
  const clearAuth = () => {
    delete apiClient.defaults.headers.Authorization;
  };

  const uploadFile = async (url, file, config = {}) => {
    const formData = new FormData();

    // Determine field name based on URL patterns
    let fieldName = "file"; // default

    if (url.includes("/image")) {
      fieldName = "image"; // for product uploads
    } else if (url.includes("/avatar")) {
      fieldName = "avatar"; // for profile uploads
    } else if (url.includes("/logo")) {
      fieldName = "logo"; // for seller profile logo
    } else if (url.includes("/banner")) {
      fieldName = "banner"; // for seller profile banner
    }

    // Allow override via config
    if (config.fieldName) {
      fieldName = config.fieldName;
    }

    formData.append(fieldName, file);

    const uploadConfig = {
      ...config,
      headers: {
        "Content-Type": "multipart/form-data",
        ...config.headers,
      },
      onUploadProgress: config.onUploadProgress || undefined,
    };

    try {
      return await apiClient.post(url, formData, uploadConfig);
    } catch (err) {
      throw err;
    }
  };

  return {
    // State
    isLoading,
    error,

    // HTTP Methods
    get,
    post,
    put,
    patch,
    delete: del,

    // Utility methods
    setAuthToken,
    clearError,
    clearAuth,
    uploadFile,

    // Direct access to axios instance if needed
    client: apiClient,
  };
};
