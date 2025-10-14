<!--USERPROFILE.VUE -->
<template>
  <div class="profile-content">
    <!-- Header Section -->
    <div class="mb-6">
      <p class="mt-1 text-sm text-gray-500">Manage your personal information and profile details</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !hasProfile" class="flex items-center justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6C5CE7]"></div>
      <span class="ml-2 text-gray-600">Loading profile...</span>
    </div>

    <!-- Error State -->
    <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div class="flex">
        <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div class="ml-3">
          <p class="text-sm text-red-800">{{ error }}</p>
          <button @click="clearError" class="mt-2 text-xs text-red-600 underline hover:no-underline">Dismiss</button>
        </div>
      </div>
    </div>

    <!-- Profile Information -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Personal Information</h3>
            <p class="text-sm text-gray-500 mt-1">Update your personal details</p>
          </div>
          <!-- Profile Completeness -->
          <div class="text-right">
            <div class="flex items-center space-x-2">
              <div class="w-16 h-16 relative">
                <svg class="w-16 h-16 transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    stroke-width="4"
                    fill="none"
                    class="text-gray-200"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    stroke-width="4"
                    fill="none"
                    :stroke-dasharray="176"
                    :stroke-dashoffset="176 - (176 * profileCompleteness) / 100"
                    class="text-[#6C5CE7] transition-all duration-300"
                    stroke-linecap="round"
                  />
                </svg>
                <div class="absolute inset-0 flex items-center justify-center">
                  <span class="text-xs font-medium text-gray-900">{{ profileCompleteness }}%</span>
                </div>
              </div>
            </div>
            <p class="text-xs text-gray-500 mt-1">Profile Complete</p>
          </div>
        </div>
      </div>

      <div class="p-6">
        <!-- Avatar Section -->
        <div class="flex items-center space-x-6 mb-6">
          <div class="relative group cursor-pointer" @click="triggerAvatarMenu">
            <div v-if="avatarUrl" class="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200">
              <img :src="avatarUrl" :alt="profileDisplayName" class="w-full h-full object-cover" />
            </div>
            <div v-else class="w-20 h-20 bg-[#6C5CE7] rounded-full flex items-center justify-center">
              <span class="text-white font-semibold text-xl">{{ profileInitials }}</span>
            </div>

            <!-- Upload Progress Overlay -->
            <div v-if="isUploading" class="absolute inset-0 rounded-full overflow-hidden bg-black/60 backdrop-blur-sm">
              <!-- Progress fill from bottom -->
              <div
                class="absolute inset-0 bg-[#6C5CE7]/80 transition-all duration-300 ease-out"
                :style="{ transform: `translateY(${100 - uploadProgress}%)` }"
              ></div>

              <!-- Content overlay -->
              <div class="absolute inset-0 flex flex-col items-center justify-center z-10">
                <Upload class="w-6 h-6 text-white mb-2 animate-pulse" />
                <span class="text-white font-semibold text-sm drop-shadow-lg"> {{ uploadProgress }}% </span>
              </div>
            </div>

            <!-- Pencil Icon Overlay -->
            <div
              v-if="!isUploading && !loading"
              class="absolute bottom-0 right-0 w-6 h-6 bg-[#6C5CE7] rounded-full flex items-center justify-center border-2 border-white shadow-sm group-hover:bg-[#5B4FD7] transition-colors"
            >
              <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </div>

            <!-- Avatar Menu Popup -->
            <div
              v-if="showAvatarMenu"
              class="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
              @click.stop
            >
              <button
                @click="handleChangeAvatar"
                :disabled="isUploading || loading"
                class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>Change Picture</span>
              </button>
              <button
                v-if="avatarUrl"
                @click="handleRemoveAvatar"
                :disabled="isUploading || loading"
                class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                <span>Remove Picture</span>
              </button>
            </div>
          </div>

          <div class="flex-1">
            <p class="text-sm text-gray-600">Click on avatar to change or remove picture</p>
            <p class="text-xs text-gray-500 mt-1">JPG, PNG or WebP. Max size of 3MB</p>

            <!-- Hidden file input -->
            <input
              ref="fileInput"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              @change="handleFileUpload"
              class="hidden"
            />
          </div>
        </div>
        <!-- Profile Form -->
        <form @submit.prevent="handleSaveProfile">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <input
                v-model="profileForm.firstName"
                type="text"
                :disabled="loading"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7] disabled:bg-gray-50"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <input
                v-model="profileForm.lastName"
                type="text"
                :disabled="loading"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7] disabled:bg-gray-50"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                :value="userEmail"
                type="email"
                disabled
                class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
              <p class="text-xs text-gray-500 mt-1">Email cannot be changed here</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                v-model="profileForm.phone"
                type="tel"
                placeholder="+62 or 08xxxxxxxxxx"
                :disabled="loading"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7] disabled:bg-gray-50"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
              <input
                v-model="profileForm.dateOfBirth"
                type="date"
                :disabled="loading"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7] disabled:bg-gray-50"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <select
                v-model="profileForm.gender"
                :disabled="loading"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7] disabled:bg-gray-50"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div class="flex justify-end mt-6">
            <button
              type="submit"
              :disabled="loading || isUploading || !isFormValid"
              class="px-6 py-2 bg-[#6C5CE7] text-white text-sm font-medium rounded-lg hover:bg-[#5B4FD7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ loading ? "Saving..." : "Save Changes" }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Primary Address Overview -->
    <div class="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Primary Address</h3>
            <p class="text-sm text-gray-500 mt-1">Your default shipping address</p>
          </div>
          <button
            @click="$emit('navigate-to', 'Addresses')"
            class="text-sm font-medium text-[#6C5CE7] hover:text-[#5B4FD7] hover:underline"
          >
            Manage All Addresses
          </button>
        </div>
      </div>

      <div class="p-6">
        <div v-if="defaultAddress" class="flex items-start space-x-4">
          <!-- Icon berdasarkan label -->
          <div
            :class="[
              'w-10 h-10 rounded-lg flex items-center justify-center',
              getAddressTypeColor(defaultAddress.label),
            ]"
          >
            <component :is="getAddressIcon(defaultAddress.label)" class="w-5 h-5 text-white" />
          </div>

          <div class="flex-1">
            <!-- Name (custom name) atau fallback ke label -->
            <p class="font-medium text-gray-900">
              {{ defaultAddress.name || defaultAddress.label || "Primary Address" }}
            </p>

            <!-- Label badge -->
            <div class="flex items-center gap-2 mt-1">
              <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                {{ defaultAddress.label }}
              </span>
              <span
                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"
              >
                Default
              </span>
            </div>

            <!-- Full address -->
            <p class="text-sm text-gray-600 mt-2">{{ formatAddress(defaultAddress) }}</p>
          </div>
        </div>

        <div v-else class="text-center py-4">
          <svg class="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
          </svg>
          <p class="text-sm text-gray-500 mb-2">No primary address set</p>
          <button
            @click="$emit('navigate-to', 'Addresses')"
            class="text-sm font-medium text-[#6C5CE7] hover:text-[#5B4FD7] hover:underline"
          >
            Add Address
          </button>
        </div>
      </div>
    </div>
  </div>
  <!-- Confirm Remove Avatar Modal -->
  <ConfirmModalProfile
    v-model="showRemoveConfirm"
    title="Delete Photo"
    confirm-text="Remove"
    cancel-text="Cancel"
    @confirm="confirmRemoveAvatar"
    @cancel="cancelRemoveAvatar"
  />

  <!-- Avatar Crop Modal -->
  <AvatarCropModal
    v-model="showCropModal"
    :image-src="tempImageSrc"
    :file-name="tempFileName"
    @crop="handleCropComplete"
    @cancel="handleCropCancel"
  />
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from "vue";
import { useUserProfileStore } from "@/stores/userProfileStore";
import { useAuthStore } from "@/stores/authStore";
import { useUserQueries } from "@/composables/useUserQueries";
import { Home, Building2, MapPin, Upload } from "lucide-vue-next";
import ConfirmModalProfile from "@/components/user/ConfirmModalProfile.vue";
import AvatarCropModal from "@/components/user/AvatarCropModal.vue";

// Stores & Composables
const userProfileStore = useUserProfileStore();
const authStore = useAuthStore();
const { useProfileQuery, useAddressesQuery, queryClient } = useUserQueries();

// Queries
const {
  data: profileData,
  isLoading: isLoadingProfile,
  error: profileQueryError,
  refetch: refetchProfile,
} = useProfileQuery();

const {
  data: addressesData,
  isLoading: isLoadingAddresses,
  error: addressesQueryError,
  refetch: refetchAddresses,
} = useAddressesQuery();

// Local reactive state
const profileForm = ref({
  firstName: "",
  lastName: "",
  phone: "",
  dateOfBirth: "",
  gender: "",
});

const showAvatarMenu = ref(false);
const showRemoveConfirm = ref(false);
const fileInput = ref(null);
const showCropModal = ref(false);
const tempImageSrc = ref("");
const tempFileName = ref("");

// Computed from queries
const profile = computed(() => profileData.value?.profile || null);
const addresses = computed(() => addressesData.value || []);
const loading = computed(() => isLoadingProfile.value || userProfileStore.loading);
const error = computed(() => userProfileStore.error || profileQueryError.value?.message || null);
const hasProfile = computed(() => !!profile.value);
const uploadProgress = computed(() => userProfileStore.uploadProgress);
const isUploading = computed(() => userProfileStore.isUploading);

// User info
const userEmail = computed(() => authStore.user?.email || "");
const profileDisplayName = computed(() => userProfileStore.fullName);
const profileInitials = computed(() => userProfileStore.initials);
const avatarUrl = computed(() => {
  return profile.value?.avatar?.url || profile.value?.avatar || null;
});
const defaultAddress = computed(() => addresses.value.find(addr => addr.isDefault) || addresses.value[0] || null);

const isFormValid = computed(() => {
  return profileForm.value.firstName?.trim() && profileForm.value.lastName?.trim();
});

const profileCompleteness = computed(() => {
  return userProfileStore.profileCompleteness;
});

// Methods
const clearError = () => {
  userProfileStore.clearError();
};

const handleSaveProfile = async () => {
  try {
    if (hasProfile.value) {
      await userProfileStore.updateProfile(profileForm.value);
    } else {
      await userProfileStore.createProfile(profileForm.value);
    }

    await queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
    await refetchProfile();
  } catch (err) {
    console.error("Error saving profile:", err);
  }
};

const triggerAvatarMenu = () => {
  if (!isUploading.value && !loading.value) {
    showAvatarMenu.value = !showAvatarMenu.value;
  }
};

const handleChangeAvatar = () => {
  showAvatarMenu.value = false;
  fileInput.value?.click();
};

const handleRemoveAvatar = () => {
  showAvatarMenu.value = false;
  showRemoveConfirm.value = true;
};

const confirmRemoveAvatar = async () => {
  try {
    await userProfileStore.removeAvatar(queryClient);
    await refetchProfile();
    showRemoveConfirm.value = false;
  } catch (err) {
    console.error("Error removing avatar:", err);
  }
};

const cancelRemoveAvatar = () => {
  showRemoveConfirm.value = false;
};

const handleFileUpload = event => {
  const file = event.target.files?.[0];
  if (!file) return;

  // Validation
  const maxSize = 3 * 1024 * 1024; // 3MB
  if (file.size > maxSize) {
    userProfileStore.error = "File size exceeds 3MB limit";
    event.target.value = "";
    return;
  }

  const validTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!validTypes.includes(file.type)) {
    userProfileStore.error = "Only JPG, PNG, or WebP files are allowed";
    event.target.value = "";
    return;
  }

  // Open crop modal
  tempFileName.value = file.name;
  const reader = new FileReader();
  reader.onload = e => {
    tempImageSrc.value = e.target.result;
    showCropModal.value = true;
  };
  reader.readAsDataURL(file);

  event.target.value = "";
};

const handleCropComplete = async croppedFile => {
  try {
    await userProfileStore.uploadAvatar(croppedFile, queryClient);
    await refetchProfile();
    showCropModal.value = false;
    tempImageSrc.value = "";
  } catch (err) {
    console.error("Error uploading cropped avatar:", err);
  }
};

const handleCropCancel = () => {
  showCropModal.value = false;
  tempImageSrc.value = "";
  tempFileName.value = "";
};

// Address helpers
const getAddressIcon = label => {
  const icons = {
    home: Home,
    office: Building2,
    other: MapPin,
  };
  return icons[label?.toLowerCase()] || MapPin;
};

const getAddressTypeColor = label => {
  const colors = {
    home: "bg-blue-500",
    office: "bg-purple-500",
    other: "bg-gray-500",
  };
  return colors[label?.toLowerCase()] || "bg-gray-500";
};

const formatAddress = address => {
  if (!address) return "";
  const parts = [address.street, address.district, address.city, address.province, address.postalCode].filter(Boolean);
  return parts.join(", ");
};

// Close menu when clicking outside
const handleClickOutside = event => {
  if (showAvatarMenu.value && !event.target.closest(".relative.group")) {
    showAvatarMenu.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

watch(
  () => profile.value,
  newProfile => {
    if (newProfile) {
      profileForm.value = {
        firstName: newProfile.firstName || "",
        lastName: newProfile.lastName || "",
        phone: newProfile.phone || "",
        // ✅ PERBAIKAN: Parse date dengan benar
        dateOfBirth: newProfile.dateOfBirth ? new Date(newProfile.dateOfBirth).toISOString().split("T")[0] : "",
        gender: newProfile.gender || "",
      };

      console.log("✅ Form synced with profile:", profileForm.value);
    }
  },
  { immediate: true, deep: true }
);

// Sync addresses to store when query updates
watch(
  () => addressesData.value,
  newAddresses => {
    if (newAddresses) {
      userProfileStore.addresses = newAddresses;
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.profile-content {
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
/* Wave animation */
.wave-animation {
  position: absolute;
  top: -10px;
  left: 0;
  width: 100%;
  height: 20px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 100%;
  animation: wave 1.5s ease-in-out infinite;
}

@keyframes wave {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-5px);
  }
}
</style>
