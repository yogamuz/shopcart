<!-- UserSettings.vue -->
<template>
  <div class="settings-content">
    <!-- Header Section -->
    <div class="mb-6">
      <p class="mt-1 text-sm text-gray-500">Manage your account preferences and security settings</p>
    </div>

    <div class="space-y-6">
      <!-- Security Settings -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">Security</h3>
          <p class="text-sm text-gray-500 mt-1">Manage your password and security preferences</p>
        </div>
        <div class="p-6 space-y-6">
          <!-- Change Password -->
          <div>
            <h4 class="text-sm font-medium text-gray-900 mb-4">Change Password</h4>

            <!-- ✅ Success Message -->
            <div v-if="successMessage" class="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div class="flex items-center">
                <svg class="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <p class="text-sm text-green-800">{{ successMessage }}</p>
              </div>
            </div>

            <!-- ✅ Error Message -->
            <div v-if="errorMessage" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div class="flex items-center">
                <svg class="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
                <p class="text-sm text-red-800">{{ errorMessage }}</p>
              </div>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <input
                  v-model="passwordForm.currentPassword"
                  type="password"
                  :disabled="isLoading"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7] disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  v-model="passwordForm.newPassword"
                  type="password"
                  :disabled="isLoading"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7] disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <p class="text-xs text-gray-500 mt-1">Must contain at least one lowercase, uppercase, and number</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <input
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  :disabled="isLoading"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7] disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              <button
                @click="changePassword"
                :disabled="!canChangePassword || isLoading"
                class="px-4 py-2 bg-[#6C5CE7] text-white text-sm font-medium rounded-lg hover:bg-[#5B4FD7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isLoading ? "Updating..." : "Update Password" }}
              </button>
            </div>
          </div>

          <!-- Two-Factor Authentication -->
          <div class="border-t pt-6">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
                <p class="text-sm text-gray-500 mt-1">Add an extra layer of security to your account</p>
              </div>
              <button
                @click="toggle2FA"
                :class="[
                  'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] focus:ring-offset-2',
                  security.twoFactorEnabled ? 'bg-[#6C5CE7]' : 'bg-gray-200',
                ]"
              >
                <span
                  :class="[
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                    security.twoFactorEnabled ? 'translate-x-5' : 'translate-x-0',
                  ]"
                ></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Notification Preferences -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">Notifications</h3>
          <p class="text-sm text-gray-500 mt-1">Choose which notifications you want to receive</p>
        </div>
        <div class="p-6">
          <div class="space-y-6">
            <div
              v-for="notification in notifications"
              :key="notification.key"
              class="flex items-center justify-between"
            >
              <div>
                <h4 class="text-sm font-medium text-gray-900">{{ notification.title }}</h4>
                <p class="text-sm text-gray-500 mt-1">{{ notification.description }}</p>
              </div>
              <button
                @click="toggleNotification(notification.key)"
                :class="[
                  'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] focus:ring-offset-2',
                  notification.enabled ? 'bg-[#6C5CE7]' : 'bg-gray-200',
                ]"
              >
                <span
                  :class="[
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                    notification.enabled ? 'translate-x-5' : 'translate-x-0',
                  ]"
                ></span>
              </button>
            </div>
          </div>

          <div class="flex justify-end mt-6">
            <button
              @click="saveNotificationSettings"
              class="px-4 py-2 bg-[#6C5CE7] text-white text-sm font-medium rounded-lg hover:bg-[#5B4FD7] transition-colors"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>

      <!-- Privacy Settings -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">Privacy</h3>
          <p class="text-sm text-gray-500 mt-1">Control your privacy and data sharing preferences</p>
        </div>
        <div class="p-6">
          <div class="space-y-6">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-sm font-medium text-gray-900">Profile Visibility</h4>
                <p class="text-sm text-gray-500 mt-1">Make your profile visible to other users</p>
              </div>
              <button
                @click="privacy.profileVisible = !privacy.profileVisible"
                :class="[
                  'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] focus:ring-offset-2',
                  privacy.profileVisible ? 'bg-[#6C5CE7]' : 'bg-gray-200',
                ]"
              >
                <span
                  :class="[
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                    privacy.profileVisible ? 'translate-x-5' : 'translate-x-0',
                  ]"
                ></span>
              </button>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-sm font-medium text-gray-900">Activity Status</h4>
                <p class="text-sm text-gray-500 mt-1">Show when you were last active</p>
              </div>
              <button
                @click="privacy.activityVisible = !privacy.activityVisible"
                :class="[
                  'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] focus:ring-offset-2',
                  privacy.activityVisible ? 'bg-[#6C5CE7]' : 'bg-gray-200',
                ]"
              >
                <span
                  :class="[
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                    privacy.activityVisible ? 'translate-x-5' : 'translate-x-0',
                  ]"
                ></span>
              </button>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-sm font-medium text-gray-900">Data Analytics</h4>
                <p class="text-sm text-gray-500 mt-1">Allow us to use your data to improve our services</p>
              </div>
              <button
                @click="privacy.analyticsEnabled = !privacy.analyticsEnabled"
                :class="[
                  'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] focus:ring-offset-2',
                  privacy.analyticsEnabled ? 'bg-[#6C5CE7]' : 'bg-gray-200',
                ]"
              >
                <span
                  :class="[
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                    privacy.analyticsEnabled ? 'translate-x-5' : 'translate-x-0',
                  ]"
                ></span>
              </button>
            </div>
          </div>

          <div class="flex justify-end mt-6">
            <button
              @click="savePrivacySettings"
              class="px-4 py-2 bg-[#6C5CE7] text-white text-sm font-medium rounded-lg hover:bg-[#5B4FD7] transition-colors"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="bg-white rounded-lg shadow-sm border border-red-200">
        <div class="p-6 border-b border-red-200">
          <h3 class="text-lg font-semibold text-red-900">Danger Zone</h3>
          <p class="text-sm text-red-600 mt-1">Irreversible and destructive actions</p>
        </div>
        <div class="p-6">
          <div class="flex items-center justify-between p-4 border border-red-200 rounded-lg">
            <div>
              <h4 class="text-sm font-medium text-gray-900">Delete Account</h4>
              <p class="text-sm text-gray-500 mt-1">
                Once you delete your account, there is no going back. Please be certain.
              </p>
            </div>
            <button
              @click="showDeleteModal = true"
              class="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Account Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div class="flex items-center mb-4">
          <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
            <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900">Delete Account</h3>
        </div>
        <p class="text-sm text-gray-600 mb-4">
          Are you sure you want to delete your account? This action cannot be undone and you will lose all your data.
        </p>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2"> Type "DELETE" to confirm </label>
          <input
            v-model="deleteConfirmText"
            type="text"
            placeholder="DELETE"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
          />
        </div>
        <div class="flex space-x-3">
          <button
            @click="
              showDeleteModal = false;
              deleteConfirmText = '';
            "
            class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            @click="deleteAccount"
            :disabled="deleteConfirmText !== 'DELETE'"
            class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/authStore";

const { changePassword: changePasswordAuth, isLoading } = useAuthStore()

const emit = defineEmits(["search"]);

// Reactive state
const showDeleteModal = ref(false);
const deleteConfirmText = ref("");

// Profile data
const profile = ref({
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1 (555) 123-4567",
  dateOfBirth: "1990-01-15",
});

// Password form
const passwordForm = ref({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

// Security settings
const security = ref({
  twoFactorEnabled: false,
});

// Notification settings
const notifications = ref([
  {
    key: "orderUpdates",
    title: "Order Updates",
    description: "Get notified about your order status changes",
    enabled: true,
  },
  {
    key: "promotions",
    title: "Promotions & Offers",
    description: "Receive emails about special offers and promotions",
    enabled: false,
  },
  {
    key: "newsletter",
    title: "Newsletter",
    description: "Get our weekly newsletter with tips and updates",
    enabled: true,
  },
  {
    key: "security",
    title: "Security Alerts",
    description: "Get notified about security-related activities",
    enabled: true,
  },
]);

// Privacy settings
const privacy = ref({
  profileVisible: true,
  activityVisible: false,
  analyticsEnabled: true,
});

// Computed properties
const canChangePassword = computed(() => {
  return (
    passwordForm.value.currentPassword &&
    passwordForm.value.newPassword &&
    passwordForm.value.confirmPassword &&
    passwordForm.value.newPassword === passwordForm.value.confirmPassword
  );
});

// Methods
const getInitials = name => {
  return name
    .split(" ")
    .map(word => word[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

const saveProfile = () => {
  // Mock save profile
  ;
  // In real app, this would call API
};

const successMessage = ref("");
const errorMessage = ref("");

// ✅ FIXED: Change password method
const changePassword = async () => {
  if (!canChangePassword.value) return;

  try {
    // Clear previous messages
    successMessage.value = "";
    errorMessage.value = "";

    ;

    // Call API
    const result = await changePasswordAuth(
      passwordForm.value.currentPassword,
      passwordForm.value.newPassword,
      passwordForm.value.confirmPassword
    );

    // Success
    successMessage.value = result.message || "Password changed successfully";

    // Reset form
    passwordForm.value = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    ;

    // Auto-hide success message after 5 seconds
    setTimeout(() => {
      successMessage.value = "";
    }, 5000);
  } catch (error) {
    console.error("❌ Change password error:", error);
    errorMessage.value = error.message || "Failed to change password";

    // Auto-hide error message after 5 seconds
    setTimeout(() => {
      errorMessage.value = "";
    }, 5000);
  }
};

const toggle2FA = () => {
  security.value.twoFactorEnabled = !security.value.twoFactorEnabled;
  ;
  // In real app, this would call API
};

const toggleNotification = key => {
  const notification = notifications.value.find(n => n.key === key);
  if (notification) {
    notification.enabled = !notification.enabled;
  }
};

const saveNotificationSettings = () => {
  ;
  // In real app, this would call API
};

const savePrivacySettings = () => {
  ;
  // In real app, this would call API
};

const deleteAccount = () => {
  if (deleteConfirmText.value !== "DELETE") return;

  // Mock account deletion
  ;
  showDeleteModal.value = false;
  deleteConfirmText.value = "";
  // In real app, this would call API and redirect to home
};

onMounted(() => {
  // Load settings data
  ;
});
onMounted(() => {
  try {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      
      if (parsed.notifications) {
        notifications.value = notifications.value.map(notif => ({
          ...notif,
          enabled: parsed.notifications[notif.key] ?? notif.enabled
        }));
      }
      
      if (parsed.privacy) {
        privacy.value = { ...privacy.value, ...parsed.privacy };
      }
      
      if (parsed.security) {
        security.value = { ...security.value, ...parsed.security };
      }
    }
  } catch (error) {
    console.error("Failed to load settings:", error);
  }
});
onMounted(() => {
  ;
  
  try {
    const savedSettings = localStorage.getItem('userSettings');
    
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      
      if (parsed.notifications) {
        notifications.value = notifications.value.map(notif => ({
          ...notif,
          enabled: parsed.notifications[notif.key] ?? notif.enabled
        }));
      }
      
      if (parsed.privacy) {
        privacy.value = { ...privacy.value, ...parsed.privacy };
      }
      
      if (parsed.security) {
        security.value = { ...security.value, ...parsed.security };
      }
      
      ;
    }
  } catch (error) {
    console.error("Failed to load settings:", error);
  }
});
</script>

<style scoped>
.settings-content {
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
</style>
