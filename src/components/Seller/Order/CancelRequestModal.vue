<!-- CancelRequestModal.vue - Fixed with Real API Integration -->
<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 modal-backdrop"
  >
    <div class="bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-semibold text-gray-900 flex items-center">
              <div class="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-3"></div>
              Cancel Requests Management
            </h2>
            <p class="text-sm text-gray-500 mt-1">Review and respond to order cancellation requests</p>
          </div>
          <button @click="$emit('close')" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>

      <div class="p-6">
        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
          <p class="mt-2 text-gray-600">Loading cancel requests...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center py-8">
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
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Error Loading Requests</h3>
          <p class="text-gray-600 mb-4">{{ error }}</p>
          <button
            @click="fetchCancelRequests"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>

        <!-- Empty State -->
        <div v-else-if="cancelRequests.length === 0" class="text-center py-8">
          <div class="text-gray-400 mb-4">
            <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">No Cancel Requests</h3>
          <p class="text-gray-600">No pending cancellation requests at this time.</p>
        </div>

        <!-- Cancel Requests List -->
        <div v-else class="space-y-4">
          <div
            v-for="request in cancelRequests"
            :key="request.cancelRequestId"
            class="bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <!-- Order Info -->
              <div class="lg:col-span-2">
                <div class="flex items-start justify-between mb-3">
                  <div>
                    <h4 class="font-semibold text-gray-900">Order #{{ request.orderNumber }}</h4>
                    <p class="text-sm text-gray-600">Status: {{ request.orderStatus }}</p>
                  </div>
                  <span class="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                    Cancel Request
                  </span>
                </div>

                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Customer:</span>
                    <span class="font-medium">{{ request.customerName }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Email:</span>
                    <span class="text-gray-800">{{ request.customerEmail }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Order Value:</span>
                    <span class="font-medium">{{ formatCurrency(request.totalAmount) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Your Earnings:</span>
                    <span class="font-medium text-green-600">
                      {{ formatCurrency(request.sellerEarnings) }}
                    </span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Requested:</span>
                    <span class="text-gray-800">{{ formatDate(request.createdAt) }}</span>
                  </div>
                </div>

                <div class="mt-3 p-3 bg-white rounded border">
                  <div class="text-sm">
                    <strong class="text-gray-700">Reason:</strong>
                    <p class="mt-1 text-gray-600">
                      {{ request.reason || "No specific reason provided" }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Action Panel -->
              <div class="space-y-3">
                <div class="text-sm">
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-gray-600">Status:</span>
                    <span class="font-medium" :class="getStatusColor(request.yourResponse)">
                      {{ request.yourResponse ? "You Responded" : "Awaiting Response" }}
                    </span>
                  </div>

                  <div v-if="!request.allSellersResponded" class="text-xs text-amber-600 bg-amber-50 p-2 rounded mb-3">
                    * Response needed from seller
                  </div>
                </div>

                <!-- Action Buttons -->
                <div v-if="!request.yourResponse" class="space-y-2">
                  <button
                    @click="handleApproveRequest(request)"
                    :disabled="isProcessing"
                    class="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    <span v-if="isProcessing && processingId === request.cancelRequestId"> Approving... </span>
                    <span v-else>Approve Cancellation</span>
                  </button>
                  <button
                    @click="handleRejectRequest(request)"
                    :disabled="isProcessing"
                    class="w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    <span v-if="isProcessing && processingId === request.cancelRequestId"> Rejecting... </span>
                    <span v-else>Reject Cancellation</span>
                  </button>
                </div>

                <!-- Already Responded -->
                <div v-else class="text-center p-3 rounded-lg bg-gray-100 text-gray-800">
                  <div class="font-medium text-sm">Response Submitted</div>
                  <div class="text-xs mt-1">
                    {{ formatDate(request.createdAt) }}
                  </div>
                </div>

                <!-- View Order Details Button -->
                <button
                  @click="$emit('view-order', request)"
                  class="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  View Order Details
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.totalPages > 1" class="mt-6 flex items-center justify-between">
          <div class="text-sm text-gray-500">
            Showing {{ (pagination.currentPage - 1) * 10 + 1 }} to
            {{ Math.min(pagination.currentPage * 10, pagination.totalRequests) }} of
            {{ pagination.totalRequests }} requests
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
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useCancelRequests } from "@/composables/useCancelRequests";
import { useSellerOrders } from "@/composables/useSellerOrders";

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "view-order", "request-approved", "request-rejected"]);

// Use composables
const { formatCurrency, formatDate } = useSellerOrders({ autoFetch: false });

const {
  pendingRequests,
  isLoading,
  error,
  pagination,
  fetchPendingRequests,
  respondToCancelRequest,
  getRequestDetails,
} = useCancelRequests();

// Local state
const cancelRequests = ref([]);
const isProcessing = ref(false);
const processingId = ref(null);

// Transform API data to component format
const transformRequestData = apiRequests => {
  return apiRequests.map(request => ({
    orderId: request.order.orderNumber,
    orderNumber: request.order.orderNumber,
    customerName: request.customer.username,
    customerEmail: request.customer.email,
    totalAmount: request.order.totalAmount,
    sellerEarnings: Math.round(request.order.totalAmount * 0.9), // Assuming 90% seller earnings
    reason: request.reason,
    createdAt: request.createdAt,
    yourResponse: request.sellersResponded > 0 ? "responded" : null,
    allSellersResponded: request.sellersResponded >= request.sellersRequired,
    cancelRequestId: request.id,
    orderStatus: request.order.status,
  }));
};

// Methods
const fetchCancelRequests = async (page = 1) => {
  try {
    await fetchPendingRequests({ page, limit: 10 });
    cancelRequests.value = transformRequestData(pendingRequests.value);
  } catch (err) {
    console.error("Failed to fetch cancel requests:", err);
  }
};
const handleApproveRequest = async request => {
  const reason = prompt("Please provide a reason for approving this cancellation (optional):");

  if (reason === null) return;

  try {
    isProcessing.value = true;
    processingId.value = request.cancelRequestId;

    // Fetch full order details
    const response = await getRequestDetails(request.cancelRequestId);

    console.log("getRequestDetails response:", response);

    // Handle response structure - response bisa { success, data, message } atau langsung data
    const detailData = response?.data || response;

    if (!detailData?.yourItems) {
      console.error("yourItems not found in response:", detailData);
      alert("Could not load request items. Please try again.");
      return;
    }

    const items = detailData.yourItems;
    console.log("Items found:", items);

    if (items.length === 0) {
      alert("No items found in this cancel request");
      return;
    }

    // Build itemResponses
    const itemResponses = items.map(item => ({
      productId: item.productId,
      response: "approved",
      responseReason: reason || "",
    }));

    console.log("Sending itemResponses:", itemResponses);

    await respondToCancelRequest(request.cancelRequestId, itemResponses);

    // Update local state
    const requestIndex = cancelRequests.value.findIndex(r => r.cancelRequestId === request.cancelRequestId);
    if (requestIndex !== -1) {
      cancelRequests.value[requestIndex].yourResponse = "approved";
      cancelRequests.value[requestIndex].respondedAt = new Date().toISOString();
    }

    emit("request-approved", request);
    alert("Cancellation request approved successfully!");
    fetchCancelRequests();
  } catch (err) {
    console.error("Error approving cancellation:", err);
    alert("Failed to approve cancellation: " + err.message);
  } finally {
    isProcessing.value = false;
    processingId.value = null;
  }
};

const handleRejectRequest = async request => {
  const reason = prompt("Please provide a reason for rejecting this cancellation (required):");

  if (!reason || reason.trim() === "") {
    alert("Rejection reason is required");
    return;
  }

  try {
    isProcessing.value = true;
    processingId.value = request.cancelRequestId;

    // Fetch full order details
    const response = await getRequestDetails(request.cancelRequestId);

    console.log("getRequestDetails response:", response);

    // Handle response structure - response bisa { success, data, message } atau langsung data
    const detailData = response?.data || response;

    if (!detailData?.yourItems) {
      console.error("yourItems not found in response:", detailData);
      alert("Could not load request items. Please try again.");
      return;
    }

    const items = detailData.yourItems;
    console.log("Items found:", items);

    if (items.length === 0) {
      alert("No items found in this cancel request");
      return;
    }

    // Build itemResponses
    const itemResponses = items.map(item => ({
      productId: item.productId,
      response: "rejected",
      responseReason: reason,
    }));

    console.log("Sending itemResponses:", itemResponses);

    await respondToCancelRequest(request.cancelRequestId, itemResponses);

    // Update local state
    const requestIndex = cancelRequests.value.findIndex(r => r.cancelRequestId === request.cancelRequestId);
    if (requestIndex !== -1) {
      cancelRequests.value[requestIndex].yourResponse = "rejected";
      cancelRequests.value[requestIndex].respondedAt = new Date().toISOString();
    }

    emit("request-rejected", request);
    alert("Cancellation request rejected successfully!");
    fetchCancelRequests();
  } catch (err) {
    console.error("Error rejecting cancellation:", err);
    alert("Failed to reject cancellation: " + err.message);
  } finally {
    isProcessing.value = false;
    processingId.value = null;
  }
};
const changePage = page => {
  if (page >= 1 && page <= pagination.value.totalPages) {
    fetchCancelRequests(page);
  }
};

const getStatusColor = response => {
  if (!response) return "text-orange-600";
  return response === "approved" ? "text-green-600" : "text-red-600";
};

// Watch for show prop changes
watch(
  () => props.show,
  newValue => {
    if (newValue) {
      fetchCancelRequests();
    }
  }
);

// Initial fetch on mount if modal is open
onMounted(() => {
  if (props.show) {
    fetchCancelRequests();
  }
});
</script>

<style scoped>
.modal-backdrop {
  backdrop-filter: blur(4px);
  background-color: rgba(0, 0, 0, 0.6);
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
