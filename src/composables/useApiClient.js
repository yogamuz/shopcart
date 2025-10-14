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

  apiClient.interceptors.request.use(
    config => {
      isLoading.value = true;
      error.value = null;

      if (config._isRetry && config.headers.Authorization) {
        return config;
      }

      try {
        const { useAuthStore } = require("@/stores/authStore");
        const authStore = useAuthStore();
        const currentToken = authStore.user?.accessToken;

        if (currentToken) {
          config.headers.Authorization = `Bearer ${currentToken}`;
          logger.tokenSet(config.url); // ← GANTI console.log
        } else {
          logger.tokenMissing(config.url); // ← GANTI console.log
        }
      } catch (err) {
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
  // Response interceptor with auto refresh logic - FIXED
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

      if (error.response?.status === 401 && !originalRequest._retry && !isRefreshRequest && !isVerifyRequest) {
        const needsRefresh =
          error.response?.data?.needsRefresh ||
          error.response?.data?.message?.includes("expired") ||
          error.response?.data?.message?.includes("token");

        if (needsRefresh) {
          originalRequest._retry = true;

          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then(token => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return apiClient(originalRequest);
              })
              .catch(err => Promise.reject(err));
          }

          isRefreshing = true;

          try {
            const { useAuthStore } = await import("@/stores/authStore");
            const authStore = useAuthStore();

            logger.tokenRefresh("Attempting to refresh token..."); // ← GANTI console.log
            const refreshed = await authStore.refreshToken();

            if (refreshed && authStore.user) {
              logger.tokenRefreshSuccess(); // ← GANTI console.log

              const newToken = authStore.user.accessToken;
              processQueue(null, newToken);

              await new Promise(resolve => setTimeout(resolve, 50));

              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              originalRequest._isRetry = true;

              return apiClient(originalRequest);
            } else {
              logger.tokenRefreshFailed("logging out"); // ← GANTI console.log
              processQueue(new Error("Token refresh failed"), null);

              await authStore.logout();

              if (typeof window !== "undefined" && window.$router) {
                window.$router.push("/login");
              } else if (typeof window !== "undefined") {
                window.location.href = "/login";
              }

              return Promise.reject(error);
            }
          } catch (refreshError) {
            logger.tokenRefreshFailed(refreshError); // ← GANTI console.log
            processQueue(refreshError, null);

            try {
              const { useAuthStore } = await import("@/stores/authStore");
              const authStore = useAuthStore();
              await authStore.logout();
            } catch (e) {
              logger.warn("Failed to logout after refresh error:", e); // ← GANTI console.warn
            }

            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        }
      }

      const apiError = {
        status: error.response?.status || 0,
        message: error.response?.data?.message || error.message || "Request failed",
        errors: error.response?.data?.errors || [],
        data: error.response?.data || null,
        code: error.code,
        isNetworkError: !error.response,
      };

      // Handle specific status codes - TIDAK BERUBAH
      switch (error.response?.status) {
        case 401:
          if (isRefreshRequest) {
            apiError.message = "Refresh token expired or invalid";
          } else if (isVerifyRequest) {
            apiError.message = "Access token expired or invalid";
          } else {
            apiError.message = "Unauthorized. Please login again.";
          }
          break;
        case 403:
          apiError.message = "Forbidden. You don't have permission to access this resource.";
          break;
        case 404:
          apiError.message = "Resource not found.";
          break;
        case 422:
          apiError.message = "Validation failed.";
          break;
        case 500:
          apiError.message = "Internal server error. Please try again later.";
          break;
        default:
          if (!error.response) {
            apiError.message = "Network error. Please check your connection.";
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
