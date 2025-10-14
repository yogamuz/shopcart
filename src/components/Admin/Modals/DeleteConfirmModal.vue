<!-- components/admin/modals/DeleteConfirmModal.vue -->
<template>
  <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="$emit('close')">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
      <!-- Header -->
      <div class="p-6">
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Delete User</h3>
            <p class="text-sm text-gray-500 mt-1">This action cannot be undone</p>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="px-6 pb-4">
        <p class="text-sm text-gray-600">
          Are you sure you want to delete <strong>{{ user.username }}</strong>?
        </p>

        <!-- Delete Type Options -->
        <div class="mt-4 space-y-3">
          <label class="flex items-start space-x-3 cursor-pointer">
            <input
              v-model="deleteType"
              type="radio"
              value="soft"
              class="mt-1 text-[#6C5CE7] focus:ring-[#6C5CE7]"
            />
            <div>
              <p class="text-sm font-medium text-gray-900">Soft Delete (Recommended)</p>
              <p class="text-xs text-gray-500">User account will be deactivated but data preserved</p>
            </div>
          </label>

          <label class="flex items-start space-x-3 cursor-pointer">
            <input
              v-model="deleteType"
              type="radio"
              value="permanent"
              class="mt-1 text-red-600 focus:ring-red-600"
            />
            <div>
              <p class="text-sm font-medium text-gray-900">Permanent Delete</p>
              <p class="text-xs text-red-600">User and all associated data will be permanently removed</p>
            </div>
          </label>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mx-6 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-sm text-red-800">{{ error }}</p>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
        <button
          @click="$emit('close')"
          :disabled="isLoading"
          class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          @click="handleDelete"
          :disabled="isLoading"
          class="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isLoading ? "Deleting..." : deleteType === "permanent" ? "Delete Permanently" : "Deactivate" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useAdminUsers } from "@/composables/useAdminUsers";

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["close", "confirm"]);

const { deleteUser, isLoading, error } = useAdminUsers();

const deleteType = ref("soft");

const handleDelete = async () => {
  try {
    const permanent = deleteType.value === "permanent";
    await deleteUser(props.user._id, permanent);
    emit("confirm");
  } catch (err) {
    console.error("Error deleting user:", err);
  }
};
</script>