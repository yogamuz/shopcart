<!-- ProductInfo.vue -->
<template>
  <div class="p-3 lg:p-4 flex flex-col flex-1">
    <div class="flex items-start justify-between mb-2">
      <h4
        class="font-semibold text-gray-900 truncate flex-1 mr-2 text-sm lg:text-base leading-tight"
      >
        {{ product.title }}
      </h4>
      <span
        class="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full whitespace-nowrap ml-2 flex-shrink-0"
      >
        {{ getSimpleCategoryName(product.category) }}
      </span>
    </div>

    <!-- Description dengan height tetap -->
    <div class="mb-3" style="height: 40px; min-height: 40px;">
      <p
        class="text-gray-600 text-xs lg:text-sm line-clamp-2 leading-relaxed h-full overflow-hidden"
      >
        {{ product.description }}
      </p>
    </div>

    <!-- Product Meta Info -->
    <div
      class="flex items-center justify-between mb-3 text-xs text-gray-500"
    >
      <div class="flex items-center space-x-3">
        <span>{{ formatDate(product.createdAt) }}</span>
        <span v-if="product.rating > 0" class="flex items-center">
          <svg
            class="w-3 h-3 text-yellow-400 mr-1"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            />
          </svg>
          {{ product.rating }} ({{ product.reviews }})
        </span>
      </div>
      <span
        :class="[
          'px-2 py-1 rounded-full text-xs flex-shrink-0',
          product.isActive
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700',
        ]"
      >
        {{ product.isActive ? "Active" : "Inactive" }}
      </span>
    </div>

    <!-- Spacer untuk mendorong price ke bottom -->
    <div class="flex-1"></div>

    <!-- Price dan Action Buttons - Always at bottom -->
    <div class="flex items-center justify-between">
      <div class="flex flex-col">
        <span class="text-sm lg:text-lg font-bold text-gray-900">
          {{ product.priceFormatted || formatPrice(product.price) }}
        </span>
        <!-- Show stock info below price on smaller cards -->
        <span class="text-xs text-gray-500 xl:hidden">
          {{
            product.stock > 0
              ? `${product.stock} in stock`
              : "Out of stock"
          }}
        </span>
      </div>

      <!-- Action buttons (visible on non-hover for mobile) -->
      <ProductActions
        :product="product"
        @edit="$emit('edit')"
        @toggle-status="$emit('toggle-status')"
        @delete="$emit('delete')"
      />
    </div>
  </div>
</template>

<script setup>
import ProductActions from "./ProductActions.vue";

defineProps({
  product: {
    type: Object,
    required: true,
  },
});

defineEmits(['edit', 'toggle-status', 'delete']);

const formatPrice = (price) => {
  return `Rp ${price.toLocaleString("id-ID")}`;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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
</style>