// composables/useProduct.js - COMPLETE FIXED VERSION
import { ref, computed } from "vue";
import { productService } from "@/services/productService";
import { useProductsStore } from "@/stores/productsStore";
import { useCartStore } from "@/stores/cartStore";
import { useProductNormalizer } from "@/composables/useProductNormalizer";

// dummy wishlist service using localStorage
const wishlistService = {
  wishlist: new Set(JSON.parse(localStorage.getItem("wishlist") || "[]")),

  isLiked(productId) {
    return this.wishlist.has(productId);
  },

  async toggleLike(productId) {
    if (this.wishlist.has(productId)) {
      this.wishlist.delete(productId);
    } else {
      this.wishlist.add(productId);
    }

    localStorage.setItem("wishlist", JSON.stringify([...this.wishlist]));

    return {
      success: true,
      isLiked: this.wishlist.has(productId),
    };
  },

  getWishlist() {
    return [...this.wishlist];
  },
};

// MAIN COMPOSABLE - useProductDetail
export function useProductDetail(route, router) {
  // Stores
  const productsStore = useProductsStore();
  const cartStore = useCartStore();
  const normalizer = useProductNormalizer();

  // ========== STATE ==========

  // Product state
  const currentProduct = ref(null);
  const previousProduct = ref(null);
  const isProductLoading = ref(false);
  const error = ref(null);

  // Reviews state
  const productReviews = ref([]);
  const reviewsRatingStats = ref(null);
  const reviewsPagination = ref(null);
  const isReviewsLoading = ref(false);
  const reviewsError = ref(null);

  // Related products state
  const relatedProducts = ref([]);
  const isRelatedLoading = ref(false);

  // Cart state
  const quantity = ref(1);
  const maxQuantity = ref(10);
  const isCartLoading = ref(false);

  // Wishlist state
  const isLiked = ref(false);
  const likedProducts = ref(new Set());

  // UI state
  const showFlyingImage = ref(false);
  const flyingImageProps = ref({});
  const showWarningModal = ref(false);
  const warningMessage = ref("");

  // ========== COMPUTED ==========

  const normalizedProduct = computed(() => {
    const product = currentProduct.value || previousProduct.value;
    if (!product) return null;
    return normalizer.normalizeProduct(product);
  });

  const cartCount = computed(() => cartStore.cartCount);

  // ========== HELPER FUNCTIONS ==========

  const getProductTitle = product => normalizer.getProductTitle(product);
  const getCategoryName = product => normalizer.getCategoryName(product);
  const getCategorySlug = product => normalizer.getCategorySlug(product);
  const getProductImage = product => normalizer.getProductImageUrl(product);
  const getPlaceholderImage = () => normalizer.getPlaceholderImageUrl();
  const getSellerLogo = product => normalizer.getSellerLogo(product);
  const getSellerName = product => normalizer.getSellerName(product);

  const formatPrice = price => {
    const numPrice = Number(price) || 0;
    const formatted = new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numPrice);
    return `${formatted}`;
  };

  const formatRatingDisplay = rating => normalizer.formatRating(rating);
  const getProductSlug = product => product?.slug || product?._id || product?.id;
  const handleLogoError = event => {
    event.target.style.display = "none";
  };

  // ========== PRODUCT DATA METHODS ==========

  const loadProductData = async () => {
    try {
      isProductLoading.value = true;
      error.value = null;

      const productId = route.params.productId || route.params.slug;

      if (!productId) {
        throw new Error("No product identifier provided");
      }

      
      const response = await productService.getProduct(productId);

      if (response.success) {
        if (currentProduct.value) {
          previousProduct.value = currentProduct.value;
        }

        const productData = response.data?.product || response.data;

        if (response.data?.similar) {
          productData._similarProducts = response.data.similar;
        }

        currentProduct.value = productData;

        const productIdentifier = productData._id || productData.id;
        isLiked.value = wishlistService.isLiked(productIdentifier);

        const stock = normalizer.normalizeStock(productData);
        maxQuantity.value = Math.min(stock || 10, 10);

        
        await Promise.all([loadRelatedProducts(), loadProductReviews()]);

        return productData;
      } else {
        throw new Error(response.message || "Product not found");
      }
    } catch (err) {
      console.error("❌ Error loading product:", err);
      error.value = err.message || "Failed to load product";
      throw err;
    } finally {
      isProductLoading.value = false;
    }
  };

  const loadProductReviews = async (page = 1) => {
    try {
      isReviewsLoading.value = true;
      reviewsError.value = null;

      const productId = currentProduct.value?._id || currentProduct.value?.id;
      if (!productId) return;

      const response = await productService.getProductReviews(productId, {
        page,
        limit: 10,
      });

      if (response.success) {
        productReviews.value = response.data.reviews || [];
        reviewsRatingStats.value = response.data.stats || null;
        reviewsPagination.value = response.data.pagination || null;
      }
    } catch (err) {
      console.error("❌ Error loading reviews:", err);
      reviewsError.value = err.message || "Failed to load reviews";
    } finally {
      isReviewsLoading.value = false;
    }
  };

  const loadRelatedProducts = async () => {
    try {
      isRelatedLoading.value = true;

      const product = currentProduct.value;
      if (!product) return;

      const initialResponse = product._similarProducts || null;

      if (initialResponse && Array.isArray(initialResponse)) {
                relatedProducts.value = initialResponse.map(p => normalizer.normalizeProduct(p));

        relatedProducts.value.forEach(p => {
          const pId = p._id || p.id;
          if (wishlistService.isLiked(pId)) {
            likedProducts.value.add(pId);
          }
        });

        isRelatedLoading.value = false;
        return;
      }

      const category = normalizer.getCategorySlug(product);

      if (!category) {
        console.warn("No category found for related products");
        isRelatedLoading.value = false;
        return;
      }

      const response = await productService.getProducts({
        category,
        limit: 8,
      });

      if (response.success) {
        const { products } = normalizer.extractProductData(response);

        const currentId = product._id || product.id;
        relatedProducts.value = products
          .filter(p => {
            const pId = p._id || p.id;
            return pId !== currentId;
          })
          .slice(0, 6);

        relatedProducts.value.forEach(p => {
          const pId = p._id || p.id;
          likedProducts.value.add(pId);
        });
      }
    } catch (err) {
      console.error("❌ Error loading related products:", err);
    } finally {
      isRelatedLoading.value = false;
    }
  };

  // ========== REVIEWS METHODS ==========

  const handleReviewsPageChange = async page => {
    await loadProductReviews(page);
  };

  const retryLoadReviews = async () => {
    await loadProductReviews();
  };

  // ========== QUANTITY METHODS ==========

  const handleIncreaseQuantity = () => {
    if (quantity.value < maxQuantity.value) {
      quantity.value++;
    }
  };

  const handleDecreaseQuantity = () => {
    if (quantity.value > 1) {
      quantity.value--;
    }
  };

  const validateQuantity = () => {
    const val = parseInt(quantity.value);

    if (isNaN(val) || val < 1) {
      quantity.value = 1;
    } else if (val > maxQuantity.value) {
      quantity.value = maxQuantity.value;
    } else {
      quantity.value = val;
    }
  };

  // ========== WISHLIST METHODS ==========

  const handleToggleLike = async () => {
    try {
      const productId = currentProduct.value?._id || currentProduct.value?.id;
      if (!productId) return;

      const result = await wishlistService.toggleLike(productId);

      if (result.success) {
        isLiked.value = result.isLiked;
              }
    } catch (err) {
      console.error("❌ Error toggling like:", err);
    }
  };

  const handleRelatedLike = async product => {
    try {
      const productId = product._id || product.id;
      if (!productId) return;

      const result = await wishlistService.toggleLike(productId);

      if (result.success) {
        if (result.isLiked) {
          likedProducts.value.add(productId);
        } else {
          likedProducts.value.delete(productId);
        }
      }
    } catch (err) {
      console.error("❌ Error toggling related like:", err);
    }
  };

  const handleAddToCart = async imageComponentRef => {
    try {
      isCartLoading.value = true;

      const productId = currentProduct.value?._id || currentProduct.value?.id;
      if (!productId) {
        throw new Error("Product ID not found");
      }

      const result = await cartStore.addToCart(productId, quantity.value);

      if (result.success) {
        
        // ✅ FIX: Get image position for flying animation
        let imageRect = null;

        // Method 1: Gunakan ref dari component (RECOMMENDED)
        if (imageComponentRef?.value?.getImageRect) {
          imageRect = imageComponentRef.value.getImageRect();
        }

        // Method 2: Fallback ke querySelector
        if (!imageRect) {
          const imageElement = document.querySelector("[data-product-image]");
          if (imageElement) {
            imageRect = imageElement.getBoundingClientRect();
          }
        }

        const cartElement = document.querySelector("[data-cart-icon]");

        if (imageRect && cartElement) {
          const cartRect = cartElement.getBoundingClientRect();

          // Set initial position (from product image)
          showFlyingImage.value = true;
          flyingImageProps.value = {
            src: getProductImage(currentProduct.value),
            alt: getProductTitle(currentProduct.value),
            top: imageRect.top,
            left: imageRect.left,
            width: imageRect.width,
            opacity: 1,
            scale: 1,
          };

          // Animate to cart icon after a tiny delay
          setTimeout(() => {
            flyingImageProps.value = {
              ...flyingImageProps.value,
              top: cartRect.top,
              left: cartRect.left,
              width: 50,
              opacity: 0,
              scale: 0.3,
            };
          }, 50);

          // Hide after animation completes
          setTimeout(() => {
            showFlyingImage.value = false;
          }, 1050);
        } else {
          console.warn("⚠️ Image or cart element not found for animation");
        }

        // Reset quantity
        quantity.value = 1;
      } else if (result.requiresAuth) {
        warningMessage.value = result.message || "Please login to add items to cart";
        showWarningModal.value = true;
      } else {
        throw new Error(result.message || "Failed to add to cart");
      }
    } catch (err) {
      console.error("❌ Error adding to cart:", err);
      warningMessage.value = err.message || "Failed to add to cart";
      showWarningModal.value = true;
    } finally {
      isCartLoading.value = false;
    }
  };

  // ========== NAVIGATION METHODS ==========

  const navigateToProduct = product => {
    const slug = getProductSlug(product);
    if (slug) {
      router.push(`/products/${slug}`);
    }
  };

  // ========== UI METHODS ==========

  const handleImageLoad = () => {
    // Image loaded successfully
  };

  const handleImageError = event => {
    event.target.src = getPlaceholderImage();
  };

  const closeWarningModal = () => {
    showWarningModal.value = false;
    warningMessage.value = "";
  };

  // ========== LIFECYCLE METHODS ==========

  const initializeComponent = async () => {
    try {
      await loadProductData();
    } catch (err) {
      console.error("❌ Error initializing component:", err);
    }
  };

  // ========== RETURN PUBLIC API ==========

  return {
    // State
    currentProduct,
    previousProduct,
    normalizedProduct,
    isProductLoading,
    error,

    // Reviews state
    productReviews,
    reviewsRatingStats,
    reviewsPagination,
    isReviewsLoading,
    reviewsError,

    // Related products
    relatedProducts,
    isRelatedLoading,

    // Quantity state
    quantity,
    maxQuantity,

    // Wishlist state
    isLiked,
    likedProducts,

    // UI state
    showFlyingImage,
    flyingImageProps,
    showWarningModal,
    warningMessage,

    // Cart state
    cartCount,
    isCartLoading,

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

    // Lifecycle
    initializeComponent,

    // Helper functions
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
  };
}
