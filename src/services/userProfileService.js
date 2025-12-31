// services/userProfileService.js - Pure API layer
import { useApiClient } from "@/composables/useApiClient";

const apiClient = useApiClient();

export const userProfileService = {
  async getProfile() {
    return apiClient.get("/api/users/me");
  },

  async createProfile(profileData) {
    return apiClient.post("/api/users/me", profileData);
  },

  async updateProfile(profileData) {
    return apiClient.put("/api/users/me", profileData);
  },

  async deleteAccount() {
    return apiClient.delete("/api/users/me");
  },

  async uploadAvatar(file, onUploadProgress = null) {
    return apiClient.uploadFile("/api/users/me/avatar", file, {
      fieldName: "avatar",
      onUploadProgress,
    });
  },

  async removeAvatar() {
    return apiClient.delete("/api/users/me/avatar");
  },

  async upgradeToSeller() {
    return apiClient.post("/api/users/me/upgrade-to-seller", {});
  },

  async getAddresses() {
    return apiClient.get("/api/users/me/addresses");
  },

  async addAddress(addressData) {
    return apiClient.post("/api/users/me/addresses", addressData);
  },

  async updateAddress(addressIndex, addressData) {
    return apiClient.patch(`/api/users/me/addresses/${addressIndex}`, addressData);
  },

  async removeAddress(addressIndex) {
    return apiClient.delete(`/api/users/me/addresses/${addressIndex}`);
  },

  async setDefaultAddress(addressIndex) {
    return apiClient.patch(`/api/users/me/addresses/${addressIndex}/default`, {});
  },
};