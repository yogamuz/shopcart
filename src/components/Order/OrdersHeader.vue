<!-- OrdersHeader.vue - Fixed for Backend Response -->
<template>
  <div class="mb-8 animate-fade-in-down">
    <!-- Page Header -->
    <div class="text-center mb-6">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">My Orders</h1>
    </div>

    <!-- Status Filter Tabs -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-1 relative overflow-hidden">
      <!-- Sliding background indicator -->
      <div
        class="absolute top-1 bottom-1 bg-blue-100 rounded-md transition-all duration-300 ease-in-out z-0"
        :style="indicatorStyle"
      ></div>

      <nav class="flex space-x-1 relative z-10" aria-label="Tabs" ref="tabsContainer">
        <button
          v-for="(tab, index) in statusTabs"
          :key="tab.key"
          ref="tabRefs"
          @click="handleStatusChange(tab.key, index)"
          :class="[
            'flex-1 py-3 px-3 text-sm font-medium rounded-md transition-all duration-200 relative',
            activeStatus === tab.key
              ? 'text-blue-700 font-semibold'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50',
          ]"
        >
          <div class="flex items-center justify-center space-x-2">
            <component
              :is="tab.icon"
              class="w-4 h-4 flex-shrink-0"
              :class="activeStatus === tab.key ? 'text-blue-600' : 'text-gray-400'"
            />
            <span class="truncate">{{ tab.label }}</span>
            <span
              v-if="tab.count > 0"
              class="ml-1 px-2 py-0.5 text-xs rounded-full flex-shrink-0 transition-colors duration-200"
              :class="activeStatus === tab.key ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-600'"
            >
              {{ tab.count }}
            </span>
          </div>
        </button>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, nextTick, onMounted, watch } from "vue";
import { ClipboardList, Clock, Package, Truck, CheckCircle2, ThumbsUp, XCircle } from "lucide-vue-next";

const props = defineProps({
  activeStatus: {
    type: String,
    default: "all",
  },
  orderStats: {
    type: Object,
    default: () => ({}),
  },
  orders: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["status-change"]);

// Refs for animation
const tabsContainer = ref(null);
const tabRefs = ref([]);
const indicatorStyle = ref({
  left: "0px",
  width: "0px",
});

// Handle status change with animation
const handleStatusChange = async (status, index) => {
  emit("status-change", status);
  await nextTick();
  updateIndicatorPosition(index);
};

// Update sliding indicator position
const updateIndicatorPosition = activeIndex => {
  if (!tabRefs.value[activeIndex] || !tabsContainer.value) return;

  const activeTab = tabRefs.value[activeIndex];
  const container = tabsContainer.value;

  const containerRect = container.getBoundingClientRect();
  const tabRect = activeTab.getBoundingClientRect();

  const left = tabRect.left - containerRect.left;
  const width = tabRect.width;

  indicatorStyle.value = {
    left: `${left}px`,
    width: `${width}px`,
  };
};

// ✅ FIXED: Count items from 'sellers' array (backend structure)
const itemLevelStats = computed(() => {
  const stats = {
    total: 0,
    pending: 0,
    packed: 0,
    shipped: 0,
    delivered: 0,
    received: 0,
    cancelled: 0,
  };

  props.orders.forEach(order => {
    // Backend returns 'sellers' array
    const sellersArray = order.sellers || order.parcels || [];
    
    if (Array.isArray(sellersArray)) {
      sellersArray.forEach(seller => {
        if (seller.items && Array.isArray(seller.items)) {
          seller.items.forEach(item => {
            stats.total++;
            const status = item.status;
            if (stats.hasOwnProperty(status)) {
              stats[status]++;
            }
          });
        }
      });
    }
  });

  return stats;
});

// Initialize indicator position on mount
onMounted(async () => {
  await nextTick();
  const activeIndex = statusTabs.value.findIndex(tab => tab.key === props.activeStatus);
  if (activeIndex >= 0) {
    updateIndicatorPosition(activeIndex);
  }
});

const statusTabs = computed(() => [

  {
    key: "pending",
    label: "Pending",
    count: itemLevelStats.value.pending,
    icon: Clock,
  },
  {
    key: "packed",
    label: "Packed",
    count: itemLevelStats.value.packed,
    icon: Package,
  },
  {
    key: "shipped",
    label: "Shipped",
    count: itemLevelStats.value.shipped,
    icon: Truck,
  },
  {
    key: "delivered",
    label: "Delivered",
    count: itemLevelStats.value.delivered,
    icon: CheckCircle2,
  },
  {
    key: "received",
    label: "Received",
    count: itemLevelStats.value.received,
    icon: ThumbsUp,
  },
  {
    key: "cancelled",
    label: "Cancelled",
    count: itemLevelStats.value.cancelled,
    icon: XCircle,
  },
]);

watch(() => props.orders, async () => {
  await nextTick();
  const activeIndex = statusTabs.value.findIndex(tab => tab.key === props.activeStatus);
  if (activeIndex >= 0) {
    updateIndicatorPosition(activeIndex);
  }
}, { deep: true });

watch(() => props.activeStatus, async () => {
  await nextTick();
  const activeIndex = statusTabs.value.findIndex(tab => tab.key === props.activeStatus);
  if (activeIndex >= 0) {
    updateIndicatorPosition(activeIndex);
  }
});
</script>

<style scoped>
.animate-fade-in-down {
  animation: fadeInDown 0.6s ease-out forwards;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

button {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

button:hover {
  transform: translateY(-1px);
}

button:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .flex-1 {
    min-width: 0;
  }

  .flex-1 span:not(.ml-1) {
    display: none;
  }

  .flex-1 .w-4 {
    margin-right: 0;
  }
}
</style>