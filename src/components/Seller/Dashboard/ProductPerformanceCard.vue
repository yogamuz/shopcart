<!-- productperformancecard.vue -->
<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-6">Category Distribution</h3>
    
    <div v-if="loading" class="flex items-center justify-center h-64">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6C5CE7]"></div>
    </div>
    
    <div v-else-if="!categories || categories.length === 0" class="text-center py-8">
      <p class="text-sm text-gray-500">No category data available</p>
    </div>
    
    <div v-else class="h-64">
      <Doughnut :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const props = defineProps({
  categories: {
    type: Array,
    default: () => []
  },
  loading: Boolean
});

const chartData = computed(() => ({
  labels: props.categories.map(c => c.name),
  datasets: [{
    data: props.categories.map(c => c.value || c.count),
    backgroundColor: [
      '#6C5CE7',
      '#00C9A7',
      '#FF6B6B',
      '#FFA502',
      '#5F27CD',
      '#48DBB4'
    ],
    borderWidth: 2,
    borderColor: '#fff'
  }]
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        padding: 15,
        usePointStyle: true
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12
    }
  }
};
</script>