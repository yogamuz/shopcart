// services/sellerProfileService.js
import { useApiClient } from "@/composables/useApiClient";

const apiClient = useApiClient();

export const sellerProfileService = {
  async getProfile() {
    return await apiClient.get("/api/seller/profile");
  },

  async createProfile(profileData) {
    return await apiClient.post("/api/seller/profile", profileData);
  },

  async updateProfile(updates) {
    return await apiClient.patch("/api/seller/profile", updates);
  },

  async deleteProfile() {
    return await apiClient.delete("/api/seller/profile");
  },

  async uploadLogo(file, onUploadProgress) {
    return await apiClient.uploadFile("/api/seller/profile/images/logo", file, {
      fieldName: "image",
      onUploadProgress,
    });
  },

  async uploadBanner(file, onUploadProgress) {
    return await apiClient.uploadFile("/api/seller/profile/images/banner", file, {
      fieldName: "image",
      onUploadProgress,
    });
  },

  async archiveProfile() {
    return await apiClient.patch("/api/seller/profile", { status: "archived" });
  },

  async restoreProfile() {
    return await apiClient.patch("/api/seller/profile", { status: "active" });
  }
};