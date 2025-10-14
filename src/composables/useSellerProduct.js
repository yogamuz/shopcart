// composables/useSellerProduct.js
import { ref, computed, onMounted } from "vue";
import { sellerProductService } from "@/services/sellerProductService";

export const useSellerProduct = (options = {}) => {
  const { autoFetch = true, fetchParams = {} } = options;

  // Reactive state
  const products = ref([]);
  const categories = ref([
    { id: "66d1a2b3c4e5f6789abcdef3", name: "Toys" },
    { id: "66d1a2b3c4e5f6789abcdef1", name: "Fashion" },
    { id: "66d1a2b3c4e5f6789abcdef5", name: "Gadgets" },
    { id: "66d1a2b3c4e5f6789abcdef2", name: "Sneakers" },
    { id: "66d1a2b3c4e5f6789abcdef4", name: "Furniture" },
    { id: "66d1a2b3c4e5f6789abcdef0", name: "Beauty" },
  ]);
  const storeInfo = ref(null);
  const isLoading = ref(false);
  const error = ref(null);

  // Computed
  const hasProducts = computed(() => products.value.length > 0);
  const totalProducts = computed(() => products.value.length);
  const dashboardStats = ref(null);
  const productAnalytics = ref(null);
  const formatChartDate = dateString => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const options = { day: "numeric", month: "short" };
    return new Intl.DateTimeFormat("id-ID", options).format(date);
  };
  const fetchProducts = async (params = {}) => {
    try {
      isLoading.value = true;
      error.value = null;

      // Clean params dan tambahkan search logic
      const cleanParams = Object.keys(params).reduce((acc, key) => {
        if (!key.includes("isTrusted") && !key.includes("_vts") && !key.includes("target")) {
          acc[key] = params[key];
        }
        return acc;
      }, {});

      // Tambahkan default params untuk search
      const finalParams = {
        ...fetchParams,
        ...cleanParams,
        // Jika ada search query, pastikan dikirim ke server
        ...(cleanParams.search && { search: cleanParams.search }),
        ...(cleanParams.category && { category: cleanParams.category }),
      };

      const response = await sellerProductService.getProducts(finalParams);

      // REVISI: Lebih specific dalam checking response structure
      if (response.success && response.data && typeof response.data === "object") {
        // Pastikan products selalu array, bahkan jika undefined
        products.value = Array.isArray(response.data.products) ? response.data.products : [];
        storeInfo.value = response.data.store || null;
      } else {
        // Jangan throw error jika hanya products kosong
        console.warn("Unexpected API response structure:", response);
        products.value = [];
        storeInfo.value = null;
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      error.value = err.message || "Terjadi kesalahan saat mengambil data products";
      products.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  const createProduct = async productData => {
    try {
      error.value = null;

      // Validasi data di frontend
      if (
        !productData.title ||
        !productData.description ||
        !productData.price ||
        !productData.stock ||
        !productData.category
      ) {
        throw new Error("Semua field wajib diisi");
      }

      // Format data sesuai backend expectation
      const formattedData = {
        title: productData.title.trim(),
        description: productData.description.trim(),
        price: Number(productData.price),
        stock: Number(productData.stock),
        category: productData.category, // Pastikan ini string ID
      };

      // Validasi tipe data
      if (isNaN(formattedData.price) || formattedData.price <= 0) {
        throw new Error("Harga harus berupa angka yang valid dan lebih besar dari 0");
      }

      if (isNaN(formattedData.stock) || formattedData.stock < 0) {
        throw new Error("Stok harus berupa angka yang valid dan tidak boleh negatif");
      }

      const response = await sellerProductService.createProduct(formattedData);

      if (response.success && response.data) {
        // OPTIMISTIC UPDATE: Tambah product baru ke awal array
        // Handle nested product structure dari backend response
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
        throw new Error(response.message || "Gagal membuat product");
      }
    } catch (err) {
      console.error("Error creating product:", err);
      // Cleanup any optimistic updates yang gagal
      if (err.status === 400 && err.message?.includes("Validation failed")) {
        // Jika ini adalah produk duplicate atau conflict, remove dari local state
        const potentialDuplicates = products.value.filter(p => p.title === formattedData.title && !p.id);

        if (potentialDuplicates.length > 0) {
          products.value = products.value.filter(p => !(p.title === formattedData.title && !p.id));
        }
      }

      // Log detail error untuk debugging
      if (err.data && err.data.errors) {
        console.error("Backend error response:", err.data);
        console.error("Backend validation errors:", err.data.errors);
      }

      // Tambah logging untuk melihat full error structure
      console.error("Full error object:", JSON.stringify(err, null, 2));

      error.value = err.message || "Terjadi kesalahan saat membuat product";
      throw err;
    }
  };

  const updateProduct = async (productId, productData) => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await sellerProductService.updateProduct(productId, productData);

      if (response.success && response.data) {
        // Update product di array
        const index = products.value.findIndex(p => p.id === productId);
        if (index !== -1) {
          products.value[index] = response.data;
        }
        return response.data;
      } else {
        throw new Error(response.message || "Gagal update product");
      }
    } catch (err) {
      console.error("Error updating product:", err);
      error.value = err.message || "Terjadi kesalahan saat update product";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteProduct = async productId => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await sellerProductService.deleteProduct(productId);

      if (response.success) {
        // Hapus product dari array
        products.value = products.value.filter(p => p.id !== productId);
        return true;
      } else {
        throw new Error(response.message || "Gagal hapus product");
      }
    } catch (err) {
      console.error("Error deleting product:", err);
      error.value = err.message || "Terjadi kesalahan saat hapus product";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const toggleProductStatus = async product => {
    try {
      const newStatus = !product.isActive;
      const response = await sellerProductService.toggleProductStatus(product.id, newStatus);

      if (response.success) {
        // Update status di array
        const index = products.value.findIndex(p => p.id === product.id);
        if (index !== -1) {
          products.value[index].isActive = newStatus;
        }
        return true;
      } else {
        throw new Error(response.message || "Gagal update status product");
      }
    } catch (err) {
      console.error("Error toggling product status:", err);
      error.value = err.message || "Terjadi kesalahan saat update status";
      throw err;
    }
  };

  const uploadProductImage = async (productId, imageFile, onProgress = null) => {
    let originalImage = null;

    try {
      isLoading.value = true;
      error.value = null;

      // OPTIMISTIC UPDATE: Langsung ganti gambar dengan placeholder
      const index = products.value.findIndex(p => p.id === productId);
      if (index !== -1) {
        originalImage = products.value[index].image;
        products.value[index].image = null;
      }

      const response = await sellerProductService.uploadProductImage(productId, imageFile, onProgress);

      if (response.success && response.data) {
        // Update dengan gambar baru setelah upload berhasil
        if (index !== -1) {
          products.value[index].image = response.data.imageUrl || response.data.url;
        }
        return response.data;
      } else {
        // Restore gambar asli jika upload gagal
        if (index !== -1) {
          products.value[index].image = originalImage;
        }
        throw new Error(response.message || "Gagal upload gambar");
      }
    } catch (err) {
      console.error("Error uploading image:", err);
      error.value = err.message || "Terjadi kesalahan saat upload gambar";

      // Restore gambar asli jika error
      const index = products.value.findIndex(p => p.id === productId);
      if (index !== -1 && originalImage) {
        products.value[index].image = originalImage;
      }
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const bulkToggleStatus = async (productIds, isActive) => {
    try {
      error.value = null;

      const response = await sellerProductService.bulkToggleStatus(productIds, isActive);

      if (response.success) {
        // Update status semua products yang diselect
        productIds.forEach(productId => {
          const index = products.value.findIndex(p => p.id === productId);
          if (index !== -1) {
            products.value[index].isActive = isActive;
          }
        });
        return true;
      } else {
        throw new Error(response.message || "Gagal update status products");
      }
    } catch (err) {
      console.error("Error bulk toggling status:", err);
      error.value = err.message || "Terjadi kesalahan saat bulk update status";
      throw err;
    }
  };

  const bulkDeleteProducts = async productIds => {
    try {
      error.value = null;

      const response = await sellerProductService.bulkDeleteProducts(productIds);

      if (response.success) {
        // Hapus products dari array
        products.value = products.value.filter(p => !productIds.includes(p.id));
        return true;
      } else {
        throw new Error(response.message || "Gagal delete products");
      }
    } catch (err) {
      console.error("Error bulk deleting:", err);
      error.value = err.message || "Terjadi kesalahan saat bulk delete";
      throw err;
    }
  };

  const fetchDashboardStats = async (period = "30d") => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await sellerProductService.getDashboardStats(period);

      if (response.success && response.data) {
        // Format tanggal untuk chart display
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
        console.warn("Unexpected dashboard stats response:", response);
        dashboardStats.value = null;
      }
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      error.value = err.message || "Failed to fetch dashboard statistics";
      dashboardStats.value = null;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchProductAnalytics = async (period = "30d") => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await sellerProductService.getProductAnalytics(period);

      if (response.success && response.data) {
        productAnalytics.value = response.data;
      } else {
        console.warn("Unexpected product analytics response:", response);
        productAnalytics.value = null;
      }
    } catch (err) {
      console.error("Error fetching product analytics:", err);
      error.value = err.message || "Terjadi kesalahan saat mengambil product analytics";
      productAnalytics.value = null;
    } finally {
      isLoading.value = false;
    }
  };

  // Lifecycle
  onMounted(async () => {
    if (autoFetch) {
      await fetchProducts(fetchParams);
    }
  });

  return {
    // State
    products,
    categories,
    storeInfo,
    isLoading,
    error,
    dashboardStats,
    productAnalytics,

    // Computed
    hasProducts,
    totalProducts,

    // Methods
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
  };
};
