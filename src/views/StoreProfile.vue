<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center min-h-[400px]">
        <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div class="text-red-500 mb-4">
          <svg class="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-gray-800 mb-2">Store Not Found</h3>
        <p class="text-gray-600 mb-6">{{ error }}</p>
        <router-link
          to="/"
          class="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          Back to Home
        </router-link>
      </div>

      <!-- Store Content -->
      <div v-else class="space-y-6 animate-fade-in-up">
        <!-- Store Header Card -->
        <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
          <!-- Banner Image -->
          <div class="relative h-48 sm:h-64 bg-gradient-to-r from-blue-500 to-cyan-600 overflow-hidden">
            <img
              v-if="storeProfile?.images?.banner"
              :src="storeProfile.images.banner"
              :alt="storeProfile.name"
              class="w-full h-full object-cover"
              @error="handleBannerError"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <svg class="w-20 h-20 text-white opacity-50" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"
                />
              </svg>
            </div>
          </div>

          <!-- Store Info -->
          <div class="relative px-6 pb-6">
            <!-- Mobile/Tablet Layout - Overlapping Banner -->
            <div class="lg:hidden flex flex-col items-center -mt-16 space-y-4">
              <div class="relative">
                <img
                  :src="storeProfile?.images?.logo || defaultLogo"
                  :alt="storeProfile?.name"
                  class="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-white shadow-xl bg-white"
                  @error="handleLogoError"
                />
                <div
                  v-if="storeProfile?.status === 'active'"
                  class="absolute bottom-2 right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center"
                >
                  <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              <div class="flex-1 text-center pt-4">
                <h1 class="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">{{ storeProfile?.name }}</h1>
                <p class="text-gray-600 mb-3">{{ storeProfile?.description || "Welcome to our store!" }}</p>

                <!-- Location -->
                <div v-if="storeProfile?.location" class="flex items-center justify-center text-gray-600 mb-3">
                  <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span class="text-sm">{{ storeProfile.location.city }}, {{ storeProfile.location.province }}</span>
                </div>

                <!-- Stats -->
                <div class="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                  <div class="flex items-center space-x-2">
                    <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
                      />
                    </svg>
                    <span class="text-sm font-medium text-gray-700"
                      >{{ storeProfile?.stats?.products || 0 }} Products</span
                    >
                  </div>
                  <div class="flex items-center space-x-2">
                    <svg class="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                      />
                    </svg>
                    <span class="text-sm font-medium text-gray-700"
                      >{{ formatRating(reviewStats.averageRating) }} ({{ reviewStats.totalReviews }} reviews)</span
                    >
                  </div>
                </div>
              </div>
              <!-- Contact Info Mobile -->
              <div v-if="storeProfile?.contact" class="flex items-center space-x-3">
                <div v-if="storeProfile.contact.social" class="flex space-x-2">
                  <a
                    v-for="(url, platform) in storeProfile.contact.social"
                    :key="platform"
                    :href="url"
                    target="_blank"
                    :class="['p-3 rounded-full transition-colors', getSocialIconStyle(platform)]"
                    :title="capitalizeFirst(platform)"
                  >
                    <component :is="getSocialIcon(platform)" :size="20" :stroke-width="2" />
                  </a>
                </div>
              </div>
            </div>

            <!-- Desktop Layout - Below Banner -->
            <div class="hidden lg:flex items-start gap-6 pt-6">
              <!-- Logo -->
              <div class="relative flex-shrink-0">
                <img
                  :src="storeProfile?.images?.logo || defaultLogo"
                  :alt="storeProfile?.name"
                  class="w-32 h-32 rounded-full object-cover border-4 border-gray-100 shadow-lg bg-white"
                  @error="handleLogoError"
                />
                <div
                  v-if="storeProfile?.status === 'active'"
                  class="absolute bottom-2 right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center"
                >
                  <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              <!-- Store Info -->
              <div class="flex-1">
                <h1 class="text-3xl font-bold text-gray-800 mb-2">{{ storeProfile?.name }}</h1>
                <p class="text-gray-600 mb-4">{{ storeProfile?.description || "Welcome to our store!" }}</p>

                <!-- Location -->
                <div v-if="storeProfile?.location" class="flex items-center text-gray-600 mb-4">
                  <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span class="text-sm">{{ storeProfile.location.city }}, {{ storeProfile.location.province }}</span>
                </div>

                <!-- Stats -->
                <div class="flex items-center gap-6">
                  <div class="flex items-center space-x-2">
                    <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
                      />
                    </svg>
                    <span class="text-sm font-medium text-gray-700"
                      >{{ storeProfile?.stats?.products || 0 }} Products</span
                    >
                  </div>
                  <div class="flex items-center space-x-2">
                    <svg class="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                      />
                    </svg>
                    <span class="text-sm font-medium text-gray-700"
                      >{{ formatRating(reviewStats.averageRating) }} ({{ reviewStats.totalReviews }} reviews)</span
                    >
                  </div>
                </div>
              </div>

              <!-- Contact Info Desktop -->
              <div v-if="storeProfile?.contact" class="flex items-center space-x-3">
                <!-- ✅ GANTI BAGIAN INI - sama seperti mobile -->
                <div v-if="storeProfile.contact.social" class="flex space-x-2">
                  <a
                    v-for="(url, platform) in storeProfile.contact.social"
                    :key="platform"
                    :href="url"
                    target="_blank"
                    :class="['p-3 rounded-full transition-colors', getSocialIconStyle(platform)]"
                    :title="capitalizeFirst(platform)"
                  >
                    <component :is="getSocialIcon(platform)" :size="20" :stroke-width="2" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters & Search -->
        <div class="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <!-- Desktop Layout -->
          <div class="hidden lg:flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <select
                v-model="sortBy"
                class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                @change="handleFilterChange"
              >
                <option value="createdAt:desc">Newest</option>
                <option value="price:asc">Price: Low to High</option>
                <option value="price:desc">Price: High to Low</option>
                <option value="title:asc">Name: A-Z</option>
              </select>

              <div class="relative w-64">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search products..."
                  class="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  @input="handleSearch"
                />
                <svg
                  class="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <!-- Mobile Layout -->
          <div class="lg:hidden space-y-4">
            <h2 class="text-lg sm:text-xl font-bold text-gray-800">
              Store Products
              <span class="text-gray-500 text-sm font-normal ml-2">({{ pagination?.total || 0 }} items)</span>
            </h2>

            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search products..."
                class="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                @input="handleSearch"
              />
              <svg
                class="absolute left-3 top-3 w-4 h-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <div class="flex gap-3">
              <select
                v-model="selectedCategory"
                class="flex-1 px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                @change="handleFilterChange"
              >
                <option value="">All Categories</option>
                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
              </select>

              <select
                v-model="sortBy"
                class="flex-1 px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                @change="handleFilterChange"
              >
                <option value="createdAt:desc">Newest</option>
                <option value="price:asc">Price: Low to High</option>
                <option value="price:desc">Price: High to Low</option>
                <option value="title:asc">Name: A-Z</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Products Section -->
        <div class="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <div v-if="isLoadingProducts" class="flex justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>

          <div v-else-if="!products.length" class="text-center py-12">
            <svg class="w-20 h-20 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 class="text-xl font-semibold text-gray-700 mb-2">No Products Found</h3>
            <p class="text-gray-500">Try adjusting your search or filters</p>
          </div>

          <ProductGrid v-else :products="products" @toggle-like="handleToggleLike" />

          <div v-if="pagination && pagination.pages > 1" class="mt-8 flex justify-center">
            <nav class="flex items-center space-x-2">
              <button
                @click="changePage(pagination.page - 1)"
                :disabled="pagination.page === 1"
                class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              <div class="flex space-x-1">
                <button
                  v-for="page in visiblePages"
                  :key="page"
                  @click="changePage(page)"
                  :class="[
                    'px-4 py-2 rounded-lg transition-colors',
                    page === pagination.page ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50',
                  ]"
                >
                  {{ page }}
                </button>
              </div>

              <button
                @click="changePage(pagination.page + 1)"
                :disabled="pagination.page === pagination.pages"
                class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { productService } from "@/services/productService";
import ProductGrid from "@/components/Product/ProductGrid.vue";
import {
  Phone,
  Instagram,
  Facebook,
  Twitter,
  Music, // TikTok
  Youtube,
  MessageCircle, // WhatsApp
} from "lucide-vue-next";
import { debounce } from "lodash";

const route = useRoute();
const router = useRouter();

// State
const storeProfile = ref(null);
const products = ref([]);
const pagination = ref(null);
const categories = ref(["Toys", "Fashion", "Gadgets", "Sneakers", "Furniture", "Beauty"]);
const isLoading = ref(true);
const isLoadingProducts = ref(false);
const error = ref(null);
const reviewStats = ref({
  totalReviews: 0,
  averageRating: 0,
});
// Filters
const searchQuery = ref("");
const selectedCategory = ref("");
const sortBy = ref("createdAt:desc");
const currentPage = ref(1);

// Default images
const defaultLogo =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjE2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSI4MCIgY3k9IjgwIiByPSI4MCIgZmlsbD0iI2Y3ZjdmNyIvPgogIDx0ZXh0IHg9IjgwIiB5PSI5NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjQwIiBmaWxsPSIjOTk5Ij5TPC90ZXh0Pgo8L3N2Zz4=";

// Computed
const storeSlug = computed(() => route.params.slug);

const visiblePages = computed(() => {
  if (!pagination.value) return [];
  const total = pagination.value.pages;
  const current = pagination.value.page;
  const pages = [];

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push("...");
      pages.push(total);
    } else if (current >= total - 3) {
      pages.push(1);
      pages.push("...");
      for (let i = total - 4; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push("...");
      for (let i = current - 1; i <= current + 1; i++) pages.push(i);
      pages.push("...");
      pages.push(total);
    }
  }

  return pages.filter(p => p !== "..." || pages.indexOf(p) === pages.lastIndexOf(p));
});

const fetchStoreProfile = async () => {
  try {
    const response = await productService.getStoreProfile(storeSlug.value);
    if (response.success) {
      storeProfile.value = response.data;

      // Fetch review stats
      const statsResponse = await productService.getStoreReviewStats(storeSlug.value);
      if (statsResponse.success && statsResponse.data) {
        reviewStats.value = {
          totalReviews: statsResponse.data.totalReviews || 0,
          averageRating: statsResponse.data.averageRating || 0,
        };
      }
    } else {
      error.value = response.message || "Store not found";
    }
  } catch (err) {
    console.error("Failed to fetch store profile:", err);
    error.value = err.message || "Failed to load store";
  }
};

const fetchProducts = async () => {
  try {
    isLoadingProducts.value = true;

    const [sortField, sortOrder] = sortBy.value.split(":");
    const params = {
      page: currentPage.value,
      limit: 20,
      ...(searchQuery.value && { search: searchQuery.value }),
      ...(selectedCategory.value && { category: selectedCategory.value }),
      sortBy: sortField,
      sortOrder: sortOrder,
    };

    const response = await productService.getStoreProducts(storeSlug.value, params);

    if (response.success && response.data) {
      const storeInfo = response.data.store;
      products.value = (response.data.products || []).map(product => ({
        ...product,
        slug: product.slug || product.id, // ✅ PENTING: Ensure slug exists
        seller: {
          name: storeInfo?.name || "Unknown Store",
          logo: storeInfo?.logo || null,
          slug: storeSlug.value,
        },
        storeName: storeInfo?.name || "Unknown Store",
      }));

      pagination.value = response.data.pagination || null;
    } else {
      products.value = [];
      pagination.value = null;
    }
  } catch (err) {
    console.error("Failed to fetch products:", err);
    products.value = [];
  } finally {
    isLoadingProducts.value = false;
  }
};

const handleSearch = debounce(() => {
  currentPage.value = 1;
  fetchProducts();
}, 500);

const handleFilterChange = () => {
  currentPage.value = 1;
  fetchProducts();
};

const changePage = page => {
  if (page < 1 || page > pagination.value?.pages || page === "...") return;
  currentPage.value = page;
  fetchProducts();
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const handleToggleLike = productId => {
  const product = products.value.find(p => (p.id || p._id) === productId);
  if (product) {
    product.isLiked = !product.isLiked;
  }
};

const formatRating = rating => {
  if (!rating || isNaN(rating)) return "0.0";
  return Number(rating).toFixed(1);
};

const handleBannerError = event => {
  console.warn("Banner image failed to load");
  event.target.style.display = "none";
};

const handleLogoError = event => {
  event.target.src = defaultLogo;
};

const getSocialIcon = platform => {
  const icons = {
    instagram: Instagram,
    facebook: Facebook,
    twitter: Twitter,
    tiktok: Music,
    youtube: Youtube,
    whatsapp: MessageCircle,
  };
  return icons[platform.toLowerCase()] || Facebook;
};

// ✅ TAMBAH: Helper untuk styling per platform
const getSocialIconStyle = platform => {
  const styles = {
    instagram:
      "bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white hover:from-purple-700 hover:via-pink-700 hover:to-orange-600",
    facebook: "bg-blue-600 text-white hover:bg-blue-700",
    twitter: "bg-black text-white hover:bg-gray-800",
    tiktok: "bg-black text-white hover:bg-gray-800",
    youtube: "bg-red-600 text-white hover:bg-red-700",
    whatsapp: "bg-green-500 text-white hover:bg-green-600",
  };
  return styles[platform.toLowerCase()] || "bg-gray-100 text-gray-600 hover:bg-gray-200";
};

const capitalizeFirst = str => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Lifecycle
onMounted(async () => {
  isLoading.value = true;
  await fetchStoreProfile();
  await fetchProducts();
  isLoading.value = false;
});

// Watch route changes
watch(
  () => route.params.slug,
  async newSlug => {
    if (newSlug) {
      isLoading.value = true;
      error.value = null;
      await fetchStoreProfile();
      await fetchProducts();
      isLoading.value = false;
    }
  }
);
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
</style>
