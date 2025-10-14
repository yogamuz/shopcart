<!-- OrdersTable.vue - Clean Structure (No Modal Imports) -->
<template>
  <div class="bg-white rounded-xl card overflow-hidden">
    <!-- Loading State -->
    <div v-if="isLoading" class="p-8 text-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6C5CE7] mx-auto"></div>
      <p class="mt-2 text-gray-600">Loading orders...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-8 text-center">
      <div class="text-red-600 mb-4">
        <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">Error Loading Orders</h3>
      <p class="text-gray-600 mb-4">{{ error }}</p>
      <button
        @click="fetchOrders"
        class="px-4 py-2 bg-[#6C5CE7] text-white rounded-lg hover:bg-[#5A4FCF] transition-colors"
      >
        Try Again
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="orders.length === 0" class="p-8 text-center">
      <div class="text-gray-400 mb-4">
        <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">No Orders Found</h3>
      <p class="text-gray-600">
        {{ filters?.status ? `No ${filters.status} orders found` : "No orders available yet" }}
      </p>
    </div>

    <!-- Orders Table -->
    <div v-else>
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">Orders</h3>
        <button
          @click="fetchOrders(filters)"
          :disabled="isLoading"
          class="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <svg v-if="isLoading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.25" />
            <path
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span v-else>Refresh</span>
        </button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Earnings</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="order in orders"
              :key="order.id"
              class="hover:bg-gray-50 cursor-pointer transition-colors"
              @click="$emit('order-clicked', order)"
            >
              <!-- Order Info -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div>
                    <div class="text-sm font-medium text-[#6C5CE7]">#{{ order.orderNumber }}</div>
                    <div class="text-xs text-gray-500">
                      {{ order.id.slice(-8) }}
                    </div>
                  </div>
                  <!-- Cancel Request Indicator -->
                  <template v-if="hasOrderCancelRequest(order.id)">
                    <div class="border-t border-gray-100 my-1"></div>
                    <div class="px-4 py-2 text-xs text-gray-500 uppercase tracking-wide font-semibold">
                      Cancel Request
                    </div>
                    <button
                      @click.stop="handleApproveCancelRequest(order)"
                      class="block w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center"
                    >
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Approve Cancel
                    </button>
                    <button
                      @click.stop="handleRejectCancelRequest(order)"
                      class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                    >
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M6 18L18 6M6 6l12 12"
                        ></path>
                      </svg>
                      Reject Cancel
                    </button>
                  </template>
                </div>
              </td>

              <!-- Customer -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ order.customer.username }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ order.customer.email }}
                  </div>
                </div>
              </td>

              <!-- Items -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10" v-if="order.items[0]?.productImage">
                    <img
                      class="h-10 w-10 rounded-lg object-cover"
                      :src="order.items[0].productImage"
                      :alt="order.items[0].productName"
                    />
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                      {{ order.items[0]?.productName || "Product" }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ order.totalItems }} item{{ order.totalItems > 1 ? "s" : "" }}
                      <span v-if="order.totalItems > 1"> +{{ order.totalItems - 1 }} more </span>
                    </div>
                  </div>
                </div>
              </td>

              <!-- Total Amount -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{ formatCurrency(order.totalAmount) }}
                </div>
              </td>

              <!-- Seller Earnings -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{ formatCurrency(order.sellerInfo.calculatedEarnings || order.sellerInfo.earnings) }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ order.sellerInfo.paymentStatus }}
                </div>
              </td>

              <!-- Order Date -->
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(order.createdAt) }}
              </td>

              <!-- Status -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(order.status)">
                  {{ getOrderStatusText(order.status) }}
                </span>
              </td>

              <!-- Payment Status -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getPaymentClass(order.paymentStatus)">
                  {{ order.paymentStatus.replace("_", " ") }}
                </span>
              </td>

              <!-- Actions -->
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="relative">
                  <button
                    @click.stop="toggleActionMenu(order.id)"
                    class="p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"
                      ></path>
                    </svg>
                  </button>

                  <!-- Action Menu -->
                  <div
                    v-if="activeActionMenu === order.id"
                    class="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 action-menu whitespace-nowrap"
                  >
                    <button
                      @click.stop="$emit('order-clicked', order)"
                      class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      View Details
                    </button>

                    <!-- Ship Order (only for packed orders) -->
                    <button
                      v-if="canShipOrder(order)"
                      @click.stop="handleShipOrder(order)"
                      class="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
                    >
                      Mark as Shipped
                    </button>

                    <!-- Track Order (for shipped orders) -->
                    <button
                      v-if="order.status === 'shipped'"
                      @click.stop="handleTrackOrder(order)"
                      class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Track Order
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div
        v-if="pagination.totalPages > 1"
        class="px-6 py-4 border-t border-gray-200 flex items-center justify-between"
      >
        <div class="text-sm text-gray-500">
          Showing {{ (pagination.currentPage - 1) * 10 + 1 }} to
          {{ Math.min(pagination.currentPage * 10, pagination.totalOrders) }} of {{ pagination.totalOrders }} results
        </div>
        <div class="flex items-center space-x-2">
          <button
            @click="changePage(pagination.currentPage - 1)"
            :disabled="!pagination.hasPrevPage"
            class="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <button
            v-for="page in visiblePages"
            :key="page"
            @click="changePage(page)"
            :class="[
              'px-3 py-1 rounded-lg text-sm',
              pagination.currentPage === page ? 'bg-[#6C5CE7] text-white' : 'border border-gray-300 hover:bg-gray-50',
            ]"
          >
            {{ page }}
          </button>

          <button
            @click="changePage(pagination.currentPage + 1)"
            :disabled="!pagination.hasNextPage"
            class="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useSellerOrders } from "@/composables/useSellerOrders";
import { useSellerCancelRequests } from "@/composables/useCancelRequests";

const props = defineProps({
  filters: {
    type: Object,
    required: true,
  },
  dateRange: {
    // TAMBAH INI
    type: Object,
    default: () => ({ start: "", end: "" }),
  },
  searchQuery: {
    type: String,
    default: "",
  },
  smartSearch: {
    type: String,
    default: "",
  },
});

// Events emitted to parent - parent handles all modal logic
const emit = defineEmits([
  "order-clicked",
  "ship-order",
  "approve-cancel",
  "reject-cancel",
  "track-order",
  "cancel-request-approved",
  "cancel-request-rejected",
  "orders-loaded",
]);

// Use seller orders composable
const {
  orders,
  isLoading,
  error,
  pagination,
  fetchOrders,
  setFilters, // TAMBAH INI
  canShipOrder,
  getOrderStatusText,
  getOrderStatusColor,
  getPaymentStatusColor,
  formatCurrency,
  formatDate,
  filters: composableFilters, // TAMBAH INI
} = useSellerOrders({ autoFetch: false }); // U

const {
  hasOrderCancelRequest,
  getOrderCancelRequest,
  approveCancelRequest,
  rejectCancelRequest,
  fetchCancelRequestsForOrders,
} = useSellerCancelRequests();

// Component state - only UI state, no modal state
const activeActionMenu = ref(null);

watch(
  () => [props.filters, props.dateRange],
  ([newFilters, newDateRange]) => {
    // Update composable filters dengan data dari props
    setFilters({
      ...newFilters,
      page: 1, // Reset ke page 1 saat filter berubah
    });

    // Trigger fetchOrders dengan params lengkap
    const params = {
      ...newFilters,
      ...(newDateRange.start && { startDate: newDateRange.start }),
      ...(newDateRange.end && { endDate: newDateRange.end }),
    };

    fetchOrders(params);
  },
  { deep: true, immediate: true }
);

// Watch for smart search changes
watch(
  () => props.smartSearch,
  newSearchTerm => {
    if (newSearchTerm !== undefined) {
      performSmartSearch(newSearchTerm);
    }
  },
  { immediate: true }
);

// Watch for orders changes to fetch cancel request data
watch(
  orders,
  async newOrders => {
    if (newOrders.length > 0) {
      const orderIds = newOrders.map(order => order.id);
      await fetchCancelRequestsForOrders(orderIds);
    }
  },
  { immediate: true }
);

// Computed properties
const visiblePages = computed(() => {
  const pages = [];
  const start = Math.max(1, pagination.value.currentPage - 2);
  const end = Math.min(pagination.value.totalPages, pagination.value.currentPage + 2);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});

// Methods
const getStatusClass = status => {
  const baseClass = "status-pill";
  const colorClass = `status-${getOrderStatusColor(status)}`;
  return `${baseClass} ${colorClass}`;
};

const getPaymentClass = payment => {
  const baseClass = "status-pill";
  const colorClass = `payment-${getPaymentStatusColor(payment)}`;
  return `${baseClass} ${colorClass}`;
};

const toggleActionMenu = orderId => {
  activeActionMenu.value = activeActionMenu.value === orderId ? null : orderId;
};

const changePage = page => {
  if (page >= 1 && page <= pagination.value.totalPages) {
    // Gunakan filter yang sudah ada + update page
    const params = {
      ...props.filters,
      ...(props.dateRange.start && { startDate: props.dateRange.start }),
      ...(props.dateRange.end && { endDate: props.dateRange.end }),
      page,
    };
    fetchOrders(params);
  }
};

// Action handlers - just emit events to parent
const handleShipOrder = order => {
  emit("ship-order", order);
  activeActionMenu.value = null;
};

const handleApproveCancel = order => {
  emit("approve-cancel", order);
  activeActionMenu.value = null;
};

const handleRejectCancel = order => {
  emit("reject-cancel", order);
  activeActionMenu.value = null;
};

const handleTrackOrder = order => {
  emit("track-order", order);
  activeActionMenu.value = null;
};
// FILE: OrdersTable.vue
// REVISI: Kedua fungsi handler (handleApproveCancelRequest dan handleRejectCancelRequest)
// LETAKKAN setelah fungsi performSmartSearch

const handleApproveCancelRequest = async order => {
  if (confirm("Are you sure you want to approve this cancellation request?")) {
    try {
      const reason = prompt("Approval reason (optional):");

      // Get cancel request data yang sudah ada dari composable
      const cancelRequestData = getOrderCancelRequest(order.id);

      // Jika tidak ada cancel request data, stop
      if (!cancelRequestData?.cancelRequestId) {
        alert("Cancel request data not found");
        return;
      }

      // PENTING: Buat structure items dari order untuk itemResponses
      const itemResponses =
        order.items?.map(item => ({
          productId: item.productId || item.id,
          response: "approved",
          responseReason: reason || "",
        })) || [];

      if (itemResponses.length === 0) {
        alert("No items found in order");
        return;
      }

      // Panggil respondToCancelRequest dengan itemResponses yang benar
      const result = await respondToCancelRequest(cancelRequestData.cancelRequestId, itemResponses);

      // Emit to parent for any additional handling
      emit("cancel-request-approved", order);

      alert("Cancellation request approved successfully!");
      activeActionMenu.value = null;

      // Refresh data
      await fetchCancelRequestsForOrders([order.id]);
    } catch (err) {
      console.error("Error approving cancellation:", err);
      alert("Failed to approve cancellation: " + err.message);
    }
  }
};

const handleRejectCancelRequest = async order => {
  if (confirm("Are you sure you want to reject this cancellation request?")) {
    try {
      const reason = prompt("Rejection reason (required):");
      if (!reason) {
        alert("Rejection reason is required");
        return;
      }

      // Get cancel request data yang sudah ada dari composable
      const cancelRequestData = getOrderCancelRequest(order.id);

      // Jika tidak ada cancel request data, stop
      if (!cancelRequestData?.cancelRequestId) {
        alert("Cancel request data not found");
        return;
      }

      // PENTING: Buat structure items dari order untuk itemResponses
      const itemResponses =
        order.items?.map(item => ({
          productId: item.productId || item.id,
          response: "rejected",
          responseReason: reason,
        })) || [];

      if (itemResponses.length === 0) {
        alert("No items found in order");
        return;
      }

      // Panggil respondToCancelRequest dengan itemResponses yang benar
      const result = await respondToCancelRequest(cancelRequestData.cancelRequestId, itemResponses);

      // Emit to parent for any additional handling
      emit("cancel-request-rejected", order);

      alert("Cancellation request rejected successfully!");
      activeActionMenu.value = null;

      // Refresh data
      await fetchCancelRequestsForOrders([order.id]);
    } catch (err) {
      console.error("Error rejecting cancellation:", err);
      alert("Failed to reject cancellation: " + err.message);
    }
  }
};
const performSmartSearch = searchTerm => {
  if (!searchTerm.trim()) {
    const clearParams = {
      ...props.filters,
      ...(props.dateRange.start && { startDate: props.dateRange.start }),
      ...(props.dateRange.end && { endDate: props.dateRange.end }),
    };
    fetchOrders(clearParams);
    return;
  }

  const trimmedTerm = searchTerm.trim();

  // Improved heuristic: Check if it looks like a person's name
  const looksLikeName =
    /^[a-zA-Z]+$/.test(trimmedTerm) &&
    trimmedTerm.length >= 3 &&
    trimmedTerm.length <= 20 &&
    !/\d/.test(trimmedTerm) && // no numbers
    !/(mini|max|pro|plus|lite|premium|size|color)/i.test(trimmedTerm); // not common product terms

  const searchParams = {
    ...props.filters,
    ...(props.dateRange.start && { startDate: props.dateRange.start }),
    ...(props.dateRange.end && { endDate: props.dateRange.end }),
    ...(looksLikeName ? { customer: trimmedTerm } : { productName: trimmedTerm }),
  };

  fetchOrders(searchParams);
};

// Close menu when clicking outside
document.addEventListener("click", e => {
  if (!e.target.closest(".relative")) {
    activeActionMenu.value = null;
  }
});
</script>

<style scoped>
.card {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.status-pill {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  line-height: 1rem;
  font-weight: 500;
}

/* Status colors */
.status-orange {
  background-color: #fed7aa;
  color: #9a3412;
}
.status-blue {
  background-color: #dbeafe;
  color: #1e40af;
}
.status-purple {
  background-color: #e9d5ff;
  color: #7c3aed;
}
.status-green {
  background-color: #dcfce7;
  color: #166534;
}
.status-emerald {
  background-color: #d1fae5;
  color: #065f46;
}
.status-red {
  background-color: #fecaca;
  color: #991b1b;
}
.status-yellow {
  background-color: #fef3c7;
  color: #92400e;
}
.status-gray {
  background-color: #f3f4f6;
  color: #6b7280;
}

/* Payment colors */
.payment-green {
  background-color: #dcfce7;
  color: #166534;
}
.payment-orange {
  background-color: #fed7aa;
  color: #9a3412;
}
.payment-red {
  background-color: #fecaca;
  color: #991b1b;
}
.payment-gray {
  background-color: #f3f4f6;
  color: #6b7280;
}

.action-menu {
  min-width: 200px;
  max-height: 300px;
  overflow-y: auto;
}

@keyframes slideUpLeft {
  from {
    opacity: 0;
    transform: translateY(10px) translateX(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0) translateX(0);
  }
}
/* Cancel Request Indicator Animation */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes ping {
  75%,
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-ping {
  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}
tbody tr:hover {
  background-color: rgba(249, 250, 251, 0.8);
}
</style>
