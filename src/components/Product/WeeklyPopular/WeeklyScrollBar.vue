<template>
  <div class="h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
    <div
      class="h-full bg-main rounded-full transition-all duration-300"
      :style="{ width: progress + '%' }"
    ></div>
  </div>
</template>

<script setup>
defineProps({
  progress: {
    type: Number,
    default: 0,
  },
});
</script>