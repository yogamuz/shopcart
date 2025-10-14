<!-- productgrid -->
<template>
  <div
    class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4"
  >
    <!-- Product Card -->
    <div
      v-for="product in products"
      :key="product.id || product._id"
      class="card group border border-gray-200 bg-white rounded-xl overflow-hidden hover:border-gray-300 transition-all duration-300 flex flex-col h-full hover:shadow-lg cursor-pointer"
      @click="navigateToProduct(product)"
    >
      <!-- Image with Love Button -->
      <div class="relative aspect-square overflow-hidden">
        <img
          :src="getProductImage(product)"
          :alt="product.name || product.title"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          @error="handleImageError"
        />
        <button
          @click.stop="$emit('toggle-like', product.id || product._id)"
          class="absolute top-3 right-3 w-8 h-8 bg-white/95 rounded-full flex items-center justify-center shadow-md transition-all duration-300 hover:bg-red-50 hover:shadow-lg"
          :class="
            product.isLiked
              ? 'text-red-500'
              : 'text-gray-400 hover:text-red-400'
          "
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
            />
          </svg>
        </button>

        <!-- Stock Badge -->
        <div
          v-if="product.stock && product.stock <= 10"
          class="absolute top-3 left-3 px-2 py-1 bg-orange-500 text-white text-xs rounded-full font-medium"
        >
          {{ product.stock }} left
        </div>
      </div>

      <!-- Card Content -->
      <div class="p-3 flex flex-col flex-grow space-y-2">
        <!-- Product Title -->
        <h3
          class="font-semibold text-gray-800 text-sm leading-tight line-clamp-2 min-h-[2.5rem] flex items-start"
        >
          {{ product.title }}
        </h3>

        <!-- Price -->
<!-- Price -->
        <div class="flex items-center justify-between">
          <span
            class="font-bold text-sm text-blue-600 bg-gradient-to-r from-blue-100 to-cyan-100 px-2 py-1 rounded-md shadow-sm"
          >
            Rp{{ formatPrice(product.price) }}
          </span>
        </div>

        <!-- Description -->
        <p class="text-gray-600 text-xs line-clamp-2 h-8 overflow-hidden">
          {{ product.description }}
        </p>

        <!-- Store Info -->
        <div class="flex items-center space-x-2 py-1">
          <img
            :src="getSellerLogo(product)"
            :alt="getSellerName(product)"
            class="w-6 h-6 rounded-full object-cover flex-shrink-0 border border-gray-200"
            @error="handleLogoError"
          />
          <span class="text-gray-600 text-xs truncate flex-1">
            {{ getSellerName(product) }}
          </span>
        </div>

        <!-- Rating, Reviews, and Stock -->
        <div class="flex items-center justify-between pt-1 mt-auto">
          <div
            class="flex items-center space-x-1"
            v-if="product.rating && product.rating > 0"
          >
            <!-- Star Rating -->
            <div class="flex items-center">
              <div class="flex">
                <span
                  v-for="i in 5"
                  :key="i"
                  :class="
                    i <= Math.floor(product.rating || 0)
                      ? 'text-amber-400'
                      : 'text-gray-300'
                  "
                >
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                    />
                  </svg>
                </span>
              </div>
              <span class="text-xs font-medium text-gray-700 ml-1">
                {{ formatRatingDisplay(product.rating) }}
              </span>
            </div>

            <!-- Reviews Count with Person Icon -->
            <div
              class="flex items-center space-x-1"
              v-if="product.reviews && product.reviews > 0"
            >
              <svg
                class="w-3 h-3 text-gray-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clip-rule="evenodd"
                />
              </svg>
              <span class="text-xs text-gray-600">{{ product.reviews }}</span>
            </div>
          </div>

          <!-- Zero Rating Display -->
          <div v-else class="flex items-center space-x-1">
            <div class="flex items-center">
              <div class="flex">
                <span v-for="i in 5" :key="i" class="text-gray-300">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                    />
                  </svg>
                </span>
              </div>
              <span class="text-xs font-medium text-gray-500 ml-1">0</span>
            </div>

            <!-- Zero Reviews with Person Icon -->
            <div class="flex items-center space-x-1">
              <svg
                class="w-3 h-3 text-gray-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clip-rule="evenodd"
                />
              </svg>
              <span class="text-xs text-gray-500">0</span>
            </div>
          </div>

          <!-- Stock Info -->
          <span class="text-xs text-gray-500 font-medium">
            {{ product.stock || 0 }} in stock
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
const router = useRouter();

const props = defineProps({
  products: {
    type: Array,
    default: () => [],
  },
  // OPTIMIZATION: Add lazy loading props
  lazyLoad: {
    type: Boolean,
    default: true,
  },
  chunkSize: {
    type: Number,
    default: 20,
  },
});

const emit = defineEmits(["toggle-like", "product-click", "add-to-cart"]);

const navigateToProduct = (product) => {
  console.log('Navigate called with:', product);
  console.log('Product slug:', product?.slug);
  
  if (product && product.slug) {
    console.log('Navigating to:', `/products/${product.slug}`);
    router.push({ path: `/products/${product.slug}` });
  } else {
    console.warn('Product or slug missing:', { product: !!product, slug: product?.slug });
  }
};

// Function to get proper image URL from API response
const getProductImage = (product) => {
  // If product has a full image URL from API, use it directly
  if (
    product.image &&
    typeof product.image === "string" &&
    product.image.startsWith("http")
  ) {
    return product.image;
  }
  // If product.image is an object with url
  if (product.image && typeof product.image === "object" && product.image.url) {
    return product.image.url;
  }

  // If image field exists but is relative path, construct full URL
  if (product.image && typeof product.image === "string") {
    // If it's already a relative path starting with /, use as is
    if (product.image.startsWith("/")) {
      return `${window.location.origin}${product.image}`;
    }
    return product.image;
  }
  // Try other common fields
  if (product.imageUrl) return product.imageUrl;
  if (product.thumbnail) return product.thumbnail;

  // Fallback to placeholder if no image
  return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pgo8L3N2Zz4K";
};

// Function to get seller logo
const getSellerLogo = (product) => {
  // From API response structure: product.seller.logo
  if (product.seller && product.seller.logo) {
    return product.seller.logo;
  }
  // Fallback for other possible structures
  if (product.sellerLogo) return product.sellerLogo;
  if (product.store && product.store.logo) return product.store.logo;

  // Default placeholder for store logo
  return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iI2Y3ZjdmNyIgc3Ryb2tlPSIjZTBlMGUwIi8+CiAgPHRleHQgeD0iMjAiIHk9IjI0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM5OTkiPlM8L3RleHQ+Cjwvc3ZnPgo=";
};

// Function to get seller name
const getSellerName = (product) => {
  // From API response structure: product.seller.name
  if (product.seller && product.seller.name) {
    return product.seller.name;
  }
  // Fallback for other possible structures
  if (product.sellerName) return product.sellerName;
  if (product.store && product.store.name) return product.store.name;
  if (product.storeName) return product.storeName;

  return "Unknown Store";
};

// Format price with proper locale
const formatPrice = (price) => {
  if (!price || isNaN(price)) return "0";
  return parseInt(price).toLocaleString("id-ID");
};

// Format rating to show decimal values
const formatRatingDisplay = (rating) => {
  if (!rating || isNaN(rating) || rating === 0) return "0";
  return Number(rating).toFixed(1);
};

// Handle image load error
const handleImageError = (event) => {
  console.warn("Image failed to load:", event.target.src);
  // Set fallback to a default placeholder
  event.target.src =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pgo8L3N2Zz4K";
};

// Handle logo load error
const handleLogoError = (event) => {
  console.warn("Logo failed to load:", event.target.src);
  event.target.src =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iI2Y3ZjdmNyIgc3Ryb2tlPSIjZTBlMGUwIi8+CiAgPHRleHQgeD0iMjAiIHk9IjI0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM5OTkiPlM8L3RleHQ+Cjwvc3ZnPgo=";
};

</script>

<style scoped>
/* Style khusus untuk card produk */
.card {
  display: flex;
  flex-direction: column;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.bg-main {
  background-color: #1a3e3e;
}

.border-main {
  border-color: #1a3e3e;
}

.hover\:bg-main:hover {
  background-color: #1a3e3e;
}

.hover\:border-main:hover {
  border-color: #1a3e3e;
}
</style>
