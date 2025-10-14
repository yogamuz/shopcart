<!-- RelatedProducts.vue -->
<template>
  <div class="mt-16">
    <h2 class="text-2xl font-bold mb-8 text-gray-800">You may also like</h2>
    <div
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4"
    >
      <div
        v-for="related in products"
        :key="`related-${related._id || related.id}`"
        class="card group border border-gray-200 bg-white rounded-xl overflow-hidden hover:border-gray-300 transition-all duration-300 flex flex-col h-full hover:shadow-lg cursor-pointer"
@click="$emit('productClick', related)"
      >
        <!-- Image with Love Button -->
        <div class="relative aspect-square overflow-hidden">
          <img
            :src="getProductImage(related)"
            :alt="getProductTitle(related)"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            @error="(e) => (e.target.src = getPlaceholderImage())"
          />
          <button
            @click.stop="
              $emit('toggleLike', related.slug || related._id || related.id)
            "
            class="absolute top-3 right-3 w-8 h-8 bg-white/95 rounded-full flex items-center justify-center shadow-md transition-all duration-300 hover:bg-red-50 hover:shadow-lg"
            :class="
              related.isLiked
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
            v-if="related.stock && related.stock <= 10"
            class="absolute top-3 left-3 px-2 py-1 bg-orange-500 text-white text-xs rounded-full font-medium"
          >
            {{ related.stock }} left
          </div>
        </div>

        <!-- Card Content -->
        <div class="p-3 flex flex-col flex-grow space-y-2">
          <!-- Product Title -->
          <h3
            class="font-semibold text-gray-800 text-sm leading-tight line-clamp-2 min-h-[2.5rem] flex items-start"
          >
            {{ getProductTitle(related) }}
          </h3>

          <!-- Price -->
          <!-- Price -->
          <div class="flex items-center justify-between">
            <span
              class="font-bold text-sm text-blue-600 bg-gradient-to-r from-blue-100 to-cyan-100 px-2 py-1 rounded-md shadow-sm"
            >
              Rp{{ formatPrice(related.price) }}
            </span>
          </div>

          <!-- Description -->
          <p class="text-gray-600 text-xs line-clamp-2 h-8 overflow-hidden">
            {{ related.description }}
          </p>

          <!-- Store Info -->
          <div class="flex items-center space-x-2 py-1">
            <img
              :src="getSellerLogo(related)"
              :alt="getSellerName(related)"
              class="w-6 h-6 rounded-full object-cover flex-shrink-0 border border-gray-200"
              @error="$emit('logoError', $event)"
            />
            <span class="text-gray-600 text-xs truncate flex-1">
              {{ getSellerName(related) }}
            </span>
          </div>

          <!-- Rating, Reviews, and Stock -->
          <div class="flex items-center justify-between pt-1 mt-auto">
            <div
              class="flex items-center space-x-2"
              v-if="related.rating || related.averageRating"
            >
              <!-- Star Rating -->
              <div class="flex items-center">
                <div class="flex">
                  <span
                    v-for="i in 5"
                    :key="i"
                    :class="
                      i <=
                      Math.floor(related.rating || related.averageRating || 0)
                        ? 'text-amber-400'
                        : 'text-gray-300'
                    "
                  >
                    <svg
                      class="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                      />
                    </svg>
                  </span>
                </div>
                <span class="text-xs font-medium text-gray-700 ml-1">
                  {{
                    formatRatingDisplay(related.rating || related.averageRating)
                  }}
                </span>
              </div>

              <!-- Reviews Count with Person Icon -->
              <div
                class="flex items-center space-x-1"
                v-if="related.reviews || related.reviewCount"
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
                <span class="text-xs text-gray-600">{{
                  related.reviews || related.reviewCount
                }}</span>
              </div>
            </div>

            <!-- Zero Rating Display -->
            <div v-else class="flex items-center space-x-2">
              <div class="flex items-center">
                <div class="flex">
                  <span v-for="i in 5" :key="i" class="text-gray-300">
                    <svg
                      class="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
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
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  products: {
    type: Array,
    required: true,
  },
  getProductImage: {
    type: Function,
    required: true,
  },
  getProductTitle: {
    type: Function,
    required: true,
  },
  formatPrice: {
    type: Function,
    required: true,
  },
  formatRatingDisplay: {
    type: Function,
    required: true,
  },
  getSellerLogo: {
    type: Function,
    required: true,
  },
  getSellerName: {
    type: Function,
    required: true,
  },
  getPlaceholderImage: {
    type: Function,
    required: true,
  },
});

defineEmits(["productClick", "toggleLike", "logoError"]);
</script>

<style scoped>
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
</style>
