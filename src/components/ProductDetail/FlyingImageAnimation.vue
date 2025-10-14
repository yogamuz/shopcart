<!-- FlyingImageAnimation.vue -->
<template>
  <div
    v-if="show"
    class="fixed pointer-events-none z-[9999] transition-all duration-1000 ease-out"
    :style="{
      top: props.top + 'px',
      left: props.left + 'px',
      width: props.width + 'px',
      opacity: props.opacity,
      transform: `scale(${props.scale})`,
    }"
  >
    <img
      :src="props.src"
      :alt="props.alt"
      class="w-full h-auto object-cover rounded-lg shadow-lg"
    />
  </div>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false
  },
  props: {
    type: Object,
    default: () => ({
      src: "",
      alt: "",
      top: 0,
      left: 0,
      width: 0,
      opacity: 1,
      scale: 1,
    })
  }
});
</script>

<style scoped>
.flying-image-enter-active,
.flying-image-leave-active {
  transition: all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.flying-image-enter-from {
  opacity: 0;
  transform: scale(1);
}

.flying-image-leave-to {
  opacity: 0;
  transform: scale(0.3);
}
</style>