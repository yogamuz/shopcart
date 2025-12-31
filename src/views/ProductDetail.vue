<!-- ProductDetail.vue - COMPLETE FIXED VERSION WITH FLYING ANIMATION -->
<template>
  <div class="bg-white">
    <Navbar />

    <!-- Flying Image Animation -->
    <FlyingImageAnimation :show="showFlyingImage" :props="flyingImageProps" />

    <!-- Warning Modal -->
    <WarningModal :show="showWarningModal" :message="warningMessage" @close="closeWarningModal" />

    <main class="py-20 sm:py-24 md:py-32 lg:py-25 relative overflow-hidden">
      <!-- Initial Loading State -->
      <div v-if="isProductLoading && !previousProduct" class="text-center py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Loading />
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p class="text-lg text-red-600 mb-4">{{ error }}</p>
          <button @click="loadProductData" class="text-amber-600 hover:underline">Try again</button>
        </div>
      </div>

      <!-- Product Detail Content -->
      <div v-else-if="currentProduct || previousProduct" class="w-full">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <!-- Overlay Loading -->
          <div v-if="isProductLoading" class="overlay-loading">
            <Loading />
          </div>

          <!-- Content with reduced opacity during loading -->
          <div :class="{ 'opacity-50 pointer-events-none': isProductLoading }">
            <!-- Breadcrumb Navigation -->
            <ProductBreadcrumb
              :product="currentProduct || previousProduct"
              :getCategorySlug="getCategorySlug"
              :getCategoryName="getCategoryName"
              :getProductTitle="getProductTitle"
            />

            <!-- Product Detail Section -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <!-- ✅ FIX: Product Images dengan ref -->
              <ProductImageSection
                ref="productImageRef"
                :product="normalizedProduct"
                :isLiked="isLiked"
                :getProductImage="getProductImage"
                :getProductTitle="getProductTitle"
                @toggle-like="handleToggleLike"
                @image-error="handleImageError"
                @image-load="handleImageLoad"
              />

              <!-- ✅ FIX: Product Info Section dengan handler baru -->
              <ProductInfoSection
                :product="normalizedProduct"
                :quantity="quantity"
                :maxQuantity="maxQuantity"
                :isCartLoading="isCartLoading"
                :isAuthenticated="isAuthenticated"
                :getProductTitle="getProductTitle"
                :formatPrice="formatPrice"
                :formatRatingDisplay="formatRatingDisplay"
                :getSellerLogo="getSellerLogo"
                :getSellerName="getSellerName"
                @increase-quantity="handleIncreaseQuantity"
                @decrease-quantity="handleDecreaseQuantity"
                @validate-quantity="validateQuantity"
                @add-to-cart="handleAddToCartClick"
                @logo-error="handleLogoError"
                v-model:quantity="quantity"
              />
            </div>

            <!-- Related Products -->
            <RelatedProducts
              v-if="relatedProducts.length > 0"
              :products="relatedProducts"
              :getProductImage="getProductImage"
              :getProductTitle="getProductTitle"
              :formatPrice="formatPrice"
              :formatRatingDisplay="formatRatingDisplay"
              :getSellerLogo="getSellerLogo"
              :getSellerName="getSellerName"
              :getPlaceholderImage="getPlaceholderImage"
              @product-click="navigateToProduct"
              @toggle-like="handleRelatedLike"
              @logo-error="handleLogoError"
            />

            <!-- Product Reviews -->
            <div class="mt-12">
              <ProductReviews
                :reviews="productReviews"
                :ratingStats="reviewsRatingStats"
                :pagination="reviewsPagination"
                :isLoading="isReviewsLoading"
                :error="reviewsError"
                @retry="retryLoadReviews"
                @changePage="handleReviewsPageChange"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Not Found State -->
      <div v-else class="text-center py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p class="text-lg text-gray-600">Product not found</p>
          <p class="text-sm text-gray-500 mt-2">Product ID: {{ route.params.productId || route.params.slug }}</p>
          <router-link to="/" class="mt-4 inline-block text-amber-600 hover:underline">Back to home</router-link>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";

// Layout Components
import Navbar from "@/components/Layout/Navbar/Navbar.vue";
import Footer from "@/components/Layout/Footer.vue";
import Loading from "@/components/Common/Loading.vue";

// ProductDetail Sub-Components
import FlyingImageAnimation from "@/components/ProductDetail/FlyingImageAnimation.vue";
import ProductBreadcrumb from "@/components/ProductDetail/ProductBreadCrumb.vue";
import ProductImageSection from "@/components/ProductDetail/ProductImageSection.vue";
import ProductInfoSection from "@/components/ProductDetail/ProductInfoSection.vue";
import RelatedProducts from "@/components/ProductDetail/RelatedProducts.vue";
import ProductReviews from "@/components/ProductDetail/ProductReviews.vue";
import WarningModal from "@/components/ProductDetail/WarningModal.vue";

// Composables
import { useProductDetail } from "@/composables/useProduct";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";

// ============================================================================
// SETUP
// ============================================================================

const route = useRoute();
const router = useRouter();
const productImageRef = ref(null); // ✅ TAMBAHAN: ref untuk ProductImageSection

// Auth
const { isAuthenticated } = useAuthStore();

// Cart store for watcher
const cartStore = useCartStore();

// ✅ CRITICAL: Watcher stop functions at COMPONENT level (not composable)
let routeWatcherStop = null;
let cartWatcherStop = null;

// ============================================================================
// COMPOSABLE - Get all product detail logic
// ============================================================================

const {
  // State
  quantity,
  currentProduct,
  previousProduct,
  normalizedProduct,
  isProductLoading,
  error,

  // Reviews
  productReviews,
  reviewsRatingStats,
  reviewsPagination,
  isReviewsLoading,
  reviewsError,

  // Related products
  relatedProducts,
  isRelatedLoading,

  // Wishlist
  isLiked,
  likedProducts,

  // UI
  showFlyingImage,
  flyingImageProps,
  showWarningModal,
  warningMessage,

  // Cart
  cartCount,
  isCartLoading,
  maxQuantity,

  // Methods
  loadProductData,
  loadProductReviews,
  handleReviewsPageChange,
  retryLoadReviews,
  handleIncreaseQuantity,
  handleDecreaseQuantity,
  validateQuantity,
  handleToggleLike,
  handleRelatedLike,
  navigateToProduct,
  handleAddToCart,
  handleImageLoad,
  handleImageError,
  closeWarningModal,
  initializeComponent,

  // Helpers
  getProductTitle,
  getCategoryName,
  getCategorySlug,
  getPlaceholderImage,
  getProductImage,
  getSellerLogo,
  getSellerName,
  formatPrice,
  formatRatingDisplay,
  getProductSlug,
  handleLogoError,
} = useProductDetail(route, router);

// ============================================================================
// ✅ TAMBAHAN: Wrapper method untuk add to cart dengan ref
// ============================================================================

const handleAddToCartClick = () => {
  handleAddToCart(productImageRef);
};

// ============================================================================
// LIFECYCLE - Component Level Watcher Management
// ============================================================================

onMounted(async () => {
  const componentId = Math.random().toString(36).substr(2, 9);
  // Initialize component - loads initial product
  await initializeComponent();

  // ✅ Setup CART watcher
  if (cartWatcherStop) {
    cartWatcherStop();
  }

  cartWatcherStop = watch(
    () => cartStore.cartCount,
    newCount => {}
  );

  // ✅ Setup ROUTE watcher
  if (routeWatcherStop) {
    routeWatcherStop();
  }

  routeWatcherStop = watch(
    () => route.params.productId || route.params.slug,
    async (newId, oldId) => {
      // ✅ CRITICAL: Only load if truly changed AND component already initialized
      if (newId && newId !== oldId && currentProduct.value !== null) {
        await nextTick();
        await loadProductData();
      } else {
      }
    }
  );
});

// ✅ CRITICAL: Cleanup watchers on unmount
onBeforeUnmount(() => {
  if (routeWatcherStop) {
    routeWatcherStop();
    routeWatcherStop = null;
  }

  if (cartWatcherStop) {
    cartWatcherStop();
    cartWatcherStop = null;
  }
});
</script>

<style scoped>
.overlay-loading {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 100;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
