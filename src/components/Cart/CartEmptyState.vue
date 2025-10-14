<template>
  <div class="text-center py-16 animate-fade-in-up">
    <div class="bg-white rounded-2xl shadow-xl p-12">
      <svg
        class="mx-auto h-24 w-24 text-gray-300 mb-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1"
          d="M3 3h2l.4 2M7 13h10l4-8H5.4m-2.4 8L5 21h14M9 19a2 2 0 100 4 2 2 0 000-4zM20 19a2 2 0 100 4 2 2 0 000-4z"
        />
      </svg>
      <h3 class="text-2xl font-semibold text-gray-800 mb-3">
        Your cart is empty
      </h3>
      <p class="text-gray-500 mb-6">
        Start shopping to add items to your cart
      </p>
      <router-link
        to="/"
        class="inline-flex items-center bg-gradient-to-r from-blue-600 to-cyan-700 hover:from-blue-700 hover:to-cyan-800 text-white py-3 px-6 rounded-lg font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
        Continue Shopping
      </router-link>
    </div>
  </div>
</template>

<script setup>
// Tidak perlu props karena komponen ini statis
</script>