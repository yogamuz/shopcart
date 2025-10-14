<!-- AdminDashboardOverview.vue - Enhanced Dashboard -->
<template>
  <div class="dashboard-content">
    <div class="space-y-4 lg:space-y-6">
      <!-- Welcome Card with Profile Completion -->
      <div class="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl shadow-sm p-6 text-white">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div class="flex-1">
            <h3 class="text-xl font-bold mb-2">Welcome Back, {{ displayName }}! 👋</h3>
            <p class="text-blue-100 text-sm">
              {{ getGreetingMessage() }}
            </p>
          </div>

          <!-- Profile Completion -->
          <div v-if="profileCompleteness < 100" class="bg-white/10 backdrop-blur-sm rounded-lg p-4 min-w-[200px]">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium">Profile Completion</span>
              <span class="text-lg font-bold">{{ profileCompleteness }}%</span>
            </div>
            <div class="w-full bg-white/20 rounded-full h-2 mb-2">
              <div
                class="bg-white rounded-full h-2 transition-all duration-300"
                :style="{ width: profileCompleteness + '%' }"
              ></div>
            </div>
            <button @click="emit('navigate-to', 'Profile')" class="text-xs text-white underline hover:no-underline">
              Complete your profile →
            </button>
          </div>
        </div>
      </div>

      <!-- Become Seller Banner (hanya untuk user role) - ENHANCED VERSION -->
      <div
        v-if="canUpgradeToSeller"
        class="seller-banner-wrapper relative overflow-hidden bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600 rounded-2xl shadow-lg"
      >
        <!-- Animated Background Elements -->
        <div class="absolute inset-0 opacity-20">
          <div class="star-field"></div>
        </div>
        
        <!-- Floating Circles -->
        <div class="floating-circle circle-1"></div>
        <div class="floating-circle circle-2"></div>
        <div class="floating-circle circle-3"></div>

        <!-- Content -->
        <div class="relative z-10 p-6 md:p-8">
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            <!-- Left Content -->
            <div class="flex-1 text-center md:text-left space-y-3">
              <div class="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-2">
                <span class="text-2xl animate-bounce-slow">🚀</span>
                <span class="text-sm font-semibold text-white">Limited Time Opportunity</span>
              </div>
              
              <h3 class="text-2xl md:text-3xl font-bold text-white leading-tight">
                Ready to Become a Seller?
              </h3>
              
              <p class="text-purple-100 text-sm md:text-base max-w-xl">
                Join thousands of successful sellers and start your own online business today. 
                <span class="font-semibold text-white">Reach millions of customers worldwide!</span>
              </p>

              <!-- Features List -->
              <div class="flex flex-wrap gap-3 pt-2">
                <div class="flex items-center gap-2 text-white/90 text-sm">
                  <svg class="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <span>No Setup Fees</span>
                </div>
                <div class="flex items-center gap-2 text-white/90 text-sm">
                  <svg class="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <span>Easy Dashboard</span>
                </div>
                <div class="flex items-center gap-2 text-white/90 text-sm">
                  <svg class="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>

            <!-- Right Content - CTA Button -->
            <div class="flex-shrink-0">
              <button @click="showSellerModal = true" class="animated-cta-button" type="button">
                <strong>GET STARTED NOW</strong>
                <div id="container-stars">
                  <div id="stars"></div>
                </div>
                <div id="glow">
                  <div class="circle"></div>
                  <div class="circle"></div>
                </div>
              </button>
              <p class="text-white/70 text-xs text-center mt-3">
                ✨ Join now and get premium features
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Become Seller Modal -->
      <BecomeSellerModal
        :show="showSellerModal"
        @close="showSellerModal = false"
        @success="handleSellerUpgradeSuccess"
      />

      <!-- Stats Grid -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
          <div class="flex items-center justify-between mb-2">
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
          </div>
          <dt class="text-sm font-medium text-gray-500 mb-1">Received Items</dt>
          <dd class="text-2xl font-bold text-gray-900">{{ stats.totalOrders }}</dd>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
          <div class="flex items-center justify-between mb-2">
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
          </div>
          <dt class="text-sm font-medium text-gray-500 mb-1">Wallet</dt>
          <dd class="text-2xl font-bold text-gray-900">{{ formatCurrency(stats.walletBalance) }}</dd>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
          <div class="flex items-center justify-between mb-2">
            <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
              </svg>
            </div>
          </div>
          <dt class="text-sm font-medium text-gray-500 mb-1">Addresses</dt>
          <dd class="text-2xl font-bold text-gray-900">{{ stats.savedAddresses }}</dd>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
          <div class="flex items-center justify-between mb-2">
            <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <dt class="text-sm font-medium text-gray-500 mb-1">Status</dt>
          <dd class="text-2xl font-bold text-gray-900">{{ stats.accountStatus }}</dd>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            @click="emit('navigate-to', 'Addresses')"
            class="flex flex-col items-center p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <div
              class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-blue-200"
            >
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span class="text-sm font-medium text-gray-700 group-hover:text-blue-700">Add Address</span>
          </button>

          <button
            @click="emit('navigate-to', 'Wallet')"
            class="flex flex-col items-center p-4 rounded-lg border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all group"
          >
            <div
              class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-green-200"
            >
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v12m6-6H6" />
              </svg>
            </div>
            <span class="text-sm font-medium text-gray-700 group-hover:text-green-700">Top Up</span>
          </button>

          <button
            @click="emit('navigate-to', 'Profile')"
            class="flex flex-col items-center p-4 rounded-lg border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all group"
          >
            <div
              class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-purple-200"
            >
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <span class="text-sm font-medium text-gray-700 group-hover:text-purple-700">Edit Profile</span>
          </button>

          <button
            @click="emit('navigate-to', 'Settings')"
            class="flex flex-col items-center p-4 rounded-lg border-2 border-gray-200 hover:border-gray-500 hover:bg-gray-50 transition-all group"
          >
            <div
              class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-gray-200"
            >
              <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
              </svg>
            </div>
            <span class="text-sm font-medium text-gray-700 group-hover:text-gray-700">Settings</span>
          </button>
        </div>
      </div>

      <!-- Primary Address & Recent Activity Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <!-- Primary Address -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Primary Address</h3>
            <button
              @click="emit('navigate-to', 'Addresses')"
              class="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All
            </button>
          </div>

          <div v-if="primaryAddress" class="space-y-3">
            <div class="flex items-start space-x-3">
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </div>
              <div class="flex-1">
                <p class="font-medium text-gray-900">{{ primaryAddress.name || "Home" }}</p>
                <p class="text-sm text-gray-600 mt-1">{{ primaryAddress.street }}</p>
                <p class="text-sm text-gray-600">
                  {{ primaryAddress.city }}, {{ primaryAddress.state }} {{ primaryAddress.zipCode }}
                </p>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8">
            <svg class="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
            </svg>
            <p class="text-sm text-gray-500 mb-3">No address added yet</p>
            <button
              @click="emit('navigate-to', 'Addresses')"
              class="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Add your first address
            </button>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>

          <div v-if="recentActivities.length" class="space-y-4">
            <div v-for="activity in recentActivities.slice(0, 3)" :key="activity.id" class="flex items-start space-x-3">
              <div
                :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                  getActivityColor(activity.type),
                ]"
              >
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm text-gray-900" v-html="activity.description"></p>
                <p class="text-xs text-gray-500 mt-1">{{ formatTimeAgo(activity.timestamp) }}</p>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8">
            <svg class="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p class="text-sm text-gray-500">No recent activity</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { useUserQueries } from "@/composables/useUserQueries";
import { useWallet } from "@/composables/useWallet";
import { useOrderStore } from "@/stores/orderStore";
import BecomeSellerModal from "@/components/user/BecomeSellerModal.vue";

const emit = defineEmits(["navigate-to"]);

const authStore = useAuthStore();
const orderStore = useOrderStore();
const { useProfileQuery, useAddressesQuery } = useUserQueries();

// Queries
const { data: profileData } = useProfileQuery();
const { data: addressesData } = useAddressesQuery();

// Wallet composable dengan auto-refresh
const {
  balance,
  isLoading: isWalletLoading,
  refreshBalance,
  formatCurrency,
  startAutoRefresh,
  stopAutoRefresh,
} = useWallet();

// Computed
const profile = computed(() => profileData.value?.profile);
const addresses = computed(() => addressesData.value || []);
const showSellerModal = ref(false);

const canUpgradeToSeller = computed(() => {
  return authStore.user?.role === "user" && authStore.isAuthenticated;
});

const displayName = computed(() => {
  if (profile.value?.firstName) {
    return profile.value.firstName;
  }
  return authStore.user?.username || "User";
});

const handleSellerUpgradeSuccess = (data) => {
  // Toast notification handler
};

const profileCompleteness = computed(() => {
  if (!profile.value) return 0;

  const requiredFields = ["firstName", "lastName", "phone"];
  const optionalFields = ["avatar", "dateOfBirth", "gender"];
  const addressFields = addresses.value.length > 0 ? ["address"] : [];

  const totalFields = requiredFields.length + optionalFields.length + addressFields.length;
  let completedFields = 0;

  requiredFields.forEach(field => {
    if (profile.value[field]) completedFields++;
  });

  optionalFields.forEach(field => {
    if (field === "avatar" && profile.value.avatar?.url) {
      completedFields++;
    } else if (profile.value[field]) {
      completedFields++;
    }
  });

  if (addresses.value.length > 0) completedFields++;

  return Math.round((completedFields / totalFields) * 100);
});

const primaryAddress = computed(() => {
  return addresses.value.find(addr => addr.isDefault) || addresses.value[0] || null;
});

const stats = computed(() => ({
  totalOrders: orderStore.receivedOrders.length,
  walletBalance: balance.value || 0,
  savedAddresses: addresses.value.length,
  accountStatus: "Active",
}));

// Recent activities
const recentActivities = ref([
  {
    id: 1,
    type: "profile",
    description: "Profile information updated",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
]);

// Methods
const getGreetingMessage = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning! Ready to start your day?";
  if (hour < 18) return "Good afternoon! Hope you're having a great day!";
  return "Good evening! How was your day?";
};

const formatTimeAgo = date => {
  const now = new Date();
  const diff = now - date;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return "Just now";
};

const getActivityColor = type => {
  const colors = {
    order: "bg-green-500",
    address: "bg-blue-500",
    wallet: "bg-yellow-500",
    profile: "bg-purple-500",
    settings: "bg-gray-500",
  };
  return colors[type] || "bg-gray-500";
};

const loadDashboardData = async () => {
  try {
    await Promise.all([refreshBalance(), orderStore.fetchOrders({ page: 1, limit: 100 })]);
  } catch (error) {
    // Error handling
  }
};

onMounted(async () => {
  await loadDashboardData();
  startAutoRefresh(30000);
});

onBeforeUnmount(() => {
  stopAutoRefresh();
});
</script>

<style scoped>
.dashboard-content {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Enhanced Seller Banner Styles */
.seller-banner-wrapper {
  position: relative;
  min-height: 200px;
}

/* Animated Star Field */
.star-field {
  position: absolute;
  width: 200%;
  height: 200%;
  background-image: 
    radial-gradient(2px 2px at 20px 30px, white, transparent),
    radial-gradient(2px 2px at 60px 70px, white, transparent),
    radial-gradient(1px 1px at 50px 50px, white, transparent),
    radial-gradient(1px 1px at 130px 80px, white, transparent),
    radial-gradient(2px 2px at 90px 10px, white, transparent);
  background-size: 200px 200px;
  animation: starMove 20s linear infinite;
}

@keyframes starMove {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-200px);
  }
}

/* Floating Circles */
.floating-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
}

.circle-1 {
  width: 150px;
  height: 150px;
  top: -50px;
  right: 50px;
  animation: float 8s ease-in-out infinite;
}

.circle-2 {
  width: 100px;
  height: 100px;
  bottom: -30px;
  left: 80px;
  animation: float 6s ease-in-out infinite 1s;
}

.circle-3 {
  width: 80px;
  height: 80px;
  top: 50%;
  right: 20%;
  animation: float 7s ease-in-out infinite 2s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

/* Bounce Animation for Emoji */
@keyframes bounce-slow {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-bounce-slow {
  animation: bounce-slow 2s ease-in-out infinite;
}

/* Animated CTA Button */
.animated-cta-button {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 13rem;
  height: 3rem;
  background-size: 300% 300%;
  cursor: pointer;
  backdrop-filter: blur(1rem);
  border-radius: 5rem;
  transition: 0.5s;
  animation: gradient_301 5s ease infinite;
  border: double 4px transparent;
  background-image: linear-gradient(#212121, #212121),
    linear-gradient(
      137.48deg,
      #ffdb3b 10%,
      #fe53bb 45%,
      #8f51ea 67%,
      #0044ff 87%
    );
  background-origin: border-box;
  background-clip: content-box, border-box;
  position: relative;
  overflow: hidden;
}

#container-stars {
  position: absolute;
  z-index: -1;
  width: 100%;
  height: 100%;
  overflow: hidden;
  transition: 0.5s;
  backdrop-filter: blur(1rem);
  border-radius: 5rem;
}

.animated-cta-button strong {
  z-index: 2;
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 12px;
  letter-spacing: 3px;
  color: #ffffff;
  text-shadow: 0 0 4px white;
}

#glow {
  position: absolute;
  display: flex;
  width: 12rem;
}

.circle {
  width: 100%;
  height: 30px;
  filter: blur(2rem);
  animation: pulse_3011 4s infinite;
  z-index: -1;
}

.circle:nth-of-type(1) {
  background: rgba(254, 83, 186, 0.636);
}

.circle:nth-of-type(2) {
  background: rgba(142, 81, 234, 0.704);
}

.animated-cta-button:hover #container-stars {
  z-index: 1;
  background-color: #212121;
}

.animated-cta-button:hover {
  transform: scale(1.1);
}

.animated-cta-button:active {
  border: double 4px #fe53bb;
  background-origin: border-box;
  background-clip: content-box, border-box;
  animation: none;
}

.animated-cta-button:active .circle {
  background: #fe53bb;
}

#stars {
  position: relative;
  background: transparent;
  width: 200rem;
  height: 200rem;
}

#stars::after {
  content: "";
  position: absolute;
  top: -10rem;
  left: -100rem;
  width: 100%;
  height: 100%;
  animation: animStarRotate 90s linear infinite;
}

#stars::after {
  background-image: radial-gradient(#ffffff 1px, transparent 1%);
  background-size: 50px 50px;
}

#stars::before {
  content: "";
  position: absolute;
  top: 0;
  left: -50%;
  width: 170%;
  height: 500%;
  animation: animStar 60s linear infinite;
}

#stars::before {
  background-image: radial-gradient(#ffffff 1px, transparent 1%);
  background-size: 50px 50px;
  opacity: 0.5;
}

@keyframes animStar {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-135rem);
  }
}

@keyframes animStarRotate {
  from {
    transform: rotate(360deg);
  }
  to {
    transform: rotate(0);
  }
}

@keyframes gradient_301 {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes pulse_3011 {
  0% {
    transform: scale(0.75);
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(0, 0, 0, 0);
  }
  100% {
    transform: scale(0.75);
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
  }
}
</style>