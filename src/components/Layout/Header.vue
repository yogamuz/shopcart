<!-- header.vue -->

<template>
<header id="header" class="fixed top-0 left-0 right-0 z-40 bg-[#004030] py-2 lg:py-2 text-white text-xs sm:text-sm">

    <div class="container mx-auto px-3 sm:px-4 lg:px-36">
      <div class="flex items-center justify-between gap-2 sm:gap-4">
        <!-- Left Section - Contact -->
        <div class="flex-shrink-0 ">
          <div class="flex items-center space-x-1 sm:space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <p class="truncate max-w-[100px] sm:max-w-none">+62893391312</p>
          </div>
        </div>

        <!-- Center Section - Promo (Hidden on smallest screens) -->
        <div class="hidden xs:flex flex-1 justify-center min-w-0 mx-1 sm:mx-2">
          <p class="text-center whitespace-nowrap overflow-hidden text-ellipsis">
            Get 50% Off <span class="hidden sm:inline">on Selected Items</span> 
            <span class="mx-1 sm:mx-2">|</span> 
            <span class="font-semibold cursor-pointer hover:underline">Shop Now</span>
          </p>
        </div>

        <!-- Right Section - Language & Location -->
        <div class="flex-shrink-0 flex items-center space-x-3 sm:space-x-4 md:space-x-6">
          <!-- Language Dropdown -->
          <div class="relative">
            <button 
              @click="toggleLanguageDropdown"
              class="flex items-center space-x-1 focus:outline-none"
            >
              <span class="hidden sm:inline">{{ currentLanguage }}</span>
              <span class="sm:hidden">{{ currentLanguage === 'English' ? 'Eng' : 'Ind' }}</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                class="h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-200" 
                :class="{ 'rotate-180': showLanguageDropdown }" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div 
              v-show="showLanguageDropdown"
              class="absolute right-0 mt-2 w-24 bg-white text-gray-800 rounded shadow-lg py-1 z-10"
            >
              <a 
                href="#" 
                @click.prevent="changeLanguage('English')"
                class="block px-3 py-1 hover:bg-gray-100 text-xs sm:text-sm"
                :class="{ 'bg-gray-100': currentLanguage === 'English' }"
              >
                English
              </a>
              <a 
                href="#" 
                @click.prevent="changeLanguage('Indonesia')"
                class="block px-3 py-1 hover:bg-gray-100 text-xs sm:text-sm"
                :class="{ 'bg-gray-100': currentLanguage === 'Indonesia' }"
              >
                Indonesia
              </a>
            </div>
          </div>

          <!-- Location Tooltip -->
          <div class="relative group">
            <button class="flex items-center space-x-1 focus:outline-none">
              <span class="hidden sm:inline">Location</span>
              <span class="sm:hidden">Loc</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <div class="absolute right-0 mt-2 px-2 py-1 bg-white text-gray-800 text-xs sm:text-sm rounded shadow-lg hidden group-hover:block z-10 whitespace-nowrap">
              Only available in Indonesia
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const currentLanguage = ref('English');
const showLanguageDropdown = ref(false);

const toggleLanguageDropdown = () => {
  showLanguageDropdown.value = !showLanguageDropdown.value;
};

const changeLanguage = (language) => {
  currentLanguage.value = language;
  showLanguageDropdown.value = false;
};

const handleClickOutside = (event) => {
  const headerElement = document.getElementById('header');
  if (headerElement && !headerElement.contains(event.target)) {
    showLanguageDropdown.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>