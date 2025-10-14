<!-- ProductDetail.vue - Tambah isAuthenticated prop saja -->
<template>
  <div class="bg-white">
    <Header />
    <Navbar />

    <!-- Flying Image Animation -->
    <FlyingImageAnimation :show="showFlyingImage" :props="flyingImageProps" />

    <!-- Warning Modal -->
    <WarningModal
      :show="showWarningModal"
      :message="warningMessage"
      @close="closeWarningModal"
    />

    <main class="py-20 sm:py-24 md:py-32 lg:py-25 relative overflow-hidden">
      <!-- Initial Loading State -->
      <div
        v-if="isProductLoading && !previousProduct"
        class="text-center py-12"
      >
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Loading />
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p class="text-lg text-red-600 mb-4">{{ error }}</p>
          <button
            @click="loadProductData"
            class="text-amber-600 hover:underline"
          >
            Try again
          </button>
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
              <!-- Product Images -->
              <ProductImageSection
                ref="productImageSection"
                :product="normalizedProduct"
                :isLiked="isLiked"
                :getProductImage="getProductImage"
                :getProductTitle="getProductTitle"
                @toggle-like="handleToggleLike"
                @image-error="handleImageError"
                @image-load="handleImageLoad"
              />

              <!-- Product Info Section - TAMBAH isAuthenticated prop -->
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
                @add-to-cart="handleAddToCart"
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
            <!-- Product Reviews - TAMBAH SECTION INI -->
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

      <!-- ProductDetail.vue - Update error message -->
      <div v-else class="text-center py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p class="text-lg text-gray-600">Product not found</p>
          <p class="text-sm text-gray-500 mt-2">
            Product Slug: {{ route.params.slug }}
            <!-- Ubah dari route.params.id -->
          </p>
          <router-link
            to="/"
            class="mt-4 inline-block text-amber-600 hover:underline"
            >Back to home</router-link
          >
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

// Layout Components
import Navbar from "@/components/Layout/Navbar/Navbar.vue";
import Header from "@/components/Layout/Header.vue";
import Footer from "@/components/Layout/Footer.vue";
import Loading from "@/components/common/Loading.vue";

// ProductDetail Sub-Components
import FlyingImageAnimation from "@/components/ProductDetail/FlyingImageAnimation.vue";
import ProductBreadcrumb from "@/components/ProductDetail/ProductBreadcrumb.vue";
import ProductImageSection from "@/components/ProductDetail/ProductImageSection.vue";
import ProductInfoSection from "@/components/ProductDetail/ProductInfoSection.vue";
import RelatedProducts from "@/components/ProductDetail/RelatedProducts.vue";
import ProductReviews from "@/components/ProductDetail/ProductReviews.vue";
import WarningModal from "@/components/ProductDetail/WarningModal.vue";

// UPDATED IMPORTS - Consolidated import from refactored composable
import { useProductDetail } from "@/composables/useProduct";
import { useAuth } from "@/composables/useAuth";

// Route and Router setup - UNCHANGED
const route = useRoute();
const router = useRouter();

// Product Image Section Reference - UNCHANGED
const productImageSection = ref(null);

// Auth composable - UNCHANGED
const { isAuthenticated } = useAuth();

// CONSOLIDATED COMPOSABLE - All logic now comes from one place
const {
  // State - SAME NAMES as before
  quantity,
  relatedProducts,
  productReviews,
  reviewsRatingStats,
  reviewsPagination,
  isReviewsLoading,
  reviewsError,
  previousProduct,
  isLiked,
  showFlyingImage,
  flyingImageProps,
  showWarningModal,
  warningMessage,

  // Computed - SAME NAMES as before
  normalizedProduct,
  isProductLoading,
  error,
  maxQuantity,
  currentProduct,

  // Cart state - SAME NAMES as before
  cartCount,
  isCartLoading,

  // Methods - SAME NAMES as before
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

  // Lifecycle - SAME NAMES as before
  initializeComponent,
  watchCartCount,
  watchRouteChanges,

  // Helper functions - SAME NAMES as before (now from utils via composable)
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

// Lifecycle hooks - UNCHANGED
onMounted(async () => {
  await initializeComponent();
  watchCartCount();
  watchRouteChanges();
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
