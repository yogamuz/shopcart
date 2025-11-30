<!-- navbarvue -->
<template>
<nav class="fixed top-[30px] left-0 right-0 z-40 bg-slate-900/90 backdrop-blur-md shadow-lg py-1">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16 gap-4">
        <NavLogo />
        <NavSearch @search="handleSearch" />
        <NavLinks :categories="categories" @select-category="handleCategorySelection" />
        <NavAccountCart @toggle-mobile-menu="toggleMobileMenu" />
      </div>

      <NavMobileMenu
        :is-open="isMobileMenuOpen"
        :is-dropdown-open="isDropdownOpen"
        :categories="categories"
        @toggle-dropdown="toggleDropdown"
        @select-category="handleCategorySelection"
      />
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useSearch } from "@/composables/useSearch";
import NavLogo from "@/components/Layout/Navbar/NavLogo.vue";
import NavSearch from "@/components/Layout/Navbar/NavSearch.vue";
import NavLinks from "@/components/Layout/Navbar/NavLinks.vue";
import NavAccountCart from "@/components/Layout/Navbar/NavAccountCart.vue";
import NavMobileMenu from "@/components/Layout/Navbar/NavMobileMenu.vue";

// Emit declaration
const emit = defineEmits(["search", "category-selected", "products-filter"]);

const router = useRouter();
const route = useRoute();
// Search composable
const { searchProducts, clearSearch } = useSearch();

// Local state
const isDropdownOpen = ref(false);
const isMobileMenuOpen = ref(false);
const searchQuery = ref("");
const selectedCategory = ref(null);

// Categories state
const categories = ref([]);
const categoriesLoading = ref(true);

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
  if (!isMobileMenuOpen.value) {
    isDropdownOpen.value = false;
  }
};

const handleSearch = async query => {
  searchQuery.value = query;

  if (query.trim().length >= 2) {
    // Call search API
    const result = await searchProducts(query.trim(), {
      category: selectedCategory.value?.name?.toLowerCase() || null,
      limit: 20,
      page: 1,
    });

    if (result.success) {
      if (result.data.products.length === 0) {
        showToastInfo(`No products found for "${query}". Try different keywords.`);
      }
      // Emit filter params dengan hasil search dari API
      const filterParams = {
        search: query,
        category: selectedCategory.value?.name?.toLowerCase() || null,
        page: 1,
        resultsFromApi: true, // Flag bahwa ini dari search API
      };

      emit("products-filter", filterParams);
      emit("search", query);

      // Update URL if not on home page
      if (route.path !== "/") {
        router.push({
          path: "/",
          query: filterParams.category
            ? {
                search: query,
                category: filterParams.category,
              }
            : { search: query },
        });
      }
    }
  } else if (query.trim().length === 0) {
    // Clear search
    clearSearch();

    const filterParams = {
      search: "",
      category: selectedCategory.value?.name?.toLowerCase() || route.query.category || null,
      page: 1,
    };

    emit("products-filter", filterParams);
    emit("search", "");
  }
};

// Fix for Navbar.vue - Update the handleCategorySelection method
const handleCategorySelection = category => {
  selectedCategory.value = category;

  // Only emit for Home page context, not for direct navigation
  if (route.path === "/") {
    emit("category-selected", category);

    const categoryName = category.name?.toLowerCase() || category.names?.toLowerCase() || "";

    // For Home page - emit filter params for products API call
    const filterParams = {
      category: categoryName,
      search: searchQuery.value || "",
      page: 1,
    };

    emit("products-filter", filterParams);
  }

  // Note: URL navigation is handled by the dropdown components themselves
};

// Fix for Navbar.vue - Update the watch for route changes
watch(
  () => route.query,
  newQuery => {
    // Update search query from URL
    if (newQuery.search !== searchQuery.value) {
      searchQuery.value = newQuery.search || "";
    }

    // Update selected category from URL only if on home page
    if (route.path === "/" && newQuery.category && newQuery.category !== selectedCategory.value?.name?.toLowerCase()) {
      const foundCategory = categories.value.find(cat => (cat.name || cat.names)?.toLowerCase() === newQuery.category);
      if (foundCategory) {
        selectedCategory.value = foundCategory;
      }
    } else if (route.path !== "/") {
      // Clear selected category when not on home page
      selectedCategory.value = null;
    }
  },
  { immediate: true }
);

// Load categories on mount
onMounted(async () => {
  try {
    // Mock data for demonstration - replace with your API call
    const mockCategories = [
      { id: 1, name: "toys", description: "Fun toys for all ages" },
      { id: 2, name: "beauty", description: "Beauty and skincare products" },
      { id: 3, name: "gadgets", description: "Latest tech gadgets" },
      { id: 4, name: "sneakers", description: "Trendy sneakers and footwear" },
      { id: 5, name: "fashion", description: "Fashion and clothing" },
      { id: 6, name: "furniture", description: "Home and office furniture" },
    ];

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    categories.value = mockCategories;

    // Initialize selected category from route
    if (route.query.category) {
      const foundCategory = mockCategories.find(cat => cat.name?.toLowerCase() === route.query.category);
      if (foundCategory) {
        selectedCategory.value = foundCategory;
      }
    }
  } catch (error) {
    console.error("Failed to load categories:", error);
    categories.value = [];
  } finally {
    categoriesLoading.value = false;
  }
});
// Fix for Navbar.vue - Update the watch for route path changes
watch(
  () => route.path,
  newPath => {
    // Clear filters when navigating away from home
    if (newPath !== "/") {
      selectedCategory.value = null;
      searchQuery.value = "";
    }
  },
  { immediate: true }
);
</script>
