// stores/sellerProductStore.js - WITH AUTH CHECK
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { sellerProductService } from "@/services/sellerProductService";
import { useAuthStore } from "@/stores/authStore"; // ✅ ADD THIS

export const useSellerProductStore = defineStore("sellerProduct", () => {
  // ========== STATE ==========
  const products = ref([]);
  const currentProduct = ref(null);
  const categories = ref([
    { id: "66d1a2b3c4e5f6789abcdef3", name: "Toys" },
    { id: "66d1a2b3c4e5f6789abcdef1", name: "Fashion" },
    { id: "66d1a2b3c4e5f6789abcdef5", name: "Gadgets" },
    { id: "66d1a2b3c4e5f6789abcdef2", name: "Sneakers" },
    { id: "66d1a2b3c4e5f6789abcdef4", name: "Furniture" },
    { id: "66d1a2b3c4e5f6789abcdef0", name: "Beauty" },
  ]);
  const storeInfo = ref(null);
  const pagination = ref({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12,
  });
  const isLoading = ref(false);
  const error = ref(null);
  const dashboardStats = ref(null);
  const productAnalytics = ref(null);

  // ========== COMPUTED ==========
  const hasProducts = computed(() => products.value.length > 0);
  const totalProducts = computed(() => products.value.length);
  const activeProducts = computed(() => products.value.filter(p => p.isActive));
  const inactiveProducts = computed(() => products.value.filter(p => !p.isActive));

  // ========== HELPERS ==========
  const setLoading = loading => {
    isLoading.value = loading;
  };

  const setError = err => {
    error.value = typeof err === "string" ? err : err.message || "An error occurred";
  };

  const clearError = () => {
    error.value = null;
  };

  const formatChartDate = dateString => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" }).format(date);
  };

  // ========== ACTIONS ==========
  const fetchProducts = async (params = {}) => {
    try {
      setLoading(true);
      clearError();

      // ✅ NO AUTH CHECK
      const response = await sellerProductService.getProducts(params);

      if (response.success && response.data) {
        products.value = Array.isArray(response.data.products) ? response.data.products : [];
        storeInfo.value = response.data.store || null;
        if (response.data.pagination) {
          pagination.value = response.data.pagination;
        }
      } else {
        products.value = [];
      }
    } catch (err) {
      console.error("❌ Error fetching products:", err);

      if (err.status === 401 || err.status === 403) {
        error.value = "Authentication required. Please login again.";
      } else {
        setError(err);
      }

      products.value = [];
    } finally {
      setLoading(false);
    }
  };
  const createProduct = async productData => {
    try {
      clearError();

      const response = await sellerProductService.createProduct(productData);

      if (response.success && response.data) {
        const productData = response.data.product || response.data;
        const newProduct = {
          id: productData.id,
          title: productData.title,
          description: productData.description,
          price: productData.price,
          priceFormatted: productData.priceFormatted,
          image: productData.image || null,
          category: productData.category || null,
          stock: productData.stock,
          rating: productData.rating || 0,
          reviews: productData.reviews || 0,
          isActive: productData.isActive !== undefined ? productData.isActive : true,
          createdAt: productData.createdAt || new Date().toISOString(),
        };

        products.value.unshift(newProduct);
        return newProduct;
      } else {
        throw new Error(response.message || "Failed to create product");
      }
    } catch (err) {
      console.error("Error creating product:", err);
      setError(err);
      throw err;
    }
  };

  const updateProduct = async (productId, productData) => {
    try {
      setLoading(true);
      clearError();

      const response = await sellerProductService.updateProduct(productId, productData);

      if (response.success && response.data) {
        const index = products.value.findIndex(p => p.id === productId);
        if (index !== -1) {
          products.value[index] = response.data;
        }
        return response.data;
      } else {
        throw new Error(response.message || "Failed to update product");
      }
    } catch (err) {
      console.error("Error updating product:", err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async productId => {
    try {
      setLoading(true);
      clearError();

      const response = await sellerProductService.deleteProduct(productId);

      if (response.success) {
        products.value = products.value.filter(p => p.id !== productId);
        return true;
      } else {
        throw new Error(response.message || "Failed to delete product");
      }
    } catch (err) {
      console.error("Error deleting product:", err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleProductStatus = async product => {
    try {
      const newStatus = !product.isActive;
      const response = await sellerProductService.toggleProductStatus(product.id, newStatus);

      if (response.success) {
        const index = products.value.findIndex(p => p.id === product.id);
        if (index !== -1) {
          products.value[index].isActive = newStatus;
        }
        return true;
      } else {
        throw new Error(response.message || "Failed to toggle status");
      }
    } catch (err) {
      console.error("Error toggling status:", err);
      setError(err);
      throw err;
    }
  };

  const uploadProductImage = async (productId, imageFile, onProgress = null) => {
    let originalImage = null;

    try {
      setLoading(true);
      clearError();

      const index = products.value.findIndex(p => p.id === productId);
      if (index !== -1) {
        originalImage = products.value[index].image;
        products.value[index].image = null;
      }

      const response = await sellerProductService.uploadProductImage(productId, imageFile, onProgress);

      if (response.success && response.data) {
        if (index !== -1) {
          products.value[index].image = response.data.imageUrl || response.data.url;
        }
        return response.data;
      } else {
        if (index !== -1 && originalImage) {
          products.value[index].image = originalImage;
        }
        throw new Error(response.message || "Failed to upload image");
      }
    } catch (err) {
      console.error("Error uploading image:", err);
      const index = products.value.findIndex(p => p.id === productId);
      if (index !== -1 && originalImage) {
        products.value[index].image = originalImage;
      }
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const bulkToggleStatus = async (productIds, isActive) => {
    try {
      clearError();

      const response = await sellerProductService.bulkToggleStatus(productIds, isActive);

      if (response.success) {
        productIds.forEach(productId => {
          const index = products.value.findIndex(p => p.id === productId);
          if (index !== -1) {
            products.value[index].isActive = isActive;
          }
        });
        return true;
      } else {
        throw new Error(response.message || "Failed to bulk toggle status");
      }
    } catch (err) {
      console.error("Error bulk toggling:", err);
      setError(err);
      throw err;
    }
  };

  const bulkDeleteProducts = async productIds => {
    try {
      clearError();

      const response = await sellerProductService.bulkDeleteProducts(productIds);

      if (response.success) {
        products.value = products.value.filter(p => !productIds.includes(p.id));
        return true;
      } else {
        throw new Error(response.message || "Failed to bulk delete");
      }
    } catch (err) {
      console.error("Error bulk deleting:", err);
      setError(err);
      throw err;
    }
  };

  const fetchDashboardStats = async (period = "30d") => {
    try {
      setLoading(true);
      clearError();

      // ✅ NO AUTH CHECK - Let interceptor handle it
      ;

      const response = await sellerProductService.getDashboardStats(period);

      if (response.success && response.data) {
        ;

        dashboardStats.value = {
          ...response.data,
          revenueData:
            response.data.revenueData?.map(item => ({
              ...item,
              date: formatChartDate(item.date),
            })) || [],
          ordersData:
            response.data.ordersData?.map(item => ({
              ...item,
              date: formatChartDate(item.date),
            })) || [],
        };

        return dashboardStats.value;
      } else {
        dashboardStats.value = null;
      }
    } catch (err) {
      console.error("❌ Error fetching dashboard stats:", err);

      // ✅ HANDLE auth errors gracefully
      if (err.status === 401 || err.status === 403) {
        error.value = "Authentication required. Please login again.";
      } else {
        setError(err);
      }

      dashboardStats.value = null;
    } finally {
      setLoading(false);
    }
  };

  const fetchProductAnalytics = async (period = "30d") => {
    try {
      setLoading(true);
      clearError();

      // ✅ NO AUTH CHECK
      const response = await sellerProductService.getProductAnalytics(period);

      if (response.success && response.data) {
        productAnalytics.value = response.data;
      } else {
        productAnalytics.value = null;
      }
    } catch (err) {
      console.error("❌ Error fetching product analytics:", err);

      if (err.status === 401 || err.status === 403) {
        error.value = "Authentication required. Please login again.";
      } else {
        setError(err);
      }

      productAnalytics.value = null;
    } finally {
      setLoading(false);
    }
  };

  const resetStore = () => {
    products.value = [];
    currentProduct.value = null;
    storeInfo.value = null;
    pagination.value = {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 12,
    };
    isLoading.value = false;
    error.value = null;
    dashboardStats.value = null;
    productAnalytics.value = null;
  };

  return {
    // State
    products,
    currentProduct,
    categories,
    storeInfo,
    pagination,
    isLoading,
    error,
    dashboardStats,
    productAnalytics,

    // Computed
    hasProducts,
    totalProducts,
    activeProducts,
    inactiveProducts,

    // Actions
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    uploadProductImage,
    bulkToggleStatus,
    bulkDeleteProducts,
    fetchDashboardStats,
    fetchProductAnalytics,
    resetStore,
  };
});
