<!-- Header.vue - Fixed Desktop Design -->
<template>
  <header class="bg-white border-b border-gray-200 px-6 py-4">
    <div class="flex items-center justify-between">
      <!-- Left Section - Desktop Design Preserved -->
      <div class="flex items-center space-x-4">
        <!-- Mobile & Tablet Hamburger Menu - Show on medium screens too -->
        <button @click="$emit('toggle-sidebar')" class="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>

        <!-- Page Title -->
        <div>
          <h1 class="text-1xl md:text-1xl font-bold text-gray-900">
            {{ title }}
          </h1>
        </div>
      </div>

      <!-- Right Section - Desktop Design Preserved -->
      <div class="flex items-center space-x-4">
        <!-- Search Bar -->
        <div class="relative hidden md:block">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
          <OrderSearch
            v-if="showSearch"
            v-model="searchQuery"
            :placeholder="searchPlaceholder"
            @search="handleSearch"
            @clear="handleClearSearch"
            class="w-80"
          />
        </div>

        <!-- Mobile Search Button -->
        <button class="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </button>

        <!-- Notifications -->
        <div class="relative">
          <button class="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
            <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              ></path>
            </svg>
            <!-- Notification Badge -->
            <span
              v-if="notificationCount > 0"
              class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
            >
              {{ notificationCount }}
            </span>
          </button>
        </div>

        <!-- User Profile -->
        <div class="relative">
          <button class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <!-- Avatar with Logo or Initials -->
            <div v-if="userLogo" class="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
              <img :src="userLogo" :alt="userName" class="w-full h-full object-cover" />
            </div>
            <div v-else class="w-8 h-8 bg-[#6C5CE7] rounded-full flex items-center justify-center flex-shrink-0">
              <span class="text-white font-medium text-sm">{{ getInitials(userName) }}</span>
            </div>

            <!-- User Info -->
            <div class="hidden md:block text-left">
              <div class="text-sm font-medium text-gray-900">
                {{ userName }}
              </div>
              <div class="text-xs text-gray-500">Seller</div>
            </div>

          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Search (hidden by default) -->
    <div class="mt-4 md:hidden">
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>
        <input
          type="text"
          :placeholder="searchPlaceholder"
          class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7]"
        />
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from "vue";
import OrderSearch from "./OrderSearch.vue";

defineProps({
  title: { type: String, default: "Dashboard" },
  searchPlaceholder: { type: String, default: "Search..." },
  notificationCount: { type: Number, default: 0 },
  userName: { type: String, default: "User" },
  userLogo: { type: String, default: null }, // ✨ TAMBAHKAN INI
  showSearch: { type: Boolean, default: true },
});

const searchQuery = ref("");

const emit = defineEmits(["toggle-sidebar", "search", "search-clear"]);

const getInitials = name => {
  return name
    .split(" ")
    .map(word => word[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

const handleSearch = query => {
  emit("search", query);
};

const handleClearSearch = () => {
  emit("search-clear");
};
</script>

<style scoped>
/* Component-specific styles */
.header-shadow {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}
</style>
