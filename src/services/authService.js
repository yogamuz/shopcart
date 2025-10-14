// services/authService.js
import { useApiClient } from "@/composables/useApiClient";

// Initialize API client
const apiClient = useApiClient();

export const authService = {
  // Login user
  async login(credentials) {
    const { email, password } = credentials;

    // Validate input
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    return apiClient.post("/api/auth/login", { email, password });
  },

  // Register new user
  async register(userData) {
    const { username, email, password } = userData;

    // Validate input
    if (!username || !email || !password) {
      throw new Error("Username, email, and password are required");
    }

    if (username.length < 3 || username.length > 30) {
      throw new Error("Username must be 3-30 characters");
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new Error("Username must be alphanumeric and underscore only");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Valid email is required");
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(password)) {
      throw new Error("Password must contain at least one lowercase, uppercase, and number");
    }

    return apiClient.post("/api/auth/register", { username, email, password });
  },

  // Logout user
  async logout() {
    return apiClient.delete("/api/auth/logout");
  },

  // Refresh access token
  async refresh() {
    return apiClient.put("/api/auth/refresh", {});
  },

  // Verify token
  async verify() {
    return apiClient.get("/api/auth/verify");
  },

  // Request password reset
  async requestPasswordReset(email) {
    if (!email) {
      throw new Error("Email is required");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Valid email is required");
    }

    return apiClient.post("/api/auth/password-reset-tokens", { email });
  },

  // Reset password with OTP
  async resetPassword(email, otp, newPassword) {
    if (!email || !otp || !newPassword) {
      throw new Error("Email, OTP and new password are required");
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(newPassword)) {
      throw new Error("Password must contain at least one lowercase, uppercase, and number");
    }

    return apiClient.put("/api/auth/passwords", { email, otp, newPassword });
  },

  // Check username availability
  async checkUsernameAvailability(username) {
    if (!username) {
      throw new Error("Username is required");
    }

    if (username.length < 3 || username.length > 30) {
      throw new Error("Username must be 3-30 characters");
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new Error("Username must be alphanumeric and underscore only");
    }

    return apiClient.get(`/api/auth/check-username/${encodeURIComponent(username)}`);
  },

  // ✅ FIXED: Change password (authenticated user)
  async changePassword(currentPassword, newPassword, confirmPassword) {
    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      throw new Error("All password fields are required");
    }

    if (newPassword.length < 6) {
      throw new Error("New password must be at least 6 characters");
    }

    if (newPassword !== confirmPassword) {
      throw new Error("Passwords do not match");
    }

    if (currentPassword === newPassword) {
      throw new Error("New password must be different from current password");
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(newPassword)) {
      throw new Error("Password must contain at least one lowercase, uppercase, and number");
    }

    return apiClient.put("/api/auth/change-password", {
      currentPassword,
      newPassword,
      confirmPassword,
    });
  },
};