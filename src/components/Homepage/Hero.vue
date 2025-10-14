<template>
  <section class="bg-gradient-to-br from-pink-200 via-purple-50 to-blue-50 flex items-center justify-center px-4 py-12 mt-20">
    <div class="max-w-6xl mx-auto">
      <div class="flex flex-col lg:flex-row items-center">
        <!-- Left Side - Content -->
        <div class="flex-1 p-4 md:p-8 lg:p-12 text-center lg:text-left">
          <div class="space-y-6">
            <!-- Heading -->
            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent leading-tight">
              Shopping and Department Store
            </h1>
            
            <!-- Paragraph -->
            <p class="text-base md:text-lg lg:text-xl text-gray-700 leading-relaxed max-w-lg mx-auto lg:mx-0">
              Shopping is a bit of a relaxing hobby for me, which is sometimes troubling for the bank balance.
            </p>
            
            <!-- Button -->
            <div class="pt-4">
              <button 
                @click="handleLearnMore"
                class="inline-flex items-center px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-out focus:outline-none focus:ring-4 focus:ring-purple-300"
              >
                Learn More
                <svg class="ml-2 w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Right Side - E-commerce Categories -->
        <div class="flex-1 p-4 md:p-8 lg:p-12 w-full">
          <div class="relative">
            <!-- Category Icons Grid -->
            <div class="grid grid-cols-3 gap-4 sm:gap-6 max-w-xs sm:max-w-sm mx-auto">
              <!-- Toys -->
              <div class="group cursor-pointer transform hover:scale-110 transition-all duration-300 animate-float flex flex-col items-center" style="animation-delay: 0s;">
                <div class="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-pink-400 to-rose-400 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl overflow-hidden">
                  <img 
                    src="/public/categories/toys.png" 
                    alt="Toys" 
                    class="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                  />
                </div>
                <p class="text-center text-xs sm:text-sm font-medium text-gray-700 mt-2">Toys</p>
              </div>
              
              <!-- Furniture -->
              <div class="group cursor-pointer transform hover:scale-110 transition-all duration-300 animate-float flex flex-col items-center" style="animation-delay: 0.5s;">
                <div class="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl overflow-hidden">
                  <img 
                    src="/public/categories/furniture.png" 
                    alt="Furniture" 
                    class="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                  />
                </div>
                <p class="text-center text-xs sm:text-sm font-medium text-gray-700 mt-2">Furniture</p>
              </div>
              
              <!-- Sneakers -->
              <div class="group cursor-pointer transform hover:scale-110 transition-all duration-300 animate-float flex flex-col items-center" style="animation-delay: 1s;">
                <div class="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl overflow-hidden">
                  <img 
                    src="/public/categories/sneakers.png" 
                    alt="Sneakers" 
                    class="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                  />
                </div>
                <p class="text-center text-xs sm:text-sm font-medium text-gray-700 mt-2">Sneakers</p>
              </div>
              
              <!-- Fashion -->
              <div class="group cursor-pointer transform hover:scale-110 transition-all duration-300 animate-float flex flex-col items-center" style="animation-delay: 1.5s;">
                <div class="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl overflow-hidden">
                  <img 
                    src="/public/categories/fashion.png" 
                    alt="Fashion" 
                    class="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                  />
                </div>
                <p class="text-center text-xs sm:text-sm font-medium text-gray-700 mt-2">Fashion</p>
              </div>
              
              <!-- Beauty -->
              <div class="group cursor-pointer transform hover:scale-110 transition-all duration-300 animate-float flex flex-col items-center" style="animation-delay: 2s;">
                <div class="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl overflow-hidden">
                  <img 
                    src="/public/categories/beauty.png" 
                    alt="Beauty" 
                    class="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                  />
                </div>
                <p class="text-center text-xs sm:text-sm font-medium text-gray-700 mt-2">Beauty</p>
              </div>
              
              <!-- Gadgets -->
              <div class="group cursor-pointer transform hover:scale-110 transition-all duration-300 animate-float flex flex-col items-center" style="animation-delay: 2.5s;">
                <div class="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-400 to-pink-400 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl overflow-hidden">
                  <img 
                    src="/public/categories/gadgets.png" 
                    alt="Gadgets" 
                    class="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                  />
                </div>
                <p class="text-center text-xs sm:text-sm font-medium text-gray-700 mt-2">Gadgets</p>
              </div>
            </div>
            
            <!-- Floating Shopping Cart -->
            <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -z-10">
              <div class="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full flex items-center justify-center">
                <svg class="w-12 h-12 sm:w-16 sm:h-16 text-purple-300/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H19M17 17a2 2 0 11-4 0 2 2 0 014 0zM9 17a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
            </div>
            
            <!-- Floating decorative elements -->
            <div class="absolute -top-4 -right-4 w-4 h-4 sm:w-6 sm:h-6 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full shadow-lg animate-bounce" style="animation-delay: 0.5s;"></div>
            <div class="absolute -bottom-4 -left-4 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-br from-green-200 to-teal-200 rounded-full shadow-lg animate-bounce" style="animation-delay: 1s;"></div>
            <div class="absolute top-1/4 -right-2 w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full shadow-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'ShoppingHero',
  methods: {
    handleLearnMore() {
      // Add your learn more functionality here
      console.log('Learn More clicked!');
      // Example: this.$router.push('/about') or emit an event
    }
  }
}
</script>

<style scoped>
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

/* Custom hover effects */
button:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Responsive text sizing improvements */
@media (max-width: 640px) {
  h1 {
    font-size: 2.5rem;
    line-height: 1.1;
  }
}
</style>