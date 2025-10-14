// stores/walletStore.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import walletService from "@/services/walletService";

export const useWalletStore = defineStore("wallet", () => {
  // State
  const wallet = ref({
    balance: 0,
    pendingBalance: 0,
    availableBalance: 0,
    totalBalance: 0,
    lastTransaction: null,
    isActive: true,
  });

  const transactions = ref([]);
  const statistics = ref({
    period: "30d",
    summary: {
      totalIncome: 0,
      totalExpense: 0,
      totalTransactions: 0,
      netAmount: 0,
    },
    byType: {},
  });

  const isLoading = ref(false);
  const error = ref(null);
  const pagination = ref({
    currentPage: 1,
    totalPages: 0,
    totalTransactions: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Loading states for specific actions
  const isLoadingBalance = ref(false);
  const isLoadingTransactions = ref(false);
  const isLoadingStats = ref(false);
  const isSettingPin = ref(false);
  const isProcessingPayment = ref(false);
  const isValidatingPayment = ref(false);

  // PIN management state
  const pinStatus = ref({
    isSet: false,
    needsVerification: false,
  });

  // Computed properties
  const hasBalance = computed(() => wallet.value.balance > 0);
  const hasPendingBalance = computed(() => wallet.value.pendingBalance > 0);
  const isWalletActive = computed(() => wallet.value.isActive);

  const recentTransactions = computed(() => transactions.value.slice(0, 10));

  const incomeTransactions = computed(() => transactions.value.filter(t => t.amount > 0));

  const expenseTransactions = computed(() => transactions.value.filter(t => t.amount < 0));

  const completedTransactions = computed(() => transactions.value.filter(t => t.status === "completed"));

  const pendingTransactions = computed(() => transactions.value.filter(t => t.status === "pending"));

  // Helper functions
  const setLoading = state => {
    isLoading.value = state;
  };

  const setError = errorData => {
    error.value = errorData;
  };

  const clearError = () => {
    error.value = null;
  };

  const handleApiResponse = (response, successCallback = null, errorCallback = null) => {
    if (response.success) {
      clearError();
      if (successCallback) successCallback(response.data);
      return response;
    } else {
      const errorData = {
        message: response.error,
        details: response.details,
        statusCode: response.statusCode,
        code: response.code,
      };
      setError(errorData);
      if (errorCallback) errorCallback(errorData);
      return response;
    }
  };

  // Actions - Balance Management
  const fetchBalance = async () => {
    try {
      isLoadingBalance.value = true;
      clearError();

      const response = await walletService.getBalance();

      return handleApiResponse(response, data => {
        wallet.value = {
          ...wallet.value,
          ...data,
        };

        // TAMBAH: Update PIN status dari response
        if (data.pinStatus) {
          pinStatus.value = data.pinStatus;
        }
      });
    } catch (error) {
      const errorData = {
        message: error.message || "Failed to fetch balance",
        details: error,
      };
      setError(errorData);
      return { success: false, error: errorData };
    } finally {
      isLoadingBalance.value = false;
    }
  };

  const checkBalance = async amount => {
    try {
      clearError();

      const response = await walletService.checkBalance(amount);
      return handleApiResponse(response);
    } catch (error) {
      const errorData = {
        message: error.message || "Failed to check balance",
        details: error,
      };
      setError(errorData);
      return { success: false, error: errorData };
    }
  };

  // Actions - Transaction Management
  const fetchTransactions = async (params = {}) => {
    try {
      isLoadingTransactions.value = true;
      clearError();

      const response = await walletService.getTransactions(params);

      return handleApiResponse(response, data => {
        transactions.value = data.transactions;
        pagination.value = data.pagination;
      });
    } catch (error) {
      const errorData = {
        message: error.message || "Failed to fetch transactions",
        details: error,
      };
      setError(errorData);
      return { success: false, error: errorData };
    } finally {
      isLoadingTransactions.value = false;
    }
  };

  const loadMoreTransactions = async () => {
    if (!pagination.value.hasNextPage || isLoadingTransactions.value) return;

    try {
      isLoadingTransactions.value = true;

      const response = await walletService.getTransactions({
        page: pagination.value.currentPage + 1,
      });

      if (response.success) {
        // Append new transactions to existing list
        transactions.value = [...transactions.value, ...response.data.transactions];
        pagination.value = response.data.pagination;
      }

      return response;
    } catch (error) {
      console.error("Failed to load more transactions:", error);
      return { success: false, error: error.message };
    } finally {
      isLoadingTransactions.value = false;
    }
  };

  const refreshTransactions = async () => {
    return await fetchTransactions({
      page: 1,
      limit: pagination.value.currentPage * 20, // Keep current loaded count
    });
  };

  // Actions - Statistics
  const fetchStats = async (period = "30d") => {
    try {
      isLoadingStats.value = true;
      clearError();

      const response = await walletService.getStats(period);

      return handleApiResponse(response, data => {
        statistics.value = data;
      });
    } catch (error) {
      const errorData = {
        message: error.message || "Failed to fetch statistics",
        details: error,
      };
      setError(errorData);
      return { success: false, error: errorData };
    } finally {
      isLoadingStats.value = false;
    }
  };

  // Actions - PIN Management
  const setPin = async (pin, currentPin = null) => {
    try {
      isSettingPin.value = true;
      clearError();

      const response = await walletService.setPin(pin, currentPin);

      return handleApiResponse(response, data => {
        pinStatus.value.isSet = true;
        pinStatus.value.needsVerification = false;
      });
    } catch (error) {
      const errorData = {
        message: error.message || "Failed to set PIN",
        details: error,
      };
      setError(errorData);
      return { success: false, error: errorData };
    } finally {
      isSettingPin.value = false;
    }
  };

  // Actions - Payment Processing
  const validatePayment = async (amount, orderId = null) => {
    try {
      isValidatingPayment.value = true;
      clearError();

      const response = await walletService.validatePayment(amount, orderId);
      return handleApiResponse(response);
    } catch (error) {
      const errorData = {
        message: error.message || "Payment validation failed",
        details: error,
      };
      setError(errorData);
      return { success: false, error: errorData };
    } finally {
      isValidatingPayment.value = false;
    }
  };

  const payOrder = async (orderId, pin) => {
    try {
      isProcessingPayment.value = true;
      clearError();

      const response = await walletService.payOrder(orderId, pin);

      return handleApiResponse(response, data => {
        // Update balance after successful payment
        if (data.wallet) {
          wallet.value = {
            ...wallet.value,
            ...data.wallet,
          };
        }

        // Add new transaction to the beginning of the list
        if (data.transaction) {
          transactions.value.unshift(data.transaction);
        }
      });
    } catch (error) {
      const errorData = {
        message: error.message || "Payment failed",
        details: error,
      };
      setError(errorData);
      return { success: false, error: errorData };
    } finally {
      isProcessingPayment.value = false;
    }
  };

  const validateOrderPayment = async orderId => {
    try {
      clearError();

      const response = await walletService.validateOrderPayment(orderId);
      return handleApiResponse(response);
    } catch (error) {
      const errorData = {
        message: error.message || "Order payment validation failed",
        details: error,
      };
      setError(errorData);
      return { success: false, error: errorData };
    }
  };

  // Actions - Utility Methods
  const refreshWallet = async () => {
    const balanceResult = await fetchBalance();
    const transactionsResult = await fetchTransactions({ page: 1 });

    return {
      balance: balanceResult.success,
      transactions: transactionsResult.success,
    };
  };

  const searchTransactions = async searchTerm => {
    // For now, filter locally since backend doesn't have search endpoint
    const filteredTransactions = transactions.value.filter(
      transaction =>
        transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.order?.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        walletService.formatTransactionType(transaction.type).toLowerCase().includes(searchTerm.toLowerCase())
    );

    return {
      success: true,
      data: {
        transactions: filteredTransactions,
        pagination: {
          ...pagination.value,
          totalTransactions: filteredTransactions.length,
        },
      },
    };
  };

  const filterTransactionsByType = type => {
    return transactions.value.filter(transaction => transaction.type === type);
  };

  const filterTransactionsByStatus = status => {
    return transactions.value.filter(transaction => transaction.status === status);
  };

  const filterTransactionsByDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    return transactions.value.filter(transaction => {
      const transactionDate = new Date(transaction.createdAt);
      return transactionDate >= start && transactionDate <= end;
    });
  };

  // Actions - Reset and Clear Methods
  const clearTransactions = () => {
    transactions.value = [];
    pagination.value = {
      currentPage: 1,
      totalPages: 0,
      totalTransactions: 0,
      hasNextPage: false,
      hasPrevPage: false,
    };
  };

  const resetWallet = () => {
    wallet.value = {
      balance: 0,
      pendingBalance: 0,
      availableBalance: 0,
      totalBalance: 0,
      lastTransaction: null,
      isActive: true,
    };
  };

  const resetStore = () => {
    resetWallet();
    clearTransactions();
    statistics.value = {
      period: "30d",
      summary: {
        totalIncome: 0,
        totalExpense: 0,
        totalTransactions: 0,
        netAmount: 0,
      },
      byType: {},
    };
    clearError();
    pinStatus.value = {
      isSet: false,
      needsVerification: false,
    };

    // Reset all loading states
    isLoading.value = false;
    isLoadingBalance.value = false;
    isLoadingTransactions.value = false;
    isLoadingStats.value = false;
    isSettingPin.value = false;
    isProcessingPayment.value = false;
    isValidatingPayment.value = false;
  };

  // Getters - Find Methods
  const getTransactionById = transactionId => {
    return transactions.value.find(t => t.id === transactionId);
  };

  const getTransactionsByOrder = orderId => {
    return transactions.value.filter(t => t.order?.id === orderId);
  };

  // Getters - Analysis
  const getMonthlyTransactionSummary = computed(() => {
    const monthlyData = {};

    transactions.value.forEach(transaction => {
      const date = new Date(transaction.createdAt);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          income: 0,
          expense: 0,
          net: 0,
          count: 0,
        };
      }

      if (transaction.amount > 0) {
        monthlyData[monthKey].income += transaction.amount;
      } else {
        monthlyData[monthKey].expense += Math.abs(transaction.amount);
      }

      monthlyData[monthKey].net = monthlyData[monthKey].income - monthlyData[monthKey].expense;
      monthlyData[monthKey].count += 1;
    });

    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  });

  const getTransactionTypesSummary = computed(() => {
    const typeSummary = {};

    transactions.value.forEach(transaction => {
      if (!typeSummary[transaction.type]) {
        typeSummary[transaction.type] = {
          count: 0,
          totalAmount: 0,
          avgAmount: 0,
        };
      }

      typeSummary[transaction.type].count += 1;
      typeSummary[transaction.type].totalAmount += Math.abs(transaction.amount);
    });

    // Calculate averages
    Object.keys(typeSummary).forEach(type => {
      typeSummary[type].avgAmount = typeSummary[type].totalAmount / typeSummary[type].count;
    });

    return typeSummary;
  });

  // Utility methods using walletService
  const formatCurrency = amount => walletService.formatCurrency(amount);
  const formatTransactionType = type => walletService.formatTransactionType(type);
  const getTransactionTypeColor = type => walletService.getTransactionTypeColor(type);
  const getTransactionStatus = status => walletService.getTransactionStatus(status);
  const getTransactionStatusColor = status => walletService.getTransactionStatusColor(status);
  const isIncomeTransaction = transaction => walletService.isIncomeTransaction(transaction);
  const getAbsoluteAmount = amount => walletService.getAbsoluteAmount(amount);

  // Auto-refresh functionality
  const startAutoRefresh = (interval = 60000) => {
    // 1 minute default
    if (typeof window !== "undefined") {
      const refreshInterval = setInterval(async () => {
        if (!isLoading.value) {
          try {
            await fetchBalance();
          } catch (error) {
            console.warn("Auto-refresh failed:", error);
          }
        }
      }, interval);

      // Return cleanup function
      return () => clearInterval(refreshInterval);
    }
  };

  return {
    // State
    wallet,
    transactions,
    statistics,
    isLoading,
    error,
    pagination,
    isLoadingBalance,
    isLoadingTransactions,
    isLoadingStats,
    isSettingPin,
    isProcessingPayment,
    isValidatingPayment,
    pinStatus,

    // Computed
    hasBalance,
    hasPendingBalance,
    isWalletActive,
    recentTransactions,
    incomeTransactions,
    expenseTransactions,
    completedTransactions,
    pendingTransactions,
    getMonthlyTransactionSummary,
    getTransactionTypesSummary,

    // Actions - Core functionality
    fetchBalance,
    checkBalance,
    fetchTransactions,
    loadMoreTransactions,
    refreshTransactions,
    fetchStats,
    setPin,
    validatePayment,
    payOrder,
    validateOrderPayment,

    // Actions - Utility methods
    refreshWallet,
    searchTransactions,
    filterTransactionsByType,
    filterTransactionsByStatus,
    filterTransactionsByDateRange,

    // Actions - Reset and clear
    clearTransactions,
    resetWallet,
    resetStore,
    clearError,

    // Getters
    getTransactionById,
    getTransactionsByOrder,

    // Utility methods
    formatCurrency,
    formatTransactionType,
    getTransactionTypeColor,
    getTransactionStatus,
    getTransactionStatusColor,
    isIncomeTransaction,
    getAbsoluteAmount,

    // Advanced features
    startAutoRefresh,
  };
});
