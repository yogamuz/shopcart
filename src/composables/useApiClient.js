// composables/useApiClient.js - FIXED: Logout-safe version
import { ref } from "vue";
import axios from "axios";
import { logger } from "@/utils/logger";

const isLoading = ref(false);
const error = ref(null);

// ✅ CRITICAL: Global logout flag to prevent interceptor interference
let isLoggingOut = false;

export const setLoggingOut = (value) => {
  isLoggingOut = value;
};

export const useApiClient = (token = null) => {
  const baseURL = import.meta.env.VITE_API_URL;

  const apiClient = axios.create({
    baseURL,
    timeout: 10000,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

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

  const isNetworkError = error => {
    if (!error.response) return true;
    if (error.code === "ECONNABORTED") return true;
    if (error.code === "ENOTFOUND") return true;
    return false;
  };

  // ============================================================================
  // REQUEST INTERCEPTOR
  // ============================================================================
  apiClient.interceptors.request.use(
    async config => {
      // ✅ CRITICAL: Skip token injection if logging out
      if (isLoggingOut) {
        logger.warn("🚫 Request blocked: Logout in progress");
        // Return rejected promise to cancel request
        return Promise.reject({
          message: "Request cancelled: Logout in progress",
          isLogoutCancellation: true,
        });
      }

      isLoading.value = true;
      error.value = null;

      if (config._isRetry && config.headers.Authorization) {
        return config;
      }

      try {
        const { useAuthStore } = await import("@/stores/authStore");
        const authStore = useAuthStore();

        // ✅ Check again after async import
        if (isLoggingOut) {
          return Promise.reject({
            message: "Request cancelled: Logout in progress",
            isLogoutCancellation: true,
          });
        }

        // Preemptive refresh if near expiry
        if (authStore.accessToken && authStore.isTokenNearExpiry()) {
          const refreshed = await authStore.refreshToken();
          if (!refreshed) {
            logger.warn("❌ Preemptive refresh failed - using old token");
          }
        }

        const currentToken = authStore.accessToken;

        if (currentToken) {
          config.headers.Authorization = `Bearer ${currentToken}`;
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

  // ============================================================================
  // RESPONSE INTERCEPTOR
  // ============================================================================
  apiClient.interceptors.response.use(
    response => {
      isLoading.value = false;
      return response.data;
    },
    async error => {
      const originalRequest = error.config;
      isLoading.value = false;

      // ✅ CRITICAL: Silently reject if logout is in progress
      if (isLoggingOut) {
        logger.warn("🚫 Response interceptor skipped: Logout in progress");
        return Promise.reject({
          message: "Response handling cancelled: Logout in progress",
          isLogoutCancellation: true,
          status: 0,
        });
      }

      // ✅ CRITICAL: Handle logout cancellations gracefully
      if (error.isLogoutCancellation) {
        return Promise.reject(error);
      }

      const isRefreshRequest = originalRequest.url?.includes("/refresh");
      const isVerifyRequest = originalRequest.url?.includes("/verify");
      const isNetworkErr = !error.response || error.code === "ECONNABORTED";

      // ============================================================================
      // 401 HANDLER
      // ============================================================================
      if (error.response?.status === 401 && !originalRequest._retry) {
        const needsRefresh = error.response?.data?.needsRefresh;

        // Network error check
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

        // Only refresh if backend explicitly says so
        if (needsRefresh) {
          // ✅ Check logout flag again before queuing
          if (isLoggingOut) {
            return Promise.reject({
              message: "Refresh cancelled: Logout in progress",
              isLogoutCancellation: true,
            });
          }

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

            // ✅ Final check before refresh
            if (isLoggingOut) {
              processQueue(new Error("Refresh cancelled: Logout in progress"), null);
              return Promise.reject({
                message: "Refresh cancelled: Logout in progress",
                isLogoutCancellation: true,
              });
            }

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

              // ✅ FIXED: Only logout if NOT already logging out
              if (!isLoggingOut && !error.isNetworkError) {
                await authStore.logout();

                // ✅ FIXED: Don't redirect to /login - let authStore.logout() handle it
                // The logout() function already redirects to "/" via router
              }

              return Promise.reject(error);
            }
          } catch (refreshError) {
            logger.tokenRefreshFailed(refreshError);
            processQueue(refreshError, null);

            const isRefreshNetworkError =
              !refreshError.status || 
              refreshError.code === "ECONNABORTED" || 
              refreshError.code === "ERR_NETWORK";

            // ✅ FIXED: Only logout if NOT already logging out
            if (!isLoggingOut && !isRefreshNetworkError) {
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
          // 401 without needsRefresh
          // ✅ FIXED: Only logout if NOT already logging out
          if (!isLoggingOut && !isNetworkErr) {
            const { useAuthStore } = await import("@/stores/authStore");
            await useAuthStore().logout();
          }

          return Promise.reject(error);
        }
      }

      // ============================================================================
      // STANDARD ERROR FORMATTING
      // ============================================================================
      const apiError = {
        status: error.response?.status || 0,
        message: error.response?.data?.message || error.message || "Request failed",
        errors: error.response?.data?.errors || [],
        data: error.response?.data || null,
        code: error.code,
        isNetworkError: isNetworkErr,
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
          if (isNetworkErr) {
            apiError.message = "Network error. Check connection.";
          }
      }

      error.value = apiError;
      return Promise.reject(apiError);
    }
  );

  // ============================================================================
  // HTTP METHODS
  // ============================================================================
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

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================
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

  const clearAuth = () => {
    delete apiClient.defaults.headers.Authorization;
  };

  const uploadFile = async (url, file, config = {}) => {
    const formData = new FormData();

    let fieldName = "file";

    if (url.includes("/image")) {
      fieldName = "image";
    } else if (url.includes("/avatar")) {
      fieldName = "avatar";
    } else if (url.includes("/logo")) {
      fieldName = "logo";
    } else if (url.includes("/banner")) {
      fieldName = "banner";
    }

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
    isLoading,
    error,
    get,
    post,
    put,
    patch,
    delete: del,
    setAuthToken,
    clearError,
    clearAuth,
    uploadFile,
    client: apiClient,
  };
};