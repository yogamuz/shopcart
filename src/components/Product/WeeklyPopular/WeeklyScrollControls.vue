<template>
  <div class="flex gap-2">
    <button
      @click="$emit('scroll-left')"
      class="flex items-center justify-center h-10 w-10 rounded-lg bg-white border border-gray-300 hover:bg-dark-green transition-colors duration-200 group"
      aria-label="Scroll left"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        class="group-hover:scale-110 transition-transform"
      >
        <path
          d="M18 12H6M6 12L11 17M6 12L11 7"
          stroke="#2E7D32"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="group-hover:stroke-main"
        />
      </svg>
    </button>
    <button
      @click="$emit('scroll-right')"
      class="flex items-center justify-center h-10 w-10 rounded-lg bg-white border border-gray-300 hover:bg-dark-green transition-colors duration-200 group"
      aria-label="Scroll right"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        class="group-hover:scale-110 transition-transform"
      >
        <path
          d="M6 12H18M18 12L13 7M18 12L13 17"
          stroke="#2E7D32"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="group-hover:stroke-main"
        />
      </svg>
    </button>
  </div>
</template>

<script setup>
defineEmits(["scroll-left", "scroll-right"]);
</script>