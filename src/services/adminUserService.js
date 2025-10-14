// services/adminUserService.js
import { useApiClient } from "@/composables/useApiClient";
import { logger } from "@/utils/logger";

const API_PREFIX = "/api/admin/users";

// Helper function untuk normalisasi id -> _id
const normalizeUser = user => ({
  ...user,
  _id: user.id || user._id,
});

export const adminUserService = {
  /**
   * Get all users with pagination and filters
   */
  async getAllUsers(queryParams = {}) {
    const { get } = useApiClient();

    try {
      logger.info("Fetching all users with params:", queryParams);

      const response = await get(API_PREFIX, { params: queryParams });

      return {
        success: response.success,
        data: (response.data || []).map(normalizeUser),
        pagination: response.pagination || {},
      };
    } catch (error) {
      logger.error("Failed to fetch users:", error);
      throw error;
    }
  },

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    const { get } = useApiClient();

    try {
      logger.info(`Fetching user: ${userId}`);

      const response = await get(`${API_PREFIX}/${userId}`);

      // PERUBAHAN: response bisa langsung object user atau { data: user }
      const userData = response.data || response;

      return {
        success: true,
        data: userData ? normalizeUser(userData) : {},
      };
    } catch (error) {
      logger.error(`Failed to fetch user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Update user
   */
  async updateUser(userId, updates) {
    const { put } = useApiClient();

    try {
      logger.info(`Updating user: ${userId}`, updates);

      const response = await put(`${API_PREFIX}/${userId}`, updates);

      // PERUBAHAN: response bisa langsung object user atau { data: user }
      const userData = response.data || response;

      return {
        success: true,
        data: userData ? normalizeUser(userData) : {},
        message: response.message || "User updated successfully",
      };
    } catch (error) {
      logger.error(`Failed to update user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Delete user (soft or hard)
   */
  async deleteUser(userId, permanent = false) {
    const { delete: del } = useApiClient();

    try {
      const deleteType = permanent ? "permanently" : "soft";
      logger.info(`Deleting user ${deleteType}: ${userId}`);

      const response = await del(`${API_PREFIX}/${userId}`, {
        params: { permanent: permanent.toString() },
      });

      return {
        success: true,
        message: response.message || "User deleted successfully",
      };
    } catch (error) {
      logger.error(`Failed to delete user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Change user role
   */
  async changeUserRole(userId, role) {
    const { patch } = useApiClient();

    try {
      logger.info(`Changing role for user ${userId} to: ${role}`);

      const response = await patch(`${API_PREFIX}/${userId}/role`, { role });

      // PERUBAHAN: response bisa langsung object user atau { data: user }
      const userData = response.data || response;

      return {
        success: true,
        data: userData ? normalizeUser(userData) : {},
        message: response.message || "User role changed successfully",
      };
    } catch (error) {
      logger.error(`Failed to change role for user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Change user status (active/inactive)
   */
  async changeUserStatus(userId, isActive) {
    const { patch } = useApiClient();

    try {
      logger.info(`Changing status for user ${userId} to: ${isActive}`);

      const response = await patch(`${API_PREFIX}/${userId}/status`, { isActive });

      // PERUBAHAN: response bisa langsung object user atau { data: user }
      const userData = response.data || response;

      return {
        success: true,
        data: userData ? normalizeUser(userData) : {},
        message: response.message || "User status changed successfully",
      };
    } catch (error) {
      logger.error(`Failed to change status for user ${userId}:`, error);
      throw error;
    }
  },
};
