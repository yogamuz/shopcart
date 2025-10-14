// composables/useAdminWallet.js
import { ref, computed } from "vue";
import { adminWalletService } from "@/services/adminWalletService";
import { logger } from "@/utils/logger";

export const useAdminWallet = () => {
  // State
  const transactions = ref([]);
  const pagination = ref({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 50,
  });
  const isLoading = ref(false);
  const error = ref(null);

  // Computed
  const totalTransactions = computed(() => pagination.value.totalItems);
  const hasTransactions = computed(() => transactions.value.length > 0);

  /**
   * Fetch all transactions (top-up, deduct, reversals)
   */
  const fetchTransactions = async (queryParams = {}) => {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await adminWalletService.getAllTransactions(queryParams);
      transactions.value = result.transactions;
      pagination.value = result.pagination;

      logger.info(`Fetched ${transactions.value.length} transactions`);
      return result;
    } catch (err) {
      error.value = err.message || "Failed to fetch transactions";
      logger.error("Error fetching transactions:", err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Top up wallet balance
   */
  const topUpBalance = async (userId, amount, description = "Admin top-up") => {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await adminWalletService.topUpBalance(userId, amount, description);

      logger.info(`Topped up wallet for ${userId}: ${amount}`);
      return result;
    } catch (err) {
      error.value = err.message || "Failed to top up balance";
      logger.error(`Error topping up wallet ${userId}:`, err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Deduct wallet balance
   */
  const deductBalance = async (userId, amount, description = "Admin deduction", reason) => {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await adminWalletService.deductBalance(
        userId,
        amount,
        description,
        reason
      );

      logger.info(`Deducted from wallet ${userId}: ${amount}`);
      return result;
    } catch (err) {
      error.value = err.message || "Failed to deduct balance";
      logger.error(`Error deducting from wallet ${userId}:`, err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Reverse transaction
   */
  const reverseTransaction = async (transactionId, reason = "Admin reversal") => {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await adminWalletService.reverseTransaction(transactionId, reason);

      logger.info(`Reversed transaction: ${transactionId}`);
      return result;
    } catch (err) {
      error.value = err.message || "Failed to reverse transaction";
      logger.error(`Error reversing transaction ${transactionId}:`, err);
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
   * Fetch all users for dropdown
   */
  const fetchUsers = async () => {
    try {
      const result = await adminWalletService.getAllUsers();
      return result.users || [];
    } catch (err) {
      logger.error("Error fetching users:", err);
      throw err;
    }
  };

  /**
   * Reset all state
   */
  const reset = () => {
    transactions.value = [];
    pagination.value = {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 50,
    };
    error.value = null;
    isLoading.value = false;
  };
/**
   * Clear transaction cache
   */
  const clearCache = () => {
    transactions.value = [];
    pagination.value = {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 50,
    };
  };
  return {
    // State
    transactions,
    pagination,
    isLoading,
    error,

    // Computed
    totalTransactions,
    hasTransactions,

    // Methods
    fetchTransactions,
    fetchUsers,
    topUpBalance,
    deductBalance,
    reverseTransaction,
    clearError,
    clearCache,
    reset,
  };
};