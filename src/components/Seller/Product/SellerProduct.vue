<!-- SellerProduct.vue - Main Component -->
<template>
  <div class="space-y-4 lg:space-y-6">
    <!-- Products Header -->
    <div
      class="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-200 p-4 lg:p-6"
    >
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h2 class="text-xl lg:text-2xl font-bold text-gray-900">
            Product Management
          </h2>
          <p class="text-sm text-gray-600 mt-1">
            Manage your product inventory and listings
          </p>
        </div>
        <button
          @click="showCreateForm = true"
          class="px-4 lg:px-6 py-2 lg:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center"
        >
          <svg
            class="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Add New Product
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-200 p-8"
    >
      <div class="flex items-center justify-center">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
        ></div>
        <span class="ml-3 text-gray-600">Loading products...</span>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-200 p-8"
    >
      <div class="text-center">
        <div class="text-red-600 mb-4">
          <svg
            class="w-12 h-12 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">
          Error Loading Products
        </h3>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <button
          @click="fetchProducts"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>

    <!-- Products Grid -->
    <ProductsGrid
      v-if="!isLoading && !error"
      :categories="categories"
      :products="products"
      :selectedCategory="selectedCategory"
      @edit-product="editProduct"
      @upload-product-image="uploadProductImage"
      @delete-product="deleteProduct"
      @toggle-status="toggleProductStatus"
      @show-create-form="showCreateForm = true"
      @search="handleSearch"
      @bulk-toggle-status="handleBulkToggleStatus"
      @bulk-delete="handleBulkDeleteProducts"
    />

    <CreateProductModal
      v-if="showCreateForm"
      ref="createFormRef"
      :key="Date.now()"
      :categories="categories"
      @submit="handleSubmitProduct"
      @cancel="closeCreateForm"
    />

<!-- Ganti SuccessModal yang lama dengan ini -->
<SuccessModal
  v-if="showSuccessModal"
  :title="successModal.title"
  :description="successModal.description"
  @close="showSuccessModal = false"
/>
    <BulkDeleteModal
      v-if="showBulkDeleteModal"
      :product-count="bulkDeleteProductIds.length"
      @confirm="confirmBulkDelete"
      @cancel="closeBulkDeleteModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import ProductsGrid from "./SellerProductsGrid.vue";
import CreateProductModal from "./CreateProductModal.vue";
import { useSellerProduct } from "@/composables/useSellerProduct";
import SuccessModal from "./SuccessModal.vue";
import BulkDeleteModal from "./BulkDeleteModal.vue";

// Menggunakan composable untuk mengelola products
const {
  products,
  categories,
  isLoading,
  error,
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  toggleProductStatus,
  bulkToggleStatus: composableBulkToggleStatus, // Rename untuk avoid conflict
  bulkDeleteProducts: composableBulkDeleteProducts, // Rename untuk avoid conflict
} = useSellerProduct({
  autoFetch: false,
});

// Form state
const showCreateForm = ref(false);
const showSuccessModal = ref(false);
const searchQuery = ref("");
const selectedCategory = ref("");
const createFormRef = ref(null);
const showBulkDeleteModal = ref(false);
const bulkDeleteProductIds = ref([]);
// Tambahkan reactive state setelah const bulkDeleteProductIds = ref([]);
const successModal = reactive({
  title: "Product Created Successfully!",
  description: "Your new product has been added to the inventory and is now available for customers."
});

const handleSubmitProduct = async (productData) => {
  try {
    // Validasi di level component
    if (
      !productData.title ||
      !productData.description ||
      !productData.category
    ) {
      alert("Semua field wajib diisi");
      return;
    }

    if (productData.price <= 0) {
      alert("Harga harus lebih besar dari 0");
      return;
    }

    if (productData.stock < 0) {
      alert("Stok tidak boleh negatif");
      return;
    }

    // Call composable method
    const newProduct = await createProduct(productData);

    if (newProduct && newProduct.id) {
      // Force re-render jika diperlukan
      setTimeout(() => {
        if (!products.value.find((p) => p.id === newProduct.id)) {
          console.warn("Product not found in list, refetching...");
          fetchProducts();
        }
      }, 100);
    } else {
      console.error("Product creation returned invalid data:", newProduct);
    }

    // Close modal dan reset form
    closeCreateForm();

    // Reset success modal ke pesan create product sebelum show
    successModal.title = "Product Created Successfully!";
    successModal.description = "Your new product has been added to the inventory and is now available for customers.";

    // Show success modal instead of alert
    showSuccessModal.value = true;

    // Optional: Force refresh products untuk memastikan consistency
    setTimeout(() => {
      const productExists = products.value.find(
        (p) => p.title === productData.title && p.id === newProduct.id
      );

      if (!productExists) {
        console.warn("Product not found in local state, refetching...");
        fetchProducts();
      }
    }, 500);
  } catch (err) {
    console.error("Error in handleSubmitProduct:", err);

    // Show specific error message
    const errorMessage =
      err.message || "Gagal membuat product. Silakan coba lagi.";
    alert(errorMessage);

    // Jangan close modal jika ada error, biarkan user memperbaiki input
  }
};

const closeCreateForm = () => {
  showCreateForm.value = false;

  // Reset form immediately dan tunggu modal benar-benar tertutup
  setTimeout(() => {
    if (createFormRef.value?.resetFormCompletely) {
      createFormRef.value.resetFormCompletely();
    }

    // Clear any lingering errors
    if (error.value) {
      error.value = null;
    }
  }, 100); // Reduced timeout
};

const resetCreateForm = () => {
  // Only try to reset if the ref exists and has the resetForm method
  if (createFormRef.value?.resetForm) {
    createFormRef.value.resetForm();
  }
};

// Handle search dari ProductsHeader - FIXED: Sinkronisasi state
const handleSearch = async (searchQuery, category = null) => {
  const params = {};
  
  // Handle search query
  if (searchQuery) {
    params.search = searchQuery;
  }
  
  // Handle category - FIXED: Explicit category handling dan state sync
  if (category !== null && category !== undefined) {
    // Jika category explicitly passed, gunakan dan sync ke local state
    if (category !== "") {
      params.category = category;
    }
    // PENTING: Update selectedCategory local state untuk sinkronisasi UI
    selectedCategory.value = category;
  } else if (selectedCategory.value && selectedCategory.value !== "") {
    // Jika tidak ada category passed tapi selectedCategory ada value
    params.category = selectedCategory.value;
  }
  
  console.log('Search params:', params, 'selectedCategory:', selectedCategory.value); // Debug log
  await fetchProducts(params);
};

const editProduct = async (productId, updateData) => {
  try {
    await updateProduct(productId, updateData);
    // Sukses - data sudah terupdate di local state via composable
  } catch (err) {
    console.error("Error updating product:", err);
    alert("Gagal memperbarui product. Silakan coba lagi.");
  }
};
const handleBulkToggleStatus = async (productIds, isActive) => {
  try {
    await composableBulkToggleStatus(productIds, isActive); // Panggil dari composable
    // Success handling sudah dilakukan di ProductsGrid
  } catch (err) {
    console.error("Error bulk toggling status:", err);
    alert("Gagal mengubah status produk secara bulk.");
  }
};

const handleBulkDeleteProducts = async (productIds) => {
  // Set data untuk modal confirmation
  bulkDeleteProductIds.value = productIds;
  showBulkDeleteModal.value = true;
};
// Ganti function confirmBulkDelete dengan ini:
const confirmBulkDelete = async () => {
  try {
    const productCount = bulkDeleteProductIds.value.length;
    await composableBulkDeleteProducts(bulkDeleteProductIds.value);

    // Set pesan khusus untuk bulk delete
    successModal.title = "Products Deleted Successfully!";
    successModal.description = `Successfully deleted ${productCount} product${productCount > 1 ? 's' : ''} from your inventory.`;

    // Show success modal setelah berhasil delete
    setTimeout(() => {
      showSuccessModal.value = true;
    }, 300);

    closeBulkDeleteModal();
  } catch (err) {
    console.error("Error bulk deleting:", err);
    alert("Gagal menghapus produk secara bulk.");
  }
};

const closeBulkDeleteModal = () => {
  showBulkDeleteModal.value = false;
  bulkDeleteProductIds.value = [];
};

// Load products saat komponen dimount
onMounted(async () => {
  await fetchProducts();
});
</script>
