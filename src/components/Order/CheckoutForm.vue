<!-- CheckoutForm.vue -->
<template>
  <div class="bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in-up">
    <div class="p-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Order Summary -->
        <div class="space-y-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

          <!-- Cart Items -->
          <div class="space-y-4">
            <div
              v-for="item in cartItems"
              :key="getItemKey(item)"
              class="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
            >
              <img
                :src="getProductImage(item)"
                :alt="getProductName(item)"
                class="w-16 h-16 object-cover rounded-lg"
                @error="handleImageError"
              />
              <div class="flex-1">
                <h3 class="font-semibold text-gray-900">
                  {{ getProductName(item) }}
                </h3>
                <p class="text-sm text-gray-600">Qty: {{ item.quantity }}</p>
              </div>
              <div class="text-right">
                <p class="font-semibold text-gray-900">
                  {{ formatCurrency(getProductPrice(item) * item.quantity) }}
                </p>
                <p class="text-sm text-gray-500">
                  {{ formatCurrency(getProductPrice(item)) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Price Breakdown -->
          <div class="border-t pt-4 space-y-2">
            <div class="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{{ formatCurrency(subtotal) }}</span>
            </div>
            <div v-if="discountAmount > 0" class="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-{{ formatCurrency(discountAmount) }}</span>
            </div>
            <div class="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>{{ shippingCost > 0 ? formatCurrency(shippingCost) : "Free" }}</span>
            </div>
            <div class="border-t pt-2 flex justify-between text-xl font-bold text-gray-900">
              <span>Total</span>
              <span>{{ formatCurrency(total) }}</span>
            </div>
          </div>
        </div>

        <!-- Checkout Form -->
        <div class="space-y-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Checkout Details</h2>

          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Loading State -->
            <div v-if="profileLoading" class="flex items-center justify-center py-8">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span class="ml-2 text-gray-600 text-sm">Loading addresses...</span>
            </div>

            <!-- Empty State -->
            <div v-else-if="userAddresses.length === 0" class="text-center py-8">
              <p class="text-gray-500 mb-3">No addresses found</p>
              <button
                type="button"
                @click="openAddAddressModal"
                class="text-blue-600 hover:underline text-sm font-medium"
              >
                Add your first address
              </button>
            </div>

            <!-- Address List -->
            <div v-else>
              <label class="block text-sm font-semibold text-gray-700 mb-3">Shipping Address</label>
              <div class="space-y-3">
                <div v-for="(address, index) in userAddresses" :key="address.index || index" class="relative">
                  <input
                    :id="'address-' + index"
                    v-model="selectedAddressId"
                    :value="index"
                    type="radio"
                    name="address"
                    class="sr-only"
                  />
                  <label
                    :for="'address-' + index"
                    class="block p-4 border-2 rounded-lg cursor-pointer transition-colors"
                    :class="
                      selectedAddressId == index
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    "
                  >
                    <div class="flex items-start space-x-3">
                      <div
                        class="w-4 h-4 rounded-full border-2 mt-1 flex-shrink-0"
                        :class="selectedAddressId == index ? 'border-blue-500 bg-blue-500' : 'border-gray-300'"
                      >
                        <div
                          v-if="selectedAddressId == index"
                          class="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"
                        ></div>
                      </div>
                      <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                          <span class="font-medium text-gray-900">
                            {{ address.name || address.label || "Address" }}
                          </span>
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
                        <div class="text-sm text-gray-600 mt-1">
                          {{ address.street }}<br />
                          {{ address.city }}, {{ address.state }} {{ address.zipCode }}<br />
                          {{ address.country || "Indonesia" }}
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <!-- Add New Address Button -->
              <button
                type="button"
                @click="openAddAddressModal"
                class="mt-3 w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
              >
                + Add New Address
              </button>
            </div>

            <!-- Payment Method -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-3">Payment Method</label>
              <div class="relative">
                <select
                  v-model="paymentMethod"
                  class="w-full p-4 border border-gray-300 rounded-lg bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 appearance-none cursor-pointer"
                  disabled
                >
                  <option value="shop_pay">Shop Pay</option>
                </select>
                <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <div class="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <p class="mt-2 text-sm text-gray-500">Pay securely using your Shop Pay wallet balance.</p>
            </div>

            <!-- Order Notes -->
            <div>
              <label for="notes" class="block text-sm font-semibold text-gray-700 mb-2">Order Notes (Optional)</label>
              <textarea
                id="notes"
                v-model="orderNotes"
                rows="3"
                class="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="Any special instructions for your order..."
              ></textarea>
            </div>

            <!-- Terms and Conditions -->
            <div class="flex items-start space-x-3">
              <input
                id="terms"
                v-model="acceptTerms"
                type="checkbox"
                class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
              />
              <label for="terms" class="text-sm text-gray-700">
                I agree to the
                <a href="#" class="text-blue-600 hover:underline">Terms and Conditions</a>
                and
                <a href="#" class="text-blue-600 hover:underline">Privacy Policy</a>
              </label>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="!canSubmit || isLoading"
              class="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
            >
              <div v-if="isLoading" class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing Order...
              </div>
              <div v-else class="flex items-center justify-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Place Order - {{ formatCurrency(total) }}
              </div>
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- Add Address Modal -->
    <div v-if="showAddressModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Add New Address</h3>

          <form @submit.prevent="handleSaveNewAddress">
            <div class="space-y-4">
              <!-- Label -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Label</label>
                <select
                  v-model="newAddressForm.label"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Home">Home</option>
                  <option value="Office">Office</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <!-- Address Name -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Address Name
                  <span class="text-xs text-gray-500">(Optional)</span>
                </label>
                <input
                  v-model="newAddressForm.name"
                  type="text"
                  maxlength="50"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Rumah Kedua, Kantor Cabang"
                />
              </div>

              <!-- Street Address -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
                <input
                  v-model="newAddressForm.street"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter street address"
                />
              </div>

              <!-- City & Province -->
              <div class="grid grid-cols-2 gap-4">
                <div class="relative">
                  <label class="block text-sm font-medium text-gray-700 mb-2">City *</label>
                  <input
                    v-model="newAddressForm.city"
                    type="text"
                    required
                    @input="onCityInput"
                    @focus="showCitySuggestions = true"
                    @blur="hideCitySuggestions"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter city"
                    autocomplete="off"
                  />

                  <div
                    v-if="showCitySuggestions && filteredCities.length > 0"
                    class="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-40 overflow-y-auto mt-1"
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

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Province *</label>
                  <input
                    v-model="newAddressForm.state"
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
                    v-model="newAddressForm.zipCode"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="12345"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <input
                    type="text"
                    readonly
                    value="Indonesia"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
              </div>

              <!-- Default Checkbox -->
              <div class="flex items-center">
                <input
                  v-model="newAddressForm.isDefault"
                  type="checkbox"
                  id="isDefaultNew"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label for="isDefaultNew" class="ml-2 text-sm text-gray-700">Set as default address</label>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex space-x-3 pt-4 mt-6">
              <button
                type="button"
                @click="closeAddressModal"
                :disabled="profileLoading"
                class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="profileLoading || !isNewAddressFormValid"
                class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ profileLoading ? "Saving..." : "Save" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from "vue";
import { storeToRefs } from "pinia"; // ✅ TAMBAHKAN INI
import { useAuthStore } from "@/stores/authStore";
import { useUserProfileStore } from "@/stores/userProfileStore"; // ✅ GANTI DARI useUserProfile

const props = defineProps({
  cartItems: { type: Array, required: true },
  subtotal: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  appliedCoupon: { type: Object, default: null },
  shippingCost: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
  isLoading: { type: Boolean, default: false },
});

const emit = defineEmits(["create-order", "address-selected"]);

// ✅ GANTI: Use store directly instead of composable
const authStore = useAuthStore();
const profileStore = useUserProfileStore();

// ✅ GANTI: Get reactive refs from store
const { addresses, defaultAddress, loading: profileLoading } = storeToRefs(profileStore);

// Form data
const selectedAddressId = ref(null);
const paymentMethod = ref("shop_pay");
const orderNotes = ref("");
const acceptTerms = ref(false);

// Add address modal
const showAddressModal = ref(false);
const showCitySuggestions = ref(false);
const filteredCities = ref([]);

// New address form
const newAddressForm = ref({
  name: "",
  street: "",
  city: "",
  state: "",
  zipCode: "",
  country: "Indonesia",
  label: "Home",
  isDefault: false,
});

// Data kota-kota Jabodetabek
const jabodetabekCities = ref([
  { name: "Jakarta Pusat", province: "DKI Jakarta" },
  { name: "Jakarta Utara", province: "DKI Jakarta" },
  { name: "Jakarta Barat", province: "DKI Jakarta" },
  { name: "Jakarta Selatan", province: "DKI Jakarta" },
  { name: "Jakarta Timur", province: "DKI Jakarta" },
  { name: "Kepulauan Seribu", province: "DKI Jakarta" },
  { name: "Bogor", province: "Jawa Barat" },
  { name: "Depok", province: "Jawa Barat" },
  { name: "Bekasi", province: "Jawa Barat" },
  { name: "Cibinong", province: "Jawa Barat" },
  { name: "Cileungsi", province: "Jawa Barat" },
  { name: "Cikarang", province: "Jawa Barat" },
  { name: "Tangerang", province: "Banten" },
  { name: "Tangerang Selatan", province: "Banten" },
  { name: "Serpong", province: "Banten" },
  { name: "BSD City", province: "Banten" },
  { name: "Bintaro", province: "Banten" },
  { name: "Karawaci", province: "Banten" },
  { name: "Pamulang", province: "Banten" },
  { name: "Ciputat", province: "Banten" },
]);

// ✅ SIMPLIFIED: userAddresses computed
const userAddresses = computed(() => {
  return Array.isArray(addresses.value) ? addresses.value : [];
});

// Computed
const canSubmit = computed(() => {
  return selectedAddressId.value !== null && acceptTerms.value && !props.isLoading;
});

const isNewAddressFormValid = computed(() => {
  return (
    newAddressForm.value.street.trim() !== "" &&
    newAddressForm.value.city.trim() !== "" &&
    newAddressForm.value.state.trim() !== "" &&
    newAddressForm.value.zipCode.trim() !== ""
  );
});

// Methods
const formatCurrency = amount => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const getItemKey = item => {
  return item.productId || item.product?.id || item._id || item.id;
};

const getProductName = item => {
  return item.product?.title || "Unknown Product";
};

const getProductPrice = item => {
  return item.unitPrice || item.product?.currentPrice || 0;
};

const getProductImage = item => {
  const product = item.product || item;
  return (
    product.image?.url ||
    product.images?.[0]?.url ||
    product.images?.[0] ||
    "https://via.placeholder.com/150x150/f3f4f6/9ca3af?text=No+Image"
  );
};

const handleImageError = event => {
  event.target.src = "https://via.placeholder.com/150x150/f3f4f6/9ca3af?text=No+Image";
};

const handleSubmit = () => {
  if (!canSubmit.value) return;

  const orderData = {
    addressId: selectedAddressId.value,
    paymentMethod: paymentMethod.value,
    notes: orderNotes.value.trim(),
  };

  emit("create-order", orderData);
};

// Address modal methods
const openAddAddressModal = () => {
  resetAddressForm();
  showAddressModal.value = true;
};

const closeAddressModal = () => {
  showAddressModal.value = false;
  resetAddressForm();
};

const resetAddressForm = () => {
  newAddressForm.value = {
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

// City autocomplete methods
const onCityInput = () => {
  const query = newAddressForm.value.city.toLowerCase();

  if (query.length === 0) {
    filteredCities.value = [];
    newAddressForm.value.state = "";
    return;
  }

  filteredCities.value = jabodetabekCities.value.filter(city => city.name.toLowerCase().includes(query)).slice(0, 8);

  showCitySuggestions.value = filteredCities.value.length > 0;
};

const selectCity = city => {
  newAddressForm.value.city = city.name;
  newAddressForm.value.state = city.province;
  showCitySuggestions.value = false;
  filteredCities.value = [];
};

const hideCitySuggestions = () => {
  setTimeout(() => {
    showCitySuggestions.value = false;
  }, 150);
};

// ✅ GANTI: Use store method directly
const handleSaveNewAddress = async () => {
  if (!isNewAddressFormValid.value) return;

  try {
    await profileStore.addAddress(newAddressForm.value);

    const newIndex = userAddresses.value.length - 1;
    selectedAddressId.value = newIndex;

    closeAddressModal();
  } catch (error) {
    console.error("Failed to add address:", error);
    alert("Failed to add address. Please try again.");
  }
};

// ✅ GANTI: Use store initialize method
onMounted(async () => {
  try {
    await profileStore.initialize();

    if (defaultAddress.value) {
      const defaultIndex = userAddresses.value.findIndex(addr => addr.isDefault);
      if (defaultIndex !== -1) {
        selectedAddressId.value = defaultIndex;
      }
    } else if (userAddresses.value.length > 0) {
      selectedAddressId.value = 0;
    }
  } catch (error) {
    console.error("Failed to load addresses:", error);
  }
});
</script>
<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

input[type="radio"]:checked + label .w-4 {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

select {
  padding-left: 3rem;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
