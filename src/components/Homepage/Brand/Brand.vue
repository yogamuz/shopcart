<!-- Brand.vue -->
<template>
  <section id="brand" class="py-8 sm:py-10 lg:py-12 px-4 sm:px-6 lg:px-8 bg-white">
    <div class="max-w-7xl mx-auto">
      <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Choose By Brand</h2>

      <div class="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 overflow-hidden">
        <BrandLeft :brands="leftBrands" />
        <BrandRight :brands="rightBrands" />
      </div>
    </div>
  </section>
</template>

<script setup>
import brandsData from '../../../data/brands.json';
import BrandLeft from './BrandLeft.vue';
import BrandRight from './BrandRight.vue';

const leftBrands = brandsData.filter(brand => brand.id >= 1 && brand.id <= 4);
const rightBrands = brandsData.filter(brand => brand.id >= 5 && brand.id <= 8);
</script>