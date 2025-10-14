<!-- ProductsHeader.vue -->
<template>
  <div
    class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
  >
    <h3 class="text-lg font-semibold text-gray-900">Your Products</h3>
    <div class="flex items-center space-x-4">
      <!-- Search -->
      <div class="relative">
        <input
          type="text"
          :value="searchQuery"
          @input="$emit('update:searchQuery', $event.target.value)"
          @keydown="handleKeydown"
          placeholder="Search products..."
          class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
        />
        <svg
          class="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <!-- Filter by Category -->
      <select
        :value="selectedCategory"
        @change="handleCategoryChange"
        class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
      >
        <option value="">All Categories</option>
        <option
          v-for="category in categories"
          :key="category.id"
          :value="category.name"
        >
          {{ category.name }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  searchQuery: String,
  selectedCategory: String,
  categories: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits([
  "update:searchQuery",
  "update:selectedCategory",
  "search",
]);

// Handle keydown events
const handleKeydown = (event) => {
  if (event.key === "Enter") {
    handleEnterSearch();
  }
};

// Handle search saat Enter ditekan
const handleEnterSearch = () => {
  const query = props.searchQuery.trim();
  if (query.length >= 2 || query.length === 0) {
    emit("search", query);
  }
};
// Handle category change - FINAL FIX: Update state dan emit dengan benar
const handleCategoryChange = (event) => {
  const category = event.target.value;
  
  // Update local state terlebih dahulu via v-model emit
  emit("update:selectedCategory", category);
  
  // Emit search dengan kategori baru
  emit("search", props.searchQuery, category);
};
</script>
