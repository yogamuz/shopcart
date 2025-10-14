// services/sellerProfileService.js
import { useApiClient } from "@/composables/useApiClient";

class SellerProfileService {
  constructor() {
    this.baseUrl = "/api/seller/profile";
  }

  /**
   * Get seller profile
   */
  async getProfile() {
    const { get } = useApiClient();
    return await get(this.baseUrl);
  }

  /**
   * Create seller profile
   */
  async createProfile(profileData) {
    const { post } = useApiClient();
    return await post(this.baseUrl, profileData);
  }

  /**
   * Update seller profile
   */
  async updateProfile(updates) {
    const { patch } = useApiClient();
    return await patch(this.baseUrl, updates);
  }

  /**
   * Delete seller profile (soft delete)
   */
  async deleteProfile() {
    const { delete: del } = useApiClient();
    return await del(this.baseUrl);
  }

  /**
   * Upload store logo
   */
  async uploadLogo(file, onUploadProgress) {
    const { uploadFile } = useApiClient();
    return await uploadFile(`${this.baseUrl}/images/logo`, file, {
      fieldName: "image",
      onUploadProgress,
    });
  }

  /**
   * Upload store banner
   */
  async uploadBanner(file, onUploadProgress) {
    const { uploadFile } = useApiClient();
    return await uploadFile(`${this.baseUrl}/images/banner`, file, {
      fieldName: "image",
      onUploadProgress,
    });
  }

  /**
   * Archive profile (set status to archived)
   */
  async archiveProfile() {
    const { patch } = useApiClient();
    return await patch(this.baseUrl, { status: "archived" });
  }

  /**
   * Restore profile (set status to active)
   */
  async restoreProfile() {
    const { patch } = useApiClient();
    return await patch(this.baseUrl, { status: "active" });
  }
}

export const sellerProfileService = new SellerProfileService();