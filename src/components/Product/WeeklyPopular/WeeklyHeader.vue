<template>
  <div class="flex items-center gap-4 mb-8">
    <h2 class="text-3xl font-bold text-gray-900">Weekly Popular Products</h2>
    <WeeklyScrollControls @scroll-left="$emit('scroll-left')" @scroll-right="$emit('scroll-right')" />
  </div>
</template>

<script setup>
import WeeklyScrollControls from "./WeeklyScrollControls.vue";

defineEmits(["scroll-left", "scroll-right"]);
</script>