<!-- CreateProductModal.vue -->
<template>
  <div class="fixed inset-0 flex items-center justify-center p-4 z-50 modal-backdrop">
    <div
      class="bg-white rounded-xl lg:rounded-2xl shadow-xl border border-gray-200 w-full max-w-4xl max-h-[85vh] overflow-y-auto"
    >
      <div class="p-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">Add New Product</h3>
          <button
            @click="$emit('cancel')"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
      <div class="p-4">
        <form @submit.prevent="handleSubmit">
          <!-- Grid Layout 2 Kolom untuk form yang lebih compact -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
            <!-- Kolom Kiri -->
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Product Name</label
                >
                <input
                  type="text"
                  v-model="createForm.title"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Enter product name"
                />
                <p
                  v-if="createForm.title && createForm.title.trim().length < 3"
                  class="text-red-500 text-xs mt-1"
                >
                  Product name must be at least 3 characters long
                </p>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1"
                    >Price (Rp)</label
                  >
                  <input
                    type="number"
                    v-model.number="createForm.price"
                    required
                    min="0"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    placeholder="Enter price"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1"
                    >Stock</label
                  >
                  <input
                    type="number"
                    v-model.number="createForm.stock"
                    required
                    min="0"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    placeholder="Stock quantity"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Category</label
                >
                <select
                  v-model="createForm.category"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                >
                  <option value="">Select a category</option>
                  <option
                    v-for="category in categories"
                    :key="category.id"
                    :value="category.id"
                  >
                    {{ category.name }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Kolom Kanan -->
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Description</label
                >
                <textarea
                  v-model="createForm.description"
                  required
                  rows="6"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 resize-none"
                  placeholder="Enter product description"
                ></textarea>
                <p
                  v-if="
                    createForm.description &&
                    createForm.description.trim().length < 10
                  "
                  class="text-red-500 text-xs mt-1"
                >
                  Description must be at least 10 characters long
                </p>
              </div>
            </div>
          </div>

          <div class="flex justify-end space-x-3 pt-3 border-t border-gray-200">
            <button
              type="button"
              @click="$emit('cancel')"
              :disabled="isCreating"
              class="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isCreating || !isFormValid"
              class="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isCreating ? "Creating..." : "Create Product" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, nextTick, computed } from "vue";

const props = defineProps({
  categories: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["submit", "cancel"]);

const createForm = reactive({
  title: "",
  description: "",
  price: 0,
  stock: 0,
  category: "",
});

const isCreating = ref(false);

const isFormValid = computed(() => {
  return (
    createForm.title.trim().length >= 3 &&
    createForm.description.trim().length >= 10 &&
    createForm.category &&
    createForm.price > 0 &&
    createForm.stock >= 0
  );
});

const handleSubmit = async () => {
  try {
    isCreating.value = true;

    // Validasi form di modal level
    if (!createForm.title.trim()) {
      alert("Product name is required");
      return;
    }

    if (!createForm.description.trim()) {
      alert("Description is required");
      return;
    }

    if (!createForm.category) {
      alert("Category is required");
      return;
    }

    if (createForm.price <= 0) {
      alert("Price must be greater than 0");
      return;
    }

    if (createForm.stock < 0) {
      alert("Stock cannot be negative");
      return;
    }

    const productData = {
      title: createForm.title.trim(),
      description: createForm.description.trim(),
      price: Number(createForm.price),
      stock: Number(createForm.stock),
      category: createForm.category,
    };




    // Emit submit dengan product data yang sudah tervalidasi
    emit("submit", productData);
  } catch (error) {
    console.error("Error in handleSubmit:", error);
    alert("Error in form submission: " + error.message);
  } finally {
    isCreating.value = false;
  }
};

// Method untuk reset form yang lebih thorough
const resetFormCompletely = () => {
  Object.assign(createForm, {
    title: "",
    description: "",
    price: 0,
    stock: 0,
    category: "",
  });

  // Force reactivity update
  nextTick(() => {
  });
};

// Update existing resetForm
const resetForm = () => {
  resetFormCompletely();
};

// Expose both methods
defineExpose({
  resetForm,
  resetFormCompletely,
});
</script>

<style scoped>
.resize-none {
  resize: none;
}

.max-h-\[85vh\] {
  max-height: 85vh;
}
.modal-backdrop {
  backdrop-filter: blur(4px);
  background-color: rgba(0, 0, 0, 0.6);
}
</style>
