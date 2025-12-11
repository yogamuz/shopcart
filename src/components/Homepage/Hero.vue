<template>
  <section class="relative w-full h-[500px] md:h-[600px] lg:h-[850px] overflow-hidden" aria-label="Hero Banner">
    <!-- Hero Image -->
    <img
      src="https://res.cloudinary.com/dzfqsajp3/image/upload/v1765434187/Screenshot_2025-12-11_132239_svunb5.png"
      alt="Shopping and Department Store"
      class="w-full h-full object-cover object-center md:object-left"
      loading="eager"
    />

    <!-- Overlay for better contrast -->
    <div class="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent pointer-events-none"></div>

    <!-- CTA Content - Left Section -->
    <div class="absolute inset-0 flex items-center">
      <div class="container mx-auto px-4 md:px-6 lg:px-8">
        <div class="max-w-xl">
          <h1 class="text-white text-3xl md:text-4xl lg:text-5xl font-bold mb-4 drop-shadow-lg">
            Discover Amazing Deals Today
          </h1>
          <p class="text-white text-base md:text-lg lg:text-xl mb-6 drop-shadow-md">
            Shop the best products at unbeatable prices
          </p>
          <button
            @click="scrollToDeals"
            class="bg-slate-900/90 hover:bg-slate-800 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-300 shadow-lg hover:shadow-xl"
          >
            Shop Now
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
// Function untuk scroll ke section TodayBestDeals
const scrollToDeals = () => {
  const dealsSection = document.querySelector('[data-section="today-best-deals"]');
  if (dealsSection) {
    dealsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};
</script>

<style scoped>
/* No custom styles needed - all handled by Tailwind */
</style>