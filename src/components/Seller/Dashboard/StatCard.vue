<!-- statcard.vue -->
<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <p class="text-sm font-medium text-gray-600 mb-1">{{ label }}</p>
        <div v-if="loading" class="animate-pulse">
          <div class="h-8 w-24 bg-gray-200 rounded"></div>
        </div>
        <h3 v-else class="text-2xl font-bold text-gray-900">{{ value }}</h3>
        
        <div v-if="!loading" class="flex items-center mt-2 text-sm">
          <component 
            :is="trendIcon" 
            :class="['w-4 h-4 mr-1', trendColor]"
          />
          <span :class="trendColor">{{ change }}</span>
          <span class="text-gray-500 ml-1">vs last period</span>
        </div>
      </div>
      
      <div :class="['p-3 rounded-lg', iconBgColor]">
        <component :is="icon" :class="['w-6 h-6', iconColor]" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { TrendingUp, TrendingDown, Minus } from 'lucide-vue-next';

const props = defineProps({
  label: String,
  value: [String, Number],
  change: String,
  icon: Object,
  trend: {
    type: String,
    default: 'neutral',
    validator: (value) => ['up', 'down', 'neutral'].includes(value)
  },
  loading: Boolean
});

const trendIcon = computed(() => {
  if (props.trend === 'up') return TrendingUp;
  if (props.trend === 'down') return TrendingDown;
  return Minus;
});

const trendColor = computed(() => {
  if (props.trend === 'up') return 'text-green-600';
  if (props.trend === 'down') return 'text-red-600';
  return 'text-gray-600';
});

const iconBgColor = computed(() => {
  if (props.trend === 'up') return 'bg-green-100';
  if (props.trend === 'down') return 'bg-red-100';
  return 'bg-blue-100';
});

const iconColor = computed(() => {
  if (props.trend === 'up') return 'text-green-600';
  if (props.trend === 'down') return 'text-red-600';
  return 'text-blue-600';
});
</script>