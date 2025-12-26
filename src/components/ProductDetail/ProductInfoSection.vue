<!-- ProductInfoSection.vue - Updated dengan LoginModal Integration -->
<template>
  <div class="space-y-6">
    <!-- Product Title -->
    <div>
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800 leading-tight mb-2">
        {{ getProductTitle(product) }}
      </h1>
    </div>

    <!-- Price with Enhanced Design -->
    <div class="flex items-center space-x-3">
      <span
        class="text-lg font-bold text-blue-600 bg-gradient-to-r from-blue-100 to-cyan-100 px-3 py-2 rounded-lg shadow-sm"
      >
        Rp{{ formatPrice(product?.price) }}
      </span>
    </div>

    <!-- Rating, Reviews, and Stock -->
    <div class="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
      <!-- Rating Display -->
      <div v-if="product?.rating" class="flex items-center space-x-3">
        <!-- Star Rating -->
        <div class="flex items-center">
          <div class="flex">
            <span
              v-for="i in 5"
              :key="i"
              :class="i <= Math.floor(product?.rating) ? 'text-amber-400' : 'text-gray-300'"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                />
              </svg>
            </span>
          </div>
          <span class="text-sm font-medium text-gray-700 ml-2">
            {{ formatRatingDisplay(product?.rating) }}
          </span>
        </div>

        <!-- Reviews Count -->
        <div v-if="product?.reviews" class="flex items-center space-x-1">
          <svg class="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
          </svg>
          <span class="text-sm text-gray-600">{{ product?.reviews }}</span>
        </div>
      </div>

      <!-- Zero Rating Display -->
      <div v-else class="flex items-center space-x-3">
        <div class="flex items-center">
          <div class="flex">
            <span v-for="i in 5" :key="i" class="text-gray-300">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                />
              </svg>
            </span>
          </div>
          <span class="text-sm font-medium text-gray-500 ml-2">0</span>
        </div>

        <div class="flex items-center space-x-1">
          <svg class="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
          </svg>
          <span class="text-sm text-gray-500">0</span>
        </div>
      </div>

      <!-- Stock Info -->
      <span class="text-sm text-gray-600 font-medium"> {{ product?.stock || 0 }} in stock </span>
    </div>

    <!-- Store Info - TAMBAH @click handler dan cursor-pointer -->
    <div
      @click="navigateToStore"
      class="flex items-center space-x-3 py-3 px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
    >
      <img
        :src="getSellerLogo(product)"
        :alt="getSellerName(product)"
        class="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-gray-200 group-hover:border-blue-400 transition-colors"
        @error="$emit('logoError', $event)"
      />
      <div class="flex-1">
        <div class="flex items-center space-x-2">
          <span class="text-gray-800 font-medium group-hover:text-blue-600 transition-colors">
            {{ getSellerName(product) }}
          </span>
          <!-- Online Status Indicator -->
          <span
            :class="['w-2 h-2 rounded-full', isSellerOnline(product) ? 'bg-green-500' : 'bg-gray-400']"
            :title="getSellerStatus(product)"
          ></span>
        </div>
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-600">Official Store</div>
          <span class="text-xs text-gray-500">
            {{ getSellerLastSeen(product) }}
          </span>
        </div>
      </div>
      <svg
        class="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </div>

    <!-- Description -->
    <div class="space-y-3">
      <h3 class="text-lg font-semibold text-gray-800">Description</h3>
      <p class="text-gray-600 leading-relaxed">
        {{ product?.description || "No description available for this product." }}
      </p>
    </div>

    <!-- Quantity Selector and Add to Cart -->
    <div class="space-y-4 pt-4 border-t border-gray-400">
      <!-- Quantity Selector -->
      <div class="flex items-center space-x-4">
        <span class="text-sm font-medium text-gray-700">Quantity:</span>
        <div class="flex items-center border border-gray-300 rounded-lg overflow-hidden">
          <button
            @click="$emit('decreaseQuantity')"
            :disabled="quantity <= 1"
            class="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
            </svg>
          </button>
          <input
            :value="quantity"
            @input="updateQuantity"
            type="number"
            min="1"
            :max="maxQuantity"
            class="w-16 px-3 py-2 text-center border-x border-gray-300 focus:outline-none focus:border-orange-500"
            @change="$emit('validateQuantity')"
          />
          <button
            @click="$emit('increaseQuantity')"
            :disabled="quantity >= maxQuantity"
            class="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
          </button>
        </div>
        <span class="text-sm text-gray-500">Max: {{ maxQuantity }}</span>
      </div>
      <!-- Add to Cart Button -->
      <button
        @click="handleAddToCart"
        :disabled="isCartLoading || (product?.stock || 0) === 0"
        class="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
      >
        <span v-if="isCartLoading">
          <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </span>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 2.5M7 13l2.5 2.5M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z"
          ></path>
        </svg>
        <span>
          {{ isCartLoading ? "Adding..." : "Add to Cart" }}
        </span>
      </button>
    </div>

    <!-- Enhanced Login Modal -->
    <AuthModal
      :show="showLoginModal"
      :isLoading="loginModalLoading"
      @close="closeLoginModal"
      @success="handleLoginSuccess"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import AuthModal from "../Auth/AuthModal.vue"
import { useToast } from "@/composables/useToast";

// Router & Toast
const router = useRouter();
const { success: showSuccess } = useToast();

// Props (sama seperti sebelumnya)
const props = defineProps({
  product: {
    type: Object,
    default: null,
  },
  quantity: {
    type: Number,
    required: true,
  },
  maxQuantity: {
    type: Number,
    required: true,
  },
  isCartLoading: {
    type: Boolean,
    default: false,
  },
  isAuthenticated: {
    type: Boolean,
    default: false,
  },
  getProductTitle: {
    type: Function,
    required: true,
  },
  formatPrice: {
    type: Function,
    required: true,
  },
  formatRatingDisplay: {
    type: Function,
    required: true,
  },
  getSellerLogo: {
    type: Function,
    required: true,
  },
  getSellerName: {
    type: Function,
    required: true,
  },
});

// Emits (sama seperti sebelumnya)
const emit = defineEmits([
  "increaseQuantity",
  "decreaseQuantity",
  "validateQuantity",
  "addToCart",
  "logoError",
  "update:quantity",
]);

// Local state untuk modal
const showLoginModal = ref(false);
const loginModalLoading = ref(false);

// Methods
const updateQuantity = event => {
  const newQuantity = parseInt(event.target.value) || 1;
  emit("update:quantity", newQuantity);
};

// Handler untuk Add to Cart - cek authentication dulu
const handleAddToCart = () => {
  if (!props.isAuthenticated) {
    // Jika user belum login, tampilkan modal
    showLoginModal.value = true;
    return;
  }

  // Jika user sudah login, lanjutkan proses normal
  emit("addToCart");
};

// Handler untuk navigate ke store profile
const navigateToStore = () => {
  const storeSlug = props.product?.seller?.slug || props.product?.storeSlug;

  if (storeSlug) {
    router.push(`/stores/${storeSlug}`);
  } else {
    console.warn("Store slug not available");
  }
};

// Handler untuk close modal
const closeLoginModal = () => {
  showLoginModal.value = false;
  loginModalLoading.value = false;
};

const getSellerLastSeen = product => {
  const lastSeen = product?.seller?.lastSeen;

  if (!lastSeen) return "status unknown";

  const lastSeenDate = new Date(lastSeen);
  const now = new Date();
  const diffMs = now - lastSeenDate;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "online now";
  if (diffMins < 60) return `Active ${diffMins}m ago`;
  if (diffHours < 24) return `Active ${diffHours}h ago`;
  if (diffDays < 7) return `Active ${diffDays}d ago`;

  return lastSeenDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};
const isSellerOnline = product => {
  const lastSeen = product?.seller?.lastSeen;

  if (!lastSeen) return false;

  const lastSeenDate = new Date(lastSeen);
  const now = new Date();
  const diffMins = Math.floor((now - lastSeenDate) / 60000);

  // Dianggap online jika terakhir seen kurang dari 5 menit yang lalu
  return diffMins < 5;
};

// Helper method untuk tooltip status
const getSellerStatus = product => {
  const lastSeen = product?.seller?.lastSeen;

  if (!lastSeen) return "Status unknown";

  const isOnline = isSellerOnline(product);
  const lastSeenText = getSellerLastSeen(product);

  return isOnline ? "Online" : `Last active: ${lastSeenText}`;
};
// Handler untuk login/register success
const handleLoginSuccess = type => {
  loginModalLoading.value = false;
  showLoginModal.value = false;

  // Show success message
  const message =
    type === "login"
      ? "Successfully logged in! You can now add items to cart."
      : "Account created successfully! You can now add items to cart.";

  showSuccess(message);

  // Auto-trigger add to cart setelah berhasil login/register
  setTimeout(() => {
    if (props.isAuthenticated) {
      emit("addToCart");
    }
  }, 1000);
};

// Removed old redirect handlers - tidak dibutuhkan lagi
</script>

<style scoped>
/* Enhanced input styling */
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style>
