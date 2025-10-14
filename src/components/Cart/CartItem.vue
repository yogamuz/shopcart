<!-- CartItem.vue - Self-contained Template -->
<template>
  <!-- Store Header (controlled by child) -->
  <div
    v-if="showStoreHeader"
    class="store-header bg-blue-50 p-3 border-b border-blue-200"
  >
    <div class="flex items-center space-x-3">
      <!-- Store Logo -->
      <img
        v-if="storeLogoUrl"
        :src="storeLogoUrl"
        :alt="`${storeName} Logo`"
        @error="handleStoreLogoError"
        class="w-8 h-8 rounded-full object-cover border border-gray-200 flex-shrink-0"
      />

      <!-- Store Icon (fallback jika tidak ada logo) -->
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5 text-blue-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-4 0H9m4 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v12m4 0V9m4 0h2m0 0V9a2 2 0 00-2-2h-2a2 2 0 00-2 2v2h6z"
        />
      </svg>

      <span class="font-semibold text-blue-800">{{ storeName }}</span>
    </div>
  </div>

  <div class="p-4 hover:bg-gray-50 transition-colors">
    <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
      <!-- Product Info (Mobile: Full width, Desktop: 5 columns) -->
      <div class="md:col-span-5 flex items-center space-x-4">
        <img
          :src="productImage"
          :alt="productName"
          @error="handleImageError"
          class="w-16 h-16 object-cover rounded-lg flex-shrink-0"
        />
        <div class="flex-1 min-w-0">
          <h3
            class="text-lg font-semibold text-gray-800 truncate"
            :title="productName"
          >
            {{ productName }}
          </h3>
          <p
            v-if="productDescription"
            class="text-sm text-gray-600 line-clamp-2 mt-1"
            :title="productDescription"
          >
            {{ productDescription }}
          </p>
          <p v-else class="text-sm text-gray-500 italic mt-1">
            No description available
          </p>
          <!-- Stock Info -->
          <p v-if="stock !== undefined" class="text-xs text-gray-500 mt-1">
            Stock: {{ stock }}
          </p>
        </div>
      </div>

      <!-- Price (Mobile: Inline, Desktop: 2 columns) -->
      <div class="md:col-span-2 md:text-center">
        <span class="text-lg font-medium text-gray-800">
          {{ formatCurrency(productPrice) }}
        </span>
      </div>

      <!-- Quantity Controls (Mobile: Inline, Desktop: 2 columns) -->
      <div class="md:col-span-2 md:flex md:justify-center">
        <div class="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
          <button
            @click="handleDecreaseQuantity"
            :disabled="currentQuantity <= 1"
            class="w-8 h-8 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            -
          </button>
          <span class="w-12 text-center font-medium">{{
            currentQuantity
          }}</span>
          <button
            @click="handleIncreaseQuantity"
            :disabled="stock > 0 && currentQuantity >= stock"
            class="w-8 h-8 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            +
          </button>
        </div>
      </div>

      <!-- Subtotal (Mobile: Inline, Desktop: 2 columns) -->
      <div class="md:col-span-2 md:text-center">
        <span class="text-lg font-semibold text-gray-800">
          {{ formatCurrency(currentSubtotal) }}
        </span>
        <div
          v-if="appliedCoupon && isItemDiscounted"
          class="text-sm text-green-600"
        >
          Discount applied!
        </div>
      </div>

      <!-- Remove Button (Mobile: Inline, Desktop: 1 column) -->
      <div class="md:col-span-1 md:text-right">
        <button
          @click="handleRemoveItem"
          :disabled="isCartLoading || isRemoving"
          class="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Remove item"
        >
          <svg
            v-if="!isRemoving"
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          <div
            v-else
            class="w-5 h-5 animate-spin rounded-full border-2 border-red-500 border-t-transparent"
          ></div>
        </button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed } from "vue";

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  itemIndex: {
    type: Number,
    required: true,
  },
  previousItem: {
    type: Object,
    default: null,
  },
  isCartLoading: {
    type: Boolean,
    default: false,
  },
  formatCurrency: {
    type: Function,
    required: true,
  },
  handleImageError: {
    type: Function,
    required: true,
  },
  increaseQuantity: {
    type: Function,
    required: true,
  },
  decreaseQuantity: {
    type: Function,
    required: true,
  },
  confirmRemoveItem: {
    type: Function,
    required: true,
  },
  appliedCoupon: {
    type: Object,
    default: null,
  },
  appliedCouponCategorySubtotal: {
    type: Number,
    default: 0,
  },
});

// Computed properties for product data from API structure
const product = computed(() => {
  return props.item?.product || props.item || {};
});

const productId = computed(() => {
  return (
    props.item?.productId || ''
  );
});

const productName = computed(() => {
  return product.value.title || product.value.name || "Unknown Product";
});

const productDescription = computed(() => {
  const desc = product.value.description || product.value.desc;
  return desc && desc.trim() ? desc.trim() : "";
});

const productPrice = computed(() => {
  return (
    props.item.unitPrice ||
    0
  );
});

const productImage = computed(() => {
  return (
    product.value.image?.url ||
    "/default-product.jpg"
  );
});

const storeName = computed(() => {
  return (
    product.value.seller?.name ||
    "Unknown Store"
  );
});

const storeLogoUrl = computed(() => {
  return (
    product.value.seller?.logo?.url ||
    product.value.seller?.logo ||
    null
  );
});
// NEW: Child determines when to show store header
const showStoreHeader = computed(() => {
  // Always show for first item
  if (props.itemIndex === 0) return true;

  // If no previous item data, show header
  if (!props.previousItem) return true;

  // Get previous store name
  const previousProduct = props.previousItem.product || props.previousItem;
  const previousStoreName =
    previousProduct.seller?.name ||
    "Unknown Store";

  // Show header if store is different from previous
  return storeName.value !== previousStoreName;
});

const handleStoreLogoError = (event) => {
  console.warn("Store logo failed to load:", event.target.src);
  // Hide logo jika error, fallback ke icon
  event.target.style.display = "none";
};

const stock = computed(() => {
  return product.value.stock !== undefined ? product.value.stock : undefined;
});

const currentQuantity = computed(() => {
  return props.item?.quantity || 0;
});

const currentSubtotal = computed(() => {
  return productPrice.value * currentQuantity.value;
});

const isItemDiscounted = computed(() => {
  if (!props.appliedCoupon || !props.appliedCoupon.category) return false;
  return product.value.category === props.appliedCoupon.category;
});

// Simple handlers - no loading states, instant UI feedback
const handleIncreaseQuantity = () => {
  if (stock.value > 0 && currentQuantity.value >= stock.value) return;
  props.increaseQuantity(productId.value);
};

const handleDecreaseQuantity = () => {
  if (currentQuantity.value <= 1) return;
  props.decreaseQuantity(productId.value);
};

const handleRemoveItem = () => {
  props.confirmRemoveItem(props.item);
};
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.store-header {
  margin-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.store-header:first-child {
  margin-top: 0;
  border-top: none;
}

@media (max-width: 767px) {
  .grid > div {
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
  }
}
</style>
