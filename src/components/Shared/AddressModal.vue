<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">
          {{ isEditing ? "Edit Address" : "Add New Address" }}
        </h3>

        <form @submit.prevent="handleSubmit">
          <div class="space-y-4">
            <!-- Label -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Label</label>
              <select
                v-model="form.label"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7]"
              >
                <option value="Home">Home</option>
                <option value="Office">Office</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <!-- Address Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Address Name <span class="text-xs text-gray-500">(Optional)</span>
              </label>
              <input
                v-model="form.name"
                type="text"
                maxlength="50"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7]"
                placeholder="e.g., Rumah Kedua, Kantor Cabang"
              />
            </div>

            <!-- Street Address -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
              <input
                v-model="form.street"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7]"
                placeholder="Enter street address"
              />
            </div>

            <!-- City & Province -->
            <div class="grid grid-cols-2 gap-4">
              <div class="relative">
                <label class="block text-sm font-medium text-gray-700 mb-2">City *</label>
                <input
                  v-model="form.city"
                  type="text"
                  required
                  @input="onCityInput"
                  @focus="showSuggestions = true"
                  @blur="hideSuggestions"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7]"
                  placeholder="Enter city"
                  autocomplete="off"
                />
                <div
                  v-if="showSuggestions && filteredCities.length > 0"
                  class="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-40 overflow-y-auto"
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
                  v-model="form.state"
                  type="text"
                  readonly
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  placeholder="Auto-filled"
                />
              </div>
            </div>

            <!-- ZIP & Country -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">ZIP Code *</label>
                <input
                  v-model="form.zipCode"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7]"
                  placeholder="12345"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <input
                  v-model="form.country"
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
                v-model="form.isDefault"
                type="checkbox"
                id="modal-isDefault"
                class="h-4 w-4 text-[#6C5CE7] focus:ring-[#6C5CE7] border-gray-300 rounded"
              />
              <label for="modal-isDefault" class="ml-2 text-sm text-gray-700">Set as default address</label>
            </div>
          </div>

          <!-- Buttons -->
          <div class="flex space-x-3 pt-4">
            <button
              type="button"
              @click="$emit('close')"
              class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="loading || !isFormValid"
              class="flex-1 px-4 py-2 bg-[#6C5CE7] text-white rounded-lg hover:bg-[#5B4FD7] disabled:opacity-50"
            >
              {{ loading ? "Saving..." : isEditing ? "Update" : "Save" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useUserProfile } from '@/composables/useUserProfile';
import { cities } from '@/data/cities'; // Extract cities data ke file terpisah

const props = defineProps({
  show: Boolean,
  address: Object,
  isEditing: Boolean
});

const emit = defineEmits(['close', 'saved']);

const { addAddress, updateAddress, loading } = useUserProfile();

const form = ref({
  name: '',
  street: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'Indonesia',
  label: 'Home',
  isDefault: false
});

const showSuggestions = ref(false);
const filteredCities = ref([]);

const isFormValid = computed(() => {
  return form.value.street.trim() && form.value.city.trim() && 
         form.value.state.trim() && form.value.zipCode.trim();
});

watch(() => props.address, (newAddress) => {
  if (newAddress) {
    form.value = { ...newAddress };
  } else {
    resetForm();
  }
}, { immediate: true });

const onCityInput = () => {
  const query = form.value.city.toLowerCase();
  if (!query) {
    filteredCities.value = [];
    form.value.state = '';
    return;
  }
  filteredCities.value = cities.filter(c => 
    c.name.toLowerCase().includes(query)
  ).slice(0, 8);
  showSuggestions.value = filteredCities.value.length > 0;
};

const selectCity = (city) => {
  form.value.city = city.name;
  form.value.state = city.province;
  showSuggestions.value = false;
};

const hideSuggestions = () => {
  setTimeout(() => showSuggestions.value = false, 150);
};

const handleSubmit = async () => {
  try {
    if (props.isEditing) {
      await updateAddress(props.address.index, form.value);
    } else {
      await addAddress(form.value);
    }
    emit('saved');
    emit('close');
    resetForm();
  } catch (error) {
    console.error('Failed to save address:', error);
  }
};

const resetForm = () => {
  form.value = {
    name: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Indonesia',
    label: 'Home',
    isDefault: false
  };
};
</script>