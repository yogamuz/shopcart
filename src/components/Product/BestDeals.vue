<!-- bestdeals.vue -->
<template>
  <section class="py-12 px-4 sm:px-6 lg:px-8 bg-white">
    <div class="max-w-7xl mx-auto">
      <h2 class="text-3xl font-bold text-gray-900 mb-8">
        Today's Best Deals For You!
      </h2>

      <!-- Loading state -->
      <div v-if="loading" class="flex justify-center items-center h-64">
        <div
          class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-main"
        ></div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="text-center py-8">
        <p class="text-red-500">
          Failed to load products. Please try again later.
        </p>
        <button
          @click="fetchProducts"
          class="mt-4 px-4 py-2 bg-green-main text-white rounded-md hover:bg-green-main transition-colors"
        >
          Retry
        </button>
      </div>

      <!-- Success state with sliding animation -->
      <div
        v-else
        class="sliding-container overflow-hidden"
        @mouseenter="stopSliding"
        @mouseleave="startSliding"
        @touchstart="stopSliding"
        @touchend="startSliding"
      >
        <div
          class="sliding-wrapper flex gap-6 pb-4"
          :style="{ transform: `translateX(${translateX}px)` }"
        >
          <!-- Original products -->
          <BestDealsCard
            v-for="product in products"
            :key="product.id"
            :product="product"
            :cart-items="cartItems"
            :is-cart-loading="isCartLoading"
            @toggle-like="toggleLike"
            @add-to-cart="handleAddToCart"
          />

          <!-- Duplicate products for seamless loop -->
          <BestDealsCard
            v-for="product in products"
            :key="`duplicate-${product.id}`"
            :product="product"
            :cart-items="cartItems"
            :is-cart-loading="isCartLoading"
            @toggle-like="toggleLike"
            @add-to-cart="handleAddToCart"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import bestDeals from "@/data/bestdeals.json";
import BestDealsCard from "@/components/Product/BestDealsCard.vue";

// Cart composable
const {
  cartItems,
  cartCount,
  cartTotal,
  isCartLoading,
  addToCart,
  isInCart,
  getItemQuantity,
  initializeCart
} = useCart();

const products = ref(bestDeals);
const loading = ref(false);
const error = ref(false);
const translateX = ref(0);
const animationId = ref(null);

// Local quantity state (tidak mempengaruhi cart sampai add to cart diklik)
const localQuantities = ref({});

// Animation variables
const cardWidth = 280; // Update sesuai dengan min-width di BestDealsCard (280px)
const gap = 24; // gap-6 = 24px
const cardPlusGap = cardWidth + gap;
const animationSpeed = 0.5; // Diperlambat untuk smoother animation

// Get local quantity for a product
const getLocalQuantity = (productId) => {
  return localQuantities.value[productId] || 1;
};

// Set local quantity for a product
const setLocalQuantity = (productId, quantity) => {
  if (quantity >= 1) {
    localQuantities.value[productId] = quantity;
  }
};

// Handle increment local quantity (+1) - tidak mempengaruhi cart
const handleIncrementLocal = (product) => {
  const currentQuantity = getLocalQuantity(product.id);
  setLocalQuantity(product.id, currentQuantity + 1);
  console.log(`Local quantity for ${product.title}: ${getLocalQuantity(product.id)}`);
};

// Handle decrement local quantity (-1) - tidak mempengaruhi cart
const handleDecrementLocal = (product) => {
  const currentQuantity = getLocalQuantity(product.id);
  if (currentQuantity > 1) {
    setLocalQuantity(product.id, currentQuantity - 1);
    console.log(`Local quantity for ${product.title}: ${getLocalQuantity(product.id)}`);
  }
};

// Start sliding animation
const startSliding = () => {
  if (animationId.value) return; // Prevent multiple animations

  const animate = () => {
    translateX.value -= animationSpeed;

    // Calculate reset point berdasarkan total width dari original products
    const totalOriginalWidth = cardPlusGap * products.value.length;
    
    // Reset position seamlessly ketika sudah melewati semua original cards
    if (Math.abs(translateX.value) >= totalOriginalWidth) {
      translateX.value = translateX.value + totalOriginalWidth;
    }

    animationId.value = requestAnimationFrame(animate);
  };

  animationId.value = requestAnimationFrame(animate);
};

// Stop sliding animation
const stopSliding = () => {
  if (animationId.value) {
    cancelAnimationFrame(animationId.value);
    animationId.value = null;
  }
};

// Toggle like function
const toggleLike = (productId) => {
  const product = products.value.find((p) => p.id === productId);
  if (product) {
    product.isLiked = !product.isLiked;
  }
};

// Enhanced add to cart function
const handleAddToCart = (product) => {
  console.log("Adding to cart:", product);
  
  // Check if product is already in cart
  if (isInCart(product.id)) {
    console.log(`${product.title} is already in cart`);
    return;
  }
  
  // Use the cart composable to add item
  const success = addToCart(product);
  
  if (success) {
    console.log(`Successfully added ${product.title} to cart`);
    console.log(`Current cart count: ${cartCount.value}`);
    console.log(`Current cart total: Rp${cartTotal.value.toLocaleString('id-ID')}`);
  } else {
    console.error("Failed to add product to cart");
  }
};

// Fetch products function (if needed for retry)
const fetchProducts = () => {
  loading.value = true;
  error.value = false;

  // Simulate API call
  setTimeout(() => {
    loading.value = false;
    // Add any fetch logic here if needed
  }, 1000);
};

onMounted(() => {
  // Initialize cart when component mounts
  initializeCart();
  
  // Start sliding animation
  startSliding();
});

onUnmounted(() => {
  stopSliding();
});

// Expose cart data for debugging (optional)
defineExpose({
  cartItems,
  cartCount,
  cartTotal,
  isCartLoading,
  localQuantities
});
</script>

<style scoped>
/* Sliding container */
.sliding-container {
  width: 100%;
  position: relative;
}

.sliding-wrapper {
  transition: none; /* Remove transition for smooth animation */
}

/* Fixed card dimensions */
.product-card {
  min-height: 400px; /* Ensure consistent height */
  max-height: 400px;
  width: 280px; /* Fixed width sesuai dengan BestDealsCard */
}

/* Line clamp for description */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .product-card {
    width: 16rem;
  }
}

@media (max-width: 640px) {
  .product-card {
    width: 14rem;
  }
}

/* Remove the CSS hover pause since we're using JavaScript events */
</style>