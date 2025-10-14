// composables/useAdminUsers.js
import { ref, computed } from "vue";
import { adminUserService } from "@/services/adminUserService";
import { logger } from "@/utils/logger";

export const useAdminUsers = () => {
  // State
  const users = ref([]);
  const currentUser = ref(null);
  const pagination = ref({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });


  
  const isLoading = ref(false);
  const error = ref(null);

  // Computed
  const hasUsers = computed(() => users.value.length > 0);
  const totalUsers = computed(() => pagination.value.totalItems);

  /**
   * Fetch all users
   */
  const fetchUsers = async (queryParams = {}) => {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await adminUserService.getAllUsers(queryParams);
      users.value = result.data;
      pagination.value = result.pagination;

      logger.info(`Fetched ${users.value.length} users`);
      return result;
    } catch (err) {
      error.value = err.message || "Failed to fetch users";
      logger.error("Error fetching users:", err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Fetch single user by ID
   */
  const fetchUserById = async userId => {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await adminUserService.getUserById(userId);

      currentUser.value = result.data;

      logger.info(`Fetched user: ${userId}`);
      return result;
    } catch (err) {
      error.value = err.message || "Failed to fetch user";
      logger.error(`Error fetching user ${userId}:`, err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Update user
   */
  const updateUser = async (userId, updates) => {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await adminUserService.updateUser(userId, updates);

      // Update local state
      const index = users.value.findIndex(u => u._id === userId);
      if (index !== -1) {
        users.value[index] = { ...users.value[index], ...result.data };
      }

      if (currentUser.value?._id === userId) {
        currentUser.value = { ...currentUser.value, ...result.data };
      }

      logger.info(`Updated user: ${userId}`);
      return result;
    } catch (err) {
      error.value = err.message || "Failed to update user";
      logger.error(`Error updating user ${userId}:`, err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Delete user
   */
  const deleteUser = async (userId, permanent = false) => {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await adminUserService.deleteUser(userId, permanent);

      // Remove from local state if hard delete
      if (permanent) {
        users.value = users.value.filter(u => u._id !== userId);
      } else {
        // Update isActive status for soft delete
        const index = users.value.findIndex(u => u._id === userId);
        if (index !== -1) {
          users.value[index].isActive = false;
        }
      }

      logger.info(`Deleted user: ${userId} (${permanent ? "permanent" : "soft"})`);
      return result;
    } catch (err) {
      error.value = err.message || "Failed to delete user";
      logger.error(`Error deleting user ${userId}:`, err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Change user role
   */
  const changeUserRole = async (userId, role) => {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await adminUserService.changeUserRole(userId, role);

      // Update local state
      const index = users.value.findIndex(u => u._id === userId);
      if (index !== -1) {
        users.value[index].role = role;
      }

      if (currentUser.value?._id === userId) {
        currentUser.value.role = role;
      }

      logger.info(`Changed role for user ${userId} to: ${role}`);
      return result;
    } catch (err) {
      error.value = err.message || "Failed to change user role";
      logger.error(`Error changing role for user ${userId}:`, err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Change user status
   */
  const changeUserStatus = async (userId, isActive) => {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await adminUserService.changeUserStatus(userId, isActive);

      // Update local state
      const index = users.value.findIndex(u => u._id === userId);
      if (index !== -1) {
        users.value[index].isActive = isActive;
      }

      if (currentUser.value?._id === userId) {
        currentUser.value.isActive = isActive;
      }

      logger.info(`Changed status for user ${userId} to: ${isActive}`);
      return result;
    } catch (err) {
      error.value = err.message || "Failed to change user status";
      logger.error(`Error changing status for user ${userId}:`, err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Clear error
   */
  const clearError = () => {
    error.value = null;
  };

  /**
   * Clear current user
   */
  const clearCurrentUser = () => {
    currentUser.value = null;
  };

  /**
   * Reset all state
   */
  const reset = () => {
    users.value = [];
    currentUser.value = null;
    pagination.value = {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 10,
    };
    error.value = null;
    isLoading.value = false;
  };

  return {
    // State
    users,
    currentUser,
    pagination,
    isLoading,
    error,

    // Computed
    hasUsers,
    totalUsers,

    // Methods
    fetchUsers,
    fetchUserById,
    updateUser,
    deleteUser,
    changeUserRole,
    changeUserStatus,
    clearError,
    clearCurrentUser,
    reset,
  };
};


