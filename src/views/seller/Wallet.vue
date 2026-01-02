<!-- SellerWallet.vue -->
<template>
  <div class="seller-wallet-content">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Seller Wallet</h2>
        <p class="mt-1 text-sm text-gray-500">Manage your earnings, payouts, and transaction history</p>
      </div>
      <div class="mt-4 sm:mt-0 flex space-x-3">
        <button
          @click="showPayoutModal = true"
          :disabled="!hasBalance"
          class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m-3-2h6"
            />
          </svg>
          Request Payout
        </button>
        <button
          @click="refreshWalletData"
          :disabled="isLoading"
          class="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          <svg
            class="w-4 h-4 mr-2"
            :class="{ 'animate-spin': isLoading }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="isLoading && !wallet.balance"
      class="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center mb-6"
    >
      <div class="animate-spin w-8 h-8 border-4 border-[#6C5CE7] border-t-transparent rounded-full mx-auto mb-4"></div>
      <p class="text-gray-500">Loading wallet data...</p>
    </div>

    <!-- Error State -->
    <div v-if="hasError && !wallet.balance" class="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
      <div class="flex">
        <svg class="w-5 h-5 text-red-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <h3 class="text-sm font-medium text-red-800">Failed to load wallet data</h3>
          <p class="mt-1 text-sm text-red-700">{{ getErrorMessage }}</p>
          <button @click="loadWalletData" class="mt-3 text-sm text-red-700 underline hover:text-red-600">
            Try again
          </button>
        </div>
      </div>
    </div>

    <!-- Wallet Balance Cards -->
    <div v-if="wallet.balance !== undefined" class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Available Balance -->
      <div class="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-sm p-6 text-white">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-green-100 text-sm font-medium">Available Balance</p>
            <p class="text-3xl font-bold mt-1">
              {{ formatCurrency(availableBalance) }}
            </p>
            <p class="text-green-100 text-sm mt-1">Ready for payout</p>
          </div>
          <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path
                d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
              />
            </svg>
          </div>
        </div>
      </div>

      <!-- Pending Balance -->
      <div class="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-sm p-6 text-white">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-orange-100 text-sm font-medium">Pending Balance</p>
            <p class="text-3xl font-bold mt-1">
              {{ formatCurrency(pendingBalance) }}
            </p>
            <p class="text-orange-100 text-sm mt-1">Processing orders</p>
          </div>
          <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div v-if="statistics.summary" class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center">
          <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500">Total Earnings</p>
            <p class="text-lg font-semibold text-gray-900">
              {{ formatCurrency(totalEarnings) }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center">
          <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500">Total Payouts</p>
            <p class="text-lg font-semibold text-gray-900">
              {{ formatCurrency(totalPayouts) }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center">
          <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
            <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500">This Month</p>
            <p class="text-lg font-semibold text-gray-900">
              {{ formatCurrency(thisMonthEarnings) }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center">
          <div class="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
            <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500">Commission Rate</p>
            <p class="text-lg font-semibold text-gray-900">{{ commissionRate }}%</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Transaction History -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <div class="p-6 border-b border-gray-200">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h3 class="text-lg font-semibold text-gray-900">Transaction History</h3>
          <div class="mt-4 sm:mt-0 flex space-x-3">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search transactions..."
              @input="handleSearch"
              class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7]"
            />
            <select
              v-model="filterType"
              @change="handleFilter"
              class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7]"
            >
              <option value="all">All Types</option>
              <option value="sale">Sale</option>
              <option value="payout">Payout</option>
              <option value="commission">Commission</option>
              <option value="refund">Refund</option>
              <option value="adjustment">Adjustment</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Transaction Loading -->
      <div v-if="isLoadingTransactions && transactions.length === 0" class="p-12 text-center">
        <div
          class="animate-spin w-8 h-8 border-4 border-[#6C5CE7] border-t-transparent rounded-full mx-auto mb-4"
        ></div>
        <p class="text-gray-500">Loading transactions...</p>
      </div>

      <div v-else class="divide-y divide-gray-200">
        <div
          v-for="transaction in filteredTransactions"
          :key="transaction.id"
          class="p-6 hover:bg-gray-50 transition-colors"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div
                :class="[
                  'w-10 h-10 rounded-full flex items-center justify-center mr-4',
                  getTransactionColor(transaction.type),
                ]"
              >
                <component :is="getTransactionIcon(transaction.type)" class="w-5 h-5 text-white" />
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">
                  {{ transaction.description || formatTransactionType(transaction.type) }}
                </p>
                <div class="flex items-center space-x-2 mt-1">
                  <p class="text-xs text-gray-500">
                    {{ formatDate(transaction.createdAt) }}
                  </p>
                  <span class="text-xs text-gray-300">•</span>
                  <span
                    :class="[
                      'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                      getStatusColor(transaction.status),
                    ]"
                  >
                    {{ getTransactionStatus(transaction.status) }}
                  </span>
                  <span v-if="transaction.orderId" class="text-xs text-gray-300">•</span>
                  <span v-if="transaction.orderId" class="text-xs text-gray-500">Order: {{ transaction.orderId }}</span>
                </div>
              </div>
            </div>
            <div class="text-right">
              <p
                :class="['text-sm font-semibold', isIncomeTransaction(transaction) ? 'text-green-600' : 'text-red-600']"
              >
                {{ isIncomeTransaction(transaction) ? "+" : "-"
                }}{{ formatCurrency(getAbsoluteAmount(transaction.amount)) }}
              </p>
              <p class="text-xs text-gray-500 mt-1">ID: {{ transaction.id }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredTransactions.length === 0 && !isLoadingTransactions" class="p-12 text-center">
        <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
        <p class="text-gray-500">
          {{ searchQuery ? "Try a different search term" : "Your transaction history will appear here" }}
        </p>
      </div>

      <!-- Load More -->
      <div
        v-if="filteredTransactions.length > 0 && hasMoreTransactions"
        class="p-6 border-t border-gray-200 text-center"
      >
        <button
          @click="loadMoreTransactions"
          :disabled="loadingMore"
          class="inline-flex items-center px-4 py-2 text-sm font-medium text-[#6C5CE7] hover:text-[#5B4FD7] disabled:opacity-50"
        >
          <svg
            v-if="loadingMore"
            class="animate-spin -ml-1 mr-3 h-4 w-4 text-[#6C5CE7]"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {{ loadingMore ? "Loading..." : "Load More Transactions" }}
        </button>
      </div>
    </div>

    <!-- Payout Modal -->
    <div v-if="showPayoutModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Request Payout</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Amount</label>
            <input
              v-model="payoutAmount"
              type="number"
              :max="availableBalance"
              placeholder="Enter payout amount"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7]"
            />
            <p class="text-xs text-gray-500 mt-1">Available balance: {{ formatCurrency(availableBalance) }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Payout Method</label>
            <select
              v-model="selectedPayoutMethod"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7]"
            >
              <option value="">Select payout method</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="paypal">PayPal</option>
              <option value="stripe">Stripe</option>
            </select>
          </div>
        </div>
        <div class="flex space-x-3 mt-6">
          <button
            @click="
              showPayoutModal = false;
              resetPayoutForm();
            "
            class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            @click="processPayout"
            :disabled="!payoutAmount || !selectedPayoutMethod || payoutAmount > availableBalance || isProcessingPayment"
            class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isProcessingPayment ? "Processing..." : "Request Payout" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useWallet } from "@/composables/useWallet";

const emit = defineEmits(["search"]);

// Use wallet composable
const {
  // Data
  wallet,
  balance,
  availableBalance,
  pendingBalance,
  transactions,
  statistics,
  pagination,
  error,
  lastRefreshTime,

  // Loading states
  isLoading,
  isLoadingBalance,
  isLoadingTransactions,
  isProcessingPayment,

  // Status
  hasBalance,
  hasError,
  getErrorMessage,

  // Methods
  fetchBalance,
  fetchTransactions,
  loadMoreTransactions: loadMore,
  searchTransactions,
  refreshWallet,
  initializeWallet,

  // Utility methods
  formatCurrency,
  formatTransactionType,
  getTransactionTypeColor,
  getTransactionStatus,
  getTransactionStatusColor,
  isIncomeTransaction,
  getAbsoluteAmount,

  // Cleanup
  resetWallet,
} = useWallet();

// Local reactive state
const searchQuery = ref("");
const filterType = ref("all");
const showPayoutModal = ref(false);
const loadingMore = ref(false);

// Payout form data
const payoutAmount = ref("");
const selectedPayoutMethod = ref("");

// Computed properties for seller-specific stats
const totalEarnings = computed(() => statistics.value?.summary?.totalIncome || 0);
const totalPayouts = computed(() => statistics.value?.summary?.totalExpense || 0);
const thisMonthEarnings = computed(() => {
  // Calculate current month earnings from transactions
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return transactions.value
    .filter(t => {
      const transactionDate = new Date(t.createdAt);
      return (
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear &&
        (t.type === "sale" || t.type === "commission")
      ); // Only earnings
    })
    .reduce((total, t) => total + Math.abs(t.amount), 0);
});

const commissionRate = computed(() => {
  // This could come from user profile/settings API
  return 15; // Default commission rate
});

const hasMoreTransactions = computed(() => pagination.value?.hasNextPage || false);

// Filtered transactions based on search and filter
const filteredTransactions = computed(() => {
  let filtered = [...transactions.value];

  // Apply type filter
  if (filterType.value !== "all") {
    filtered = filtered.filter(tx => tx.type === filterType.value);
  }

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      tx =>
        tx.description?.toLowerCase().includes(query) ||
        tx.id.toLowerCase().includes(query) ||
        tx.orderId?.toLowerCase().includes(query) ||
        formatTransactionType(tx.type).toLowerCase().includes(query)
    );
  }

  return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
});

// Methods
const handleSearch = async () => {
  emit("search", searchQuery.value);

  if (searchQuery.value.trim()) {
    try {
      await searchTransactions(searchQuery.value);
    } catch (error) {
      console.error("Search failed:", error);
    }
  } else {
    await fetchTransactions({ page: 1 });
  }
};

const handleFilter = async () => {
  try {
    const params = { page: 1 };
    if (filterType.value !== "all") {
      params.type = filterType.value;
    }
    await fetchTransactions(params);
  } catch (error) {
    console.error("Filter failed:", error);
  }
};

const loadMoreTransactions = async () => {
  if (loadingMore.value || !hasMoreTransactions.value) return;

  try {
    loadingMore.value = true;
    const result = await loadMore();

    if (!result.success) {
      console.error("Failed to load more transactions:", result.error);
    }
  } catch (error) {
    console.error("Load more failed:", error);
  } finally {
    loadingMore.value = false;
  }
};

const processPayout = async () => {
  try {
    // Here you would call the actual payout API endpoint
    // await requestPayout(payoutAmount.value, selectedPayoutMethod.value);

    showPayoutModal.value = false;
    resetPayoutForm();

    // Refresh wallet data after payout request
    await refreshWalletData();
  } catch (error) {
    console.error("Payout request failed:", error);
  }
};

const resetPayoutForm = () => {
  payoutAmount.value = "";
  selectedPayoutMethod.value = "";
};

const refreshWalletData = async () => {
  try {
    await refreshWallet({ includeStats: true });
  } catch (error) {
    console.error("Failed to refresh wallet data:", error);
  }
};

const formatDate = date => {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  });
};

const getTransactionColor = type => {
  const colors = {
    sale: "bg-green-500",
    payout: "bg-blue-500",
    commission: "bg-purple-500",
    refund: "bg-red-500",
    adjustment: "bg-orange-500",
  };
  return colors[type] || "bg-gray-500";
};

const getTransactionIcon = type => {
  const icons = {
    sale: "TrendingUpIcon",
    payout: "ArrowDownIcon",
    commission: "StarIcon",
    refund: "ArrowUturnLeftIcon",
    adjustment: "AdjustmentsIcon",
  };
  return icons[type] || "DocumentIcon";
};

const getStatusColor = status => {
  const colors = {
    completed: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    failed: "bg-red-100 text-red-800",
    cancelled: "bg-gray-100 text-gray-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

// Load initial wallet data
const loadWalletData = async () => {
  try {
    await initializeWallet({
      autoRefresh: false,
      fetchStats: true,
    });
  } catch (error) {
    console.error("Failed to load wallet data:", error);
  }
};

// Watch for search query changes with debounce
let searchTimeout = null;
watch(searchQuery, newQuery => {
  if (searchTimeout) clearTimeout(searchTimeout);

  searchTimeout = setTimeout(() => {
    handleSearch();
  }, 300);
});

// Lifecycle hooks
onMounted(async () => {
  await loadWalletData();
});

onUnmounted(() => {
  resetWallet();
  if (searchTimeout) clearTimeout(searchTimeout);
});
</script>

<style scoped>
.seller-wallet-content {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
