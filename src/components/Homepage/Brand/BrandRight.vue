<template>
  <div class="sliding-container overflow-hidden" @mouseenter="pause" @mouseleave="resume">
    <div class="sliding-wrapper flex gap-3 sm:gap-4 lg:gap-6" :style="{ transform: `translateX(${position}px)` }">
      <template v-for="(set, setIndex) in 2" :key="`right-set-${setIndex}`">
        <div
          v-for="brand in brands"
          :key="`right-${setIndex}-${brand.id}`"
          class="brand-card bg-gray-100 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:shadow-md transition-all border border-transparent hover:border-gray-600"
        >
          <div class="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
            <div class="flex-shrink-0">
              <img
                :src="brand.image"
                :alt="brand.name"
                class="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-lg object-contain transition-transform duration-300 hover:scale-105"
                style="will-change: transform"
              />
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="text-sm sm:text-base lg:text-lg font-semibold truncate">{{ brand.name }}</h3>
              <p class="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1 line-clamp-1">{{ brand.caption }}</p>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';

const props = defineProps(['brands']);

const position = ref(0);
const isAnimating = ref(true);
let animationId = null;

// Responsive card dimensions
const getCardDimensions = () => {
  const width = window.innerWidth;
  if (width < 640) { // Mobile
    return { cardWidth: 240, gapSize: 12, speed: 0.3 };
  } else if (width < 1024) { // Tablet
    return { cardWidth: 280, gapSize: 16, speed: 0.4 };
  } else { // Desktop
    return { cardWidth: 320, gapSize: 24, speed: 0.5 };
  }
};

const dimensions = ref(getCardDimensions());
const animationSpeed = computed(() => dimensions.value.speed);
const setWidth = computed(() => (dimensions.value.cardWidth + dimensions.value.gapSize) * props.brands.length);

const animate = () => {
  if (!isAnimating.value) return;
  
  position.value += animationSpeed.value;
  
  if (position.value >= 0) {
    position.value = -setWidth.value;
  }

  animationId = requestAnimationFrame(animate);
};

const pause = () => {
  isAnimating.value = false;
  cancelAnimationFrame(animationId);
};

const resume = () => {
  if (!isAnimating.value) {
    isAnimating.value = true;
    animate();
  }
};

const handleResize = () => {
  dimensions.value = getCardDimensions();
};

onMounted(() => {
  position.value = -setWidth.value;
  window.addEventListener('resize', handleResize);
  animate();
});

onUnmounted(() => {
  cancelAnimationFrame(animationId);
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.sliding-container {
  width: 100%;
  position: relative;
}

.sliding-wrapper {
  display: flex;
  will-change: transform;
}

.brand-card {
  min-width: 240px;
  flex-shrink: 0;
}

@media (min-width: 640px) {
  .brand-card {
    min-width: 280px;
  }
}

@media (min-width: 1024px) {
  .brand-card {
    min-width: 320px;
  }
}

/* Prevent text overflow on mobile */
.line-clamp-1 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}
</style>