// PriceRangeFilter.vue - Ganti class flex-1 dengan width fixed
<template>
  <div class="w-full max-w-lg"> <!-- UBAH DARI: flex-1 max-w-2xl -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
      <div class="text-xs text-black mb-3">
        Rp {{ formatPrice(localPriceRange.min) }} - Rp {{ formatPrice(localPriceRange.max) }}
      </div>
    </div>

    <!-- Volume Bar Container -->
    <div class="relative">
      <!-- Background track -->
      <div
        ref="priceTrack"
        class="w-full h-4 bg-gray-200 rounded-full overflow-hidden relative cursor-pointer"
        @click="handleTrackClick"
      >
        <!-- Gradient fill -->
        <div
          class="absolute top-0 h-full transition-all duration-300 rounded-full"
          :style="{
            left: minHandlePosition + '%',
            width: volumeBarWidth + '%',
            background: priceGradient,
          }"
        ></div>

        <!-- Min price handle -->
        <div
          ref="minHandle"
          class="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-white border-2 border-gray-400 rounded-full cursor-grab active:cursor-grabbing shadow-md hover:border-blue-500 transition-colors z-20"
          :style="{ left: minHandlePosition + '%' }"
          @mousedown="startDrag('min', $event)"
          @touchstart="startDrag('min', $event)"
        >
          <div
            v-if="dragState.isDragging && dragState.dragType === 'min'"
            class="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none"
          >
            Rp {{ formatPrice(localPriceRange.min) }}
          </div>
        </div>

        <!-- Max price handle -->
        <div
          ref="maxHandle"
          class="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-white border-2 border-gray-400 rounded-full cursor-grab active:cursor-grabbing shadow-md hover:border-blue-500 transition-colors z-20"
          :style="{ left: maxHandlePosition + '%' }"
          @mousedown="startDrag('max', $event)"
          @touchstart="startDrag('max', $event)"
        >
          <div
            v-if="dragState.isDragging && dragState.dragType === 'max'"
            class="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none"
          >
            Rp {{ formatPrice(localPriceRange.max) }}
          </div>
        </div>
      </div>

      <!-- Current range display -->
      <div class="flex justify-between items-center text-xs text-gray-600 mt-3">
        <div class="flex items-center gap-2">
          <span class="text-black">Min:</span>
          <span class="font-medium">Rp {{ formatPrice(localPriceRange.min) }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-black">Max:</span>
          <span class="font-medium">Rp {{ formatPrice(localPriceRange.max) }}</span>
        </div>
      </div>

      <!-- Price labels -->
      <div class="flex justify-between text-xs text-gray-400 mt-1">
        <span>Rp 0</span>
        <span>Rp {{ formatPrice(maxPossiblePrice) }}</span>
      </div>
    </div>

    <!-- Clear Filter Button - Only show when price range is modified -->
    <div v-if="isPriceRangeModified" class="mt-4 flex justify-start">
      <button
        @click="clearPriceFilter"
        class="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        Clear Filter
      </button>
    </div>
  </div>
</template>

<!-- Script tetap sama seperti yang sudah ada -->
<script setup>
import { computed, ref, watch, onUnmounted } from "vue";

const props = defineProps({
  priceRange: Object,
  maxPossiblePrice: Number,
  isFiltering: Boolean
});

const emit = defineEmits([
  "price-range-change",
  "clear-price-filter"
]);

// Local state for dragging
const localPriceRange = ref({ ...props.priceRange });
const priceTrack = ref(null);
const minHandle = ref(null);
const maxHandle = ref(null);

// Drag state - internal to component
const dragState = ref({
  isDragging: false,
  dragType: null,
  startX: 0,
  startValue: 0,
  trackRect: null
});

// Watch for external price range changes
watch(() => props.priceRange, (newRange) => {
  if (!dragState.value.isDragging) {
    localPriceRange.value = { ...newRange };
  }
}, { deep: true });

// Check if price range has been modified from default
const isPriceRangeModified = computed(() => {
  return localPriceRange.value.min > 0 || localPriceRange.value.max < props.maxPossiblePrice;
});

// Computed properties
const minHandlePosition = computed(() => {
  return (localPriceRange.value.min / props.maxPossiblePrice) * 100;
});

const maxHandlePosition = computed(() => {
  return (localPriceRange.value.max / props.maxPossiblePrice) * 100;
});

const volumeBarWidth = computed(() => {
  return maxHandlePosition.value - minHandlePosition.value;
});

const priceGradient = computed(() => {
  const startColor = "#fecaca";
  const endColor = "#dc2626";
  return `linear-gradient(to right, ${startColor}, ${endColor})`;
});

// Methods
const formatPrice = (price) => {
  return new Intl.NumberFormat("id-ID").format(price);
};

// Clear price filter - reset to default
const clearPriceFilter = () => {
  localPriceRange.value = {
    min: 0,
    max: props.maxPossiblePrice
  };
  emit('price-range-change', { ...localPriceRange.value });
  emit('clear-price-filter');
};

// DRAG FUNCTIONALITY - Now internal to component with auto-apply
const startDrag = (type, event) => {
  event.preventDefault();
  event.stopPropagation();
  
  if (!priceTrack.value) {
    console.warn('PriceTrack element not found in PriceRangeFilter');
    return;
  }
  
  const rect = priceTrack.value.getBoundingClientRect();
  const clientX = event.touches ? event.touches[0].clientX : event.clientX;
  
  dragState.value = {
    isDragging: true,
    dragType: type,
    startX: clientX,
    startValue: localPriceRange.value[type],
    trackRect: rect
  };
  
  if (event.touches) {
    document.addEventListener('touchmove', onDrag, { passive: false });
    document.addEventListener('touchend', endDrag);
  } else {
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', endDrag);
  }
  
  document.body.style.userSelect = 'none';
  document.body.style.cursor = 'grabbing';
};

const onDrag = (event) => {
  if (!dragState.value.isDragging || !dragState.value.trackRect) return;
  
  event.preventDefault();
  
  const clientX = event.touches ? event.touches[0].clientX : event.clientX;
  const rect = dragState.value.trackRect;
  
  let percentage = ((clientX - rect.left) / rect.width) * 100;
  percentage = Math.max(0, Math.min(100, percentage));
  
  const newValue = Math.round((percentage / 100) * props.maxPossiblePrice);
  
  if (dragState.value.dragType === 'min') {
    const maxAllowed = localPriceRange.value.max - 100000;
    localPriceRange.value.min = Math.max(0, Math.min(newValue, maxAllowed));
  } else if (dragState.value.dragType === 'max') {
    const minAllowed = localPriceRange.value.min + 100000;
    localPriceRange.value.max = Math.max(minAllowed, Math.min(newValue, props.maxPossiblePrice));
  }
  
  // Auto-emit changes to parent during drag
  emit('price-range-change', { ...localPriceRange.value });
};

const endDrag = () => {
  if (dragState.value.isDragging) {
    dragState.value.isDragging = false;
    dragState.value.dragType = null;
    dragState.value.trackRect = null;
    
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchmove', onDrag);
    document.removeEventListener('touchend', endDrag);
    
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  }
};

const handleTrackClick = (event) => {
  if (!priceTrack.value || dragState.value.isDragging) return;
  
  const rect = priceTrack.value.getBoundingClientRect();
  const percentage = ((event.clientX - rect.left) / rect.width) * 100;
  const clickValue = Math.round((percentage / 100) * props.maxPossiblePrice);
  
  const distanceToMin = Math.abs(percentage - minHandlePosition.value);
  const distanceToMax = Math.abs(percentage - maxHandlePosition.value);
  
  if (distanceToMin < distanceToMax) {
    const maxAllowed = localPriceRange.value.max - 100000;
    localPriceRange.value.min = Math.max(0, Math.min(clickValue, maxAllowed));
  } else {
    const minAllowed = localPriceRange.value.min + 100000;
    localPriceRange.value.max = Math.max(minAllowed, Math.min(clickValue, props.maxPossiblePrice));
  }
  
  // Auto-emit changes to parent
  emit('price-range-change', { ...localPriceRange.value });
};

// Cleanup on unmount
onUnmounted(() => {
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', endDrag);
  document.removeEventListener('touchmove', onDrag);
  document.removeEventListener('touchend', endDrag);
  document.body.style.userSelect = '';
  document.body.style.cursor = '';
});
</script>

<style scoped>
.cursor-grab {
  cursor: grab;
}

.cursor-grab:active,
.cursor-grabbing {
  cursor: grabbing;
}

.select-none {
  user-select: none;
}

.cursor-pointer:hover {
  transform: scale(1.05);
}

.transition-transform {
  transition: transform 0.2s ease;
}

.volume-bar-container {
  touch-action: none;
}
</style>