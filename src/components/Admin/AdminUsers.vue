<!-- AdminUsers.vue - Clean User Management Component -->
<template>
  <div class="users-content">
    <!-- Header Section -->
    <div class="mb-6">
      <p class="mt-1 text-sm text-gray-500">Manage all users, roles, and account status</p>
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

    <!-- Filters & Search -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Search -->
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Search by username or email..."
            @input="handleSearch"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7]"
          />
        </div>

        <!-- Role Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Role</label>
          <select
            v-model="filters.role"
            @change="handleFilterChange"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7]"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="seller">Seller</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <!-- Status Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            v-model="filters.isActive"
            @change="handleFilterChange"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7]"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <!-- Table Header -->
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Users List</h3>
            <p class="text-sm text-gray-500 mt-1">{{ totalUsers }} total users</p>
          </div>
          <button
            @click="handleRefresh"
            :disabled="isLoading"
            class="px-4 py-2 bg-[#6C5CE7] text-white text-sm font-medium rounded-lg hover:bg-[#5B4FD7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <svg
              class="w-4 h-4"
              :class="{ 'animate-spin': isLoading }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading && !hasUsers" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6C5CE7]"></div>
        <span class="ml-2 text-gray-600">Loading users...</span>
      </div>

      <!-- Table Content -->
      <div v-else-if="hasUsers" class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined Date
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in users" :key="user._id" class="hover:bg-gray-50 transition-colors">
              <!-- User Info -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <img
                      v-if="user.avatar"
                      :src="user.avatar"
                      :alt="user.username"
                      class="h-10 w-10 rounded-full object-cover"
                    />
                    <div v-else class="h-10 w-10 rounded-full bg-[#6C5CE7] flex items-center justify-center">
                      <span class="text-white font-medium text-sm">{{ getUserInitials(user) }}</span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ user.username }}</div>
                    <div class="text-xs text-gray-500">ID: {{ user._id }}</div>
                  </div>
                </div>
              </td>

              <!-- Email -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ user.email }}</div>
              </td>

              <!-- Role -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    getRoleBadgeClass(user.role),
                  ]"
                >
                  {{ user.role }}
                </span>
              </td>

              <!-- Status -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
                  ]"
                >
                  {{ user.isActive ? "Active" : "Inactive" }}
                </span>
              </td>

              <!-- Joined Date -->
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(user.createdAt) }}
              </td>

              <!-- Actions -->
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-2">
                  <button @click="handleViewUser(user)" class="text-[#6C5CE7] hover:text-[#5B4FD7] font-medium">
                    View
                  </button>
                  <button @click="handleEditUser(user)" class="text-blue-600 hover:text-blue-700 font-medium">
                    Edit
                  </button>
                  <button
                    @click="handleDeleteUser(user)"
                    :disabled="isLoading"
                    class="text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <svg class="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <p class="text-sm text-gray-500">No users found</p>
      </div>

      <!-- Pagination -->
      <div v-if="hasUsers && pagination.totalPages > 1" class="px-6 py-4 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-500">
            Showing {{ (pagination.currentPage - 1) * pagination.itemsPerPage + 1 }} to
            {{ Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems) }} of
            {{ pagination.totalItems }} users
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="handlePageChange(pagination.currentPage - 1)"
              :disabled="pagination.currentPage === 1 || isLoading"
              class="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span class="text-sm text-gray-700">
              Page {{ pagination.currentPage }} of {{ pagination.totalPages }}
            </span>
            <button
              @click="handlePageChange(pagination.currentPage + 1)"
              :disabled="pagination.currentPage === pagination.totalPages || isLoading"
              class="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- View User Modal -->
    <UserViewModal v-if="showViewModal" :user="selectedUser" @close="showViewModal = false" />

    <!-- Edit User Modal -->
    <UserEditModal
      v-if="showEditModal"
      :user="selectedUser"
      @close="showEditModal = false"
      @success="handleEditSuccess"
    />

    <!-- Delete Confirmation Modal -->
    <DeleteConfirmModal
      v-if="showDeleteModal"
      :user="selectedUser"
      @close="showDeleteModal = false"
      @confirm="handleDeleteConfirm"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useAdminUsers } from "@/composables/useAdminUsers";
import UserViewModal from "@/components/admin/modals/UserViewModal.vue";
import UserEditModal from "@/components/admin/modals/UserEditModal.vue";
import DeleteConfirmModal from "@/components/admin/modals/DeleteConfirmModal.vue";

// Composable
const { users, pagination, isLoading, error, hasUsers, totalUsers, fetchUsers, clearError } = useAdminUsers();
// Local state
const filters = ref({
  search: "",
  role: "",
  isActive: "",
  page: 1,
  limit: 10,
});

const showViewModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const selectedUser = ref(null);
const searchTimeout = ref(null);

// Methods
const loadUsers = async () => {
  try {
    await fetchUsers(filters.value);
  } catch (err) {
    console.error("Error loading users:", err);
  }
};

const handleSearch = () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }

  searchTimeout.value = setTimeout(() => {
    filters.value.page = 1;
    loadUsers();
  }, 500);
};

const handleFilterChange = () => {
  filters.value.page = 1;
  loadUsers();
};

const handlePageChange = page => {
  filters.value.page = page;
  loadUsers();
};

const handleRefresh = () => {
  loadUsers();
};

const handleViewUser = user => {
  selectedUser.value = user;
  showViewModal.value = true;
};

const handleEditUser = user => {
  selectedUser.value = user;
  showEditModal.value = true;
};

const handleDeleteUser = user => {
  selectedUser.value = user;
  showDeleteModal.value = true;
};

const handleEditSuccess = () => {
  showEditModal.value = false;
  loadUsers();
};

const handleDeleteConfirm = () => {
  showDeleteModal.value = false;
  loadUsers();
};

// Helpers
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
    month: "short",
    day: "numeric",
  });
};

// Lifecycle
onMounted(() => {
  loadUsers();
});
</script>

<style scoped>
.users-content {
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

/* Custom scrollbar for table */
.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 10px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
