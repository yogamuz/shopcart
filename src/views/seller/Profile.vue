<!-- components/seller/SellerProfile.vue -->
<template>
  <div class="seller-profile-content">
    <!-- Header Section -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900">Seller Profile</h2>
      <p class="mt-1 text-sm text-gray-500">Manage your store information and business details</p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoadingProfile && !hasProfile" class="flex items-center justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6C5CE7]"></div>
      <span class="ml-2 text-gray-600">Loading profile...</span>
    </div>

    <!-- Error State -->
    <div v-if="profileError || createError || updateError" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
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
          <p class="text-sm text-red-800">
            {{ profileError?.message || createError?.message || updateError?.message }}
          </p>
        </div>
      </div>
    </div>

    <!-- No Profile - Create Form -->
    <div v-if="!hasProfile && !isLoadingProfile" class="space-y-6">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="text-center py-8">
          <Store class="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Create Your Seller Profile</h3>
          <p class="text-sm text-gray-500 mb-6">Set up your store to start selling on our platform</p>
          <button
            @click="showCreateForm = true"
            class="px-6 py-2 bg-[#6C5CE7] text-white text-sm font-medium rounded-lg hover:bg-[#5B4FD7] transition-colors"
          >
            Create Seller Profile
          </button>
        </div>

        <!-- Create Form -->
        <form v-if="showCreateForm" @submit.prevent="handleCreateProfile" class="mt-6 pt-6 border-t border-gray-200">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"> Store Name * </label>
              <input
                v-model="createForm.storeName"
                type="text"
                required
                placeholder="Enter your store name"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7]"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"> Store Description </label>
              <textarea
                v-model="createForm.description"
                rows="4"
                placeholder="Describe your store and products"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7]"
              ></textarea>
            </div>
          </div>

          <div class="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              @click="showCreateForm = false"
              :disabled="isCreating"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isCreating || !createForm.storeName.trim()"
              class="px-6 py-2 bg-[#6C5CE7] text-white text-sm font-medium rounded-lg hover:bg-[#5B4FD7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isCreating ? "Creating..." : "Create Profile" }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Profile Information -->
    <div v-if="hasProfile" class="space-y-6">
      <!-- Store Images Section -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">Store Branding</h3>
          <p class="text-sm text-gray-500 mt-1">Upload your store logo and banner</p>
        </div>

        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Logo Upload -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3"> Store Logo </label>
              <div class="relative group cursor-pointer" @click="handleLogoClick">
                <!-- Logo Preview -->
                <div
                  class="w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50 flex items-center justify-center"
                >
                  <img
                    v-if="profile.logo"
                    :src="profile.logo"
                    :alt="profile.storeName"
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="text-center">
                    <ImagePlus class="w-8 h-8 text-gray-400 mx-auto mb-1" />
                    <span class="text-xs text-gray-500">Add Logo</span>
                  </div>
                </div>

                <!-- Upload Progress Overlay -->
                <div v-if="isUploadingLogo" class="absolute inset-0 rounded-lg bg-black/60 backdrop-blur-sm">
                  <div
                    class="absolute inset-0 bg-[#6C5CE7]/80 transition-all duration-300"
                    :style="{ transform: `translateY(${100 - uploadProgress}%)` }"
                  ></div>
                  <div class="absolute inset-0 flex flex-col items-center justify-center z-10">
                    <Upload class="w-6 h-6 text-white mb-2 animate-pulse" />
                    <span class="text-white font-semibold text-sm"> {{ uploadProgress }}% </span>
                  </div>
                </div>

                <!-- Edit Icon -->
                <div
                  v-if="!isUploadingLogo"
                  class="absolute bottom-2 right-2 w-8 h-8 bg-[#6C5CE7] rounded-lg flex items-center justify-center shadow-sm group-hover:bg-[#5B4FD7] transition-colors"
                >
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </div>
              </div>
              <p class="text-xs text-gray-500 mt-2">Square image (400x400px). Max 2MB</p>
              <input
                ref="logoInput"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                @change="handleLogoUpload"
                class="hidden"
              />
            </div>

            <!-- Banner Upload -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3"> Store Banner </label>
              <div class="relative group cursor-pointer" @click="handleBannerClick">
                <!-- Banner Preview -->
                <div
                  class="w-full h-32 rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50 flex items-center justify-center"
                >
                  <img
                    v-if="profile.banner"
                    :src="profile.banner"
                    :alt="profile.storeName"
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="text-center">
                    <ImagePlus class="w-8 h-8 text-gray-400 mx-auto mb-1" />
                    <span class="text-xs text-gray-500">Add Banner</span>
                  </div>
                </div>

                <!-- Upload Progress Overlay -->
                <div v-if="isUploadingBanner" class="absolute inset-0 rounded-lg bg-black/60 backdrop-blur-sm">
                  <div
                    class="absolute inset-0 bg-[#6C5CE7]/80 transition-all duration-300"
                    :style="{ transform: `translateY(${100 - uploadProgress}%)` }"
                  ></div>
                  <div class="absolute inset-0 flex flex-col items-center justify-center z-10">
                    <Upload class="w-6 h-6 text-white mb-2 animate-pulse" />
                    <span class="text-white font-semibold text-sm"> {{ uploadProgress }}% </span>
                  </div>
                </div>

                <!-- Edit Icon -->
                <div
                  v-if="!isUploadingBanner"
                  class="absolute bottom-2 right-2 w-8 h-8 bg-[#6C5CE7] rounded-lg flex items-center justify-center shadow-sm group-hover:bg-[#5B4FD7] transition-colors"
                >
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </div>
              </div>
              <p class="text-xs text-gray-500 mt-2">Wide image (1200x400px). Max 5MB</p>
              <input
                ref="bannerInput"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                @change="handleBannerUpload"
                class="hidden"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Store Information -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Store Information</h3>
              <p class="text-sm text-gray-500 mt-1">Basic information about your store</p>
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
                    <span class="text-xs font-medium text-gray-900"> {{ profileCompleteness }}% </span>
                  </div>
                </div>
              </div>
              <p class="text-xs text-gray-500 mt-1">Profile Complete</p>
            </div>
          </div>
        </div>

        <div class="p-6">
          <form @submit.prevent="handleUpdateProfile">
            <div class="space-y-4">
              <!-- Store Name -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"> Store Name * </label>
                <input
                  v-model="updateForm.storeName"
                  type="text"
                  required
                  :disabled="isUpdating"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7] disabled:bg-gray-50"
                />
              </div>

              <!-- Store Slug (Read-only) -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"> Store URL </label>
                <div class="flex items-center">
                  <span class="text-sm text-gray-500 mr-2"> /stores/ </span>
                  <input
                    :value="profile.storeSlug"
                    type="text"
                    disabled
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
                <p class="text-xs text-gray-500 mt-1">URL is auto-generated from store name</p>
              </div>

              <!-- Description -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"> Store Description </label>
                <textarea
                  v-model="updateForm.description"
                  rows="4"
                  :disabled="isUpdating"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7] disabled:bg-gray-50"
                ></textarea>
              </div>
            </div>

            <div class="flex justify-end mt-6">
              <button
                type="submit"
                :disabled="isUpdating || !updateForm.storeName.trim()"
                class="px-6 py-2 bg-[#6C5CE7] text-white text-sm font-medium rounded-lg hover:bg-[#5B4FD7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isUpdating ? "Saving..." : "Save Changes" }}
              </button>
            </div>
          </form>
        </div>
      </div>
      <!-- Contact Information -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">Contact Information</h3>
          <p class="text-sm text-gray-500 mt-1">How customers can reach you</p>
        </div>

        <div class="p-6">
          <form @submit.prevent="handleUpdateProfile">
            <div class="space-y-4">
              <!-- Phone -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"> Phone Number </label>
                <input
                  v-model="updateForm.contact.phone"
                  type="tel"
                  placeholder="+62 or 08xxxxxxxxxx"
                  :disabled="isUpdating"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7] disabled:bg-gray-50"
                />
              </div>

              <!-- Email -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"> Contact Email </label>
                <input
                  v-model="updateForm.contact.email"
                  type="email"
                  placeholder="store@example.com"
                  :disabled="isUpdating"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7] disabled:bg-gray-50"
                />
              </div>

              <!-- Social Media Links - PINDAHKAN KE SINI -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-3"> Social Media Links </label>

                <!-- Existing Links -->
                <div v-if="updateForm.contact.socialLinks.length > 0" class="space-y-2 mb-3">
                  <div
                    v-for="(link, index) in updateForm.contact.socialLinks"
                    :key="index"
                    class="flex items-center justify-between p-3 rounded-lg border border-gray-200"
                  >
                    <div class="flex items-center space-x-3 flex-1 min-w-0">
                      <!-- Icon with platform color -->
                      <div :class="['p-2 rounded-lg flex-shrink-0', getSocialIconStyle(link.platform)]">
                        <component :is="getPlatformIcon(link.platform)" :size="18" :stroke-width="2" />
                      </div>

                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-900">
                          {{ socialPlatforms.find(p => p.value === link.platform)?.label || link.platform }}
                        </p>
                        <p class="text-xs text-gray-500 truncate mt-0.5">
                          {{ extractUsername(link.url) }}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      @click="removeSocialLink(index)"
                      :disabled="isUpdating"
                      class="ml-3 p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Add New Link Button -->
                <button
                  v-if="!showAddSocialLink"
                  type="button"
                  @click="showAddSocialLink = true"
                  :disabled="isUpdating"
                  class="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-[#6C5CE7] hover:text-[#6C5CE7] transition-colors disabled:opacity-50"
                >
                  + Add Social Media Link
                </button>

                <!-- Add Link Form -->
                <div v-if="showAddSocialLink" class="p-4 border-2 border-[#6C5CE7] rounded-lg space-y-3">
                  <div>
                    <label class="block text-xs font-medium text-gray-700 mb-1">Platform</label>
                    <select
                      v-model="newSocialLink.platform"
                      class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7]"
                    >
                      <option value="">Select platform</option>
                      <option v-for="platform in socialPlatforms" :key="platform.value" :value="platform.value">
                        {{ platform.label }}
                      </option>
                    </select>
                  </div>

                  <div v-if="newSocialLink.platform">
                    <label class="block text-xs font-medium text-gray-700 mb-1">
                      {{ socialPlatforms.find(p => p.value === newSocialLink.platform)?.label }} Username
                    </label>
                    <div class="relative">
                      <span class="absolute left-3 top-2 text-sm text-gray-400">
                        {{ socialPlatforms.find(p => p.value === newSocialLink.platform)?.prefix }}
                      </span>
                      <input
                        v-model="newSocialLink.url"
                        type="text"
                        :placeholder="socialPlatforms.find(p => p.value === newSocialLink.platform)?.placeholder"
                        class="w-full pl-[140px] pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7]"
                      />
                    </div>
                    <p class="text-xs text-gray-500 mt-1">
                      Enter username only (e.g.,
                      {{ socialPlatforms.find(p => p.value === newSocialLink.platform)?.placeholder }})
                    </p>
                  </div>

                  <div class="flex space-x-2">
                    <button
                      type="button"
                      @click="addSocialLink"
                      :disabled="!newSocialLink.platform || !newSocialLink.url.trim()"
                      class="flex-1 px-3 py-1.5 bg-[#6C5CE7] text-white text-sm font-medium rounded-lg hover:bg-[#5B4FD7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      @click="
                        showAddSocialLink = false;
                        newSocialLink = { platform: '', url: '' };
                      "
                      class="flex-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Submit Button - Tetap di sini -->
            <div class="flex justify-end mt-6">
              <button
                type="submit"
                :disabled="isUpdating"
                class="px-6 py-2 bg-[#6C5CE7] text-white text-sm font-medium rounded-lg hover:bg-[#5B4FD7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isUpdating ? "Saving..." : "Save Changes" }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Business Address -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">Business Address</h3>
          <p class="text-sm text-gray-500 mt-1">Your store's physical location</p>
        </div>

        <div class="p-6">
          <form @submit.prevent="handleUpdateProfile">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Street -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2"> Street Address </label>
                <input
                  v-model="updateForm.address.street"
                  type="text"
                  :disabled="isUpdating"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7] disabled:bg-gray-50"
                />
              </div>

              <!-- City -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"> City </label>
                <input
                  v-model="updateForm.address.city"
                  type="text"
                  :disabled="isUpdating"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7] disabled:bg-gray-50"
                />
              </div>

              <!-- Province -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"> Province/State </label>
                <input
                  v-model="updateForm.address.province"
                  type="text"
                  :disabled="isUpdating"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7] disabled:bg-gray-50"
                />
              </div>

              <!-- Postal Code -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"> Postal Code </label>
                <input
                  v-model="updateForm.address.postalCode"
                  type="text"
                  :disabled="isUpdating"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7] disabled:bg-gray-50"
                />
              </div>

              <!-- Country -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"> Country </label>
                <input
                  v-model="updateForm.address.country"
                  type="text"
                  :disabled="isUpdating"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] focus:border-[#6C5CE7] disabled:bg-gray-50"
                />
              </div>
            </div>

            <div class="flex justify-end mt-6">
              <button
                type="submit"
                :disabled="isUpdating"
                class="px-6 py-2 bg-[#6C5CE7] text-white text-sm font-medium rounded-lg hover:bg-[#5B4FD7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isUpdating ? "Saving..." : "Save Changes" }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Store Statistics -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">Store Statistics</h3>
          <p class="text-sm text-gray-500 mt-1">Overview of your store</p>
        </div>

        <div class="p-6">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <p class="text-2xl font-bold text-gray-900">
                {{ profile.stats?.totalProducts || 0 }}
              </p>
              <p class="text-sm text-gray-500 mt-1">Total Products</p>
            </div>
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <p class="text-2xl font-bold text-green-600">
                {{ profile.stats?.activeProducts || 0 }}
              </p>
              <p class="text-sm text-gray-500 mt-1">Active</p>
            </div>
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <p class="text-2xl font-bold text-gray-600">
                {{ profile.stats?.inactiveProducts || 0 }}
              </p>
              <p class="text-sm text-gray-500 mt-1">Inactive</p>
            </div>
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <p :class="['text-2xl font-bold', profile.status === 'active' ? 'text-green-600' : 'text-gray-600']">
                {{ profile.status || "N/A" }}
              </p>
              <p class="text-sm text-gray-500 mt-1">Status</p>
            </div>
          </div>
        </div>
      </div>
      <!-- Profile Status Actions -->
      <div class="mt-6 pt-6 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-sm font-medium text-gray-900 mb-1">Profile Status Management</h4>
            <p class="text-xs text-gray-500">
              {{
                profile.status === "active"
                  ? "Your store is currently active and visible to customers"
                  : "Your store is archived and not visible to customers"
              }}
            </p>
          </div>

          <!-- Archive/Activate Button -->
          <button
            v-if="profile.status === 'active'"
            @click="confirmArchiveProfile"
            :disabled="isArchiving"
            class="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Archive v-if="!isArchiving" class="w-4 h-4" />
            <div v-else class="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            {{ isArchiving ? "Archiving..." : "Archive Profile" }}
          </button>

          <button
            v-else
            @click="confirmRestoreProfile"
            :disabled="isRestoring"
            class="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ArchiveRestore v-if="!isRestoring" class="w-4 h-4" />
            <div v-else class="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            {{ isRestoring ? "Activating..." : "Activate Profile" }}
          </button>
        </div>
      </div>
    </div>
    <!-- Avatar Crop Modal -->
    <AvatarCropModal
      v-model="showCropModal"
      :image-src="tempImageSrc"
      :file-name="tempFileName"
      @crop="handleCropComplete"
      @cancel="handleCropCancel"
    />
  </div>
</template>
<script setup>
import { ref, watch, onMounted, onUnmounted } from "vue";
import { useSellerProfileStore } from "@/stores/sellerProfileStore";
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/authStore";
import AvatarCropModal from "@/components/User/AvatarCropModal.vue";
import {
  Store,
  ImagePlus,
  Upload,
  Instagram,
  Facebook,
  Twitter,
  Music,
  Youtube,
  MessageCircle,
  Archive,
  ArchiveRestore,
} from "lucide-vue-next";

// Get auth store to watch for user changes
const authStore = useAuthStore();

// Use Pinia store directly
const sellerProfileStore = useSellerProfileStore();

// Extract reactive state with storeToRefs
const {
  profile,
  hasProfile,
  storeName,
  isLoading,
  isCreating,
  isUpdating,
  isUploadingLogo,
  isUploadingBanner,
  uploadProgress,
  error,
  profileCompleteness,
} = storeToRefs(sellerProfileStore);
const {
  createProfile,
  updateProfile,
  uploadLogo,
  uploadBanner,
  fetchProfile,
  clearProfile,
  archiveProfile,
  restoreProfile,
  cancelActiveRequest,
} = sellerProfileStore;

// Aliases for template compatibility
const isLoadingProfile = isLoading;
const profileError = error;
const createError = error;
const updateError = error;

// Local state
const showCreateForm = ref(false);
const logoInput = ref(null);
const bannerInput = ref(null);
const showCropModal = ref(false);
const tempImageSrc = ref("");
const tempFileName = ref("");
const currentUploadType = ref("");

const createForm = ref({
  storeName: "",
  description: "",
});

const updateForm = ref({
  storeName: "",
  description: "",
  contact: {
    phone: "",
    email: "",
    socialLinks: [],
  },
  address: {
    street: "",
    city: "",
    province: "",
    postalCode: "",
    country: "Indonesia",
  },
});
const socialPlatforms = [
  {
    value: "instagram",
    label: "Instagram",
    icon: Instagram,
    placeholder: "username",
    prefix: "https://instagram.com/",
  },
  { value: "facebook", label: "Facebook", icon: Facebook, placeholder: "username", prefix: "https://facebook.com/" },
  { value: "twitter", label: "X (Twitter)", icon: Twitter, placeholder: "username", prefix: "https://twitter.com/" },
  { value: "tiktok", label: "TikTok", icon: Music, placeholder: "@username", prefix: "https://tiktok.com/@" },
  { value: "youtube", label: "YouTube", icon: Youtube, placeholder: "channel_name", prefix: "https://youtube.com/" },
  {
    value: "whatsapp",
    label: "WhatsApp",
    icon: MessageCircle,
    placeholder: "+62xxxxxxxxxx",
    prefix: "https://wa.me/+62",
  },
];

const newSocialLink = ref({
  platform: "",
  url: "",
});

const showAddSocialLink = ref(false);
const isArchiving = ref(false);
const isRestoring = ref(false);
const showConfirmModal = ref(false);
const confirmAction = ref(null);
// Methods
const handleCreateProfile = async () => {
  try {
    await createProfile(createForm.value);
    showCreateForm.value = false;
    createForm.value = { storeName: "", description: "" };
  } catch (err) {
    console.error("Create profile error:", err);
  }
};

const handleUpdateProfile = async () => {
  try {
    await updateProfile(updateForm.value);
  } catch (err) {
    console.error("Update profile error:", err);
  }
};

const handleLogoClick = () => {
  if (!isUploadingLogo.value) {
    logoInput.value?.click();
  }
};

const handleBannerClick = () => {
  if (!isUploadingBanner.value) {
    bannerInput.value?.click();
  }
};

const handleLogoUpload = event => {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file type
  const validTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!validTypes.includes(file.type)) {
    alert("Please upload a valid image file (JPEG, PNG, or WebP)");
    event.target.value = "";
    return;
  }

  // Validate file size (2MB for logo)
  const maxSize = 2 * 1024 * 1024;
  if (file.size > maxSize) {
    alert("Logo file size must be less than 2MB");
    event.target.value = "";
    return;
  }

  // Open crop modal
  currentUploadType.value = "logo";
  tempFileName.value = file.name;
  const reader = new FileReader();
  reader.onload = e => {
    tempImageSrc.value = e.target.result;
    showCropModal.value = true;
  };
  reader.readAsDataURL(file);

  event.target.value = "";
};
const handleBannerUpload = async event => {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file type
  const validTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!validTypes.includes(file.type)) {
    alert("Please upload a valid image file (JPEG, PNG, or WebP)");
    event.target.value = "";
    return;
  }

  // Validate file size (5MB for banner)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    alert("Banner file size must be less than 5MB");
    event.target.value = "";
    return;
  }

  try {
    await uploadBanner(file);
    event.target.value = "";
  } catch (err) {
    console.error("Banner upload error:", err);
    event.target.value = "";
  }
};

const handleCropComplete = async croppedFile => {
  try {
    if (currentUploadType.value === "logo") {
      await uploadLogo(croppedFile);
    } else if (currentUploadType.value === "banner") {
      await uploadBanner(croppedFile);
    }

    showCropModal.value = false;
    tempImageSrc.value = "";
    currentUploadType.value = "";
  } catch (err) {
    console.error("Error uploading cropped image:", err);
  }
};

const handleCropCancel = () => {
  showCropModal.value = false;
  tempImageSrc.value = "";
  tempFileName.value = "";
  currentUploadType.value = "";
};

const addSocialLink = () => {
  if (!newSocialLink.value.platform || !newSocialLink.value.url.trim()) {
    alert("Please select platform and enter username");
    return;
  }

  // Check if platform already exists
  const exists = updateForm.value.contact.socialLinks.some(link => link.platform === newSocialLink.value.platform);

  if (exists) {
    alert("This platform is already added");
    return;
  }

  // Generate full URL
  const fullUrl = getFullUrl(newSocialLink.value.platform, newSocialLink.value.url.trim());

  updateForm.value.contact.socialLinks.push({
    platform: newSocialLink.value.platform,
    url: fullUrl,
  });

  // Reset form
  newSocialLink.value = { platform: "", url: "" };
  showAddSocialLink.value = false;
};

const removeSocialLink = index => {
  updateForm.value.contact.socialLinks.splice(index, 1);
};

const getPlatformIcon = platformValue => {
  const platform = socialPlatforms.find(p => p.value === platformValue);
  return platform?.icon || Facebook;
};

const getSocialIconStyle = platformValue => {
  const styles = {
    instagram:
      "bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white hover:from-purple-700 hover:via-pink-700 hover:to-orange-600",
    facebook: "bg-blue-600 text-white hover:bg-blue-700",
    twitter: "bg-black text-white hover:bg-gray-800",
    tiktok: "bg-black text-white hover:bg-gray-800",
    youtube: "bg-red-600 text-white hover:bg-red-700",
    whatsapp: "bg-green-500 text-white hover:bg-green-600",
  };
  return styles[platformValue] || "bg-gray-100 text-gray-600 hover:bg-gray-200";
};

const getFullUrl = (platform, username) => {
  const platformData = socialPlatforms.find(p => p.value === platform);
  if (!platformData) return username;

  // Jika sudah ada https://, return as is
  if (username.startsWith("http://") || username.startsWith("https://")) {
    return username;
  }

  return platformData.prefix + username;
};

const extractUsername = url => {
  if (!url) return "";

  // Jika bukan URL lengkap, return as is
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return url;
  }

  // Extract username dari URL
  try {
    const urlObj = new URL(url);
    let path = urlObj.pathname.replace(/^\//, "").replace(/\/$/, "");

    // Handle TikTok @username
    if (url.includes("tiktok.com") && path.startsWith("@")) {
      return path;
    }

    return path || url;
  } catch {
    return url;
  }
};
const confirmArchiveProfile = () => {
  if (
    confirm(
      "Are you sure you want to archive your store? Your store will be hidden from customers and you cannot sell products while archived."
    )
  ) {
    handleArchiveProfile();
  }
};

const confirmRestoreProfile = () => {
  if (confirm("Are you sure you want to activate your store? Your store will be visible to customers again.")) {
    handleRestoreProfile();
  }
};

const handleArchiveProfile = async () => {
  try {
    isArchiving.value = true;
    await archiveProfile();
    alert("Store archived successfully");
  } catch (err) {
    console.error("Archive profile error:", err);
    alert(err.message || "Failed to archive store");
  } finally {
    isArchiving.value = false;
  }
};

const handleRestoreProfile = async () => {
  try {
    isRestoring.value = true;
    await restoreProfile();
    alert("Store activated successfully");
  } catch (err) {
    console.error("Restore profile error:", err);
    alert(err.message || "Failed to activate store");
  } finally {
    isRestoring.value = false;
  }
};

watch(
  () => profile.value,
  newProfile => {
    if (newProfile) {
      // Update form with latest profile data
      updateForm.value = {
        storeName: newProfile.storeName || "",
        description: newProfile.description || "",
        contact: {
          phone: newProfile.contact?.phone || "",
          email: newProfile.contact?.email || "",
          socialLinks: newProfile.contact?.socialLinks || [], // ← TAMBAH INI
        },
        address: {
          street: newProfile.address?.street || "",
          city: newProfile.address?.city || "",
          province: newProfile.address?.province || "",
          postalCode: newProfile.address?.postalCode || "",
          country: newProfile.address?.country || "Indonesia",
        },
      };
    }
  },
  { immediate: true, deep: true }
);

// SellerProfile.vue - Update watch
const unwatchUser = watch(
  () => authStore.user,
  async (newUser, oldUser) => {
    // ✅ TAMBAH: async
    const newUserId = newUser?._id || newUser?.id;
    const oldUserId = oldUser?._id || oldUser?.id;

    if (newUserId !== oldUserId) {
      // ✅ TAMBAH: Cancel active requests first
      const { cancelActiveRequest } = useSellerProfileStore();
      cancelActiveRequest();

      clearProfile();

      if (newUserId) {
        console.log("🔄 Fetching profile for new user:", newUserId);
        await fetchProfile(true); // ✅ PERBAIKAN: Await
      }
    }
  }
);
// TAMBAH setelah unwatchUser declaration (line 473)
const unwatchInitializing = watch(
  () => authStore.isInitializing,
  async (isInit, wasInit) => {
    // Ketika initialize selesai dan ada user
    if (wasInit && !isInit && authStore.user?.accessToken) {
      await fetchProfile(true);
    }
  }
);

// TAMBAH di onUnmounted (line 495)
onUnmounted(() => {
  unwatchUser();
  unwatchInitializing(); // ✅ Cleanup
});
onMounted(async () => {
  const authStore = useAuthStore();

  // Tunggu auth initialize selesai
  let attempts = 0;
  while (authStore.isInitializing && attempts < 30) {
    await new Promise(resolve => setTimeout(resolve, 100));
    attempts++;
  }

  // ✅ CRITICAL: Tambah delay agar axios interceptor set token
  if (authStore.user?.accessToken) {
    await new Promise(resolve => setTimeout(resolve, 150)); // ← TAMBAH INI

    await fetchProfile();
  } else {
  }
});

// Cleanup on unmount
onUnmounted(() => {
  unwatchUser(); // Stop watching user changes
});
</script>
<style scoped>
.seller-profile-content {
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

/* Upload progress animation */
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
