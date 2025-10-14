<!-- components/admin/modals/UserEditModal.vue -->
<template>
  <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="$emit('close')">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">Edit User</h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-sm text-red-800">{{ error }}</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Username</label>
          <input
            v-model="form.username"
            type="text"
            required
            :disabled="isLoading"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7] disabled:bg-gray-50"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            v-model="form.email"
            type="email"
            required
            :disabled="isLoading"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7] disabled:bg-gray-50"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Role</label>
          <select
            v-model="form.role"
            required
            :disabled="isLoading"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7] disabled:bg-gray-50"
          >
            <option value="user">User</option>
            <option value="seller">Seller</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            v-model="form.isActive"
            required
            :disabled="isLoading"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7] disabled:bg-gray-50"
          >
            <option :value="true">Active</option>
            <option :value="false">Inactive</option>
          </select>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            @click="$emit('close')"
            :disabled="isLoading"
            class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isLoading"
            class="px-4 py-2 bg-[#6C5CE7] text-white text-sm font-medium rounded-lg hover:bg-[#5B4FD7] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isLoading ? "Saving..." : "Save Changes" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import { useAdminUsers } from "@/composables/useAdminUsers";

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["close", "success"]);

const { updateUser, isLoading, error } = useAdminUsers();

const form = reactive({
  username: "",
  email: "",
  role: "",
  isActive: true,
});

// Initialize form with user data
watch(
  () => props.user,
  (newUser) => {
    if (newUser) {
      form.username = newUser.username;
      form.email = newUser.email;
      form.role = newUser.role;
      form.isActive = newUser.isActive;
    }
  },
  { immediate: true }
);

const handleSubmit = async () => {
  try {
    await updateUser(props.user._id, form);
    emit("success");
  } catch (err) {
    console.error("Error updating user:", err);
  }
};
</script>