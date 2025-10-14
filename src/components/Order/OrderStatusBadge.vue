<!-- OrderStatusBadge.vue - ENHANCED dengan cancel request indicator dan size support -->
<template>
  <div class="flex items-center space-x-2">
    <!-- Main Status Badge -->
    <span :class="badgeClasses">
      <svg v-if="statusConfig.icon" :class="iconClasses" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="statusConfig.icon" />
      </svg>
      {{ statusConfig.label }}
    </span>

    <!-- Cancel Request Indicator -->
    <span 
      v-if="hasCancelRequest && status !== 'cancellation_requested'" 
      :class="cancelBadgeClasses"
      title="Cancellation request pending"
    >
      <svg :class="cancelIconClasses" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
      Cancel Pending
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  status: {
    type: String,
    required: true
  },
  hasCancelRequest: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  }
});

const statusConfig = computed(() => {
  const configs = {
    pending: {
      label: 'Pending Payment',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    packed: {
      label: 'Packed',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
    },
    shipped: {
      label: 'Shipped',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-800',
      icon: 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1l1-1h2l1 1h2l1-1h1a1 1 0 001-1z'
    },
    delivered: {
      label: 'Delivered',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      icon: 'M5 13l4 4L19 7'
    },
    received: {
      label: 'Received',
      bgColor: 'bg-emerald-100',
      textColor: 'text-emerald-800',
      icon: 'M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2H4a2 2 0 00-2 2v7a2 2 0 002 2h3m7-10L10.5 8'
    },
    cancelled: {
      label: 'Cancelled',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      icon: 'M6 18L18 6M6 6l12 12'
    },
    cancellation_requested: {
      label: 'Cancellation Requested',
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-800',
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
    }
  };
  
  return configs[props.status] || configs.pending;
});

// Size configurations
const sizeConfig = computed(() => {
  const configs = {
    sm: {
      badge: 'px-2 py-0.5 text-xs',
      icon: 'w-3 h-3 mr-1',
      cancelBadge: 'px-1.5 py-0.5 text-xs',
      cancelIcon: 'w-2.5 h-2.5 mr-0.5'
    },
    md: {
      badge: 'px-2.5 py-0.5 text-xs',
      icon: 'w-3 h-3 mr-1',
      cancelBadge: 'px-2 py-0.5 text-xs',
      cancelIcon: 'w-3 h-3 mr-1'
    },
    lg: {
      badge: 'px-3 py-1 text-sm',
      icon: 'w-4 h-4 mr-1.5',
      cancelBadge: 'px-2.5 py-0.5 text-sm',
      cancelIcon: 'w-3.5 h-3.5 mr-1'
    }
  };
  
  return configs[props.size] || configs.md;
});

const badgeClasses = computed(() => [
  'inline-flex items-center rounded-full font-medium',
  sizeConfig.value.badge,
  statusConfig.value.bgColor,
  statusConfig.value.textColor
]);

const iconClasses = computed(() => [
  sizeConfig.value.icon,
  statusConfig.value.textColor
]);

const cancelBadgeClasses = computed(() => [
  'inline-flex items-center rounded-full font-medium bg-amber-100 text-amber-800 border border-amber-200',
  sizeConfig.value.cancelBadge
]);

const cancelIconClasses = computed(() => [
  sizeConfig.value.cancelIcon
]);
</script>