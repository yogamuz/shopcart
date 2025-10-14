<!-- OrderModal.vue - Clean Structure (No Modal Imports) -->
<template>
  <div
    v-if="order"
    class="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 modal-backdrop"
  >
    <div class="bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-semibold text-gray-900">Order Details #{{ order.orderNumber }}</h2>
            <p class="text-sm text-gray-500 mt-1">Order ID: {{ order.id.slice(-12) }}</p>
          </div>
          <button @click="$emit('close')" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>

      <div class="p-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Left Column: Order Info -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Order Items -->
            <div>
              <h3 class="font-semibold text-gray-900 mb-4">Order Items ({{ order.totalItems }})</h3>
              <div class="space-y-4">
                <div
                  v-for="(item, index) in order.items"
                  :key="index"
                  class="flex items-center p-4 bg-gray-50 rounded-lg"
                >
                  <img
                    :src="item.productImage || '/placeholder-product.jpg'"
                    :alt="item.productName"
                    class="w-16 h-16 rounded-lg object-cover mr-4"
                  />
                  <div class="flex-1">
                    <h4 class="font-medium text-gray-900">
                      {{ item.productName }}
                    </h4>
                    <p class="text-sm text-gray-500 mt-1">
                      {{ formatCurrency(item.pricePerUnit || 0) }} x
                      {{ item.quantity }}
                    </p>
                    <div v-if="item.discountApplied" class="text-xs text-green-600 mt-1">
                      Discount: {{ item.discountApplied.couponCode }} (-{{
                        formatCurrency(item.discountApplied.discountAmount)
                      }})
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="font-medium text-gray-900">
                      {{ formatCurrency(item.subtotal || 0) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Shipping Address -->
            <div v-if="order.shippingAddress">
              <h3 class="font-semibold text-gray-900 mb-4">Shipping Address</h3>
              <div class="p-4 bg-gray-50 rounded-lg">
                <div class="space-y-1 text-sm">
                  <div>{{ order.shippingAddress.street }}</div>
                  <div>
                    {{ order.shippingAddress.city }},
                    {{ order.shippingAddress.state }}
                    {{ order.shippingAddress.zipCode }}
                  </div>
                  <div>{{ order.shippingAddress.country }}</div>
                </div>
              </div>
            </div>

            <!-- Order Timeline -->
            <div v-if="order.timestamps">
              <h3 class="font-semibold text-gray-900 mb-4">Order Timeline</h3>
              <div class="relative">
                <!-- Garis vertikal utama -->
                <div class="absolute left-1 top-0 bottom-0 w-0.5 bg-gray-300"></div>

                <div class="space-y-4">
                  <div class="relative flex items-center" v-if="order.timestamps.orderedAt">
                    <div class="w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-sm z-10 relative"></div>
                    <div class="flex-1 ml-4">
                      <span class="text-sm font-medium">Order Placed</span>
                      <div class="text-xs text-gray-500">
                        {{ formatDate(order.timestamps.orderedAt) }}
                      </div>
                    </div>
                  </div>

                  <div class="relative flex items-center" v-if="order.timestamps.packedAt">
                    <div class="w-3 h-3 bg-yellow-500 rounded-full border-2 border-white shadow-sm z-10 relative"></div>
                    <div class="flex-1 ml-4">
                      <span class="text-sm font-medium">Order Packed</span>
                      <div class="text-xs text-gray-500">
                        {{ formatDate(order.timestamps.packedAt) }}
                      </div>
                    </div>
                  </div>

                  <div class="relative flex items-center" v-if="order.timestamps.shippedAt">
                    <div class="w-3 h-3 bg-purple-500 rounded-full border-2 border-white shadow-sm z-10 relative"></div>
                    <div class="flex-1 ml-4">
                      <span class="text-sm font-medium">Order Shipped</span>
                      <div class="text-xs text-gray-500">
                        {{ formatDate(order.timestamps.shippedAt) }}
                      </div>
                    </div>
                  </div>

                  <div class="relative flex items-center" v-if="order.timestamps.deliveredAt">
                    <div class="w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm z-10 relative"></div>
                    <div class="flex-1 ml-4">
                      <span class="text-sm font-medium">Order Delivered</span>
                      <div class="text-xs text-gray-500">
                        {{ formatDate(order.timestamps.deliveredAt) }}
                      </div>
                    </div>
                  </div>

                  <div class="relative flex items-center" v-if="order.timestamps.receivedAt">
                    <div
                      class="w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm z-10 relative"
                    ></div>
                    <div class="flex-1 ml-4">
                      <span class="text-sm font-medium">Order Received</span>
                      <div class="text-xs text-gray-500">
                        {{ formatDate(order.timestamps.receivedAt) }}
                      </div>
                    </div>
                  </div>

                  <div class="relative flex items-center" v-if="order.timestamps.cancelledAt">
                    <div class="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-sm z-10 relative"></div>
                    <div class="flex-1 ml-4">
                      <span class="text-sm font-medium">Order Cancelled</span>
                      <div class="text-xs text-gray-500">
                        {{ formatDate(order.timestamps.cancelledAt) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- Cancel Information (if order is cancelled) -->
            <div v-if="order.status === 'cancelled' && order.cancelInfo">
              <h3 class="font-semibold text-gray-900 mb-4 flex items-center">
                <svg class="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
                Cancellation Information
              </h3>
              <div class="p-4 bg-red-50 rounded-lg border border-red-200">
                <div class="space-y-2">
                  <div class="flex items-start">
                    <span class="text-sm font-medium text-gray-700 min-w-[80px]">Reason:</span>
                    <span class="text-sm text-red-800 flex-1">
                      {{ order.cancelInfo.reason }}
                    </span>
                  </div>
                  <div class="flex items-center">
                    <span class="text-sm font-medium text-gray-700 min-w-[80px]">Cancelled:</span>
                    <span class="text-sm text-gray-600">
                      {{ formatDate(order.cancelInfo.cancelledAt) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <!-- Customer Reviews Section - UPDATED WITH ACTUAL REVIEWS -->
            <div v-if="hasCustomerFeedback">
              <h3 class="font-semibold text-gray-900 mb-4">Customer Reviews</h3>

              <!-- Loading state -->
              <div v-if="isLoadingReviews" class="p-4 bg-gray-50 rounded-lg">
                <div class="animate-pulse flex items-center">
                  <div class="h-4 bg-gray-300 rounded w-1/3"></div>
                </div>
              </div>

              <!-- Reviews loaded -->
              <div v-else-if="orderProductReviews.length > 0" class="space-y-3">
                <div
                  v-for="review in orderProductReviews"
                  :key="review.id"
                  class="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200"
                >
                  <!-- Product info -->
                  <div class="flex items-center mb-3">
                    <img
                      v-if="review.productImage"
                      :src="review.productImage"
                      :alt="review.productName"
                      class="w-12 h-12 rounded-lg object-cover mr-3"
                    />
                    <div class="flex-1">
                      <div class="font-medium text-sm text-gray-900">
                        {{ review.productName }}
                      </div>
                      <div class="text-xs text-gray-500 mt-0.5">
                        {{ formatDate(review.createdAt) }}
                      </div>
                    </div>
                  </div>

                  <!-- Rating -->
                  <div class="flex items-center mb-2">
                    <div class="flex text-yellow-400 mr-2">
                      <svg
                        v-for="i in 5"
                        :key="i"
                        :class="i <= review.rating ? 'text-yellow-400' : 'text-gray-300'"
                        class="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                        />
                      </svg>
                    </div>
                    <span class="text-sm font-semibold text-gray-700">{{ review.rating }}/5</span>
                  </div>

                  <!-- Comment -->
                  <p v-if="review.comment" class="text-sm text-gray-700 leading-relaxed">"{{ review.comment }}"</p>
                  <p v-else class="text-sm text-gray-500 italic">No written review</p>
                </div>
              </div>

              <!-- Fallback: No reviews found -->
              <div v-else class="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div class="flex items-center mb-2">
                  <svg class="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                  <span class="font-semibold text-gray-900">Customer Reviews</span>
                </div>
                <p class="text-sm text-gray-600">No reviews found for this order yet.</p>
              </div>
            </div>

            <!-- Cancel Request Information (if exists) -->
            <div v-if="hasCancelRequest" class="cancel-request-section">
              <h3 class="font-semibold text-gray-900 mb-4 flex items-center">
                <div class="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
                Cancel Request
              </h3>
              <div class="p-4 bg-red-50 rounded-lg border border-red-200">
                <div class="space-y-3">
                  <div class="flex justify-between items-start">
                    <span class="text-sm text-gray-600">Reason:</span>
                    <span class="text-sm font-medium text-red-800 max-w-md text-right">
                      {{ cancelRequestData?.reason || "Customer wants to cancel this order" }}
                    </span>
                  </div>

                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Requested:</span>
                    <span class="text-sm text-gray-800">
                      {{ cancelRequestData?.createdAt ? formatDate(cancelRequestData.createdAt) : "Recently" }}
                    </span>
                  </div>

                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Status:</span>
                    <span
                      class="text-sm font-medium"
                      :class="
                        cancelRequestData?.yourResponse
                          ? cancelRequestData.yourResponse === 'approved'
                            ? 'text-green-600'
                            : 'text-red-600'
                          : 'text-orange-600'
                      "
                    >
                      {{
                        cancelRequestData?.yourResponse
                          ? cancelRequestData.yourResponse === "approved"
                            ? "You Approved"
                            : "You Rejected"
                          : "Awaiting Response"
                      }}
                    </span>
                  </div>

                  <div v-if="cancelRequestData?.allSellersResponded === false" class="text-xs text-gray-500 italic">
                    * Waiting for other sellers to respond
                  </div>
                </div>

                <!-- Action buttons for cancel request -->
                <div v-if="!cancelRequestData?.yourResponse" class="flex gap-2 mt-4">
                  <button
                    @click="handleApproveCancelRequest"
                    class="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    Approve
                  </button>
                  <button
                    @click="handleRejectCancelRequest"
                    class="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Summary & Actions -->
          <div class="space-y-6">
            <!-- Order Summary -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Status</span>
                  <span :class="getStatusClass(order.status)">
                    {{ getOrderStatusText(order.status) }}
                  </span>
                </div>

                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Payment</span>
                  <span :class="getPaymentClass(order.paymentStatus)">
                    {{ order.paymentStatus.replace("_", " ") }}
                  </span>
                </div>

                <div class="border-t pt-3">
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Total Amount</span>
                    <span class="font-medium">{{ formatCurrency(order.totalAmount) }}</span>
                  </div>

                  <div class="flex justify-between items-center mt-2">
                    <span class="text-sm text-gray-600">Your Earnings</span>
                    <span class="font-medium text-green-600">{{
                      formatCurrency(order.sellerInfo.calculatedEarnings || order.sellerInfo.earnings)
                    }}</span>
                  </div>

                  <div class="flex justify-between items-center mt-1">
                    <span class="text-xs text-gray-500">Payment Status</span>
                    <span class="text-xs" :class="getSellerPaymentClass(order.sellerInfo.paymentStatus)">
                      {{ order.sellerInfo.paymentStatus.replace("_", " ") }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Customer Information -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="font-semibold text-gray-900 mb-4">Customer Information</h3>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Name</span>
                  <span class="text-sm font-medium">{{ order.customer.username }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Email</span>
                  <span class="text-sm font-medium">{{ order.customer.email }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Order Date</span>
                  <span class="text-sm">{{ formatDate(order.createdAt) }}</span>
                </div>
              </div>
            </div>

            <!-- Payment Information -->
            <div class="bg-gray-50 rounded-lg p-4" v-if="order.paymentInfo">
              <h3 class="font-semibold text-gray-900 mb-4">Payment Information</h3>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Method</span>
                  <span class="text-sm font-medium">{{ order.paymentInfo.method }}</span>
                </div>
                <div class="flex justify-between items-start" v-if="order.paymentInfo.transactionId">
                  <span class="text-sm text-gray-600 flex-shrink-0 mr-2">Transaction ID</span>
                  <span class="text-sm font-mono text-right break-all">{{ order.paymentInfo.transactionId }}</span>
                </div>
                <div class="flex justify-between" v-if="order.paymentInfo.paidAt">
                  <span class="text-sm text-gray-600">Paid At</span>
                  <span class="text-sm">{{ formatDate(order.paymentInfo.paidAt) }}</span>
                </div>
              </div>
            </div>

            <!-- Action Buttons - Emit events to parent instead of handling directly -->
            <div class="space-y-3" v-if="showActionButtons">
              <button
                v-if="canShipOrder(order)"
                @click="handleShipOrder"
                class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Mark as Shipped
              </button>

              <!-- Enhanced Cancel Request Actions -->
              <div v-if="hasCancelRequest && !cancelRequestData?.yourResponse" class="space-y-2">
                <div class="text-sm font-medium text-red-600 mb-2 flex items-center">
                  <div class="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
                  Cancel Request Pending
                </div>
                <button
                  @click="handleApproveCancelRequest"
                  class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Approve Cancellation
                </button>
                <button
                  @click="handleRejectCancelRequest"
                  class="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Reject Cancellation
                </button>
              </div>

              <!-- Show response status if already responded -->
              <div
                v-else-if="hasCancelRequest && cancelRequestData?.yourResponse"
                class="p-3 rounded-lg text-center"
                :class="
                  cancelRequestData.yourResponse === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                "
              >
                <div class="font-medium">
                  {{
                    cancelRequestData.yourResponse === "approved" ? "Cancellation Approved" : "Cancellation Rejected"
                  }}
                </div>
                <div class="text-sm mt-1">
                  {{
                    cancelRequestData.allSellersResponded ? "All sellers have responded" : "Waiting for other sellers"
                  }}
                </div>
              </div>

              <button
                v-if="order.status === 'shipped'"
                @click="handleTrackOrder"
                class="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                View Tracking
              </button>
            </div>

            <!-- Notes Section -->
            <div v-if="order.notes" class="bg-yellow-50 rounded-lg p-4">
              <h3 class="font-semibold text-gray-900 mb-2">Notes</h3>
              <p class="text-sm text-gray-700">{{ order.notes }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed, ref, onMounted } from "vue";
import { useSellerOrders } from "@/composables/useSellerOrders";
import { useSellerCancelRequests } from "@/composables/useCancelRequests";
import { SellerOrderService } from "@/services/sellerOrderService";

const props = defineProps({
  order: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["close", "ship-order", "approve-cancel", "reject-cancel", "track-order"]);

const { canShipOrder, getOrderStatusText, getOrderStatusColor, getPaymentStatusColor, formatCurrency, formatDate } =
  useSellerOrders({ autoFetch: false });
const { hasOrderCancelRequest, getOrderCancelRequest, approveCancelRequest, rejectCancelRequest } =
  useSellerCancelRequests();

// State for reviews
const orderProductReviews = ref([]);
const isLoadingReviews = ref(false);

// Computed properties
const showActionButtons = computed(() => {
  if (!props.order) return false;
  return (
    canShipOrder(props.order) || props.order.status === "cancellation_requested" || props.order.status === "shipped"
  );
});

const cancelRequestData = computed(() => {
  if (!props.order?.id) return null;

  // ✅ FIX: Cek multiple sources untuk reason
  
  // Priority 1: Dari composable data (jika sudah di-fetch detail)
  const composableData = getOrderCancelRequest(props.order.id);
  if (composableData?.hasPendingCancelRequest) {
    return composableData;
  }

  // Priority 2: Dari order.cancelRequest (direct dari API response)
  if (props.order.cancelRequest) {
    return {
      hasPendingCancelRequest: true,
      reason: props.order.cancelRequest.reason || props.order.cancelRequest.generalReason,
      generalReason: props.order.cancelRequest.generalReason,
      createdAt: props.order.cancelRequest.submittedAt,
      yourResponse: null,
      allSellersResponded: false,
      ...props.order.cancelRequest, // Include all other fields
    };
  }

  // Priority 3: Fallback - extract dari notes jika format "Reason: ..."
  if (props.order.notes && props.order.notes.includes("Reason:")) {
    const reasonText = props.order.notes.split("Reason:")[1].trim();
    return {
      hasPendingCancelRequest: true,
      reason: reasonText,
      generalReason: reasonText,
      createdAt: props.order.createdAt,
      yourResponse: null,
      allSellersResponded: false,
    };
  }

  return null;
});

const hasCancelRequest = computed(() => {
  return hasOrderCancelRequest(props.order?.id);
});

// ✅ FIX: Always show review section for delivered/received orders
const hasCustomerFeedback = computed(() => {
  if (!props.order) return false;

  // Check if order is in a state where reviews could exist
  const canHaveReviews = ["delivered", "received"].includes(props.order.status);

  // If customerFeedback exists, check it
  if (props.order.sellerInfo?.customerFeedback) {
    if (props.order.sellerInfo.customerFeedback.hasProductReviews) return true;
    if (props.order.sellerInfo.customerFeedback.rating || props.order.sellerInfo.customerFeedback.review) return true;
  }

  // ✅ NEW: For delivered/received orders, always try to fetch reviews
  // even if customerFeedback is not in the response
  return canHaveReviews;
});

// ✅ FIX: Improved review fetching with better filtering
const fetchOrderProductReviews = async () => {
  if (!props.order) return;

  try {
    isLoadingReviews.value = true;
    const service = new SellerOrderService();
    const response = await service.getSellerReviews({ page: 1, limit: 50 });

    if (response.success && response.data.reviews) {
      // ✅ DEBUG: Check item structure first
      console.log("=== Order Items Structure ===");
      console.log("First item:", props.order.items[0]);
      console.log("All items:", props.order.items);

      // ✅ Extract actual product IDs from order items
      const orderProductIds = props.order.items
        .map(item => {
          console.log("Mapping item:", {
            productId: item.productId,
            productDotId: item.product?.id,
            productDotUnderscore: item.product?._id,
            itemId: item.id,
            itemUnderscore: item._id,
          });
          return item.productId || item.product?.id || item.product?._id || item.id || item._id;
        })
        .filter(Boolean);

      console.log("=== Review Filtering Debug ===");
      console.log("Order product IDs:", orderProductIds);
      console.log("Customer username:", props.order.customer.username);
      console.log("Total reviews fetched:", response.data.reviews.length);

      // ✅ Filter reviews by product ID AND customer username
      orderProductReviews.value = response.data.reviews
        .filter(review => {
          const matchesProduct = orderProductIds.includes(review.product.id);
          const matchesCustomer =
            review.customer.username.toLowerCase() === props.order.customer.username.toLowerCase();

          console.log("Review check:", {
            reviewId: review.id,
            productId: review.product.id,
            productTitle: review.product.title,
            matchesProduct,
            reviewCustomer: review.customer.username,
            orderCustomer: props.order.customer.username,
            matchesCustomer,
            finalMatch: matchesProduct && matchesCustomer,
          });

          return matchesProduct && matchesCustomer;
        })
        .map(review => ({
          id: review.id,
          productName: review.product.title,
          productImage: review.product.image,
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt,
        }));

      console.log("Filtered reviews count:", orderProductReviews.value.length);
      console.log("Filtered reviews:", orderProductReviews.value);
    }
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
  } finally {
    isLoadingReviews.value = false;
  }
};

// Helper methods
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

const getSellerPaymentClass = paymentStatus => {
  const colors = {
    confirmed: "text-green-600",
    pending: "text-orange-600",
    not_paid: "text-gray-600",
  };
  return colors[paymentStatus] || "text-gray-600";
};

const handleApproveCancelRequest = async () => {
  const reason = prompt("Please provide a reason for approving this cancellation (optional):");
  try {
    await approveCancelRequest(props.order.id, reason || "");
    emit("approve-cancel", props.order);
    alert("Cancellation request approved successfully!");
  } catch (err) {
    alert("Failed to approve cancellation: " + err.message);
  }
};

const handleRejectCancelRequest = async () => {
  const reason = prompt("Please provide a reason for rejecting this cancellation (required):");
  if (!reason || reason.trim() === "") {
    alert("Rejection reason is required");
    return;
  }
  try {
    await rejectCancelRequest(props.order.id, reason);
    emit("reject-cancel", props.order);
    alert("Cancellation request rejected successfully!");
  } catch (err) {
    alert("Failed to reject cancellation: " + err.message);
  }
};

const handleShipOrder = () => {
  emit("ship-order", props.order);
};

const handleTrackOrder = () => {
  emit("track-order", props.order);
};

onMounted(() => {
  console.log("=== OrderModal Mounted ===");
  console.log("Order:", props.order);
  console.log("Order items:", props.order?.items);
  console.log("Customer:", props.order?.customer);
  console.log("Has feedback:", props.order?.sellerInfo?.customerFeedback);

  fetchOrderProductReviews();
});
</script>

<style scoped>
.modal-backdrop {
  backdrop-filter: blur(4px);
  background-color: rgba(0, 0, 0, 0.6);
}

/* Fade in animation */
.fixed {
  animation: fadeIn 0.3s ease-out;
}

.bg-white {
  animation: slideIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Timeline styles */
.relative {
  position: relative;
}

/* Garis vertikal timeline */
.absolute.left-1 {
  left: 0.25rem;
}

/* Dot timeline styles */
.w-3.h-3 {
  width: 0.75rem;
  height: 0.75rem;
}

/* Hover effect untuk timeline items */
.relative.flex.items-center:hover {
  background-color: rgba(249, 250, 251, 0.5);
  border-radius: 0.375rem;
  padding: 0.5rem;
  margin: -0.5rem;
  transition: all 0.2s ease-in-out;
}

/* Animasi untuk timeline dots */
.rounded-full.shadow-sm {
  transition: all 0.2s ease-in-out;
}

.relative.flex.items-center:hover .rounded-full.shadow-sm {
  transform: scale(1.1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
</style>
