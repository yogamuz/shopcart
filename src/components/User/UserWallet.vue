<!-- UserWallet.vue -->
<template>
  <div class="wallet-content">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <p class="mt-1 text-sm text-gray-500">Manage your wallet balance and transaction history</p>
      </div>
      <div class="mt-4 sm:mt-0">
        <button
          @click="showChangePinModal = true"
          class="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Change PIN
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

    <!-- Wallet Balance Card -->
    <div
      v-if="wallet.balance !== undefined"
      class="bg-gradient-to-r from-[#6C5CE7] to-[#5B4FD7] rounded-xl shadow-sm p-6 text-white mb-6"
    >
      <div class="flex items-center justify-between">
        <div>
          <p class="text-blue-100 text-sm font-medium">Current Balance</p>
          <p class="text-3xl font-bold mt-1">{{ formatCurrency(walletBalance) }}</p>
          <p class="text-blue-100 text-sm mt-1">Last updated: {{ formatDate(lastUpdated) }}</p>
        </div>
        <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path
              d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
            />
          </svg>
        </div>
      </div>

      <!-- Loading indicator for balance refresh -->
      <div v-if="isLoadingBalance" class="mt-4 flex items-center text-blue-100">
        <div class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
        <span class="text-sm">Updating balance...</span>
      </div>
    </div>

    <!-- Quick Stats -->
    <div v-if="statistics.summary" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center">
          <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500">Total Income</p>
            <p class="text-lg font-semibold text-gray-900">{{ formatCurrency(totalTopUp) }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center">
          <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500">Total Spent</p>
            <p class="text-lg font-semibold text-gray-900">{{ formatCurrency(totalSpent) }}</p>
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
            <p class="text-lg font-semibold text-gray-900">{{ formatCurrency(thisMonthSpent) }}</p>
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
              <option value="top_up">Top Up</option>
              <option value="admin_deduct">Deduction</option>
              <option value="payment">Payment</option>
              <option value="withdraw">Withdraw</option>
              <option value="refund">Refund</option>
              <option value="receive">Receive</option>
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
            <!-- LEFT: Icon + Description -->
            <div class="flex items-center">
              <div
                :class="[
                  'w-10 h-10 rounded-full flex items-center justify-center mr-4',
                  getTransactionColor(transaction),
                ]"
              >
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    v-if="isIncomeTransactionDisplay(transaction)"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 11l5-5m0 0l5 5m-5-5v12"
                  />
                  <path
                    v-else
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 13l-5 5m0 0l-5-5m5 5V6"
                  />
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">
                  {{ transaction.description || formatTransactionType(transaction.type) }}
                </p>
                <div class="flex items-center space-x-2 mt-1">
                  <p class="text-xs text-gray-500">{{ formatDate(transaction.createdAt) }}</p>
                  <span class="text-xs text-gray-300">•</span>
                  <span
                    :class="[
                      'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                      getStatusColor(transaction.status),
                    ]"
                  >
                    {{ getTransactionStatus(transaction.status) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- RIGHT: Amount + ID -->
            <div class="text-right">
              <p :class="['text-sm font-semibold', getTransactionAmountColor(transaction)]">
                {{ getTransactionSign(transaction) }}{{ formatCurrency(getAbsoluteAmount(transaction.amount)) }}
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

    <!-- Change PIN Modal -->
    <div v-if="showChangePinModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">
          {{ pinStatus.isSet ? "Change Wallet PIN" : "Set Wallet PIN" }}
        </h3>
        <p class="text-sm text-gray-600 mb-4">
          {{
            pinStatus.isSet
              ? "Update your wallet PIN to a new 6-digit code"
              : "Create a 6-digit PIN to secure your wallet transactions"
          }}
        </p>

        <div class="space-y-4">
          <!-- Current PIN field -->
          <div v-if="pinStatus.isSet">
            <label class="block text-sm font-medium text-gray-700 mb-2">Current PIN</label>
            <input
              v-model="currentPin"
              type="password"
              maxlength="6"
              autocomplete="off"
              placeholder="Enter current PIN"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7]"
              @input="validatePinInput"
            />
          </div>

          <!-- New PIN field -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ pinStatus.isSet ? "New PIN" : "PIN" }}
            </label>
            <input
              v-model="newPin"
              type="password"
              maxlength="6"
              autocomplete="off"
              placeholder="Enter 6-digit PIN"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7]"
              @input="validatePinInput"
            />
          </div>

          <!-- Confirm PIN field -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ pinStatus.isSet ? "Confirm New PIN" : "Confirm PIN" }}
            </label>
            <input
              v-model="confirmPin"
              type="password"
              maxlength="6"
              autocomplete="off"
              placeholder="Re-enter PIN"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7]"
              @input="validatePinInput"
            />
          </div>
          <!-- Error message -->
          <div v-if="pinError" class="text-sm text-red-600">
            {{ pinError }}
          </div>
        </div>

        <div class="flex space-x-3 mt-6">
          <button
            @click="
              showChangePinModal = false;
              resetChangePinForm();
            "
            class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            @click="processChangePin"
            :disabled="!canChangePin || isSettingPin"
            class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{
              isSettingPin
                ? pinStatus.isSet
                  ? "Changing PIN..."
                  : "Setting PIN..."
                : pinStatus.isSet
                ? "Change PIN"
                : "Set PIN"
            }}
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
  pinStatus,
  isSettingPin,
  setWalletPin,
  changeWalletPin,
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
const showChangePinModal = ref(false);
const loadingMore = ref(false);
const currentPinInput = ref(null);
const newPinInput = ref(null);
const confirmPinInput = ref(null);
// PIN form data
const newPin = ref("");
const confirmPin = ref("");
const pinError = ref("");
const currentPin = ref("");
const canChangePin = computed(() => {
  console.log("🔍 canChangePin check:", {
    isSet: pinStatus.value.isSet,
    currentPin: currentPin.value.length,
    newPin: newPin.value.length,
    confirmPin: confirmPin.value.length,
    match: newPin.value === confirmPin.value,
  });

  if (pinStatus.value.isSet) {
    // Jika sudah punya PIN, butuh semua 3 field
    const isValid =
      currentPin.value.length === 6 &&
      newPin.value.length === 6 &&
      confirmPin.value.length === 6 &&
      newPin.value === confirmPin.value &&
      /^\d{6}$/.test(currentPin.value) &&
      /^\d{6}$/.test(newPin.value);
    console.log("🔍 Change mode - isValid:", isValid);
    return isValid;
  } else {
    // Jika belum punya PIN, hanya butuh newPin dan confirmPin
    const isValid =
      newPin.value.length === 6 &&
      confirmPin.value.length === 6 &&
      newPin.value === confirmPin.value &&
      /^\d{6}$/.test(newPin.value);
    console.log("🔍 Set mode - isValid:", isValid);
    return isValid;
  }
});

// Computed properties for backward compatibility
const walletBalance = computed(() => balance.value || 0);
const totalTopUp = computed(() => statistics.value?.summary?.totalIncome || 0);
const totalSpent = computed(() => statistics.value?.summary?.totalExpense || 0);
const thisMonthSpent = computed(() => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return transactions.value
    .filter(t => {
      const transactionDate = new Date(t.createdAt);
      return (
        transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear && t.amount < 0
      );
    })
    .reduce((total, t) => total + Math.abs(t.amount), 0);
});

const lastUpdated = computed(() => lastRefreshTime.value || new Date());
const hasMoreTransactions = computed(() => pagination.value?.hasNextPage || false);

// Filtered transactions based on search and filter
const filteredTransactions = computed(() => {
  let filtered = [...transactions.value];

  if (filterType.value !== "all") {
    filtered = filtered.filter(tx => tx.type === filterType.value);
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      tx =>
        tx.description?.toLowerCase().includes(query) ||
        tx.id.toLowerCase().includes(query) ||
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

const handlePinKeydown = event => {
  // Only allow numbers (0-9)
  if (!/[0-9]/.test(event.key) && !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(event.key)) {
    event.preventDefault();
  }
};

const validatePinInput = (event) => {
  pinError.value = "";
  // Only allow numbers
  currentPin.value = currentPin.value.replace(/\D/g, "");
  newPin.value = newPin.value.replace(/\D/g, "");
  confirmPin.value = confirmPin.value.replace(/\D/g, "");
};

const processChangePin = async () => {
  try {
    pinError.value = "";

    if (newPin.value !== confirmPin.value) {
      pinError.value = "PINs do not match";
      return;
    }

    if (newPin.value.length !== 6) {
      pinError.value = "PIN must be 6 digits";
      return;
    }

    // Jika sudah punya PIN, validasi current PIN
    if (pinStatus.value.isSet && currentPin.value.length !== 6) {
      pinError.value = "Current PIN must be 6 digits";
      return;
    }

    // currentPin hanya dikirim jika sudah punya PIN sebelumnya
    const result = await changeWalletPin(
      pinStatus.value.isSet ? currentPin.value : null,
      newPin.value,
      confirmPin.value
    );

    if (result.success) {
      showChangePinModal.value = false;
      resetChangePinForm();
      alert(
        pinStatus.value.isSet ? "Wallet PIN has been changed successfully!" : "Wallet PIN has been set successfully!"
      );
    } else {
      pinError.value = result.error || "Failed to set PIN";
    }
  } catch (error) {
    console.error("PIN operation failed:", error);
    pinError.value = error.message || "Failed to set PIN";
  }
};
const resetChangePinForm = () => {
  currentPin.value = "";
  newPin.value = "";
  confirmPin.value = "";
  pinError.value = "";
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

/**
 * Check if transaction is income (green with +)
 */
const isIncomeTransactionDisplay = transaction => {
  if (transaction.type === "top_up" || transaction.type === "topup") {
    return true;
  }

  if (transaction.type === "refund" || transaction.type === "receive") {
    return true;
  }

  if (transaction.reversalOf && transaction.type === "reversal") {
    return true;
  }

  return false;
};

/**
 * Check if transaction is deduction (red with -)
 */
const isDeductionTransaction = transaction => {
  if (transaction.type === "admin_deduct") {
    return true;
  }

  if (transaction.type === "payment" || transaction.type === "withdraw") {
    return true;
  }

  return false;
};

/**
 * Get transaction amount color
 */
const getTransactionAmountColor = transaction => {
  if (isIncomeTransactionDisplay(transaction)) {
    return "text-green-600";
  }

  if (isDeductionTransaction(transaction)) {
    return "text-red-600";
  }

  return "text-gray-900";
};

/**
 * Get transaction sign (+ or -)
 */
const getTransactionSign = transaction => {
  if (isIncomeTransactionDisplay(transaction)) {
    return "+";
  }

  if (isDeductionTransaction(transaction)) {
    return "-";
  }

  return "";
};

/**
 * Get transaction icon background color
 */
const getTransactionColor = transaction => {
  if (isIncomeTransactionDisplay(transaction)) {
    return "bg-green-500";
  }

  if (isDeductionTransaction(transaction)) {
    return "bg-red-500";
  }

  if (transaction.status === "pending") {
    return "bg-yellow-500";
  }

  return "bg-gray-500";
};

const getStatusColor = status => {
  return (
    getTransactionStatusColor(status).replace("text-", "bg-").replace("-600", "-100") +
    " " +
    getTransactionStatusColor(status)
  );
};

// Load initial wallet data
const loadWalletData = async () => {
  try {
    await initializeWallet({
      autoRefresh: false,
      fetchStats: true,
    });

    // Force check PIN status setelah wallet data loaded
    console.log("📌 PIN Status:", pinStatus.value);
    console.log("📌 isSet:", pinStatus.value.isSet);
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
.wallet-content {
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
