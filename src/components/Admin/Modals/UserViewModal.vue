<!-- components/admin/modals/UserViewModal.vue -->
<template>
  <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="$emit('close')">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">User Details</h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 space-y-6">
        <!-- User Avatar & Basic Info -->
        <div class="flex items-center space-x-4">
          <div v-if="user.avatar" class="w-16 h-16 rounded-full overflow-hidden">
            <img :src="user.avatar" :alt="user.username" class="w-full h-full object-cover" />
          </div>
          <div v-else class="w-16 h-16 rounded-full bg-[#6C5CE7] flex items-center justify-center">
            <span class="text-white font-semibold text-xl">{{ getUserInitials(user) }}</span>
          </div>
          <div>
            <h4 class="text-xl font-semibold text-gray-900">{{ user.username }}</h4>
            <p class="text-sm text-gray-500">{{ user.email }}</p>
          </div>
        </div>

        <!-- User Info Grid -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-500 mb-1">User ID</label>
            <p class="text-sm text-gray-900 font-mono">{{ user._id }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-500 mb-1">Role</label>
            <span
              :class="[
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                getRoleBadgeClass(user.role),
              ]"
            >
              {{ user.role }}
            </span>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-500 mb-1">Status</label>
            <span
              :class="[
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
              ]"
            >
              {{ user.isActive ? "Active" : "Inactive" }}
            </span>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-500 mb-1">Joined Date</label>
            <p class="text-sm text-gray-900">{{ formatDate(user.createdAt) }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-500 mb-1">Last Updated</label>
            <p class="text-sm text-gray-900">{{ formatDate(user.updatedAt) }}</p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
        <button
          @click="$emit('close')"
          class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
});

defineEmits(["close"]);

const getUserInitials = user => {
  if (!user.username) return "U";
  const words = user.username.split(" ");
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return user.username.slice(0, 2).toUpperCase();
};

const getRoleBadgeClass = role => {
  const classes = {
    admin: "bg-purple-100 text-purple-800",
    seller: "bg-blue-100 text-blue-800",
    user: "bg-gray-100 text-gray-800",
  };
  return classes[role] || "bg-gray-100 text-gray-800";
};

const formatDate = dateString => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
</script>
