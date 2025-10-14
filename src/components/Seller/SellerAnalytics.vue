<!-- SellerAnalytics.vue -->
<template>
  <div class="analytics-container space-y-4 lg:space-y-6">
    <!-- Period Filter -->
    <div class="bg-white rounded-lg lg:rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-xl lg:text-2xl font-bold text-gray-900">Product Analytics</h2>
          <p class="text-sm text-gray-600 mt-1">
            {{ dateRange.startDate }} - {{ dateRange.endDate }}
          </p>
        </div>
        
        <div class="flex items-center gap-2">
          <button
            v-for="period in periodOptions"
            :key="period.value"
            @click="handlePeriodChange(period.value)"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              selectedPeriod === period.value
                ? 'bg-[#6C5CE7] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            {{ period.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6C5CE7]"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg lg:rounded-xl p-4 lg:p-6">
      <div class="flex items-center gap-3">
        <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <p class="text-red-800 font-medium">{{ error }}</p>
      </div>
    </div>

    <!-- Analytics Content -->
    <template v-else-if="productAnalytics">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <div class="bg-white rounded-lg lg:rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Total Products</p>
              <p class="text-2xl lg:text-3xl font-bold text-gray-900">
                {{ productAnalytics.summary?.totalProducts || 0 }}
              </p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
            </div>
          </div>
          <div class="mt-4 flex items-center gap-2">
            <span class="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
              {{ productAnalytics.summary?.activeProducts || 0 }} Active
            </span>
            <span class="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
              {{ productAnalytics.summary?.inactiveProducts || 0 }} Inactive
            </span>
          </div>
        </div>

        <div class="bg-white rounded-lg lg:rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Average Price</p>
              <p class="text-2xl lg:text-3xl font-bold text-gray-900">
                {{ formatCurrency(productAnalytics.pricing?.averagePrice || 0) }}
              </p>
            </div>
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <div class="mt-4">
            <p class="text-xs text-gray-600">
              Range: {{ formatCurrency(productAnalytics.pricing?.minPrice || 0) }} - 
              {{ formatCurrency(productAnalytics.pricing?.maxPrice || 0) }}
            </p>
          </div>
        </div>

        <div class="bg-white rounded-lg lg:rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Inventory Value</p>
              <p class="text-2xl lg:text-3xl font-bold text-gray-900">
                {{ formatCurrency(productAnalytics.pricing?.totalInventoryValue || 0) }}
              </p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <!-- Product Trends Chart -->
        <div class="bg-white rounded-lg lg:rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Product Creation Trends</h3>
          <div class="h-64">
            <Line 
              v-if="productAnalytics.trends?.monthly"
              :data="lineChartData"
              :options="lineChartOptions"
            />
          </div>
        </div>

        <!-- Category Distribution Chart -->
        <div class="bg-white rounded-lg lg:rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Category Distribution</h3>
          <div class="h-64">
            <Bar
              v-if="productAnalytics.categories"
              :data="barChartData"
              :options="barChartOptions"
            />
          </div>
        </div>
      </div>

      <!-- Category Details Table -->
      <div class="bg-white rounded-lg lg:rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Category Performance</h3>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Category
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Products
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Active
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Avg Price
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Total Stock
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="category in productAnalytics.categories" :key="category.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm font-medium text-gray-900">
                  {{ category.name }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-600">
                  {{ category.count }}
                </td>
                <td class="px-4 py-3 text-sm">
                  <span class="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    {{ category.activeCount }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-900 font-medium">
                  {{ formatCurrency(category.averagePrice) }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-600">
                  {{ category.totalStock.toLocaleString('id-ID') }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Line, Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { useSellerProduct } from '@/composables/useSellerProduct';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Composable
const { productAnalytics, isLoading, error, fetchProductAnalytics } = useSellerProduct({
  autoFetch: false
});

// State
const selectedPeriod = ref('30d');

const periodOptions = [
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '90 Days', value: '90d' },
  { label: '1 Year', value: '1y' }
];

// Computed
const dateRange = computed(() => {
  if (!productAnalytics.value?.dateRange) {
    return { startDate: '-', endDate: '-' };
  }
  
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    }).format(date);
  };
  
  return {
    startDate: formatDate(productAnalytics.value.dateRange.startDate),
    endDate: formatDate(productAnalytics.value.dateRange.endDate)
  };
});

// Chart.js data configuration
const lineChartData = computed(() => {
  if (!productAnalytics.value?.trends?.monthly) {
    return { labels: [], datasets: [] };
  }
  
  const trends = productAnalytics.value.trends.monthly;
  return {
    labels: trends.map(item => item.period || '-'),
    datasets: [
      {
        label: 'Products Created',
        data: trends.map(item => item.count || 0),
        borderColor: '#6C5CE7',
        backgroundColor: 'rgba(108, 92, 231, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };
});

const barChartData = computed(() => {
  if (!productAnalytics.value?.categories) {
    return { labels: [], datasets: [] };
  }
  
  const categories = productAnalytics.value.categories;
  return {
    labels: categories.map(cat => cat.name),
    datasets: [
      {
        label: 'Products',
        data: categories.map(cat => cat.count),
        backgroundColor: '#6C5CE7'
      }
    ]
  };
});

const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      mode: 'index',
      intersect: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        precision: 0
      }
    }
  }
};

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      mode: 'index',
      intersect: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        precision: 0
      }
    }
  }
};

// Methods
const formatCurrency = (value) => {
  if (!value && value !== 0) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const handlePeriodChange = async (period) => {
  selectedPeriod.value = period;
  await fetchProductAnalytics(period);
};

// Lifecycle
onMounted(async () => {
  await fetchProductAnalytics(selectedPeriod.value);
});
</script>

<style scoped>
.analytics-container {
  max-width: 100%;
  overflow-x: hidden;
}

/* Table responsive */
@media (max-width: 640px) {
  table {
    font-size: 0.75rem;
  }
  
  th, td {
    padding: 0.5rem;
  }
}

/* Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.analytics-container > * {
  animation: fadeIn 0.3s ease-in-out;
}
</style>