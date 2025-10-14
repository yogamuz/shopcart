<!-- chartcard.vue -->
<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
      
      <div class="flex gap-2">
        <button
          v-for="p in periods"
          :key="p.value"
          @click="$emit('period-change', p.value)"
          :class="[
            'px-3 py-1 text-sm rounded-lg transition-colors',
            period === p.value
              ? 'bg-[#6C5CE7] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          ]"
          :disabled="loading"
        >
          {{ p.label }}
        </button>
      </div>
    </div>
    
    <div class="h-64">
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  period: String,
  loading: Boolean
});

defineEmits(['period-change']);

const periods = [
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
  { label: '90D', value: '90d' }
];
</script>