<!-- ProductBreadcrumb.vue -->
<template>
  <nav class="flex mb-6" aria-label="Breadcrumb">
    <ol class="inline-flex items-center space-x-1 md:space-x-3">
      <!-- Home Link -->
      <li class="inline-flex items-center">
        <router-link
          to="/"
          class="text-sm font-medium text-gray-700 hover:text-amber-600"
        >
          Home
        </router-link>
      </li>
      
      <!-- Category Link -->
      <li>
        <div class="flex items-center">
          <svg
            class="w-4 h-4 text-gray-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clip-rule="evenodd"
            ></path>
          </svg>
          <router-link
            :to="`/category/${getCategorySlug(product)}`"
            class="ml-1 text-sm font-medium text-gray-700 hover:text-amber-600 md:ml-2 capitalize truncate max-w-xs"
            :title="getCategoryName(product)"
          >
            {{ getCategoryName(product) }}
          </router-link>
        </div>
      </li>
      
      <!-- Current Product -->
      <li aria-current="page">
        <div class="flex items-center">
          <svg
            class="w-4 h-4 text-gray-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clip-rule="evenodd"
            ></path>
          </svg>
          <span
            class="ml-1 text-sm font-medium text-gray-500 md:ml-2 truncate max-w-xs"
            :title="getProductTitle(product)"
          >
            {{ getProductTitle(product) }}
          </span>
        </div>
      </li>
    </ol>
  </nav>
</template>

<script setup>
/**
 * ProductBreadcrumb Component
 * 
 * Displays navigation breadcrumbs for product detail pages
 * Provides: Home > Category > Current Product navigation
 */

defineProps({
  /**
   * Product object containing category and title information
   */
  product: {
    type: Object,
    default: null
  },
  /**
   * Function to generate category slug for routing
   */
  getCategorySlug: {
    type: Function,
    required: true
  },
  /**
   * Function to get formatted category name
   */
  getCategoryName: {
    type: Function,
    required: true
  },
  /**
   * Function to get formatted product title
   */
  getProductTitle: {
    type: Function,
    required: true
  }
});
</script>

<style scoped>
/* Ensure consistent truncation behavior */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Responsive max-width for breadcrumb items */
.max-w-xs {
  max-width: 20rem;
}

@media (max-width: 640px) {
  .max-w-xs {
    max-width: 8rem;
  }
}

/* Hover effects for interactive elements */
.hover\:text-amber-600:hover {
  color: #d97706;
}

/* Ensure proper spacing on mobile */
@media (max-width: 768px) {
  .md\:space-x-3 > :not([hidden]) ~ :not([hidden]) {
    --tw-space-x-reverse: 0;
    margin-right: calc(0.5rem * var(--tw-space-x-reverse));
    margin-left: calc(0.5rem * calc(1 - var(--tw-space-x-reverse)));
  }
  
  .md\:ml-2 {
    margin-left: 0.25rem;
  }
}
</style>