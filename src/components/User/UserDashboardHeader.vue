<!-- UserDashboardHeader.vue - Clean Header for User Dashboard -->
<template>
  <header class="bg-white border-b border-gray-200 px-6 py-4">
    <div class="flex items-center justify-between">
      <!-- Left Section -->
      <div class="flex items-center space-x-4">
        <!-- Mobile & Tablet Hamburger Menu -->
        <button @click="$emit('toggle-sidebar')" class="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>

        <!-- Page Title -->
        <div>
          <h1 class="text-xl md:text-2xl font-bold text-gray-900">
            {{ title }}
          </h1>
        </div>
      </div>

      <!-- Right Section -->
      <div class="flex items-center space-x-4">
        <!-- User Profile - No Dropdown -->
        <div class="relative">
          <div class="flex items-center space-x-3 p-2 rounded-lg">
            <!-- Avatar with image support -->
            <div class="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
              <img
                v-if="profileAvatarUrl"
                :src="profileAvatarUrl"
                :alt="profileDisplayName"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full bg-[#6C5CE7] flex items-center justify-center">
                <span class="text-white font-medium text-sm">{{ profileInitials }}</span>
              </div>
            </div>
            <!-- User Info - Always visible on all screen sizes -->
            <div class="text-left">
              <div class="text-sm font-medium text-gray-900">
                {{ profileDisplayName }}
              </div>
              <div class="text-xs text-gray-500">User</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { useUserProfileStore } from "@/stores/userProfileStore"; // ✅ GANTI: useUserQueries → useUserProfileStore

// ✅ Props
defineProps({
  title: { 
    type: String, 
    default: "Dashboard" 
  }
});

// ✅ Emits
const emit = defineEmits(["toggle-sidebar"]);

// ✅ Setup stores
const authStore = useAuthStore();
const userProfileStore = useUserProfileStore(); // ✅ GANTI: dari useUserQueries ke useUserProfileStore

// ✅ Computed dari store langsung
const profile = computed(() => userProfileStore.profile); // ✅ GANTI: dari profileData.value?.profile ke userProfileStore.profile

const profileAvatarUrl = computed(() => {
  if (profile.value?.avatar) {
    return typeof profile.value.avatar === "string" ? profile.value.avatar : profile.value.avatar?.url;
  }
  return null;
});

const profileDisplayName = computed(() => {
  if (!profile.value) {
    return authStore.user?.username || "User";
  }
  const firstName = profile.value.firstName || "";
  const lastName = profile.value.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || authStore.user?.username || "User";
});

const profileInitials = computed(() => {
  if (!profile.value) {
    return authStore.user?.username?.substring(0, 2).toUpperCase() || "U";
  }
  const first = profile.value.firstName?.charAt(0).toUpperCase() || "";
  const last = profile.value.lastName?.charAt(0).toUpperCase() || "";
  return `${first}${last}` || authStore.user?.username?.substring(0, 2).toUpperCase() || "U";
});

// ✅ HAPUS: watch untuk queryClient.invalidateQueries (tidak diperlukan lagi)
</script>

<style scoped>
/* Component-specific styles */
.header-shadow {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}
</style>