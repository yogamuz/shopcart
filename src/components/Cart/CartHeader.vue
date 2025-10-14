<template>
  <div class="text-center mb-12 animate-fade-in-down">
    <h1 class="text-4xl font-bold text-gray-800 mb-3">
      Your Shopping Cart
    </h1>
    <div
      class="w-24 h-1 bg-gradient-to-r from-blue-400 to-cyan-500 mx-auto mb-4 rounded-full"
    ></div>
    <p class="text-gray-600 max-w-lg mx-auto">
      Review and modify your {{ cartCount }} item{{
        cartCount !== 1 ? "s" : ""
      }}
      before proceeding to checkout
    </p>
  </div>
</template>

<script setup>
defineProps({
  cartCount: {
    type: Number,
    required: true
  }
});
</script>