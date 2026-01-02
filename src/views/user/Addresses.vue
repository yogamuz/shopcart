<!-- useraddress.vue -->
<template>
  <div class="address-content">
    <!-- Header Section -->
    <div v-if="!embedded" class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <p class="mt-1 text-sm text-gray-500">Manage your shipping addresses for faster checkout</p>
      </div>
      <button
        @click="openAddModal"
        :disabled="loading"
        class="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-[#6C5CE7] text-white text-sm font-medium rounded-lg hover:bg-[#5B4FD7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add New Address
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading && addresses.length === 0" class="flex items-center justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6C5CE7]"></div>
      <span class="ml-2 text-gray-600">Loading addresses...</span>
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

    <!-- Search and Filters -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6" v-if="addresses.length > 0">
      <div class="flex justify-end">
        <select
          v-model="filterType"
          class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7]"
        >
          <option value="all">All Types</option>
          <option value="Home">Home</option>
          <option value="Office">Work</option>
          <option value="Other">Other</option>
        </select>
      </div>
    </div>

    <!-- Addresses List -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20" v-if="filteredAddresses.length > 0">
      <div
        v-for="(address, index) in filteredAddresses"
        :key="address.index || index"
        class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center">
            <div
              :class="[
                'w-10 h-10 rounded-lg flex items-center justify-center mr-3',
                getAddressTypeColor(address.label),
              ]"
            >
              <component :is="getAddressIcon(address.label)" class="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">
                {{ address.name || address.label || "Address" }}
              </h3>
              <div class="flex items-center gap-2 mt-1">
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600"
                >
                  {{ address.label }}
                </span>
                <span
                  v-if="address.isDefault"
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"
                >
                  Default
                </span>
              </div>
            </div>
          </div>

          <!-- Actions Menu -->
          <div class="relative">
            <button
              @click="toggleMenu(address.index || index)"
              class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              :disabled="loading"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"
                />
              </svg>
            </button>

            <div
              v-if="activeMenu === (address.index || index)"
              class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
            >
              <button
                @click="openEditModal(address, address.index || index)"
                class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Edit Address
              </button>
              <button
                v-if="!address.isDefault"
                @click="handleSetDefault(address.index || index)"
                class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Set as Default
              </button>
              <hr class="my-1" />
              <button
                @click="handleDeleteAddress(address.index || index)"
                :disabled="address.isDefault"
                class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete Address
              </button>
            </div>
          </div>
        </div>

        <!-- Address Details -->
        <div class="text-sm text-gray-600">
          <p class="font-medium text-gray-900">{{ getAddressPreview(address) }}</p>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && filteredAddresses.length === 0" class="text-center py-12">
      <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">
        {{ searchQuery ? "No addresses found" : "No addresses yet" }}
      </h3>
      <p class="text-gray-500 mb-4">
        {{ searchQuery ? "Try a different search term" : "Get started by adding your first address" }}
      </p>
      <button
        v-if="!searchQuery"
        @click="openAddModal"
        class="inline-flex items-center px-4 py-2 bg-[#6C5CE7] text-white text-sm font-medium rounded-lg hover:bg-[#5B4FD7] transition-colors"
      >
        Add New Address
      </button>
    </div>

    <!-- Add/Edit Address Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            {{ isEditing ? "Edit Address" : "Add New Address" }}
          </h3>

          <form @submit.prevent="handleSaveAddress">
            <div class="space-y-4">
              <!-- Label -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Label</label>
                <select
                  v-model="addressForm.label"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7]"
                >
                  <option value="Home">Home</option>
                  <option value="Office">Office</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <!-- Address Name (Custom) -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Address Name
                  <span class="text-xs text-gray-500">(Optional)</span>
                </label>
                <input
                  v-model="addressForm.name"
                  type="text"
                  maxlength="50"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7]"
                  placeholder="e.g., Rumah Kedua, Kantor Cabang"
                />
                <p class="mt-1 text-xs text-gray-500">Give this address a memorable name</p>
              </div>

              <!-- Street Address -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
                <input
                  v-model="addressForm.street"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7]"
                  placeholder="Enter street address"
                />
              </div>

              <!-- City & Province -->
              <div class="grid grid-cols-2 gap-4">
                <!-- City Autocomplete -->
                <div class="relative">
                  <label class="block text-sm font-medium text-gray-700 mb-2">City *</label>
                  <input
                    v-model="addressForm.city"
                    type="text"
                    required
                    @input="onCityInput"
                    @focus="showCitySuggestions = true"
                    @blur="hideCitySuggestions"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7]"
                    placeholder="Enter city"
                    autocomplete="off"
                  />

                  <!-- City Suggestions Dropdown -->
                  <div
                    v-if="showCitySuggestions && filteredCities.length > 0"
                    class="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-40 overflow-y-auto suggestion-dropdown"
                  >
                    <button
                      v-for="city in filteredCities"
                      :key="city.name"
                      type="button"
                      @mousedown.prevent="selectCity(city)"
                      class="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-b-0"
                    >
                      <div class="font-medium">{{ city.name }}</div>
                      <div class="text-xs text-gray-500">{{ city.province }}</div>
                    </button>
                  </div>
                </div>

                <!-- State/Province Display -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Province *</label>
                  <input
                    v-model="addressForm.state"
                    type="text"
                    readonly
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    placeholder="Auto-filled"
                  />
                </div>
              </div>

              <!-- ZIP Code & Country -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">ZIP Code *</label>
                  <input
                    v-model="addressForm.zipCode"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7]"
                    placeholder="12345"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <input
                    v-model="addressForm.country"
                    type="text"
                    readonly
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    value="Indonesia"
                  />
                </div>
              </div>

              <!-- Default Checkbox -->
              <div class="flex items-center">
                <input
                  v-model="addressForm.isDefault"
                  type="checkbox"
                  id="isDefault"
                  class="h-4 w-4 text-[#6C5CE7] focus:ring-[#6C5CE7] border-gray-300 rounded"
                />
                <label for="isDefault" class="ml-2 text-sm text-gray-700">Set as default address</label>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex space-x-3 pt-4">
              <button
                type="button"
                @click="closeModal"
                class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="loading || !isFormValid"
                class="flex-1 px-4 py-2 bg-[#6C5CE7] text-white rounded-lg hover:bg-[#5B4FD7] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ loading ? "Saving..." : isEditing ? "Update" : "Save" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    <!-- Confirm Delete Address Modal -->
<ConfirmModalProfile
  v-model="showDeleteConfirm"
  title="Delete Address"
  confirm-text="Delete"
  cancel-text="Cancel"
  @confirm="confirmDeleteAddress"
  @cancel="cancelDeleteAddress"
/>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { Home, Building2, MapPin } from "lucide-vue-next";
import { useUserProfileStore } from "@/stores/userProfileStore";
import ConfirmModalProfile from "../../components/User/ConfirmModalProfile.vue";

const props = defineProps({
  embedded: {
    type: Boolean,
    default: false,
  },
  showSearch: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["search", "address-selected"]);

const profileStore = useUserProfileStore();

const addresses = computed(() => profileStore.addresses);
const loading = computed(() => profileStore.loading);
const error = computed(() => profileStore.error);

// Data kota-kota Jabodetabek
const jabodetabekCities = ref([
  // DKI Jakarta
  { name: "Jakarta Pusat", province: "DKI Jakarta" },
  { name: "Jakarta Utara", province: "DKI Jakarta" },
  { name: "Jakarta Barat", province: "DKI Jakarta" },
  { name: "Jakarta Selatan", province: "DKI Jakarta" },
  { name: "Jakarta Timur", province: "DKI Jakarta" },
  { name: "Kepulauan Seribu", province: "DKI Jakarta" },

  // Jawa Barat - Bodetabek
  { name: "Bogor", province: "Jawa Barat" },
  { name: "Bogor Barat", province: "Jawa Barat" },
  { name: "Bogor Timur", province: "Jawa Barat" },
  { name: "Bogor Utara", province: "Jawa Barat" },
  { name: "Bogor Selatan", province: "Jawa Barat" },
  { name: "Cibinong", province: "Jawa Barat" },
  { name: "Cileungsi", province: "Jawa Barat" },
  { name: "Gunung Putri", province: "Jawa Barat" },
  { name: "Parung", province: "Jawa Barat" },

  // Depok
  { name: "Depok", province: "Jawa Barat" },
  { name: "Beji", province: "Jawa Barat" },
  { name: "Cimanggis", province: "Jawa Barat" },
  { name: "Cinere", province: "Jawa Barat" },
  { name: "Limo", province: "Jawa Barat" },
  { name: "Pancoran Mas", province: "Jawa Barat" },
  { name: "Sawangan", province: "Jawa Barat" },
  { name: "Sukmajaya", province: "Jawa Barat" },
  { name: "Tapos", province: "Jawa Barat" },

  // Tangerang
  { name: "Tangerang", province: "Banten" },
  { name: "Tangerang Selatan", province: "Banten" },
  { name: "Serpong", province: "Banten" },
  { name: "BSD City", province: "Banten" },
  { name: "Alam Sutera", province: "Banten" },
  { name: "Bintaro", province: "Banten" },
  { name: "Cipondoh", province: "Banten" },
  { name: "Karawaci", province: "Banten" },
  { name: "Lippo Karawaci", province: "Banten" },
  { name: "Pamulang", province: "Banten" },
  { name: "Pondok Aren", province: "Banten" },
  { name: "Ciputat", province: "Banten" },

  // Bekasi
  { name: "Bekasi", province: "Jawa Barat" },
  { name: "Bekasi Timur", province: "Jawa Barat" },
  { name: "Bekasi Barat", province: "Jawa Barat" },
  { name: "Bekasi Utara", province: "Jawa Barat" },
  { name: "Bekasi Selatan", province: "Jawa Barat" },
  { name: "Cikarang", province: "Jawa Barat" },
  { name: "Tambun", province: "Jawa Barat" },
  { name: "Cibitung", province: "Jawa Barat" },
  { name: "Jababeka", province: "Jawa Barat" },
  { name: "Lippo Cikarang", province: "Jawa Barat" },
]);

// Local state
const searchQuery = ref("");
const filterType = ref("all");
const showModal = ref(false);
const isEditing = ref(false);
const editingIndex = ref(null);
const activeMenu = ref(null);

// Autocomplete state
const showCitySuggestions = ref(false);
const filteredCities = ref([]);
const showDeleteConfirm = ref(false);
const addressToDelete = ref(null);


// Address form
const addressForm = ref({
  name: "",
  street: "",
  city: "",
  state: "",
  zipCode: "",
  country: "Indonesia",
  label: "Home",
  isDefault: false,
});

// Computed properties
const filteredAddresses = computed(() => {
  let filtered = addresses.value || [];

  if (filterType.value !== "all") {
    filtered = filtered.filter(addr => addr.label === filterType.value);
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(addr => {
      const addressStr = getAddressPreview(addr).toLowerCase();
      return addressStr.includes(query) || (addr.label && addr.label.toLowerCase().includes(query));
    });
  }

  return filtered;
});

const isFormValid = computed(() => {
  return (
    addressForm.value.street.trim() !== "" &&
    addressForm.value.city.trim() !== "" &&
    addressForm.value.state.trim() !== "" &&
    addressForm.value.zipCode.trim() !== ""
  );
});

// Methods
const handleAddressClick = (address, index) => {
  if (props.embedded) {
    emit("address-selected", { address, index });
  }
};

const handleSearch = () => {
  emit("search", searchQuery.value);
};

const clearError = () => {
  profileStore.clearError();
};

const formatAddress = address => {
  if (!address) return "";
  return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country || "Indonesia"}`;
};

const getAddressPreview = address => {
  const formatted = formatAddress(address);
  const maxLength = 50;
  if (formatted.length <= maxLength) return formatted;
  return formatted.substring(0, maxLength - 3) + "...";
};

// Autocomplete methods
const onCityInput = () => {
  const query = addressForm.value.city.toLowerCase();

  if (query.length === 0) {
    filteredCities.value = [];
    addressForm.value.state = "";
    return;
  }

  filteredCities.value = jabodetabekCities.value.filter(city => city.name.toLowerCase().includes(query)).slice(0, 8);

  showCitySuggestions.value = filteredCities.value.length > 0;
};

const selectCity = city => {
  addressForm.value.city = city.name;
  addressForm.value.state = city.province;
  showCitySuggestions.value = false;
  filteredCities.value = [];
};

const hideCitySuggestions = () => {
  setTimeout(() => {
    showCitySuggestions.value = false;
  }, 150);
};

const toggleMenu = addressIndex => {
  activeMenu.value = activeMenu.value === addressIndex ? null : addressIndex;
};

const openAddModal = () => {
  resetForm();
  isEditing.value = false;
  editingIndex.value = null;
  showModal.value = true;
};

const openEditModal = (address, index) => {
  addressForm.value = {
    name: address.name || "",
    street: address.street || "",
    city: address.city || "",
    state: address.state || "",
    zipCode: address.zipCode || "",
    country: address.country || "Indonesia",
    label: address.label || "Home",
    isDefault: address.isDefault || false,
  };
  isEditing.value = true;
  editingIndex.value = index;
  showModal.value = true;
  activeMenu.value = null;

  showCitySuggestions.value = false;
  filteredCities.value = [];
};

const closeModal = () => {
  showModal.value = false;
  resetForm();
  isEditing.value = false;
  editingIndex.value = null;
};

const resetForm = () => {
  addressForm.value = {
    name: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Indonesia",
    label: "Home",
    isDefault: false,
  };

  showCitySuggestions.value = false;
  filteredCities.value = [];
};

const handleSaveAddress = async () => {
  try {
    let result;
    
    if (isEditing.value) {
      result = await profileStore.updateAddress(editingIndex.value, addressForm.value);
    } else {
      result = await profileStore.addAddress(addressForm.value);
    }

    if (result.success) {
      closeModal();
      // ✅ Data sudah auto-update via store, tidak perlu queryClient
    }
  } catch (err) {
    console.error("Failed to save address:", err);
  }
};

// Tambahkan setelah handleSaveAddress (sekitar baris 395)
const updateAddressCache = (updatedAddress, index) => {
  queryClient.setQueryData(["user", "addresses"], (old) => {
    if (!old) return old;
    
    const newAddresses = [...old];
    if (index !== null) {
      // Update existing
      newAddresses[index] = { ...newAddresses[index], ...updatedAddress };
    } else {
      // Add new
      newAddresses.push(updatedAddress);
    }
    
    return newAddresses;
  });
};

// Sekitar baris 400
const handleSetDefault = async addressIndex => {
  try {
    await profileStore.setDefaultAddress(addressIndex);
    activeMenu.value = null;
    
    // ✅ Consistent: invalidate dari component
    await queryClient.invalidateQueries({ queryKey: ["user", "addresses"] });
    
  } catch (err) {
    console.error("Failed to set default address:", err);
  }
};

const handleDeleteAddress = (addressIndex) => {
  const address = addresses.value[addressIndex];
  if (!address) return;

  addressToDelete.value = addressIndex;
  showDeleteConfirm.value = true;
  activeMenu.value = null;
};

onMounted(async () => {
  if (!addresses.value || addresses.value.length === 0) {
    try {
      await profileStore.fetchAddresses(true);
    } catch (error) {
      console.error("Failed to fetch addresses on mount:", error);
    }
  }
});

const confirmDeleteAddress = async () => {
  if (addressToDelete.value === null) return;

  try {
    await profileStore.removeAddress(addressToDelete.value);
    showDeleteConfirm.value = false;
    addressToDelete.value = null;
    
    await queryClient.invalidateQueries({ queryKey: ["user", "addresses"] });
    
  } catch (err) {
    console.error("Failed to delete address:", err);
  }
};

const cancelDeleteAddress = () => {
  showDeleteConfirm.value = false;
  addressToDelete.value = null;
};

const getAddressTypeColor = type => {
  const colors = {
    Home: "bg-blue-500",
    Office: "bg-green-500",
    Other: "bg-purple-500",
  };
  return colors[type] || "bg-gray-500";
};

const getAddressIcon = type => {
  const icons = {
    Home: Home,
    Office: Building2,
    Other: MapPin,
  };
  return icons[type] || MapPin;
};

const handleClickOutside = event => {
  if (!event.target.closest(".relative")) {
    activeMenu.value = null;
  }
};

// ✅ Lifecycle - HAPUS initialize()
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  // TanStack Query auto-fetch, no need to call initialize
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
onMounted(async () => {
  ;
  
  if (profileStore.addresses.length === 0) {
    ;
    await profileStore.fetchAddresses(true);
  } else {
    ;
  }
});
</script>
<style scoped>
.address-content {
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

/* Autocomplete dropdown styling */
.suggestion-dropdown {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #f7fafc;
}

.suggestion-dropdown::-webkit-scrollbar {
  width: 4px;
}

.suggestion-dropdown::-webkit-scrollbar-track {
  background: #f7fafc;
}

.suggestion-dropdown::-webkit-scrollbar-thumb {
  background-color: #cbd5e0;
  border-radius: 2px;
}
</style>