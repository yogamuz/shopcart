<!-- AdminWallet.vue -->
<template>
  <div class="transactions-content">
    <!-- Header Section -->
    <div class="mb-6">
      <p class="mt-1 text-sm text-gray-500">Manage top-ups, deductions, and transaction reversals</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div class="flex">
        <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div class="ml-3">
          <p class="text-sm text-red-800">{{ error }}</p>
          <button @click="clearError" class="mt-2 text-xs text-red-600 underline hover:no-underline">Dismiss</button>
        </div>
      </div>
    </div>

    <!-- Filters & Actions -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Type</label>
          <select
            v-model="filterType"
            @change="handleFilterChange"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7]"
          >
            <option value="">All Types</option>
            <option value="top_up">Top Up</option>
            <option value="admin_deduct">Deduction</option>
            <option value="reversal">Reversal</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
          <input
            v-model="filterDateFrom"
            type="date"
            @change="handleFilterChange"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7]"
          />
        </div>

        <div class="flex items-end gap-2">
          <button
            @click="loadTransactions"
            :disabled="isLoading"
            class="flex-1 px-4 py-2 bg-[#6C5CE7] text-white text-sm font-medium rounded-lg hover:bg-[#5B4FD7] transition-colors disabled:opacity-50"
          >
            Refresh
          </button>
        </div>

        <div class="flex items-end gap-2">
          <button
            @click="openTopUpModal"
            :disabled="isLoading"
            class="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            Top Up
          </button>
          <button
            @click="openDeductModal"
            :disabled="isLoading"
            class="flex-1 px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
          >
            Deduct
          </button>
        </div>
      </div>
    </div>

    <!-- Transactions Table -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <!-- Table Header -->
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Transactions</h3>
            <p class="text-sm text-gray-500 mt-1">{{ totalTransactions }} total transactions</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading && !hasTransactions" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6C5CE7]"></div>
        <span class="ml-2 text-gray-600">Loading transactions...</span>
      </div>

      <!-- Table Content -->
      <div v-else-if="hasTransactions" class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="transaction in transactions" :key="transaction.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ transaction.user.username }}</div>
                  <div class="text-xs text-gray-500">{{ transaction.user.email }}</div>
                </div>
              </td>

              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    transaction.type === 'top_up'
                      ? 'bg-green-100 text-green-800'
                      : transaction.type === 'admin_deduct'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-blue-100 text-blue-800',
                  ]"
                >
                  {{ getTransactionTypeLabel(transaction.type, transaction.reversalOf) }}
                </span>
              </td>

              <td class="px-6 py-4 whitespace-nowrap text-right">
                <span
                  :class="[
                    'text-sm font-semibold',
                    transaction.type === 'top_up'
                      ? 'text-green-600'
                      : transaction.type === 'admin_deduct'
                      ? 'text-red-600'
                      : 'text-blue-600',
                  ]"
                >
                  {{ formatTransactionAmount(transaction) }}
                </span>
              </td>

              <td class="px-6 py-4">
                <div class="text-sm text-gray-600 truncate max-w-xs">{{ transaction.description }}</div>
              </td>

              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    transaction.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : transaction.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800',
                  ]"
                >
                  {{ capitalize(transaction.status) }}
                </span>
              </td>

              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(transaction.createdAt) }}
              </td>

              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-2">
                  <button
                    @click="handleViewDetails(transaction)"
                    class="text-[#6C5CE7] hover:text-[#5B4FD7] font-medium"
                  >
                    View
                  </button>
                  <button
                    v-if="
                      !transaction.isReversed && (transaction.type === 'top_up' || transaction.type === 'admin_deduct')
                    "
                    @click="handleReverseModal(transaction)"
                    class="text-red-600 hover:text-red-700 font-medium"
                  >
                    Reverse
                  </button>
                  <span v-else-if="transaction.isReversed" class="text-xs text-gray-400 italic">Reversed</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <svg class="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p class="text-sm text-gray-500">No transactions found</p>
      </div>

      <!-- Pagination -->
      <div v-if="hasTransactions && pagination.totalPages > 1" class="px-6 py-4 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-500">
            Showing {{ (pagination.currentPage - 1) * pagination.itemsPerPage + 1 }} to
            {{ Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems) }} of
            {{ pagination.totalItems }} transactions
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="handlePageChange(pagination.currentPage - 1)"
              :disabled="pagination.currentPage === 1 || isLoading"
              class="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span class="text-sm text-gray-700">
              Page {{ pagination.currentPage }} of {{ pagination.totalPages }}
            </span>
            <button
              @click="handlePageChange(pagination.currentPage + 1)"
              :disabled="pagination.currentPage === pagination.totalPages || isLoading"
              class="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Transaction Details Modal -->
    <div
      v-if="showDetailsModal"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      @click.self="showDetailsModal = false"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">Transaction Details</h3>
        </div>
        <div class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-gray-500 uppercase">User</p>
              <p class="text-sm font-medium text-gray-900">{{ selectedTransaction?.user.username }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 uppercase">Type</p>
              <p class="text-sm font-medium text-gray-900">
                {{ getTransactionTypeLabel(selectedTransaction?.type, selectedTransaction?.reversalOf) }}
              </p>
            </div>
            <div>
              <p class="text-xs text-gray-500 uppercase">Amount</p>
              <p class="text-sm font-semibold text-gray-900">{{ formatCurrency(selectedTransaction?.amount) }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 uppercase">Status</p>
              <p class="text-sm font-medium text-gray-900">{{ capitalize(selectedTransaction?.status) }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 uppercase">Balance After</p>
              <p class="text-sm font-medium text-gray-900">{{ formatCurrency(selectedTransaction?.balanceAfter) }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 uppercase">Date</p>
              <p class="text-sm font-medium text-gray-900">{{ formatDate(selectedTransaction?.createdAt) }}</p>
            </div>
          </div>
          <div>
            <p class="text-xs text-gray-500 uppercase mb-1">Description</p>
            <p class="text-sm text-gray-700">{{ selectedTransaction?.description }}</p>
          </div>
          <div v-if="selectedTransaction?.metadata" class="pt-4 border-t border-gray-200">
            <p class="text-xs text-gray-500 uppercase mb-2">Metadata</p>
            <div class="text-xs text-gray-600 space-y-1">
              <p>IP: {{ selectedTransaction.metadata.ip }}</p>
              <p>Source: {{ selectedTransaction.metadata.source }}</p>
            </div>
          </div>
        </div>
        <div class="flex items-center justify-end p-6 border-t border-gray-200">
          <button
            @click="showDetailsModal = false"
            class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Reverse Transaction Modal -->
    <div
      v-if="showReverseModal"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      @click.self="showReverseModal = false"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">Reverse Transaction</h3>
        </div>
        <div class="p-6 space-y-4">
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p class="text-sm text-yellow-800">
              This will reverse the transaction for <strong>{{ selectedTransaction?.user.username }}</strong> and refund
              <strong>{{ formatCurrency(selectedTransaction?.amount) }}</strong
              >.
            </p>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-700 mb-2">Transaction Type</p>
            <p class="text-sm text-gray-600">
              {{ getTransactionTypeLabel(selectedTransaction?.type, selectedTransaction?.reversalOf) }}
            </p>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-700 mb-2">Description</p>
            <p class="text-sm text-gray-600">{{ selectedTransaction?.description }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Reason for Reversal</label>
            <input
              v-model="reverseForm.reason"
              type="text"
              placeholder="Enter reason"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7]"
            />
          </div>
        </div>
        <div class="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            @click="showReverseModal = false"
            :disabled="isLoading"
            class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            @click="processReverse"
            :disabled="!reverseForm.reason || isLoading"
            class="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isLoading ? "Processing..." : "Reverse" }}
          </button>
        </div>
      </div>
    </div>

    <!-- Top Up Modal -->
    <div
      v-if="showTopUpModal"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      @click.self="showTopUpModal = false"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">Top Up Wallet</h3>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Select User</label>
            <select
              v-model="transactionForm.userId"
              :disabled="loadingUsers"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7] disabled:bg-gray-100"
            >
              <option value="">{{ loadingUsers ? "Loading users..." : "Select a user" }}</option>
              <option v-for="user in users" :key="user.id" :value="user.id">{{ user.username }} ({{ user.id }})</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Amount</label>
            <input
              v-model="transactionForm.amount"
              type="number"
              placeholder="Enter amount"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7]"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
            <input
              v-model="transactionForm.description"
              type="text"
              placeholder="Enter description"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7]"
            />
          </div>
        </div>
        <div class="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            @click="showTopUpModal = false"
            :disabled="isLoading"
            class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            @click="processTopUp"
            :disabled="!transactionForm.userId || !transactionForm.amount || isLoading"
            class="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isLoading ? "Processing..." : "Top Up" }}
          </button>
        </div>
      </div>
    </div>

    <!-- Deduct Modal -->
    <div
      v-if="showDeductModal"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      @click.self="showDeductModal = false"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">Deduct Balance</h3>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Select User</label>
            <select
              v-model="transactionForm.userId"
              :disabled="loadingUsers"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7] disabled:bg-gray-100"
            >
              <option value="">{{ loadingUsers ? "Loading users..." : "Select a user" }}</option>
              <option v-for="user in users" :key="user.id" :value="user.id">{{ user.username }} ({{ user.id }})</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Amount</label>
            <input
              v-model="transactionForm.amount"
              type="number"
              placeholder="Enter amount"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7]"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Reason</label>
            <input
              v-model="transactionForm.reason"
              type="text"
              placeholder="Enter reason"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7]"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
            <input
              v-model="transactionForm.description"
              type="text"
              placeholder="Enter description"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7]"
            />
          </div>
        </div>
        <div class="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            @click="showDeductModal = false"
            :disabled="isLoading"
            class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            @click="processDeduct"
            :disabled="!transactionForm.userId || !transactionForm.amount || !transactionForm.reason || isLoading"
            class="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isLoading ? "Processing..." : "Deduct" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useAdminWallet } from "@/composables/useAdminWallet";

// Composable
const {
  transactions,
  pagination,
  isLoading,
  error,
  hasTransactions,
  totalTransactions,
  fetchTransactions,
  reverseTransaction,
  topUpBalance,
  deductBalance,
  clearError,
  reset,
} = useAdminWallet();

// Local state
const filterType = ref("");
const filterDateFrom = ref("");
const showDetailsModal = ref(false);
const showReverseModal = ref(false);
const showTopUpModal = ref(false);
const showDeductModal = ref(false);
const selectedTransaction = ref(null);
const users = ref([]);
const loadingUsers = ref(false);

// Reverse form
const reverseForm = ref({
  reason: "",
});

// Top Up & Deduct form
const transactionForm = ref({
  userId: "",
  amount: "",
  description: "",
  reason: "",
});

const loadTransactions = async () => {
  try {
    console.log("📌 [loadTransactions] page:", pagination.value.currentPage, "limit:", pagination.value.itemsPerPage);
    
    const params = {
      page: pagination.value.currentPage,
      limit: pagination.value.itemsPerPage,
    };

    if (filterType.value) {
      params.type = filterType.value;
    }

    if (filterDateFrom.value) {
      params.dateFrom = filterDateFrom.value;
    }

    console.log("📌 [loadTransactions] params:", params);
    
    await fetchTransactions(params);
    
    console.log("📌 [loadTransactions] result - total:", totalTransactions.value, "count:", transactions.value.length);
  } catch (err) {
    console.error("❌ [loadTransactions] Error:", err);
  }
};

const loadUsers = async () => {
  try {
    loadingUsers.value = true;
    const { adminWalletService } = await import("@/services/adminWalletService");
    const result = await adminWalletService.getAllUsers();
    users.value = result.users || [];
  } catch (err) {
    console.error("Error loading users:", err);
  } finally {
    loadingUsers.value = false;
  }
};

const handleFilterChange = () => {
  pagination.value.currentPage = 1;
  loadTransactions();
};

const handleViewDetails = transaction => {
  selectedTransaction.value = transaction;
  showDetailsModal.value = true;
};

const handleReverseModal = async transaction => {
  selectedTransaction.value = transaction;
  reverseForm.value = { reason: "" };

  // Load users jika belum
  if (users.value.length === 0) {
    await loadUsers();
  }

  showReverseModal.value = true;
};

const openTopUpModal = async () => {
  if (users.value.length === 0) {
    await loadUsers();
  }
  showTopUpModal.value = true;
};

const openDeductModal = async () => {
  if (users.value.length === 0) {
    await loadUsers();
  }
  showDeductModal.value = true;
};

const processReverse = async () => {
  try {
    await reverseTransaction(selectedTransaction.value.id, reverseForm.value.reason);

    showReverseModal.value = false;

    // FIXED: Delay + reset cache
    await new Promise(resolve => setTimeout(resolve, 500));
    pagination.value.currentPage = 1;

    await loadTransactions();
  } catch (err) {
    console.error("Error reversing transaction:", err);
  }
};
const processTopUp = async () => {
  try {
    console.log("🔵 [processTopUp] START - userId:", transactionForm.value.userId, "amount:", transactionForm.value.amount);
    
    await topUpBalance(
      transactionForm.value.userId,
      Number(transactionForm.value.amount),
      transactionForm.value.description || "Admin top-up"
    );

    console.log("✅ [processTopUp] Top-up success");

    // Reset form & close modal
    transactionForm.value = { userId: "", amount: "", description: "", reason: "" };
    showTopUpModal.value = false;

    console.log("⏳ [processTopUp] Waiting 500ms...");
    await new Promise(resolve => setTimeout(resolve, 500));

    // Reset pagination ke page 1 agar data segar
    pagination.value.currentPage = 1;

    console.log("🔄 [processTopUp] Calling loadTransactions...");
    await loadTransactions();
    
    console.log("✅ [processTopUp] loadTransactions complete");
    console.log("📊 [processTopUp] Transactions count:", transactions.value.length);
  } catch (err) {
    console.error("❌ [processTopUp] Error:", err);
  }
};

const processDeduct = async () => {
  try {
    await deductBalance(
      transactionForm.value.userId,
      Number(transactionForm.value.amount),
      transactionForm.value.description || "Admin deduction",
      transactionForm.value.reason
    );

    // Reset form & close modal
    transactionForm.value = { userId: "", amount: "", description: "", reason: "" };
    showDeductModal.value = false;

    // FIXED: Delay sebentar agar backend selesai process
    await new Promise(resolve => setTimeout(resolve, 500));

    // Reset pagination ke page 1 agar data segar
    pagination.value.currentPage = 1;

    // Reload transactions dengan force refresh
    await loadTransactions();
  } catch (err) {
    console.error("Error processing deduct:", err);
  }
};

const getTransactionTypeLabel = (type, reversalOf) => {
  if (reversalOf) return "Reversal";
  if (type === "top_up") return "Top Up";
  if (type === "admin_deduct") return "Deduction";
  return type;
};

const formatTransactionAmount = transaction => {
  const sign = transaction.type === "top_up" || transaction.reversalOf ? "+" : "-";
  return `${sign} ${formatCurrency(transaction.amount)}`;
};

const formatCurrency = value => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value || 0);
};

const formatDate = dateString => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const capitalize = text => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
};

// Lifecycle
onMounted(() => {
  loadTransactions();
  loadUsers();
});

onUnmounted(() => {
  reset();
});
</script>

<style scoped>
.transactions-content {
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
