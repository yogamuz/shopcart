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
              </select>
            </div>
          </div>

          <div class="mt-6 flex justify-end">
            <button
              type="submit"
              :disabled="loading || !isFormValid"
              class="px-6 py-2 bg-[#6C5CE7] text-white rounded-lg hover:bg-[#5B4FD7] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ loading ? "Saving..." : "Save Changes" }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Addresses Section -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Saved Addresses</h3>
            <p class="text-sm text-gray-500 mt-1">Manage your delivery addresses</p>
          </div>
        </div>
      </div>

      <div class="p-6">
        <div v-if="addresses.length === 0" class="text-center py-8">
          <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
          </svg>
          <p class="text-gray-500">No addresses saved yet</p>
          <p class="text-sm text-gray-400 mt-1">Add an address to make checkout faster</p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="(address, index) in addresses.slice(0, 2)"
            :key="index"
            class="flex items-start p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
          >
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              :class="getAddressTypeColor(address.label)"
            >
              <component :is="getAddressIcon(address.label)" class="w-5 h-5 text-white" />
            </div>
            <div class="ml-4 flex-1">
              <div class="flex items-center justify-between">
                <h4 class="font-medium text-gray-900 capitalize">{{ address.label }}</h4>
                <span v-if="address.isDefault" class="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                  Default
                </span>
              </div>
              <p class="text-sm text-gray-600 mt-1">{{ formatAddress(address) }}</p>
            </div>
          </div>
          <p v-if="addresses.length > 2" class="text-sm text-gray-500 text-center mt-4">
            + {{ addresses.length - 2 }} more addresses
          </p>
        </div>
      </div>
    </div>

    <!-- ✅ Avatar Crop Modal (dengan props yang benar) -->
    <AvatarCropModal
      v-model="showCropModal"
      :image-src="tempImageSrc"
      :file-name="tempFileName"
      @crop="handleCropComplete"
      @cancel="handleCropCancel"
    />

    <!-- ✅ Remove Avatar Confirmation Modal (dengan ConfirmModalProfile) -->
    <ConfirmModalProfile
      v-model="showRemoveConfirm"
      title="Remove Avatar"
      message="Are you sure you want to remove your profile picture?"
      confirm-text="Remove"
      cancel-text="Cancel"
      @confirm="confirmRemoveAvatar"
      @cancel="cancelRemoveAvatar"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { useUserProfileStore } from "@/stores/userProfileStore";
import { Home, Building2, MapPin, Upload } from "lucide-vue-next";
// ✅ Import komponen yang benar
import AvatarCropModal from "@/components/User/AvatarCropModal.vue";
import ConfirmModalProfile from "@/components/User/ConfirmModalProfile.vue";

const router = useRouter();
const authStore = useAuthStore();
const userProfileStore = useUserProfileStore();

// ========== REFS ==========
const fileInput = ref(null);
const showAvatarMenu = ref(false);
const showCropModal = ref(false);
const showRemoveConfirm = ref(false);
const tempImageSrc = ref("");
const tempFileName = ref("");

const profileForm = ref({
  firstName: "",
  lastName: "",
  phone: "",
  dateOfBirth: "",
  gender: "",
});

// ========== COMPUTED ==========
const profile = computed(() => userProfileStore.profile);
const addresses = computed(() => userProfileStore.addresses);
const loading = computed(() => userProfileStore.loading);
const error = computed(() => userProfileStore.error);
const hasProfile = computed(() => userProfileStore.hasProfile);
const isUploading = computed(() => userProfileStore.isUploading);
const uploadProgress = computed(() => userProfileStore.uploadProgress);

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

// ========== METHODS ==========
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
    // Data sudah otomatis ter-update di store
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
    await userProfileStore.removeAvatar();
    showRemoveConfirm.value = false;
    // Data sudah otomatis ter-update di store
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
    await userProfileStore.uploadAvatar(croppedFile);
    showCropModal.value = false;
    tempImageSrc.value = "";
    // Data sudah otomatis ter-update di store
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

// ✅ PERBAIKAN: Fungsi untuk load data
const loadProfileData = async () => {
  try {
    console.log("👤 Loading profile data...");
    
    // ✅ Fetch profile jika belum ada atau force refresh
    if (!userProfileStore.profile) {
      await userProfileStore.fetchProfile(false);
    }

    // ✅ Fetch addresses jika belum ada
    if (userProfileStore.addresses.length === 0) {
      await userProfileStore.fetchAddresses(false);
    }
  } catch (err) {
    console.error("❌ Error loading profile data:", err);
  }
};

// ========== LIFECYCLE ==========
onMounted(async () => {
  console.log("🔄 Profile component mounted");
  document.addEventListener("click", handleClickOutside);
  
  // ✅ Load data saat component mounted
  await loadProfileData();
});

onUnmounted(() => {
  console.log("👋 Profile component unmounted");
  document.removeEventListener("click", handleClickOutside);
});

// ✅ PERBAIKAN: Watch route changes untuk reload data
watch(
  () => router.currentRoute.value.name,
  async (newRouteName) => {
    if (newRouteName === "UserProfile") {
      console.log("👤 Profile page visited via route change");
      await loadProfileData();
    }
  },
  { immediate: false } // ✅ Tidak immediate karena sudah di-handle di onMounted
);

// Watch profile changes untuk update form
watch(
  () => userProfileStore.profile,
  newProfile => {
    if (newProfile) {
      console.log("📝 Updating profile form with new data");
      profileForm.value = {
        firstName: newProfile.firstName || "",
        lastName: newProfile.lastName || "",
        phone: newProfile.phone || "",
        dateOfBirth: newProfile.dateOfBirth ? new Date(newProfile.dateOfBirth).toISOString().split("T")[0] : "",
        gender: newProfile.gender || "",
      };
    }
  },
  { immediate: true, deep: true }
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