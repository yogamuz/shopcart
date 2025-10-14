<!-- OrdersContent.vue - Fixed Filter Logic -->
<template>
  <div class="animate-fade-in-up">
    <!-- Loading State -->
    <div v-if="isLoading && (!orders || orders.length === 0)" class="bg-white rounded-2xl shadow-xl p-8">
      <div class="flex items-center justify-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span class="ml-3 text-gray-600">Loading orders...</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-white rounded-2xl shadow-xl p-8">
      <div class="text-center">
        <svg class="mx-auto h-16 w-16 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-7 2l1.5-1.5m0 0L12 19l6.5-6.5m-13 0L12 5l6.5 6.5"
          />
        </svg>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Failed to Load Orders</h3>
        <p class="text-gray-600 mb-4">{{ error.message || "Something went wrong while loading your orders." }}</p>
        <button
          @click="$emit('refresh')"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!isLoading && filteredParcels.length === 0" class="bg-white rounded-2xl shadow-xl p-8">
      <div class="text-center">
        <svg class="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M16 11V7a4 4 0 00-8 0v4M8 11v6h8v-6M8 11H6a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2v-6a2 2 0 00-2-2h-2"
          />
        </svg>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">No Orders Found</h3>
        <p class="text-gray-600 mb-6">{{ getEmptyStateMessage() }}</p>
        <router-link
          to="/"
          class="inline-flex items-center bg-gradient-to-r from-blue-600 to-cyan-700 hover:from-blue-700 hover:to-cyan-800 text-white py-3 px-6 rounded-lg font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          Start Shopping
        </router-link>
      </div>
    </div>

    <!-- Orders List - FILTERED BY STATUS -->
    <div v-else-if="filteredParcels.length > 0" class="space-y-6">
      <!-- Loop filtered parcels -->
      <div
        v-for="parcelData in filteredParcels"
        :key="`${parcelData.order.id}-${parcelData.parcel.parcelId}`"
        class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <!-- Card Header with Order Number & Seller -->
        <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">
                #{{ parcelData.order.orderNumber || parcelData.order.id }}
              </h3>
              <div class="flex items-center space-x-2 mt-1">
                <img
                  v-if="parcelData.parcel.seller?.storeLogo"
                  :src="parcelData.parcel.seller.storeLogo"
                  :alt="parcelData.parcel.seller.storeName"
                  class="w-5 h-5 rounded-full object-cover border border-gray-300"
                  @error="e => (e.target.src = '')"
                />
                <Store v-else :size="16" class="text-blue-600" />
                <span class="font-medium text-gray-700">{{
                  parcelData.parcel.seller?.storeName || "Unknown Store"
                }}</span>
              </div>
              <p class="text-sm text-gray-500 mt-1">{{ formatDate(parcelData.order.createdAt) }}</p>
            </div>
            <div class="flex items-center space-x-3">
              <OrderStatusBadge :status="parcelData.parcel.status" />
            </div>
          </div>

          <!-- Order Info Row -->
          <div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
            <div class="flex items-center space-x-4">
              <!-- Expiry -->
              <div
                v-if="parcelData.order.paymentStatus === 'pending' && parcelData.order.expiresAt"
                class="flex items-center text-orange-600"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span class="text-sm font-semibold">{{ getTimeUntilExpiry(parcelData.order) }}</span>
              </div>

              <!-- Cancel Request -->
              <div
                v-if="parcelData.order.status === 'cancellation_requested'"
                class="flex items-center text-orange-600"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <span class="text-xs">{{ parcelData.order.cancelRequest?.reason || "Waiting for approval" }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Parcel Items -->
        <div class="p-6">
          <div class="space-y-3">
            <div
              v-for="item in parcelData.parcel.items"
              :key="item.productId"
              class="flex items-start space-x-4 hover:bg-gray-50 p-3 rounded-lg transition-colors"
            >
              <!-- Product Image -->
              <img
                :src="item.productImage || 'https://via.placeholder.com/80'"
                :alt="item.productName"
                class="w-16 h-16 rounded-lg border border-gray-200 object-cover flex-shrink-0"
                @error="handleImageError"
              />

              <!-- Product Info -->
              <div class="flex-1 min-w-0">
                <h4 class="text-sm font-medium text-gray-900 truncate">{{ item.productName }}</h4>
                <div class="flex items-center space-x-2 mt-1">
                  <p class="text-xs text-gray-500">Qty: {{ item.quantity }} × {{ formatCurrency(item.price) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Card Actions Footer -->
        <div class="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div class="flex items-center justify-between">
            <!-- ✅ UPDATE: Kirim parcel yang spesifik -->
            <button
              @click="$emit('view-order', parcelData.order, parcelData.parcel)"
              class="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View Details from {{ parcelData.parcel.seller?.storeName }}
            </button>

            <div class="flex items-center space-x-2">
              <!-- Pay Button -->
              <button
                v-if="parcelData.order.statusInfo?.canPay"
                @click.stop="$emit('pay-order', parcelData.order)"
                class="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                Pay Now
              </button>

              <!-- Cancel Button -->
              <button
                v-if="parcelData.order.statusInfo?.canCancel"
                @click.stop="$emit('cancel-order', parcelData.order)"
                class="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Load More -->
      <div v-if="pagination && pagination.hasNextPage" class="text-center pt-6">
        <button
          @click="$emit('load-more')"
          :disabled="isLoading"
          class="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <span v-if="isLoading">Loading...</span>
          <span v-else>Load More Orders</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { Store, ShoppingCart, ShoppingBag } from "lucide-vue-next";
import OrderStatusBadge from "./OrderStatusBadge.vue";

const props = defineProps({
  orders: { type: Array, default: () => [] },
  isLoading: { type: Boolean, default: false },
  error: { type: Object, default: null },
  pagination: { type: Object, default: () => ({}) },
  activeStatus: { type: String, default: "all" },
});
const currentTime = ref(Date.now());

const emit = defineEmits(["refresh", "load-more", "view-order", "pay-order", "cancel-order", "confirm-delivery"]);
const filteredParcels = computed(() => {
  const result = [];

  props.orders.forEach(order => {
    // ✅ FIX: Jangan convert sellers → parcels di sini
    // Gunakan data yang sudah di-normalized dari store
    if (!order.parcels || order.parcels.length === 0) {
      console.warn("Order tanpa parcels:", order.id);
      return; // Skip order ini
    }

    // ✅ CRITICAL FIX: Filter by PARCEL status
    order.parcels.forEach(parcel => {
      const parcelStatus = parcel.status;

      // Match filter
      if (props.activeStatus === "all" || parcelStatus === props.activeStatus) {
        result.push({
          order,
          parcel: {
            ...parcel,
            status: parcelStatus,
          },
        });
      }
    });
  });

  return result;
});

const formatCurrency = amount => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = dateString => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const handleImageError = event => {
  event.target.src = "https://via.placeholder.com/80/f3f4f6/9ca3af?text=No+Image";
};

const getEmptyStateMessage = () => {
  const messages = {
    all: "You haven't placed any orders yet.",
    pending: "No items with pending status.",
    packed: "No items being packed.",
    shipped: "No items in transit.",
    delivered: "No items delivered.",
    received: "No items received.",
    cancelled: "No cancelled items.",
  };
  return messages[props.activeStatus] || messages.all;
};

const getTimeUntilExpiry = order => {
  if (!order.expiresAt) return null;
  // ✅Gunakan currentTime.value agar reactive
  const diff = new Date(order.expiresAt) - currentTime.value;
  if (diff <= 0) return "Expired";

  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const hours = Math.floor(diff / 1000 / 60 / 60);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")} left`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")} left`;
};

onMounted(() => {
  // ✅ Update currentTime setiap detik
  const interval = setInterval(() => {
    currentTime.value = Date.now();
  }, 1000);
  
  onUnmounted(() => clearInterval(interval));
});
watch(
  () => props.orders,
  (newOrders) => {
    // Force re-check expiresAt
    if (newOrders && newOrders.length > 0) {
      newOrders.forEach(order => {
        if (order.paymentStatus === 'pending' && !order.expiresAt) {
          console.warn('⚠️ Order missing expiresAt:', order.orderNumber);
        }
      });
    }
  },
  { deep: true, immediate: true }
);
</script>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
