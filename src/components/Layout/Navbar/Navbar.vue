<!-- Navbar.vue - FIXED VERSION -->
<template>
  <!-- CHANGED: Removed overflow properties that might clip modal -->
  <nav class="fixed top-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-md shadow-lg py-1">
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
const { searchProducts, clearSearch } = useSearch();

// Local state
const isDropdownOpen = ref(false);
const isMobileMenuOpen = ref(false);
const searchQuery = ref("");
const selectedCategory = ref(null);
const categories = ref([]);
const categoriesLoading = ref(true);

// Toggle category dropdown
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

// Toggle mobile menu
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
  if (!isMobileMenuOpen.value) {
    isDropdownOpen.value = false;
  }
};

// Handle search query from search component
const handleSearch = async query => {
  searchQuery.value = query;

  if (query.trim().length >= 2) {
    const result = await searchProducts(query.trim(), {
      category: selectedCategory.value?.name?.toLowerCase() || null,
      limit: 20,
      page: 1,
    });

    if (result.success) {
      const filterParams = {
        search: query,
        category: selectedCategory.value?.name?.toLowerCase() || null,
        page: 1,
        resultsFromApi: true,
      };

      emit("products-filter", filterParams);
      emit("search", query);

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

// Handle category selection from dropdown
const handleCategorySelection = category => {
  selectedCategory.value = category;

  if (route.path === "/") {
    emit("category-selected", category);

    const categoryName = category.name?.toLowerCase() || category.names?.toLowerCase() || "";

    const filterParams = {
      category: categoryName,
      search: searchQuery.value || "",
      page: 1,
    };

    emit("products-filter", filterParams);
  }
};

// Watch - Sync search query and category from URL
watch(
  () => route.query,
  newQuery => {
    if (newQuery.search !== searchQuery.value) {
      searchQuery.value = newQuery.search || "";
    }

    if (route.path === "/" && newQuery.category && newQuery.category !== selectedCategory.value?.name?.toLowerCase()) {
      const foundCategory = categories.value.find(cat => (cat.name || cat.names)?.toLowerCase() === newQuery.category);
      if (foundCategory) {
        selectedCategory.value = foundCategory;
      }
    } else if (route.path !== "/") {
      selectedCategory.value = null;
    }
  },
  { immediate: true }
);

// Watch - Clear filters when navigating away from home
watch(
  () => route.path,
  newPath => {
    if (newPath !== "/") {
      selectedCategory.value = null;
      searchQuery.value = "";
    }
  },
  { immediate: true }
);

// Lifecycle - Load categories on mount
onMounted(async () => {
  try {
    const mockCategories = [
      { id: 1, name: "toys", description: "Fun toys for all ages" },
      { id: 2, name: "beauty", description: "Beauty and skincare products" },
      { id: 3, name: "gadgets", description: "Latest tech gadgets" },
      { id: 4, name: "sneakers", description: "Trendy sneakers and footwear" },
      { id: 5, name: "fashion", description: "Fashion and clothing" },
      { id: 6, name: "furniture", description: "Home and office furniture" },
    ];

    await new Promise(resolve => setTimeout(resolve, 500));
    categories.value = mockCategories;

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
</script>

<style scoped>
/* CRITICAL: No overflow properties that could clip the modal */
/* The nav element uses fixed positioning but should NOT have overflow:hidden */
</style>