<!-- ProductBadges.vue -->
<template>
  <!-- Stock Badge -->
  <div class="absolute top-2 right-2">
    <span
      :class="[
        'px-2 py-1 rounded-full text-xs font-semibold',
        product.stock > 0
          ? 'bg-green-100 text-green-800'
          : 'bg-red-100 text-red-800',
      ]"
    >
      {{
        product.stock > 0
          ? `${product.stock} in stock`
          : "Out of stock"
      }}
    </span>
  </div>

  <!-- Select Badge -->
<div class="absolute top-2 left-2">
  <input
    type="checkbox"
    :checked="isSelected"
    @change="$emit('toggle-select', product.id)"
    class="w-4 h-4 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer hover:border-blue-400 transition-colors"
  />
</div>

  <!-- Rating Badge (if has rating) -->
  <div v-if="product.rating > 0" class="absolute bottom-2 left-2">
    <div
      class="flex items-center bg-white bg-opacity-90 px-2 py-1 rounded-full"
    >
      <svg
        class="w-3 h-3 text-yellow-400 mr-1"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
        />
      </svg>
      <span class="text-xs font-medium text-gray-900">{{
        product.rating
      }}</span>
      <span class="text-xs text-gray-500 ml-1"
        >({{ product.reviews }})</span
      >
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
});
defineEmits(['toggle-select']);
</script>