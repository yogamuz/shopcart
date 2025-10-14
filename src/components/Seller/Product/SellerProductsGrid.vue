<!-- SellerProductsGrid.vue -->
<template>
  <div
    class="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
  >
    <div class="p-4 lg:p-6">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center">
          <input
            type="checkbox"
            :checked="
              selectedProducts.size === filteredProducts.length &&
              filteredProducts.length > 0
            "
            @change="selectAllProducts"
            class="w-4 h-4 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
          />
          <label class="ml-2 text-sm font-medium text-gray-700">
            Select All ({{ filteredProducts.length }} products)
          </label>
        </div>
      </div>

      <!-- Bulk Actions Bar -->
      <div
        v-if="showBulkActions"
        class="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
      >
        <div
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        >
          <div class="flex items-center">
            <span class="text-sm font-medium text-blue-900">
              {{ selectedProducts.size }} product(s) selected
            </span>
            <button
              @click="selectedProducts.clear()"
              class="ml-3 text-xs text-blue-700 hover:text-blue-900 underline"
            >
              Clear selection
            </button>
          </div>

          <div class="flex flex-wrap gap-2">
            <button
              @click="bulkToggleStatus(true)"
              class="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
            >
              Activate Selected
            </button>
            <button
              @click="bulkToggleStatus(false)"
              class="px-3 py-1.5 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
            >
              Deactivate Selected
            </button>
            <button
              @click="bulkDeleteProducts"
              class="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete Selected
            </button>
          </div>
        </div>
      </div>
      <!-- GANTI template ProductsHeader di ProductsGrid.vue dengan ini: -->
      <ProductsHeader
        v-model:search-query="searchQuery"
        v-model:selected-category="selectedCategory"
        :categories="categories"
        @search="handleSearchFromHeader"
      />

      <!-- Products Grid -->
      <div
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-4 lg:gap-6"
      >
        <ProductCard
          v-for="product in filteredProducts"
          :key="product.id"
          :product="product"
          :categories="categories"
          :is-uploading="uploadingProducts.has(product.id)"
          :is-selected="selectedProducts.has(product.id)"
          @edit="editProduct"
          @delete="deleteProduct"
          @toggle-status="toggleStatus"
          @toggle-select="toggleProductSelection"
        />
      </div>

      <!-- Empty State -->
      <EmptyState
        v-if="filteredProducts.length === 0"
        :search-query="searchQuery"
        :selected-category="selectedCategory"
        @show-create-form="$emit('show-create-form')"
      />
    </div>

    <!-- Modals -->
    <DeleteModal
      v-if="showDeleteModal"
      :product="productToDelete"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />

    <EditModal
      v-if="showEditModal"
      :product="productToEdit"
      :categories="categories"
      @submit="submitEditProduct"
      @cancel="cancelEdit"
    />
    <SuccessModal
      v-if="showSuccessModal"
      :title="successMessage.title"
      :description="successMessage.description"
      @close="closeSuccessModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch } from "vue";
import ProductsHeader from "./ProductsHeader.vue";
import ProductCard from "./ProductCard.vue";
import EmptyState from "./EmptyState.vue";
import DeleteModal from "./DeleteModal.vue";
import EditModal from "./EditModal.vue";
import SuccessModal from "./SuccessModal.vue";
// Props
// Tambahkan setelah defineProps yang ada:
const props = defineProps({
  categories: {
    type: Array,
    required: true,
  },
  products: {
    type: Array,
    required: true,
  },
  selectedCategory: {
    type: String,
    default: "",
  },
});

const emit = defineEmits([
  "edit-product",
  "upload-product-image",
  "delete-product",
  "toggle-status",
  "show-create-form",
  "search",
  "bulk-toggle-status",
  "bulk-delete",
]);

// State
const searchQuery = ref("");
const selectedCategory = ref(props.selectedCategory || "");
const showDeleteModal = ref(false);
const productToDelete = ref(null);
const showEditModal = ref(false);
const uploadingProducts = ref(new Set());
const productToEdit = ref(null);
const showSuccessModal = ref(false);
const successMessage = reactive({ title: "", description: "" });
const selectedProducts = ref(new Set());
const showBulkActions = computed(() => selectedProducts.value.size > 0);
// Hapus computed filteredProducts, ganti dengan props
const filteredProducts = computed(() => {
  // Jika ada searchQuery atau selectedCategory, return products langsung
  // karena filtering sudah dilakukan di server
  if (searchQuery.value || selectedCategory.value) {
    return props.products;
  }

  // Jika tidak ada filter, return semua products
  return props.products;
});

// Methods
const editProduct = (product) => {
  productToEdit.value = product;
  showEditModal.value = true;
};

const deleteProduct = (productId) => {
  const product = props.products.find((p) => p.id === productId);
  productToDelete.value = product;
  showDeleteModal.value = true;
};

const confirmDelete = () => {
  if (productToDelete.value) {
    emit("delete-product", productToDelete.value.id);
    cancelDelete();
  }
};

const cancelDelete = () => {
  showDeleteModal.value = false;
  productToDelete.value = null;
};

const toggleStatus = (product) => {
  emit("toggle-status", product);
};

const showSuccess = (title, description) => {
  successMessage.title = title;
  successMessage.description = description;
  showSuccessModal.value = true;
};

const closeSuccessModal = () => {
  showSuccessModal.value = false;
  successMessage.title = "";
  successMessage.description = "";
};

const toggleProductSelection = (productId) => {
  if (selectedProducts.value.has(productId)) {
    selectedProducts.value.delete(productId);
  } else {
    selectedProducts.value.add(productId);
  }
};

const selectAllProducts = () => {
  if (selectedProducts.value.size === filteredProducts.value.length) {
    selectedProducts.value.clear();
  } else {
    filteredProducts.value.forEach((product) => {
      selectedProducts.value.add(product.id);
    });
  }
};

const bulkToggleStatus = async (isActive) => {
  const productIds = Array.from(selectedProducts.value);
  try {
    emit("bulk-toggle-status", productIds, isActive);
    selectedProducts.value.clear();
    showSuccess(
      `Products ${isActive ? "Activated" : "Deactivated"}!`,
      `Successfully ${isActive ? "activated" : "deactivated"} ${
        productIds.length
      } products.`
    );
  } catch (error) {
    showSuccess(
      "Bulk Action Failed",
      "Failed to update product status. Please try again."
    );
  }
};

const bulkDeleteProducts = async () => {
  const productIds = Array.from(selectedProducts.value);

  // Emit ke parent component tanpa try-catch
  // Biarkan parent yang handle success/error dan modal
  emit("bulk-delete", productIds);

  // Clear selection setelah emit
  selectedProducts.value.clear();

  // HAPUS showSuccess call - biarkan parent component yang handle
  // Success notification akan ditampilkan setelah user confirm di modal
};
// Revisi method untuk handle search dari ProductsHeader - FIXED: Sinkronisasi state
const handleSearchFromHeader = (query, category) => {
  // Update local state untuk sinkronisasi
  searchQuery.value = query;

  if (category !== undefined) {
    selectedCategory.value = category;
  }

  // FIXED: Pass both query and category explicitly dengan state yang sudah disinkronkan
  emit(
    "search",
    query,
    category !== undefined ? category : selectedCategory.value
  );
};

watch(
  () => props.selectedCategory,
  (newValue) => {
    selectedCategory.value = newValue || "";
  },
  { immediate: true }
);

const submitEditProduct = async (updateData, imageFile) => {
  if (productToEdit.value) {
    const productId = productToEdit.value.id; // SIMPAN ID sebelum modal ditutup

    try {
      // Step 1: Update product data
      emit("edit-product", productId, updateData);

      // Step 2: Upload image jika ada file baru
      if (imageFile) {
        // TAMBAH ke tracking upload
        uploadingProducts.value.add(productId);

        emit("upload-product-image", productId, imageFile);

        // Success message dengan delay dan HAPUS dari tracking
        setTimeout(() => {
          uploadingProducts.value.delete(productId); // Gunakan productId yang sudah disimpan
          showSuccess(
            "Product Updated Successfully!",
            "File uploaded successfully. Product information and image have been updated."
          );
        }, 2000);
      } else {
        // Success message untuk update tanpa image
        setTimeout(() => {
          showSuccess(
            "Product Updated Successfully!",
            "Product information has been updated successfully."
          );
        }, 300);
      }

      // Close modal setelah success
      cancelEdit();
    } catch (error) {
      console.error("Error updating product:", error);
      // HAPUS dari tracking jika error - gunakan productId yang sudah disimpan
      uploadingProducts.value.delete(productId);
      showSuccess(
        "Update Failed",
        "Failed to update product. Please try again."
      );
    }
  }
};

const cancelEdit = () => {
  showEditModal.value = false;
  productToEdit.value = null;
};

const getSimpleCategoryName = (category) => {
  if (typeof category === "object" && category !== null) {
    return category.name || category;
  }
  return category;
};
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Ensure consistent card heights dengan flexbox */
.grid > div {
  display: flex;
  flex-direction: column;
  min-height: 0; /* Untuk flexbox proper sizing */
}

/* Better responsive text sizing */
@media (max-width: 1280px) {
  .text-xs {
    font-size: 0.75rem;
  }

  .text-sm {
    font-size: 0.825rem;
  }
}

/* Improved hover effects for larger screens */
@media (min-width: 1024px) {
  .group:hover .border-gray-200 {
    border-color: #e5e7eb;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
      0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }
}

/* Custom scrolling behavior for overflow content */
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Ensure proper spacing in smaller viewports */
@media (max-width: 640px) {
  .grid {
    gap: 1rem;
  }
}

/* Better visual hierarchy for product cards */
.aspect-square {
  position: relative;
}

/* Improved badge positioning to avoid overlap */
.absolute.top-2.right-2 {
  z-index: 10;
}

.absolute.top-2.left-2 {
  z-index: 9;
}

.absolute.bottom-2.left-2 {
  z-index: 8;
}

/* Enhanced action buttons styling */
.p-1\.5 svg,
.p-2 svg {
  flex-shrink: 0;
}

/* Prevent textarea resize dalam modal */
.resize-none {
  resize: none;
}

/* Ensure modal scrolling works properly */
.max-h-\[85vh\] {
  max-height: 85vh;
}
</style>
