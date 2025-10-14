<!-- EditModal.vue -->
<template>
  <div
class="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 modal-backdrop"
  >
    <div
      class="bg-white rounded-xl lg:rounded-2xl shadow-xl border border-gray-200 w-full max-w-5xl max-h-[85vh] overflow-y-auto"
    >
      <div class="p-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">Edit Product</h3>
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
                  v-model="editForm.title"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Enter product name"
                />
              </div>
              
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1"
                    >Price (Rp)</label
                  >
                  <input
                    type="number"
                    v-model.number="editForm.price"
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
                    v-model.number="editForm.stock"
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
                  v-model="editForm.category"
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
                  v-model="editForm.description"
                  required
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 resize-none"
                  placeholder="Enter product description"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Product Image</label
                >
                <div class="space-y-2">
                  <!-- Current Image Preview -->
                  <div v-if="editForm.image" class="w-full max-w-[160px]">
                    <img
                      :src="editForm.image"
                      :alt="editForm.title"
                      class="w-full h-20 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                  <!-- File Upload -->
                  <input
                    type="file"
                    @change="handleImageChange"
                    accept="image/*"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-sm"
                  />
                  <p class="text-xs text-gray-500">
                    Choose new image to replace current one (optional)
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end space-x-3 pt-3 border-t border-gray-200">
            <button
              type="button"
              @click="$emit('cancel')"
              :disabled="isUploading"
              class="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isUploading"
              class="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {{ isUploading ? 'Uploading...' : 'Update Product' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, ref } from "vue";

const props = defineProps({
  product: {
    type: Object,
    default: null,
  },
  categories: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['submit', 'cancel']);

const editForm = reactive({
  title: "",
  description: "",
  price: 0,
  stock: 0,
  category: "",
  image: "",
  imageFile: null,
});

const isUploading = ref(false);

// Helper method to get category ID by name
const getCategoryIdByName = (categoryName) => {
  const category = props.categories.find(cat => cat.name === categoryName)
  return category ? category.id : null
}

// Watch for product changes to populate form
watch(() => props.product, (product) => {
  if (product) {
    editForm.title = product.title
    editForm.description = product.description
    editForm.price = product.price
    editForm.stock = product.stock
    editForm.category = getCategoryIdByName(product.category) || ''
    editForm.image = product.image || ''
    editForm.imageFile = null
  }
}, { immediate: true });

const handleImageChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    editForm.imageFile = file;
    // Optional: Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      editForm.image = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const handleSubmit = async () => {
  try {
    isUploading.value = true;

    const updateData = {
      title: editForm.title,
      description: editForm.description,
      price: editForm.price,
      stock: editForm.stock,
      category: editForm.category,
    };

    // Emit submit dengan status loading
    emit('submit', updateData, editForm.imageFile);
    
  } catch (error) {
    console.error('Error in handleSubmit:', error);
  } finally {
    isUploading.value = false;
  }
};
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