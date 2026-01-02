// composables/useCategory.js
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useCategoryStore } from "@/stores/categoryStore";

export const useCategories = () => {
  const categoryStore = useCategoryStore();

  // Reactive state from store
  const { categories, currentCategory, categoryProducts, loading, error } = storeToRefs(categoryStore);

  // Computed getters
  const activeCategories = computed(() => categoryStore.getActiveCategories);
  const isLoading = computed(() => categoryStore.isLoading);
  const hasError = computed(() => categoryStore.hasError);
  const errorMessage = computed(() => categoryStore.getErrorMessage);

  // Category mapping for dropdown with proper IDs
  const categoryMapping = computed(() => ({
    fashion: "66d1a2b3c4e5f6789abcdef1",
    sneakers: "66d1a2b3c4e5f6789abcdef2",
    toys: "66d1a2b3c4e5f6789abcdef3",
    furniture: "66d1a2b3c4e5f6789abcdef4",
    gadgets: "66d1a2b3c4e5f6789abcdef5",
    beauty: "66d1a2b3c4e5f6789abcdef0",
  }));

  // Actions
  const getCategoryByName = categoryName => {
    return categoryStore.setCategoryByName(categoryName);
  };

  const getCategoryById = id => {
    return categoryStore.getCategoryById(id);
  };

  const getCategoryByNameSync = name => {
    return categoryStore.getCategoryByName(name);
  };

  const fetchProductsByCategory = async (categoryId, params = {}) => {
    return await categoryStore.fetchProductsByCategory(categoryId, params);
  };

  const clearError = () => {
    categoryStore.clearError();
  };

  const clearCurrentCategory = () => {
    categoryStore.clearCurrentCategory();
  };

  const clearCategoryProducts = () => {
    categoryStore.clearCategoryProducts();
  };

  // Helper function to get category ID by name from mapping
  const getCategoryIdByName = categoryName => {
    const normalizedName = categoryName.toLowerCase();
    return categoryMapping.value[normalizedName] || null;
  };

  // Helper function to generate category route (fixed route name)
  const getCategoryRoute = category => {
    const categorySlug = category.slug || category.name?.toLowerCase() || "";
    return `/category/${categorySlug}`;
  };

  // Helper function to handle category selection for dropdown
  const handleCategorySelection = (category, router) => {
    try {
      const categorySlug = category.slug || category.name?.toLowerCase() || "";

      if (!categorySlug) {
        console.warn("No valid category slug found:", category);
        return null;
      }

      const route = {
        name: "Category", // Match the route name in router
        params: {
          slug: categorySlug,
        },
      };

      if (router) {
        // Use replace to avoid navigation errors
        return router.push(route).catch(err => {
          // Handle navigation errors gracefully
          if (err.name !== "NavigationDuplicated") {
            console.warn("Navigation error:", err.message);
          }
          return route;
        });
      }

      return route;
    } catch (error) {
      console.error("Error in handleCategorySelection:", error);
      return null;
    }
  };

  // Safe navigation helper
  const navigateToCategory = async (category, router) => {
    try {
      const categorySlug = category.slug || category.name?.toLowerCase() || "";

      if (!categorySlug) {
        throw new Error("Invalid category data");
      }

      // Check if we're already on this category page
      if (router.currentRoute.value.name === "Category" && router.currentRoute.value.params.slug === categorySlug) {
        return;
      }

      await router.push({
        name: "Category",
        params: { slug: categorySlug },
      });
    } catch (error) {
      if (error.name !== "NavigationDuplicated") {
        console.error("Navigation failed:", error);
        throw error;
      }
    }
  };

  return {
    // State
    categories,
    currentCategory,
    categoryProducts,
    loading,
    error,

    // Computed
    activeCategories,
    isLoading,
    hasError,
    errorMessage,
    categoryMapping,

    // Actions
    getCategoryByName,
    getCategoryById,
    getCategoryByNameSync,
    fetchProductsByCategory,
    clearError,
    clearCurrentCategory,
    clearCategoryProducts,

    // Helpers
    getCategoryIdByName,
    getCategoryRoute,
    handleCategorySelection,
    navigateToCategory,
  };
};
