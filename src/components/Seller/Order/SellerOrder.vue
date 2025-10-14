<!-- SellerOrder.vue - Clean Order Management Component -->
<template>
  <div class="orders-content">
    <!-- Metric Cards -->
    <MetricCards />

    <!-- Control Panel with Cancel Request Button -->
    <ControlPanel
      v-model:dateRange="dateRange"
      v-model:filters="filters"
      v-model:sortBy="sortBy"
      v-model:savedView="savedView"
      :showAdvancedFilters="showAdvancedFilters"
      :cancelRequestCount="cancelRequestCount"
      @export-csv="handleExportCSV"
      @show-cancel-requests="showCancelRequestsModal"
      @toggle-filters="toggleAdvancedFilters"
      @apply-filters="applyFilters"
    />

    <!-- Orders Table -->
    <OrdersTable
      :filters="filters"
      :dateRange="dateRange"
      :searchQuery="searchQuery"
      :smartSearch="searchQuery"
      @order-clicked="openOrderModal"
      @ship-order="handleShipOrder"
      @approve-cancel="handleApproveCancel"
      @reject-cancel="handleRejectCancel"
      @track-order="handleTrackOrder"
      @cancel-request-approved="handleCancelRequestApproved"
      @cancel-request-rejected="handleCancelRequestRejected"
    />

    <!-- Order Modal -->
    <OrderModal
      v-if="selectedOrder"
      :order="selectedOrder"
      @close="closeOrderModal"
      @ship-order="handleShipOrder"
      @approve-cancel="handleApproveCancelFromModal"
      @reject-cancel="handleRejectCancelFromModal"
      @track-order="handleTrackOrder"
    />

    <!-- Cancel Request Modal -->
    <CancelRequestModal
      :show="showCancelRequestModal"
      @close="closeCancelRequestModal"
      @view-order="handleViewOrderFromCancelRequest"
      @request-approved="handleCancelRequestApproved"
      @request-rejected="handleCancelRequestRejected"
    />

    <!-- Ship Order Modal -->
    <ShipOrderModal
      v-if="showShipModal && selectedOrderForShip"
      :order="selectedOrderForShip"
      @close="closeShipModal"
      @confirm="confirmShipOrder"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useSellerOrders } from "@/composables/useSellerOrders";
import { useSellerCancelRequests } from "@/composables/useCancelRequests";

import MetricCards from "@/components/seller/Order/MetricCards.vue";
import ControlPanel from "@/components/seller/Order/ControlPanel.vue";
import OrdersTable from "@/components/seller/Order/OrdersTable.vue";
import OrderModal from "@/components/seller/Order/OrderModal.vue";
import CancelRequestModal from "@/components/seller/Order/CancelRequestModal.vue";
import ShipOrderModal from "@/components/seller/Order/ShipOrderModal.vue";

// Use seller orders composable
const {
  shipOrder,
  pagination,
  orders,
  fetchOrders,
  setFilters,
  setDateRange,
  performSmartSearch,
  filters: composableFilters,
  dateRange: composableDateRange,
  searchFilters: composableSearchFilters,
} = useSellerOrders({
  autoFetch: true,
});

const {
  hasOrderCancelRequest,
  getOrderCancelRequest,
  approveCancelRequest,
  rejectCancelRequest,
  fetchCancelRequestsForOrders,
} = useSellerCancelRequests();

// Reactive state - sync with composable
const selectedOrder = ref(null);
const sortBy = ref("createdAt");
const savedView = ref("");
const showAdvancedFilters = ref(false);
const searchQuery = ref("");

// Local filters that sync with composable
const dateRange = ref({
  start: composableDateRange.value.start || "",
  end: composableDateRange.value.end || "",
});

const filters = ref({
  status: composableFilters.value.status || "",
});

// Modal state
const showShipModal = ref(false);
const selectedOrderForShip = ref(null);
const showCancelRequestModal = ref(false);

// Computed properties
const cancelRequestCount = computed(() => {
  return orders.value.filter((order) => hasOrderCancelRequest(order.id)).length;
});

// Watch for filter changes and apply them
watch(
  [() => filters.value.status, () => dateRange.value],
  () => {
    // Debounce to prevent multiple rapid calls
    applyFilters();
  },
  { deep: true }
);

// Watch for sortBy changes
watch(sortBy, () => {
  applyFilters();
});

// Watch for search query changes
watch(searchQuery, (newQuery) => {
  if (newQuery) {
    performSmartSearch(newQuery);
  } else {
    // Clear search filters when query is empty
    composableSearchFilters.value = {
      customer: "",
      productName: "",
    };
  }
  fetchOrders();
});

// Methods
  const applyFilters = () => {
  // Update composable filters
  setFilters({
    status: filters.value.status,
    sortBy: sortBy.value,
    sortOrder: composableFilters.value.sortOrder,
    page: 1, // Reset to first page when filters change
  });

  // Update composable date range
  setDateRange({
    start: dateRange.value.start,
    end: dateRange.value.end,
  });

  // Fetch with new filters
  fetchOrders();
};

const toggleAdvancedFilters = () => {
  showAdvancedFilters.value = !showAdvancedFilters.value;
};

// Modal Management
const closeAllModals = () => {
  selectedOrder.value = null;
  showShipModal.value = false;
  selectedOrderForShip.value = null;
  showCancelRequestModal.value = false;
};

const openOrderModal = (order) => {
  if (order) {
    selectedOrder.value = order;
  }
};

const closeOrderModal = () => {
  selectedOrder.value = null;
};

// Cancel Request Modal Management
const showCancelRequestsModal = () => {
  showCancelRequestModal.value = true;
};

const closeCancelRequestModal = () => {
  showCancelRequestModal.value = false;
};

const handleViewOrderFromCancelRequest = (request) => {
  const order = orders.value.find((o) => o.id === request.orderId);
  if (order) {
    closeCancelRequestModal();
    openOrderModal(order);
  }
};

// Ship Order Modal Management
const handleShipOrder = (order) => {
  selectedOrderForShip.value = order;
  showShipModal.value = true;
  selectedOrder.value = null;
};

const closeShipModal = () => {
  showShipModal.value = false;
  selectedOrderForShip.value = null;
};

const confirmShipOrder = async (shippingDetails) => {
  try {
    await shipOrder(selectedOrderForShip.value.id, shippingDetails);
    closeShipModal();
    alert("Order shipped successfully!");
  } catch (err) {
    alert("Failed to ship order: " + err.message);
  }
};

// Export CSV Handler
const handleExportCSV = () => {
  console.log("Exporting CSV with current filters:", filters.value);
  alert("CSV export functionality will be implemented");
};

// Action Handlers
const handleApproveCancel = async (order) => {
  await handleApproveCancelFromModal(order);
};

const handleRejectCancel = async (order) => {
  await handleRejectCancelFromModal(order);
};

const handleTrackOrder = (order) => {
  console.log("Tracking order:", order.id);
};

const handleCancelRequestApproved = async (order) => {
  try {
    console.log("Cancel request approved for order:", order.id);
  } catch (error) {
    console.error("Error handling cancel request approval:", error);
  }
};

const handleCancelRequestRejected = async (order) => {
  try {
    console.log("Cancel request rejected for order:", order.id);
  } catch (error) {
    console.error("Error handling cancel request rejection:", error);
  }
};

const handleApproveCancelFromModal = async (order) => {
  try {
    console.log("Approving cancellation for order from modal:", order.id);
    closeOrderModal();
  } catch (err) {
    console.error("Error approving cancellation from modal:", err);
  }
};

const handleRejectCancelFromModal = async (order) => {
  try {
    console.log("Rejecting cancellation for order from modal:", order.id);
    closeOrderModal();
  } catch (err) {
    console.error("Error rejecting cancellation from modal:", err);
  }
};

// Method untuk handle search dari global header
const handleSearch = (query) => {
  searchQuery.value = query;
};

const handleSearchClear = () => {
  searchQuery.value = "";
};

// Method untuk mendapatkan total orders count
const getOrdersCount = () => {
  return pagination.value.totalOrders || 0;
};

// Expose methods untuk parent
defineExpose({
  handleSearch,
  handleSearchClear,
  getOrdersCount,
});
</script>

<style scoped>
.orders-content {
  animation: fadeIn 0.3s ease-in-out;
  max-width: 100%;
  overflow-x: hidden;
  margin-top: 0;
  padding-top: 0;
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

@media (max-width: 640px) {
  .orders-content {
    padding: 0;
  }
}
</style>