<!-- MetricCards.vue - Responsive Grid -->
<template>
  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
    <div v-for="metric in metrics" :key="metric.title" 
         class="bg-white rounded-lg lg:rounded-xl p-3 sm:p-4 lg:p-6 card card-hover transition-shadow metric-card">
      <div class="flex items-center justify-between">
        <div class="min-w-0 flex-1">
          <p class="text-gray-600 text-xs sm:text-sm font-medium truncate">{{ metric.title }}</p>
          <p class="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mt-1 lg:mt-2">{{ metric.value }}</p>
          <div class="flex items-center mt-1 lg:mt-2">
            <!-- Trend Icon -->
            <svg v-if="metric.trend > 0" class="w-3 h-3 sm:w-4 sm:h-4 text-green-600 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
            <svg v-else class="w-3 h-3 sm:w-4 sm:h-4 text-red-600 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
            <p :class="['text-xs sm:text-sm', metric.trend > 0 ? 'text-green-600' : 'text-red-600']">
              {{ metric.trend > 0 ? '+' : '' }}{{ metric.trend }}% from last month
            </p>
          </div>
        </div>
        <div :class="['w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center flex-shrink-0', metric.bgColor]">
          <span v-html="metric.icon" class="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
// Metrics data (moved from parent)
const metrics = ref([
  {
    title: 'Total Sales',
    value: '$124,532',
    trend: 12.5,
  },
  {
    title: 'New Orders',
    value: '1,234',
    trend: 8.2,
  },
  {
    title: 'New Customers',
    value: '543',
    trend: 15.3,
  },
  {
    title: 'Pending Orders',
    value: '89',
    trend: -5.1,
  },
  {
    title: 'Avg. Order Value',
    value: '$89.50',
    trend: 3.7,
  }
])
</script>

<style scoped>
.card {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.card-hover:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.metric-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.metric-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .metric-card:hover {
    transform: none; /* Disable hover effects on mobile */
  }
}

/* Ensure cards are properly sized */
.grid > div {
  min-height: 90px;
}

@media (min-width: 640px) {
  .grid > div {
    min-height: 110px;
  }
}

@media (min-width: 1024px) {
  .grid > div {
    min-height: 130px;
  }
}
</style>