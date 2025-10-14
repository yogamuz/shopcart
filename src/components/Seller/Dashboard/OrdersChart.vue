<!-- orderschart.vue -->
<template>
  <div class="w-full h-full">
    <div v-if="loading" class="flex items-center justify-center h-full">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6C5CE7]"></div>
    </div>
    <Bar v-else :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  loading: Boolean
});

const chartData = computed(() => ({
  labels: props.data.map(d => d.date || d.label),
  datasets: [
    {
      label: 'Orders',
      data: props.data.map(d => d.value || d.orders),
      backgroundColor: '#6C5CE7',
      borderRadius: 6,
      barThickness: 24
    }
  ]
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)'
      },
      ticks: {
        stepSize: 1
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  }
};
</script>