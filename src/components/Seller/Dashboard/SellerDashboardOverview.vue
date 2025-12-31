<template>
  <div class="dashboard-overview space-y-6">
    <!-- Stats Cards Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        v-for="stat in statsCards"
        :key="stat.label"
        :label="stat.label"
        :value="stat.value"
        :change="stat.change"
        :icon="stat.icon"
        :trend="stat.trend"
        :loading="isLoading"
      />
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Revenue Chart -->
      <ChartCard
        title="Revenue Overview"
        :period="selectedPeriod"
        :loading="isLoading"
        @period-change="handlePeriodChange"
      >
        <RevenueChart :data="dashboardData?.revenueData || []" :loading="isLoading" />
      </ChartCard>

      <!-- Orders Chart -->
      <ChartCard title="Orders Trend" :period="selectedPeriod" :loading="isLoading" @period-change="handlePeriodChange">
        <OrdersChart :data="dashboardData?.ordersData || []" :loading="isLoading" />
      </ChartCard>
    </div>

    <!-- Product Performance & Recent Activity -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ProductPerformanceCard :categories="categoryDistribution" :loading="isLoading" />
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia"; // ✅ IMPORT INI
import { useSellerProductStore } from "@/stores/sellerProductStore";
import StatCard from "./StatCard.vue";
import ChartCard from "./ChartCard.vue";
import RevenueChart from "./RevenueChart.vue";
import OrdersChart from "./OrdersChart.vue";
import ProductPerformanceCard from "./ProductPerformanceCard.vue";
import { TrendingUp, ShoppingCart, Package, DollarSign } from "lucide-vue-next";

const route = useRoute();

// ✅ FIX: Get store instance
const productStore = useSellerProductStore();

// ✅ FIX: Use storeToRefs for reactive state
const { dashboardStats, isLoading, error } = storeToRefs(productStore);

// ✅ FIX: Get action directly from store
const { fetchDashboardStats } = productStore;

const selectedPeriod = ref("30d");
const dashboardData = computed(() => dashboardStats.value);

const categoryDistribution = computed(() => {
  if (!dashboardData.value?.topProducts) return [];

  const categoryMap = new Map();

  dashboardData.value.topProducts.forEach((product) => {
    const categoryName = product.category || "Uncategorized";

    if (categoryMap.has(categoryName)) {
      const existing = categoryMap.get(categoryName);
      existing.count += product.sales;
      existing.value += product.sales;
      existing.revenue += product.revenue;
    } else {
      categoryMap.set(categoryName, {
        name: categoryName,
        count: product.sales,
        value: product.sales,
        revenue: product.revenue,
      });
    }
  });

  return Array.from(categoryMap.values());
});

const statsCards = computed(() => {
  if (!dashboardData.value) {
    return [
      { label: "Total Revenue", value: "0", change: "0%", icon: DollarSign, trend: "neutral" },
      { label: "Total Orders", value: "0", change: "0%", icon: ShoppingCart, trend: "neutral" },
      { label: "Active Products", value: "0", change: "0%", icon: Package, trend: "neutral" },
      { label: "Conversion Rate", value: "0%", change: "0%", icon: TrendingUp, trend: "neutral" },
    ];
  }

  const data = dashboardData.value;
  return [
    {
      label: "Total Revenue",
      value: formatCurrency(data.totalRevenue || 0),
      change: `${data.revenueChange || 0}%`,
      icon: DollarSign,
      trend: (data.revenueChange || 0) >= 0 ? "up" : "down",
    },
    {
      label: "Total Orders",
      value: data.totalOrders || 0,
      change: `${data.ordersChange || 0}%`,
      icon: ShoppingCart,
      trend: (data.ordersChange || 0) >= 0 ? "up" : "down",
    },
    {
      label: "Active Products",
      value: data.activeProducts || 0,
      change: `${data.productsChange || 0}%`,
      icon: Package,
      trend: (data.productsChange || 0) >= 0 ? "up" : "down",
    },
    {
      label: "Conversion Rate",
      value: `10%`,
      change: `${data.conversionChange || 0}%`,
      icon: TrendingUp,
      trend: (data.conversionChange || 0) >= 0 ? "up" : "down",
    },
  ];
});

const formatCurrency = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

const loadDashboardData = async (period = "30d") => {
  try {
    console.log("📊 Loading dashboard data...");
    await fetchDashboardStats(period);
    console.log("✅ Dashboard data loaded:", dashboardStats.value);
  } catch (err) {
    console.error("❌ Failed to load dashboard data:", err);
  }
};

const handlePeriodChange = async (period) => {
  selectedPeriod.value = period;
  await loadDashboardData(period);
};

// ✅ WATCH: Re-fetch on route change (handles hot reload)
watch(
  () => route.path,
  (newPath) => {
    if (newPath === '/seller/dashboard' && !dashboardData.value) {
      console.log("🔄 Hot reload detected, re-fetching dashboard data");
      loadDashboardData(selectedPeriod.value);
    }
  },
  { immediate: true }
);

// ✅ FIX: Always fetch on mount with console log
onMounted(async () => {
  console.log("🎬 Dashboard mounted, fetching data...");
  if (!dashboardData.value) {
    await loadDashboardData(selectedPeriod.value);
  } else {
    console.log("✅ Dashboard data already exists:", dashboardData.value);
  }
});
</script>