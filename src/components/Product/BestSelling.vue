<script setup>
// You can add any script logic here if needed
const products = [
  {
    id: 1,
    brand: "Staples",
    category: "bag • Perfume",
    name: "No. 5 Eau de Parfum",
    image: "../icons/bags-icon.png",
    logo: "../icons/staples.png",
    delivery: "Delivery within 24 hours"
  },
    {
    id: 2,
    brand: "Bevmo!",
    category: "Iphone • Electronics",
    name: "Iphone 14 Pro Max",
    image: "../icons/iphone-icons.png",
    logo: "../icons/bevmo.png",
    delivery: "Delivery within 24 hours"
  },
    {
    id: 3,
    brand: "Grocery Outlet",
    category: "Pot • Flower",
    name: "Flower Pot",
    image: "../icons/pot-icons.png",
    logo: "../icons/grocery-outlet.png",
    delivery: "Delivery within 24 hours"
  },
    {
    id: 4,
    brand: "Sports Basement",
    category: "Snekaers • Sports",
    name: "Sneakers",
    image: "../icons/sneakers-icons.png",
    logo: "../icons/sports-basement.png",
    delivery: "Delivery within 24 hours"
  },
  // Add more products as needed
];

</script>

<template>
  <section id="trending" class="py-12 px-4 sm:px-6 lg:px-8 bg-white">
    <div class="max-w-7xl mx-auto">
      <h2 class="text-3xl font-bold text-gray-900 mb-8">
        Best Selling Store
      </h2>
      
      <!-- Cards Grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <!-- Card per product -->
        <div
          v-for="product in products"
          :key="product.id"
          class="group relative overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 hover:shadow-lg card-hover-effect"
        >
          <div class="relative">
            <img 
              :src="product.image" 
              :alt="product.name"
              class="w-full h-48 object-cover"
            >
            <div class="absolute -bottom-4 left-4">
              <div class="w-14 h-14 rounded-full bg-white border-2 border-white overflow-hidden shadow-md">
                <img 
                  :src="product.logo" 
                  :alt="product.brand + ' Logo'"
                  class="w-full h-full object-cover"
                >
              </div>
            </div>
          </div>
          <div class="p-4 pt-6">
            <p class="text-sm font-semibold text-gray-800">{{ product.brand }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ product.category }}</p>
            <h3 class="text-lg font-bold text-gray-900 mt-2">{{ product.name }}</h3>
            <div class="flex items-center mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span class="text-xs text-pink-500 ml-1">{{ product.delivery }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.card-hover-effect:hover {
  transform: translateY(-5px);
  transition: transform 0.3s ease;
}
</style>