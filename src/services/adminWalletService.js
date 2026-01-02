// services/adminWalletService.js
import { useApiClient } from "@/composables/useApiClient";

const BASE_URL = "/api/admin/wallets";
const api = useApiClient();

export const adminWalletService = {
  /**
   * Get all transactions (top-up, deduct, reversals) with filters
   */
  async getAllTransactions(queryParams = {}) {
    try {
      const response = await api.get(`${BASE_URL}/transactions/history`, {
        params: queryParams,
      });

      const { success, data, message } = response;

      if (!success) {
        throw new Error(message || "Failed to fetch transactions");
      }

      if (!data) {
        throw new Error("No data in response");
      }

      const transactions = Array.isArray(data.transactions) ? data.transactions : [];
      const pagination = data.pagination || {};

      return {
        transactions,
        pagination,
      };
    } catch (error) {
      console.error("Service Error - getAllTransactions:", error);
      throw new Error(error.message || "Failed to fetch transactions");
    }
  },

  /**
   * Get all users for dropdown (admin only)
   */
  async getAllUsers(queryParams = {}) {
    try {
      const response = await api.get("/api/admin/users", {
        params: queryParams,
      });

      const { success, data, message } = response;

      if (!success) {
        throw new Error(message || "Failed to fetch users");
      }

      // FIXED: data adalah array langsung, bukan { users: [] }
      const users = Array.isArray(data) ? data : [];

      return {
        users,
      };
    } catch (error) {
      console.error("Service Error - getAllUsers:", error);
      throw new Error(error.message || "Failed to fetch users");
    }
  },

  /**
   * Top-up user balance
   */
  async topUpBalance(userId, amount, description = "Admin top-up") {
    try {
      const payload = {
        amount,
        description,
      };

      const response = await api.post(`${BASE_URL}/${userId}/top-up`, payload);

      // FIXED: Backend return { success: true, data: {...} }
      // Jadi cek response.success langsung, bukan response.data.success
      if (!response.success) {
        console.warn("⚠️ [topUpBalance] Response tidak success:", response);
        throw new Error(response.message || "Top up failed");
      }

      // Return response.data yang berisi { transaction, newBalance }
      return response.data;
    } catch (error) {
      console.error("Service Error - topUpBalance:", error);
      throw new Error(error.message || "Failed to top up balance");
    }
  },

  /**
   * Deduct user balance
   */
  async deductBalance(userId, amount, description = "Admin deduction", reason) {
    try {
      const payload = {
        amount,
        description,
        reason,
      };

      const response = await api.post(`${BASE_URL}/${userId}/deduct`, payload);

      // FIXED: Backend return { success: true, data: {...} }
      if (!response.success) {
        console.warn("⚠️ [deductBalance] Response tidak success:", response);
        throw new Error(response.message || "Deduction failed");
      }

      // Return response.data yang berisi { transaction, newBalance }
      return response.data;
    } catch (error) {
      console.error("Service Error - deductBalance:", error);
      throw new Error(error.message || "Failed to deduct balance");
    }
  },

  /**
   * Reverse a transaction
   */
  async reverseTransaction(transactionId, reason = "Admin reversal") {
    try {
      const payload = {
        reason,
        confirmReverse: true,
      };

      const response = await api.post(`${BASE_URL}/transactions/${transactionId}/reverse`, payload);

      // FIXED: Backend return { success: true, data: {...} }
      if (!response.success) {
        console.warn("⚠️ [reverseTransaction] Response tidak success:", response);
        throw new Error(response.message || "Reversal failed");
      }

      // Return response.data yang berisi { originalTransaction, reversalTransaction }
      return response.data;
    } catch (error) {
      console.error("Service Error - reverseTransaction:", error);
      throw new Error(error.message || "Failed to reverse transaction");
    }
  },
};
