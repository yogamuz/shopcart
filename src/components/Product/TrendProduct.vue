<script setup>
import furnitureImg from "/furniture/furniture-icons.png";
import fashionImg from "/fashion/shirts.png";

</script>
<template>
  <section id="trending" class="py-12 px-4 sm:px-6 lg:px-8 bg-white">
    <div class="max-w-7xl mx-auto">
      <h2 class="text-3xl font-bold text-gray-900 mb-8">
        Trending Products For You!
      </h2>
      
      <!-- Cards Grid -->
      <div class="grid grid-cols-2 gap-4 sm:gap-6 md:gap-8">
        <!-- Card 1 -->
        <div class="bg-gray-100 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
          <!-- Image Container -->
          <div class="overflow-hidden">
            <img 
            :src="furnitureImg"
              alt="Furniture Village"
              class="w-full h-32 sm:h-48 md:h-64 object-cover transform hover:scale-110 transition-transform duration-500 ease-out"
            >
          </div>
          
          <!-- Content -->
          <div class="p-3 sm:p-4 md:p-6">
            <h3 class="text-sm sm:text-lg md:text-xl font-bold text-gray-900 mb-1 sm:mb-2">
              Furniture Village
            </h3>
            <p class="text-xs sm:text-sm md:text-base text-gray-600 mb-2 sm:mb-3 md:mb-4">
              Delivery within 24 hours
            </p>
            <button class="bg-black text-white px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-4xl text-xs sm:text-sm md:text-base font-medium hover:bg-main transition-colors duration-300 w-auto">
              Shop Now
            </button>
          </div>
        </div>

        <!-- Card 2 -->
        <div class="bg-gray-100 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
          <!-- Image Container -->
          <div class="overflow-hidden">
            <img 
            :src="fashionImg"
              alt="Smart Watch"
              class="w-full h-32 sm:h-48 md:h-64 object-cover transform hover:scale-110 transition-transform duration-500 ease-out"
            >
          </div>
          
          <!-- Content -->
          <div class="p-3 sm:p-4 md:p-6">
            <h3 class="text-sm sm:text-lg md:text-xl font-bold text-gray-900 mb-1 sm:mb-2">
              Fashion World
            </h3>
            <p class="text-xs sm:text-sm md:text-base text-gray-600 mb-2 sm:mb-3 md:mb-4">
              Delivery within 24 hours
            </p>
            <button class="bg-black text-white px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-4xl text-xs sm:text-sm md:text-base font-medium hover:bg-main transition-colors duration-300 w-auto">
              Shop Now
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Custom styles for additional enhancements */
.card-hover-effect {
  transform-origin: center;
}
</style>