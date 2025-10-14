<!-- controlpanel -->
<template>
  <div
    class="bg-white rounded-lg lg:rounded-xl p-3 sm:p-4 lg:p-6 card mb-4 lg:mb-6"
  >
    <div class="space-y-3 sm:space-y-4">
      <!-- Mobile First Row - Main Actions -->
      <div class="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4">
        <!-- Request Orders Button -->
        <button
          @click="$emit('show-cancel-requests')"
          class="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm"
          :class="{ 'animate-pulse': hasPendingRequests }"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
            ></path>
          </svg>
          <span class="hidden sm:inline">Request Orders</span>
          <span class="sm:hidden">Requests</span>
          <span
            v-if="cancelRequestCount > 0"
            class="bg-white text-red-600 px-2 py-1 rounded-full text-xs font-bold"
          >
            {{ cancelRequestCount }}
          </span>
        </button>

        <button
          @click="$emit('export-csv')"
          class="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-[#6C5CE7] text-white rounded-lg font-medium hover:bg-[#5A4FCF] transition-colors text-sm"
        >
          <span class="hidden sm:inline">Export CSV</span>
          <span class="sm:hidden">Export</span>
        </button>
      </div>

      <!-- Second Row - Filters and Controls -->
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3 lg:gap-4"
      >
        <!-- Saved Views -->
        <select
          :value="savedView"
          @change="handleSavedViewChange($event.target.value)"
          class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C5CE7]"
        >
          <option value="">Saved Views</option>
          <option value="today">Today's Orders</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>

        <!-- Date Range -->
        <div
          class="col-span-1 sm:col-span-2 lg:col-span-2 flex items-center gap-2"
        >
          <input
            type="date"
            :value="dateRange.start"
            @input="handleDateInput('start', $event.target.value)"
            class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C5CE7]"
          />
          <span class="text-gray-500 text-sm hidden sm:inline">to</span>
          <span class="text-gray-500 text-sm sm:hidden">-</span>
          <input
            type="date"
            :value="dateRange.end"
            @input="handleDateInput('end', $event.target.value)"
            class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C5CE7]"
          />
        </div>

        <!-- Status Filter -->
        <select
          :value="filters.status"
          @change="handleStatusChange($event.target.value)"
          class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6C5CE7]"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="packed">Packed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="received">Received</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <!-- Apply Button - Show when date changed -->
        <button
          v-if="hasDateChanged"
          @click="applyDateFilter"
          class="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors text-sm flex items-center justify-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span>Apply</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps({
  dateRange: {
    type: Object,
    required: true,
  },
  filters: {
    type: Object,
    required: true,
  },
  sortBy: {
    type: String,
    required: true,
  },
  savedView: {
    type: String,
    default: "",
  },
  showAdvancedFilters: {
    type: Boolean,
    default: false,
  },
  cancelRequestCount: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits([
  "update:dateRange",
  "update:filters",
  "update:sortBy",
  "update:savedView",
  "export-csv",
  "show-cancel-requests",
  "toggle-filters",
  "apply-filters",
]);

// Track temporary date changes
const tempDateRange = ref({ ...props.dateRange });
const hasDateChanged = computed(() => {
  return (
    tempDateRange.value.start !== props.dateRange.start ||
    tempDateRange.value.end !== props.dateRange.end
  );
});

const hasPendingRequests = computed(() => {
  return props.cancelRequestCount > 0;
});

// Watch for props changes to sync tempDateRange
watch(() => props.dateRange, (newRange) => {
  tempDateRange.value = { ...newRange };
}, { deep: true });

// Handle date input (tidak langsung apply)
const handleDateInput = (type, value) => {
  tempDateRange.value[type] = value;
  emit("update:dateRange", tempDateRange.value);
};

// Apply date filter (baru panggil API)
const applyDateFilter = () => {
  emit("apply-filters");
};

// Handle status filter change (langsung apply)
const handleStatusChange = (value) => {
  emit("update:filters", { ...props.filters, status: value });
  emit("apply-filters");
};

// Handle saved view selection
const handleSavedViewChange = (value) => {
  emit("update:savedView", value);

  if (!value) {
    tempDateRange.value = { start: "", end: "" };
    emit("update:dateRange", tempDateRange.value);
    emit("apply-filters");
    return;
  }

  const today = new Date();
  let startDate = "";
  let endDate = "";

  switch (value) {
    case "today":
      startDate = today.toISOString().split("T")[0];
      endDate = startDate;
      break;

    case "week":
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      startDate = weekStart.toISOString().split("T")[0];
      endDate = weekEnd.toISOString().split("T")[0];
      break;

    case "month":
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      startDate = monthStart.toISOString().split("T")[0];
      endDate = monthEnd.toISOString().split("T")[0];
      break;
  }

  tempDateRange.value = { start: startDate, end: endDate };
  emit("update:dateRange", tempDateRange.value);
  emit("apply-filters");
};
</script>