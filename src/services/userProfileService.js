// services/userProfileService.js
import { useApiClient } from "@/composables/useApiClient";
import { useAuthStore } from "@/stores/authStore";

class UserProfileService {
  getApiClient() {
    const authStore = useAuthStore();
    const token = authStore.user?.accessToken;

    // ✅ Pass token, tapi request interceptor akan ambil real-time token
    return useApiClient(token);
  }

  /**
   * Get user profile
   */
  async getProfile() {
    try {
      const api = this.getApiClient(); // ✅ Fresh client
      const response = await api.get("/api/users/me");
      return { success: true, data: response.data, message: response.message };
    } catch (error) {
      console.error("Error getting profile:", error);
      throw { success: false, message: error.message || "Failed to get profile" };
    }
  }

  /**
   * Create user profile
   */
  async createProfile(profileData) {
    try {
      const api = this.getApiClient(); // ✅ Fresh client
      const response = await api.post("/api/users/me", profileData);
      return { success: true, data: response.data, message: response.message };
    } catch (error) {
      console.error("Error creating profile:", error);
      throw {
        success: false,
        message: error.message || "Failed to create profile",
        status: error.status,
        errors: error.errors,
        code: error.data?.code,
      };
    }
  }

  async updateProfile(profileData) {
    try {
      const api = this.getApiClient();
      const response = await api.put("/api/users/me", profileData);

      // ✅ TAMBAHKAN: Log untuk debugging
      console.log("📤 Update profile response:", response.data);
      console.log("📤 Date of birth from server:", response.data.profile?.dateOfBirth);

      return { success: true, data: response.data, message: response.message };
    } catch (error) {
      console.error("Error updating profile:", error);
      throw {
        success: false,
        message: error.message || "Failed to update profile",
        status: error.status,
        errors: error.errors,
        code: error.data?.code,
      };
    }
  }

  /**
   * Delete user account (soft delete)
   */
  async deleteAccount() {
    try {
      const api = this.getApiClient(); // ✅ FIX: Tambahkan ini
      const response = await api.delete("/api/users/me");
      return { success: true, message: response.message };
    } catch (error) {
      console.error("Error deleting account:", error);
      throw {
        success: false,
        message: error.message || "Failed to delete account",
        status: error.status,
      };
    }
  }

  /**
   * Upload avatar
   */
  async uploadAvatar(file, onUploadProgress = null) {
    try {
      const api = this.getApiClient(); // ✅ FIX: Tambahkan ini
      const response = await api.uploadFile("/api/users/me/avatar", file, {
        fieldName: "avatar",
        onUploadProgress,
      });
      return { success: true, data: response.data, message: response.message };
    } catch (error) {
      console.error("Error uploading avatar:", error);
      throw {
        success: false,
        message: error.message || "Failed to upload avatar",
        status: error.status,
        code: error.data?.code,
      };
    }
  }

  /**
   * Remove avatar
   */
  async removeAvatar() {
    try {
      const api = this.getApiClient(); // ✅ FIX: Tambahkan ini
      const response = await api.delete("/api/users/me/avatar");
      return { success: true, data: response.data, message: response.message };
    } catch (error) {
      console.error("Error removing avatar:", error);
      throw {
        success: false,
        message: error.message || "Failed to remove avatar",
        status: error.status,
      };
    }
  }


  /**
   * Upgrade to seller
   */
  async upgradeToSeller() {
    try {
      const api = this.getApiClient();
      const response = await api.post("/api/users/me/upgrade-to-seller", {});
      return { success: true, data: response.data, message: response.message };
    } catch (error) {
      console.error("Error upgrading to seller:", error);
      throw {
        success: false,
        message: error.message || "Failed to upgrade to seller",
        status: error.status,
        code: error.data?.code,
      };
    }
  }

  /**
   * Get user addresses
   */
  async getAddresses() {
    try {
      const api = this.getApiClient(); // ✅ FIX: Tambahkan ini
      const response = await api.get("/api/users/me/addresses");
      return { success: true, data: response.data, message: response.message };
    } catch (error) {
      console.error("Error getting addresses:", error);
      throw {
        success: false,
        message: error.message || "Failed to get addresses",
        status: error.status,
      };
    }
  }

  /**
   * Add new address
   */
  async addAddress(addressData) {
    try {
      const api = this.getApiClient(); // ✅ FIX: Tambahkan ini
      const response = await api.post("/api/users/me/addresses", addressData);
      return { success: true, data: response.data, message: response.message };
    } catch (error) {
      console.error("Error adding address:", error);
      throw {
        success: false,
        message: error.message || "Failed to add address",
        status: error.status,
        errors: error.errors,
        code: error.data?.code,
      };
    }
  }
  /**
   * Update address by index
   */
  async updateAddress(addressIndex, addressData) {
    try {
      const api = this.getApiClient(); // ✅ FIX: Tambahkan ini
      const response = await api.patch(`/api/users/me/addresses/${addressIndex}`, addressData);
      return { success: true, data: response.data, message: response.message };
    } catch (error) {
      console.error("Error updating address:", error);
      throw {
        success: false,
        message: error.message || "Failed to update address",
        status: error.status,
        errors: error.errors,
        code: error.data?.code,
      };
    }
  }

  /**
   * Remove address by index
   */
  async removeAddress(addressIndex) {
    try {
      const api = this.getApiClient(); // ✅ FIX: Tambahkan ini
      const response = await api.delete(`/api/users/me/addresses/${addressIndex}`);
      return { success: true, data: response.data, message: response.message };
    } catch (error) {
      console.error("Error removing address:", error);
      throw {
        success: false,
        message: error.message || "Failed to remove address",
        status: error.status,
        code: error.data?.code,
      };
    }
  }

  /**
   * Set default address by index
   */
  async setDefaultAddress(addressIndex) {
    try {
      const api = this.getApiClient(); // ✅ FIX: Tambahkan ini
      const response = await api.patch(`/api/users/me/addresses/${addressIndex}/default`, {});
      return { success: true, data: response.data, message: response.message };
    } catch (error) {
      console.error("Error setting default address:", error);
      throw {
        success: false,
        message: error.message || "Failed to set default address",
        status: error.status,
        code: error.data?.code,
      };
    }
  }

  /**
   * Validate address data
   */
  validateAddress(addressData) {
    const errors = [];
    const requiredFields = ["street", "city", "state", "zipCode"];

    requiredFields.forEach(field => {
      if (!addressData[field] || addressData[field].toString().trim() === "") {
        errors.push(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate profile data
   */
  validateProfile(profileData) {
    const errors = [];

    // Phone validation (Indonesian format)
    if (profileData.phone) {
      const phoneRegex = /^(\+62|62|08)\d{8,12}$/;
      if (!phoneRegex.test(profileData.phone.replace(/[\s-]/g, ""))) {
        errors.push("Phone number must be in Indonesian format (+62xxxxxxxxxx or 08xxxxxxxxxx)");
      }
    }

    // Email validation (basic)
    if (profileData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(profileData.email)) {
        errors.push("Please enter a valid email address");
      }
    }

    // Name validation
    if (profileData.firstName && profileData.firstName.length < 2) {
      errors.push("First name must be at least 2 characters long");
    }

    if (profileData.lastName && profileData.lastName.length < 2) {
      errors.push("Last name must be at least 2 characters long");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Format address for display
   */
  formatAddress(address) {
    if (!address) return "";

    return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country || "Indonesia"}`;
  }

  /**
   * Format phone number for display
   */
  formatPhone(phone) {
    if (!phone) return "";

    // Remove all non-digits
    const digits = phone.replace(/\D/g, "");

    // Format Indonesian phone numbers
    if (digits.startsWith("62")) {
      return `+62 ${digits.substring(2, 5)} ${digits.substring(5, 9)} ${digits.substring(9)}`;
    } else if (digits.startsWith("08")) {
      return `${digits.substring(0, 4)} ${digits.substring(4, 8)} ${digits.substring(8)}`;
    }

    return phone;
  }

  /**
   * Generate full name from first and last name
   */
  getFullName(firstName, lastName) {
    return `${firstName || ""} ${lastName || ""}`.trim() || "User";
  }

  /**
   * Get initials from name
   */
  getInitials(firstName, lastName) {
    const first = firstName ? firstName.charAt(0).toUpperCase() : "";
    const last = lastName ? lastName.charAt(0).toUpperCase() : "";
    return `${first}${last}` || "U";
  }
}

// Create singleton instance
const userProfileService = new UserProfileService();

export default userProfileService;
