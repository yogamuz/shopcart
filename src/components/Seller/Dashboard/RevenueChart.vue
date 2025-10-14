<!-- revenuechart.vue -->
<template>
  <div class="w-full h-full">
    <div v-if="loading" class="flex items-center justify-center h-full">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6C5CE7]"></div>
    </div>
    <Line v-else :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
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
      label: 'Revenue',
      data: props.data.map(d => d.value || d.revenue),
      borderColor: '#6C5CE7',
      backgroundColor: 'rgba(108, 92, 231, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6
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
      padding: 12,
      callbacks: {
        label: (context) => {
          return `Revenue: Rp ${context.parsed.y.toLocaleString('id-ID')}`;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)'
      },
      ticks: {
        callback: (value) => {
          return value >= 1000000 
            ? `${(value / 1000000).toFixed(1)}M`
            : value >= 1000 
            ? `${(value / 1000).toFixed(1)}K`
            : value;
        }
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