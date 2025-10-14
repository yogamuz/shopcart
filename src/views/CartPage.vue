<!-- CartPage.vue - Clean Template -->
<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <CartHeader :cart-count="cartStore.cartCount" />

      <CartEmptyState v-if="cartStore.cartCount === 0 && !cartStore.isLoading" />

      <div v-else class="bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in-up relative">
        <!-- Loading Overlay -->
        <div
          v-if="cartStore.isLoading"
          class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10"
        >
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>

        <!-- Cart Header (Desktop) -->
        <div class="hidden md:grid grid-cols-12 bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-4 font-medium">
          <div class="col-span-5">Product</div>
          <div class="col-span-2 text-center">Price</div>
          <div class="col-span-2 text-center">Quantity</div>
          <div class="col-span-2 text-center">Subtotal</div>
          <div class="col-span-1 text-right">Action</div>
        </div>

        <!-- Cart Items - Simplified -->
        <div class="divide-y divide-gray-100">
          <CartItem
            v-for="(item, index) in sortedCartItems"
            :key="getItemKey(item)"
            :item="item"
            :item-index="index"
            :previous-item="index > 0 ? sortedCartItems[index - 1] : null"
            :is-cart-loading="cartStore.isLoading"
            :format-currency="formatCurrency"
            :handle-image-error="handleImageError"
            :increase-quantity="increaseQuantity"
            :decrease-quantity="decreaseQuantity"
            :confirm-remove-item="confirmRemoveItem"
            :applied-coupon="cartStore.appliedCoupon"
            :applied-coupon-category-subtotal="appliedCouponCategorySubtotal"
          />
        </div>

        <CartSummary
          :coupon-code="couponCode"
          :applied-coupon="cartStore.appliedCoupon"
          :cart-count="cartStore.cartCount"
          :subtotal="cartStore.subtotal"
          :discount-amount="cartStore.discountAmount"
          :shipping-cost="shippingCost"
          :tax="tax"
          :total="cartStore.total"
          :is-cart-loading="cartStore.isLoading"
          :format-currency="formatCurrency"
          @update:coupon-code="couponCode = $event"
          @apply-coupon="applyCoupon"
          @remove-coupon="removeCoupon"
          @proceed-to-checkout="showCheckoutModal"
          @confirm-clear-cart="confirmClearCart"
        />
      </div>

      <!-- Continue Shopping -->
      <div class="mt-8 text-center animate-bounce-in">
        <router-link
          to="/"
          class="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
          </svg>
          Continue Shopping
        </router-link>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <CartConfirmModal
      :show="showCartConfirmModal"
      :title="cartConfirmModal.title"
      :message="cartConfirmModal.message"
      :confirm-text="cartConfirmModal.confirmText"
      :type="cartConfirmModal.type || 'danger'"
      :is-processing="cartConfirmModal.isProcessing || false"
      :on-confirm="cartConfirmModal.onConfirm"
      :on-cancel="() => (showCartConfirmModal = false)"
    />
  </div>
</template>
<script setup>
import { ref, computed, onMounted, watch, nextTick, provide } from "vue";
import { debounce } from "lodash";
import { useRouter } from "vue-router";
import { useCartStore } from "@/stores/cartStore.js";
import CartHeader from "@/components/cart/CartHeader.vue";
import CartEmptyState from "@/components/cart/CartEmptyState.vue";
import CartItem from "@/components/cart/CartItem.vue";
import CartSummary from "@/components/cart/CartSummary.vue";
import CartConfirmModal from "@/components/cart/CartConfirmModal.vue";

const router = useRouter();
const cartStore = useCartStore();

// Provide cartStore to child components
provide("cartStore", cartStore);

// Local reactive data
const couponCode = ref("");
const showCartConfirmModal = ref(false);

const cartConfirmModal = ref({
  title: "",
  message: "",
  confirmText: "",
  onConfirm: () => {},
});

// Track pending updates for immediate UI feedback
const pendingQuantityUpdates = ref(new Map());

// Helper function to get unique key for cart items
const getItemKey = item => {
  return item.product?._id || item.product?.id || item.productId || item._id || item.id;
};

// Sort cart items by store name to group them together
const sortedCartItems = computed(() => {
  if (!cartStore.cartItems || cartStore.cartItems.length === 0) {
    return [];
  }

  // Create a copy to avoid mutating the original array
  const items = [...cartStore.cartItems];

  // Sort by store name
  return items.sort((a, b) => {
    const storeA = (a.product?.seller?.name || "Unknown Store").toLowerCase();
    const storeB = (b.product?.seller?.name || "Unknown Store").toLowerCase();
    return storeA.localeCompare(storeB);
  });
});

const appliedCouponCategorySubtotal = computed(() => {
  if (!cartStore.appliedCoupon || !cartStore.appliedCoupon.category) return 0;

  const categoryItems = cartStore.cartItems.filter(item => {
    const product = item.product || item;
    return product.category?.name?.toLowerCase() === cartStore.appliedCoupon.category.toLowerCase();
  });

  return categoryItems.reduce((sum, item) => {
    const product = item.product || item;
    const price = product.price || item.priceAtAddition || 0;
    return sum + price * item.quantity;
  }, 0);
});

const shippingCost = computed(() => {
  if (cartStore.appliedCoupon?.freeShipping || cartStore.subtotal > 50000) return 0;
  return 10000;
});

const tax = computed(() => {
  const taxableAmount = cartStore.subtotal - cartStore.discountAmount;
  return taxableAmount * 0.08;
});

// Methods - keep existing logic
const formatCurrency = amount => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const handleImageError = event => {
  event.target.src = "https://via.placeholder.com/150x150/f3f4f6/9ca3af?text=No+Image";
};

// Debounced API update function - will batch rapid clicks
const debouncedUpdateQuantity = debounce(async (productId, newQuantity) => {
  try {
    console.log(`Sending API call for ${productId}: ${newQuantity}`);
    const result = await cartStore.updateCartItem(productId, newQuantity);

    if (!result.success) {
      console.error("API update failed, refreshing cart...");
      await cartStore.refreshCart();
    }

    // Clear pending update
    pendingQuantityUpdates.value.delete(productId);
  } catch (error) {
    console.error("Debounced quantity update failed:", error);
    // Refresh cart to get correct state
    await cartStore.refreshCart();
    pendingQuantityUpdates.value.delete(productId);
  }
}, 800); // 800ms delay

// Optimistic quantity increase with debounced API call
const increaseQuantity = productId => {
  const currentItem = cartStore.cartItems.find(item => getItemKey(item) === productId);

  if (!currentItem) return;

  // Check stock first
  if (currentItem.product.stock > 0 && currentItem.quantity >= currentItem.product.stock) {
    alert(`Only ${currentItem.product.stock} items available`);
    return;
  }

  // Update UI immediately
  currentItem.quantity += 1;

  // Track pending update
  pendingQuantityUpdates.value.set(productId, currentItem.quantity);

  // Debounced API call
  debouncedUpdateQuantity(productId, currentItem.quantity);
};

// Optimistic quantity decrease with debounced API call
const decreaseQuantity = productId => {
  const currentItem = cartStore.cartItems.find(item => getItemKey(item) === productId);

  if (!currentItem || currentItem.quantity <= 1) return;

  // Update UI immediately
  currentItem.quantity -= 1;

  // Track pending update
  pendingQuantityUpdates.value.set(productId, currentItem.quantity);

  // Debounced API call
  debouncedUpdateQuantity(productId, currentItem.quantity);
};

const applyCoupon = async () => {
  if (!couponCode.value.trim()) return;

  try {
    const result = await cartStore.applyCoupon(couponCode.value.trim());
    if (result.success) {
      couponCode.value = "";
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error("Failed to apply coupon:", error);
    throw error;
  }
};

const removeCoupon = async () => {
  try {
    const result = await cartStore.removeCoupon();
    if (!result.success) {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error("Failed to remove coupon:", error);
    throw error;
  }
};

const confirmRemoveItem = item => {
  const productId = getItemKey(item);
  const productName = item.product?.title || item.product?.name || item.title || item.name || "this item";

  cartConfirmModal.value = {
    title: "Remove Item",
    message: `Are you sure you want to remove "${productName}" from your cart?`,
    confirmText: "Remove",
    onConfirm: async () => {
      try {
        const result = await cartStore.removeFromCart(productId);
        if (result.success) {
          showCartConfirmModal.value = false;
        } else {
          console.error("Failed to remove item:", result.message);
          alert(result.message || "Failed to remove item");
          showCartConfirmModal.value = false;
        }
      } catch (error) {
        console.error("Failed to remove item:", error);
        alert(error.message || "Failed to remove item");
        showCartConfirmModal.value = false;
      }
    },
  };
  showCartConfirmModal.value = true;
};

const confirmClearCart = () => {
  cartConfirmModal.value = {
    title: "Clear Cart",
    message: "Are you sure you want to remove all items from your cart? This action cannot be undone.",
    confirmText: "Clear All",
    onConfirm: async () => {
      try {
        const result = await cartStore.clearCart();
        if (result.success) {
          showCartConfirmModal.value = false;
        } else {
          console.error("Failed to clear cart:", result.message);
          alert(result.message || "Failed to clear cart");
          showCartConfirmModal.value = false;
        }
      } catch (error) {
        console.error("Failed to clear cart:", error);
        alert(error.message || "Failed to clear cart");
        showCartConfirmModal.value = false;
      }
    },
  };
  showCartConfirmModal.value = true;
};

const showCheckoutModal = () => {
  if (cartStore.cartCount === 0) {
    alert("Your cart is empty");
    return;
  }
  // LANGSUNG REDIRECT KE ORDERS PAGE
  router.push("/orders/checkout");
};

// Watch for store errors
watch(
  () => cartStore.error,
  error => {
    if (error) {
      console.error("Cart store error:", error);
      cartStore.clearError();
    }
  }
);

onMounted(async () => {
  try {
    console.log("Initializing cart from API...");
    await cartStore.initializeCart();
    await nextTick();
    console.log("Cart initialized:", {
      count: cartStore.cartCount,
      items: cartStore.cartItems.length,
    });
  } catch (error) {
    console.error("Failed to initialize cart:", error);
  }
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.store-header {
  margin-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.store-header:first-child {
  margin-top: 0;
  border-top: none;
}

/* Animations */
.animate-fade-in-down {
  animation: fadeInDown 0.6s ease-out forwards;
}

.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
}

.animate-fade-in-left {
  animation: fadeInLeft 0.6s ease-out forwards;
}

.animate-fade-in-right {
  animation: fadeInRight 0.6s ease-out forwards;
}

.animate-bounce-in {
  animation: bounceIn 0.8s ease-out forwards;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

@media (max-width: 767px) {
  .line-clamp-2 {
    -webkit-line-clamp: 2;
  }

  .line-clamp-1 {
    -webkit-line-clamp: 1;
  }

  .grid > div {
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
  }
}
</style>
