// composables/useProduct.js - Consolidated TanStack Query Version with ProductDetail Support
import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed, ref, watch, nextTick, onMounted } from "vue";
import { productService } from "@/services/productService";
import { useCart } from "@/composables/useCart";
import { useApiClient } from "@/composables/useApiClient";

// Import all helper functions from utils
import {
  getProductTitle,
  getCategoryName,
  getCategorySlug,
  getPlaceholderImage,
  getProductImage,
  getSellerLogo,
  getSellerName,
  formatPrice,
  formatRatingDisplay,
  handleImageError as utilsHandleImageError,
  handleLogoError,
  getProductSlug,
} from "@/utils/productHelpers";

// Frontend validation constants
const API_LIMITS = {
  MIN_LIMIT: 1,
  MAX_LIMIT: 50,
  DEFAULT_LIMIT: 20,
  MIN_PAGE: 1,
  DEFAULT_PAGE: 1,
};

// Global states for backward compatibility
const currentProduct = ref(null);
const loadingStates = ref({
  currentProduct: false,
  products: false,
  categories: false,
});
const errors = ref({
  currentProduct: null,
  products: null,
  categories: null,
});

/**
 * Sanitize and validate query parameters
 */
const sanitizeQueryParams = (params = {}) => {
  const { limit = API_LIMITS.DEFAULT_LIMIT, page = API_LIMITS.DEFAULT_PAGE, ...otherParams } = params;

  const sanitizedLimit = Math.min(
    API_LIMITS.MAX_LIMIT,
    Math.max(API_LIMITS.MIN_LIMIT, parseInt(limit) || API_LIMITS.DEFAULT_LIMIT)
  );

  const sanitizedPage = Math.max(API_LIMITS.MIN_PAGE, parseInt(page) || API_LIMITS.DEFAULT_PAGE);

  return {
    ...otherParams,
    limit: sanitizedLimit,
    page: sanitizedPage,
  };
};

// Single product query hook
export const useProductQuery = productId => {
  const {
    data: queryData,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => productService.getProduct(productId.value),
    staleTime: 5 * 60 * 1000,
    enabled: !!productId.value,
  });

  return {
    data: queryData,
    isLoading,
    error: queryError,
    refetch,
  };
};

// Product by slug query hook
export const useProductBySlugQuery = productSlug => {
  const {
    data: queryData,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ["product", "slug", productSlug],
    queryFn: () => productService.getProductBySlug(productSlug.value),
    staleTime: 60 * 1000, // ✅ Kurangi jadi 1 menit
    refetchOnMount: 'always', // ✅ Always refetch saat mount
    refetchOnWindowFocus: true, // ✅ Refetch ketika window focus
    enabled: !!productSlug.value,
  });

  return {
    data: queryData,
    isLoading,
    error: queryError,
    refetch,
  };
};

// Products query hook
export const useProductsQuery = params => {
  const sanitizedParams = computed(() => {
    return params.value ? sanitizeQueryParams(params.value) : null;
  });

  const {
    data: queryData,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ["products", params],
    queryFn: () => productService.getProducts(sanitizedParams.value),
    staleTime: 2 * 60 * 1000,
    enabled: !!sanitizedParams.value,
  });

  const products = computed(() => {
    if (!queryData.value?.success) return [];
    return normalizeProductList(queryData.value);
  });

  return {
    products,
    isLoading,
    error: queryError,
    refetch,
  };
};

// Normalize product list helper
const normalizeProductList = queryData => {
  const normalize = p => ({
    id: p.id || p._id,
    _id: p._id || p.id,
    title: p.title || p.name,
    name: p.name || p.title,
    slug: p.slug,
    description: p.description || "",
    price: p.price || 0,
    image: p.image?.url ? p.image : p.image || p.imageUrl || p.thumbnail || null,
    category: typeof p.category === "string" ? p.category : p.category?.name || p.category,
    seller: p.seller,
    stock: typeof p.stock === "number" ? p.stock : p.inStock ? 1 : 0,
    rating: p.rating || 0,
    reviews: p.reviews || 0,
    isAvailable: p.isAvailable !== undefined ? p.isAvailable : p.stock > 0,
    storeName: p.storeName || p.seller?.name,
    isLiked: p.isLiked || false,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  });

  const list = queryData.data?.products || queryData.data?.data?.products || [];
  return list.map(normalize);
};

// Backward compatible useProductsApi
export const useProductsApi = () => {
  const queryParams = sanitizeQueryParams({ limit: 20, page: 1 });

  const {
    data: queryData,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ["products", queryParams],
    queryFn: () => productService.getProducts(queryParams),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const products = computed(() => {
    if (!queryData.value?.success) return [];
    return normalizeProductList(queryData.value);
  });

  const pagination = computed(
    () => queryData.value?.data?.pagination || queryData.value?.data?.data?.pagination || null
  );

  const filters = computed(() => queryData.value?.data?.filters || queryData.value?.data?.data?.filters || null);

  const error = computed(() => queryError.value);

  const fetchProducts = async (params = {}) => {
    const sanitizedParams = sanitizeQueryParams(params);
    return await refetch();
  };

  const clearError = () => {
    // TanStack Query handles errors internally
  };

  const clearProducts = () => {
    // TanStack Query handles data clearing
  };

  return {
    products,
    pagination,
    filters,
    isLoading,
    error,
    fetchProducts,
    clearError,
    clearProducts,
  };
};

// CONSOLIDATED PRODUCT DETAIL LOGIC
export const useProductDetail = (route, router) => {
  // Safe route parameter access
  const productSlug = computed(() => {
    if (!route || !route.params) {
      console.warn("Route or params not available");
      return null;
    }
    return route.params.slug || null;
  });

  const productId = computed(() => {
    if (!route || !route.params) {
      console.warn("Route or params not available");
      return null;
    }
    return route.params.id || null;
  });

  // Initialize query
  const queryEnabled = computed(() => !!productSlug.value);

  const {
    data: productQueryData,
    isLoading: isProductLoading,
    error: productError,
    refetch: refetchProduct,
  } = useProductBySlugQuery(productSlug);

  // State management - SAME NAMES as original
  const quantity = ref(1);
  const relatedProducts = ref([]);
  const productReviews = ref([]);
  const reviewsRatingStats = ref(null);
  const reviewsPagination = ref(null);
  const isReviewsLoading = ref(false);
  const reviewsError = ref(null);
  const productImage = ref(null);
  const imageLoadStatus = ref("loading");
  const previousProduct = ref(null);
  const isLiked = ref(false);

  // Flying animation states
  const showFlyingImage = ref(false);
  const flyingImageProps = ref({
    src: "",
    alt: "",
    top: 0,
    left: 0,
    width: 0,
    opacity: 1,
    scale: 1,
  });
  const showWarningModal = ref(false);
  const warningMessage = ref("");

  // Cart composable
  const {
    cartItems,
    cartCount,
    isLoading: isCartLoading,
    initializeCart,
    safeAddToCart,
    showCartNotification,
    isUserAuthenticated,
    refreshCart,
    refreshCartCount,
  } = useCart();

  // Computed properties - SAME NAMES as original
  const currentProduct = computed(() => {
    if (!productQueryData.value?.success) return null;
    return productQueryData.value.data?.product || productQueryData.value.data;
  });

  const error = computed(() => productError.value?.message || productError.value);

  const normalizedProduct = computed(() => {
    const product = currentProduct.value || previousProduct.value;
    if (!product) return null;

    return {
      ...product,
      storeName: product.storeName || product.sellerId?.storeName || product.seller?.storeName || "Unknown Store",
      rating: product.rating || 0,
      reviews: product.reviews || 0,
      stock: product.stock || 0,
    };
  });

  const maxQuantity = computed(() => {
    return normalizedProduct.value?.stock || normalizedProduct.value?.quantity || 99;
  });

  // METHODS - SAME NAMES as original
  const loadProductData = async () => {
    if (!route || !route.params) {
      console.warn("Route or params not available in loadProductData");
      return;
    }

    const currentProductSlug = route.params.slug;
    if (!currentProductSlug) {
      console.warn("Product slug not available");
      return;
    }

    quantity.value = 1;

    try {
      if (currentProduct.value) {
        previousProduct.value = { ...currentProduct.value };
      }

      if (isProductLoading.value) {
        console.log("Product still loading, waiting...");
        return;
      }

      if (productQueryData.value?.success) {
        const responseData = productQueryData.value.data;
        console.log("API Response Data:", responseData);
        console.log("Related Products Raw:", responseData?.similar || responseData?.relatedProducts);
        relatedProducts.value = responseData?.similar || responseData?.relatedProducts || [];
        console.log("Related Products After Assignment:", relatedProducts.value);
        relatedProducts.value.forEach((product, index) => {
          console.log(`Product ${index}:`, {
            id: product._id || product.id,
            slug: product.slug,
            title: product.title || product.name,
          });
        });

        await loadProductReviews();
      } else if (productQueryData.value && !productQueryData.value.success) {
        console.warn("Product query returned error:", productQueryData.value.message);
        relatedProducts.value = [];
      } else {
        relatedProducts.value = [];
      }
    } catch (err) {
      console.error("Failed to process product data:", err);
      relatedProducts.value = [];
    }
  };

  // ✅ KODE BARU (ganti dengan ini)
  const loadProductReviews = async () => {
    // Use internal ID from currentProduct, not slug
    const productId = currentProduct.value?.id || currentProduct.value?._id;

    if (!productId) {
      console.warn("Product ID not available for loading reviews");
      return;
    }

    isReviewsLoading.value = true;
    reviewsError.value = null;

    try {
      const response = await productService.getProductReviews(productId);

      if (response.success) {
        productReviews.value = response.data.reviews || [];
        reviewsRatingStats.value = response.data.ratingStats || null;
        reviewsPagination.value = response.data.pagination || null;
      } else {
        productReviews.value = [];
        reviewsRatingStats.value = null;
        reviewsPagination.value = null;
        reviewsError.value = response.message || "Failed to load reviews";
      }
    } catch (error) {
      console.error("Failed to load reviews:", error);
      productReviews.value = [];
      reviewsRatingStats.value = null;
      reviewsPagination.value = null;
      reviewsError.value = "Failed to load reviews";
    } finally {
      isReviewsLoading.value = false;
    }
  };

  
const handleReviewsPageChange = async (page) => {
  const productId = currentProduct.value?.id || currentProduct.value?._id;

  if (!productId || isReviewsLoading.value) return;

  isReviewsLoading.value = true;

  try {
    const response = await productService.getProductReviews(productId, { page });

    if (response.success) {
      productReviews.value = response.data.reviews || [];
      reviewsPagination.value = response.data.pagination || null;
    }
  } catch (error) {
    console.error('Failed to change reviews page:', error);
  } finally {
    isReviewsLoading.value = false;
  }
};

  const retryLoadReviews = () => {
    loadProductReviews();
  };

  // Quantity management - SAME NAMES as original
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
    if (quantity.value < 1) {
      quantity.value = 1;
    } else if (quantity.value > maxQuantity.value) {
      quantity.value = maxQuantity.value;
    }
  };

  // Like functionality - SAME NAMES as original
  const handleToggleLike = () => {
    isLiked.value = !isLiked.value;
  };

  const handleRelatedLike = productId => {
    const productIndex = relatedProducts.value.findIndex(p => (p._id || p.id) === productId);
    if (productIndex !== -1) {
      relatedProducts.value[productIndex].isLiked = !relatedProducts.value[productIndex].isLiked;
    }
  };

  // Navigation - SAME NAMES as original
  const navigateToProduct = product => {
    let routeParam = null;

    if (typeof product === "string") {
      routeParam = product;
    } else if (product && typeof product === "object") {
      routeParam = getProductSlug(product);
    }

    if (routeParam) {
      console.log("Navigating to product with:", routeParam);
      router.push({ path: `/products/${routeParam}` });
    }
  };

  // Flying animation utilities - SAME NAMES as original
  const getCartPosition = () => {
    const cartIcon =
      document.querySelector('button[onclick*="cart"]') ||
      document.querySelector('a[href="/cart"]') ||
      document.querySelector("[data-cart-icon]") ||
      document.querySelector('button:has(svg[viewBox="0 0 24 24"]) svg path[d*="M3 3h2"]')?.closest("button");

    if (cartIcon) {
      const rect = cartIcon.getBoundingClientRect();
      return {
        top: rect.top + rect.height / 2,
        left: rect.left + rect.width / 2,
        found: true,
      };
    }

    console.warn("Cart icon not found, using fallback position");
    return {
      top: 50,
      left: window.innerWidth - 100,
      found: false,
    };
  };

  const triggerFlyingAnimation = () => {
    const imageElement =
      document.querySelector("[data-product-image]") ||
      document.querySelector(".product-image-main img") ||
      document.querySelector('img[alt*="' + getProductTitle(normalizedProduct.value) + '"]') ||
      document.querySelectorAll("img")[0];

    if (!imageElement) {
      console.warn("Product image element not found for flying animation");
      return;
    }

    const imageRect = imageElement.getBoundingClientRect();
    const cartPos = getCartPosition();

    flyingImageProps.value = {
      src: getProductImage(normalizedProduct.value),
      alt: getProductTitle(normalizedProduct.value),
      top: imageRect.top,
      left: imageRect.left,
      width: Math.min(imageRect.width, 100),
      opacity: 0.9,
      scale: 1,
    };

    showFlyingImage.value = true;

    nextTick(() => {
      setTimeout(() => {
        flyingImageProps.value = {
          ...flyingImageProps.value,
          top: cartPos.top - 25,
          left: cartPos.left - 25,
          width: 50,
          opacity: 0.3,
          scale: 0.5,
        };
      }, 50);

      setTimeout(() => {
        showFlyingImage.value = false;
        flyingImageProps.value.opacity = 0;
      }, 1050);

      setTimeout(() => {
        flyingImageProps.value = {
          src: "",
          alt: "",
          top: 0,
          left: 0,
          width: 0,
          opacity: 1,
          scale: 1,
        };
      }, 1300);
    });
  };

  // Add to cart functionality - SAME NAMES as original
  const handleAddToCart = async () => {
    const productToAdd = normalizedProduct.value;

    if (!productToAdd) {
      showCartNotification("Product not available", "error");
      return;
    }

    if (!isUserAuthenticated()) {
      showCartNotification("Please login to add items to cart", "error");
      return;
    }

    if (quantity.value < 1) {
      showCartNotification("Please select a valid quantity", "error");
      return;
    }

    if (quantity.value > maxQuantity.value) {
      showCartNotification(`Only ${maxQuantity.value} items available`, "error");
      return;
    }

    try {
      const productId = productToAdd._id || productToAdd.id;
      if (!productId) {
        throw new Error("Invalid product ID");
      }

      const result = await safeAddToCart(productId, quantity.value);

      if (result.success) {
        triggerFlyingAnimation();

        const addedQuantity = quantity.value;
        quantity.value = 1;

        showCartNotification(`Added ${addedQuantity} item(s) to cart`);

        try {
          let refreshedCount = 0;

          if (typeof refreshCartCount === "function") {
            const newCount = await refreshCartCount();

            if (typeof newCount === "number" && !isNaN(newCount) && newCount >= 0) {
              refreshedCount = newCount;
            } else {
              console.warn("refreshCartCount returned invalid value:", newCount);
              refreshedCount = cartCount.value || 0;
            }
          }

          if (typeof refreshCart === "function") {
            await refreshCart();

            if (typeof cartCount.value === "number" && !isNaN(cartCount.value)) {
              refreshedCount = Math.max(refreshedCount, cartCount.value);
            }
          }

          if (refreshedCount === 0 || isNaN(refreshedCount)) {
            await initializeCart();

            if (typeof cartCount.value === "number" && !isNaN(cartCount.value)) {
              refreshedCount = cartCount.value;
            }
          }

          const finalCount = isNaN(refreshedCount) ? 0 : Math.max(0, refreshedCount);

          await nextTick();

          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("cart-updated", {
                detail: {
                  count: finalCount,
                  action: "add",
                  productId,
                  quantity: addedQuantity,
                },
              })
            );
          }
        } catch (refreshError) {
          console.warn("Failed to refresh cart after add:", refreshError);
          if (isNaN(cartCount.value)) {
            const calculatedCount = Array.isArray(cartItems.value)
              ? cartItems.value.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0)
              : 0;
          }
        }
      } else if (result.requiresAuth) {
        showCartNotification(result.message, "error");
      } else {
        if (result.message === "Cannot purchase your own products") {
          warningMessage.value = "Cannot add your own product to the cart";
          showWarningModal.value = true;
        } else {
          showCartNotification(result.message, "error");
        }
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      let errorMessage = "Failed to add item to cart";

      if (error.message.includes("server error") || error.message.includes("Server error")) {
        errorMessage = "Server is busy. Please try again in a moment.";
      } else if (error.message.includes("Network")) {
        errorMessage = "Connection error. Please check your internet.";
      } else if (error.message.includes("Cannot purchase your own products")) {
        warningMessage.value = "Cannot add your own products to the cart";
        showWarningModal.value = true;
        return;
      } else if (error.message) {
        errorMessage = error.message;
      }

      showCartNotification(errorMessage, "error");
    }
  };

  // Image handling - SAME NAMES as original
  const handleImageLoad = () => {
    imageLoadStatus.value = "loaded";
  };

  const handleImageError = event => {
    imageLoadStatus.value = "error";
    utilsHandleImageError(event); // Use helper from utils
  };

  // Lifecycle and watchers - SAME NAMES as original
  const initializeComponent = async () => {
    await initializeCart();
    await loadProductData();
  };

  const watchCartCount = () => {
    watch(cartCount, { immediate: true, deep: true });
  };

  const watchRouteChanges = () => {
    if (!route) {
      console.warn("Route not available for watching");
      return;
    }

    // Watch for productQueryData changes
    watch(
      productQueryData,
      async (newData, oldData) => {
        if (newData !== oldData) {
          console.log("Product query data changed:", newData?.success);
          await loadProductData();
        }
      },
      { deep: true, immediate: false }
    );

    // Safe route params watching
    watch(
      () => {
        if (!route || !route.params) return null;
        return route.params.slug;
      },
      async (newSlug, oldSlug) => {
        if (newSlug !== oldSlug && newSlug) {
          console.log("Route slug changed:", oldSlug, "->", newSlug);

          if (currentProduct.value) {
            previousProduct.value = { ...currentProduct.value };
          }

          // Reset data saat ganti route
          relatedProducts.value = [];
          productReviews.value = [];
          reviewsRatingStats.value = null;
          reviewsPagination.value = null;
          reviewsError.value = null;
          quantity.value = 1;

          await nextTick();
          await loadProductData();
        }
      },
      { immediate: true }
    );
  };

  return {
    // State - SAME NAMES as original
    quantity,
    relatedProducts,
    productReviews,
    reviewsRatingStats,
    reviewsPagination,
    isReviewsLoading,
    reviewsError,
    productImage,
    imageLoadStatus,
    previousProduct,
    isLiked,
    showFlyingImage,
    flyingImageProps,
    showWarningModal,
    warningMessage,

    // Computed - SAME NAMES as original
    normalizedProduct,
    isProductLoading,
    error,
    maxQuantity,
    currentProduct,

    // Cart state - SAME NAMES as original
    cartCount,
    isCartLoading,

    // Methods - SAME NAMES as original
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
    triggerFlyingAnimation,
    handleAddToCart,
    handleImageLoad,
    handleImageError,
    closeWarningModal: () => {
      showWarningModal.value = false;
    },

    // Lifecycle - SAME NAMES as original
    initializeComponent,
    watchCartCount,
    watchRouteChanges,

    // Re-export helper functions for convenience
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
  };
};

// Missing functions needed by backward compatibility
const clearProductsError = () => {
  errors.value.currentProduct = null;
  errors.value.products = null;
  errors.value.categories = null;
};

const getProduct = async productId => {
  loadingStates.value.currentProduct = true;
  errors.value.currentProduct = null;

  try {
    const response = await productService.getProduct(productId);
    if (response.success) {
      currentProduct.value = response.data.product || response.data;
      return response;
    } else {
      errors.value.currentProduct = response.message;
      currentProduct.value = null;
      return null;
    }
  } catch (error) {
    errors.value.currentProduct = error.message;
    currentProduct.value = null;
    console.error("Failed to get product:", error);
    return null;
  } finally {
    loadingStates.value.currentProduct = false;
  }
};

const normalizeProduct = product => {
  if (!product) return null;

  return {
    id: product.id || product._id,
    _id: product._id || product.id,
    title: product.title || product.name,
    name: product.name || product.title,
    slug: product.slug,
    description: product.description || "",
    price: product.price || 0,
    image: product.image?.url ? product.image : product.image || product.imageUrl || product.thumbnail || null,
    category: typeof product.category === "string" ? product.category : product.category?.name || product.category,
    categoryId: product.categoryId || product.category?.id || product.category?._id,
    seller: product.seller,
    stock: typeof product.stock === "number" ? product.stock : product.inStock ? 1 : 0,
    rating: product.rating || 0,
    reviews: product.reviews || 0,
    isAvailable: product.isAvailable !== undefined ? product.isAvailable : product.stock > 0,
    storeName: product.storeName || product.seller?.name,
    isLiked: product.isLiked || false,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
};

// Enhanced useProducts with all required exports for backward compatibility
export const useProducts = () => {
  const api = useProductsApi();

  return {
    ...api,
    // Add missing exports that ProductDetail needs
    currentProduct,
    products: api.products,
    loadingStates,
    errors,
    getProduct,
    clearProductsError,
    normalizeProduct,

    // Re-export helper functions
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
  };
};

// Backward compatible alias
export default useProducts;
