<!-- ProductReviews.vue - Component untuk menampilkan review produk -->
<template>
  <div class="space-y-4">
    <!-- Header Section -->
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-800">Customer Reviews</h3>
      <span class="text-sm text-gray-600">({{ totalReviews }} reviews)</span>
    </div>

    <!-- Reviews List -->
    <div>
      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-8">
        <div
          class="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-blue-600 rounded-full"
          role="status"
        >
          <span class="sr-only">Loading reviews...</span>
        </div>
        <p class="text-gray-600 mt-2 text-sm">Loading reviews...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-8">
        <p class="text-red-600 mb-2 text-sm">Failed to load reviews</p>
        <button @click="$emit('retry')" class="text-blue-600 hover:underline text-sm">Try again</button>
      </div>

      <!-- No Reviews State -->
      <div v-else-if="!reviews.length" class="text-center py-8">
        <svg class="mx-auto h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.013 9.013 0 01-5.916-2.165c-.787-.57-.415-1.81.588-1.81h3.462a1 1 0 00.951-.69l1.07-3.292a1 1 0 000-.364L9.196 11.57a1 1 0 00-.364 1.118L10.9 15.98c.3.921-.755 1.688-1.54 1.118L6.56 15.064A9.013 9.013 0 013 12z"
          />
        </svg>
        <p class="text-gray-600 mt-2 text-sm">No reviews yet</p>
        <p class="text-gray-500 text-xs">Be the first to review this product</p>
      </div>

      <!-- Reviews Items - 2 Column Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div
          v-for="review in reviews"
          :key="review.id"
          class="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
        >
          <!-- Review Header -->
          <div class="flex items-start justify-between mb-2">
            <div class="flex items-center space-x-2">
              <!-- User Avatar/Initial -->
              <!-- User Avatar/Initial - GANTI BAGIAN INI -->
              <div v-if="getReviewerAvatar(review)" class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                <img
                  :src="getReviewerAvatar(review)"
                  :alt="review.user?.username || 'User'"
                  class="w-full h-full object-cover"
                  @error="e => (e.target.style.display = 'none')"
                />
              </div>
              <div
                v-else
                class="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-medium text-sm flex-shrink-0"
              >
                {{ getUserInitial(review.user?.username) }}
              </div>

              <!-- User Info -->
              <div>
                <div class="font-medium text-gray-800 text-sm">
                  {{ review.user?.username || "Anonymous" }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ formatDate(review.createdAt) }}
                </div>
              </div>
            </div>

            <!-- Rating Stars -->
            <div class="flex items-center">
              <span v-for="i in 5" :key="i" :class="i <= review.rating ? 'text-amber-400' : 'text-gray-300'">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  />
                </svg>
              </span>
            </div>
          </div>

          <!-- Review Comment -->
          <div class="text-gray-700 text-sm leading-relaxed line-clamp-3">
            {{ review.comment }}
          </div>

          <!-- Moderation Status (optional, untuk admin) -->
          <div v-if="review.isModerated" class="mt-2 text-xs text-orange-600">This review is under moderation</div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination && pagination.totalPages > 1" class="flex items-center justify-center space-x-2 pt-2">
      <button
        @click="$emit('changePage', pagination.currentPage - 1)"
        :disabled="!pagination.hasPrev"
        class="px-3 py-1.5 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Previous
      </button>

      <span class="text-sm text-gray-600"> Page {{ pagination.currentPage }} of {{ pagination.totalPages }} </span>

      <button
        @click="$emit('changePage', pagination.currentPage + 1)"
        :disabled="!pagination.hasNext"
        class="px-3 py-1.5 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

// Props
const props = defineProps({
  reviews: {
    type: Array,
    default: () => [],
  },
  ratingStats: {
    type: Object,
    default: null,
  },
  pagination: {
    type: Object,
    default: null,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: null,
  },
});

// Emits
const emit = defineEmits(["retry", "changePage"]);

// Computed
const totalReviews = computed(() => {
  return props.ratingStats?.totalReviews || props.reviews.length || 0;
});

// ✅ TAMBAHKAN INI - Setelah totalReviews computed
const getReviewerAvatar = (review) => {
  if (review.user?.avatar) {
    return typeof review.user.avatar === 'string' 
      ? review.user.avatar 
      : review.user.avatar.url || null;
  }
  return null;
};

// Methods
const formatRating = rating => {
  if (!rating || isNaN(rating)) return "0.0";
  return Number(rating).toFixed(1);
};

const getPercentage = count => {
  if (!props.ratingStats?.totalReviews) return 0;
  return ((count || 0) / props.ratingStats.totalReviews) * 100;
};

const getUserInitial = username => {
  if (!username) return "U";
  return username.charAt(0).toUpperCase();
};

const formatDate = dateString => {
  if (!dateString) return "Unknown date";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    return "Invalid date";
  }
};
</script>
