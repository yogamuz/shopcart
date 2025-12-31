// services/authService.js - Pure API layer, no validation
import { useApiClient } from "@/composables/useApiClient";

const apiClient = useApiClient();

export const authService = {
  async login(credentials) {
    return apiClient.post("/api/auth/login", credentials);
  },

  async register(userData) {
    return apiClient.post("/api/auth/register", userData);
  },

  async logout() {
    return apiClient.delete("/api/auth/logout");
  },

  async refresh() {
    return apiClient.put("/api/auth/refresh", {});
  },

  async verify() {
    return apiClient.get("/api/auth/verify");
  },

  async requestPasswordReset(email) {
    return apiClient.post("/api/auth/password-reset-tokens", { email });
  },

  async resetPassword(email, otp, newPassword) {
    return apiClient.put("/api/auth/passwords", { email, otp, newPassword });
  },

  async checkUsernameAvailability(username) {
    return apiClient.get(`/api/auth/check-username/${encodeURIComponent(username)}`);
  },

  async changePassword(currentPassword, newPassword, confirmPassword) {
    return apiClient.put("/api/auth/change-password", {
      currentPassword,
      newPassword,
      confirmPassword,
    });
  },
};