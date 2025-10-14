<template>
  <!-- Template tetap sama -->
  <section class="py-12 px-4 sm:px-6 lg:px-8 bg-white">
    <div class="max-w-7xl mx-auto">
      <WeeklyHeader @scroll-left="scrollLeft" @scroll-right="scrollRight" />

      <!-- Gunakan Loading.vue yang sudah ada -->
      <Loading v-if="loading" class="h-64" />
      <WeeklyError v-else-if="error" @retry="fetchProducts" />
      
      <!-- Container untuk daftar produk -->
      <div v-else class="relative">
        <!-- Scroll container dengan WeeklyCard -->
        <div
          ref="scrollContainer"
          class="flex overflow-x-auto overflow-y-hidden pb-4 gap-4 scrollbar-hide scroll-container"
          @scroll="handleScroll"
          style="scroll-behavior: smooth"
        >
          <WeeklyCard
            v-for="weeklyProduct in products"
            :key="weeklyProduct.id"
            :weeklyProduct="weeklyProduct"
            :cartItems="cartItems"
            :isCartLoading="isCartLoading"
            @toggle-like="toggleLike"
            @add-to-cart="handleAddToCart"
            class="flex-shrink-0 card-item"
          />
        </div>

        <!-- Scroll bar indicator -->
        <WeeklyScrollBar :progress="scrollProgress" />
      </div>

      <!-- MiniCart -->
      <MiniCart
        :cart-items="cartItems"
        :cart-count="totalItems"
        :cart-total="totalPrice"
        :format-currency="formatCurrency"
        @increase-quantity="(id) => handleUpdateCartQuantity(id, getItemQuantity(id) + 1)"
        @decrease-quantity="(id) => handleUpdateCartQuantity(id, getItemQuantity(id) - 1)"
        @remove-from-cart="handleRemoveFromCart"
        @clear-cart="clearCart"
        @go-to-cart="() => $router.push('/cart')"
      />
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, nextTick, computed, watch } from "vue";
import { useRouter } from "vue-router";
import weeklyProductsData from "@/data/weeklyProducts.json";

// Komponen
import MiniCart from "@/components/Cart/MiniCart.vue";
import Loading from "@/components/Common/Loading.vue";
import WeeklyError from "@/components/Product/WeeklyPopular/WeeklyError.vue";
import WeeklyHeader from "@/components/Product/WeeklyPopular/WeeklyHeader.vue";
import WeeklyCard from "@/components/Product/WeeklyPopular/WeeklyCard.vue";
import WeeklyScrollBar from "@/components/Product/WeeklyPopular/WeeklyScrollBar.vue";

const router = useRouter();

// Cart composable
const {
  cartItems,
  totalItems,
  totalPrice,
  isEmpty,
  isCartLoading,
  addToCart,
  removeFromCart,
  updateItemQuantity,
  clearCart: clearCartStore,
  isInCart,
  getItemQuantity,
  formatPrice,
  initializeCart,
} = useCart();

// Component state
const products = ref(weeklyProductsData.map(product => ({
  ...product,
  isLiked: product.isLiked || false // Pastikan properti isLiked ada
})));
const loading = ref(false);
const error = ref(false);
const scrollContainer = ref(null);
const scrollProgress = ref(0);

// Fungsi toggle like
const toggleLike = (productId) => {
  const productIndex = products.value.findIndex(p => p.id === productId);
  if (productIndex !== -1) {
    products.value[productIndex].isLiked = !products.value[productIndex].isLiked;
    // Di sini bisa ditambahkan API call untuk menyimpan perubahan
    console.log(`Product ${productId} like status:`, products.value[productIndex].isLiked);
  }
};

// Format currency function
const formatCurrency = (price) => {
  if (typeof formatPrice === "function") {
    return formatPrice(price);
  }

  if (typeof price !== "number") {
    price = parseFloat(price) || 0;
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

// Cart functions
const handleAddToCart = async (product) => {
  try {
    await addToCart(product);
  } catch (error) {
    console.error("Error adding to cart:", error);
  }
};

const handleUpdateCartQuantity = async (productId, quantity) => {
  try {
    await updateItemQuantity(productId, quantity);
  } catch (error) {
    console.error("Error updating cart quantity:", error);
  }
};

const handleRemoveFromCart = async (productId) => {
  try {
    await removeFromCart(productId);
  } catch (error) {
    console.error("Error removing from cart:", error);
  }
};

const clearCart = async () => {
  try {
    if (confirm("Apakah Anda yakin ingin mengosongkan keranjang?")) {
      await clearCartStore();
    }
  } catch (error) {
    console.error("Error clearing cart:", error);
  }
};

// Scroll functions
const handleScroll = () => {
  if (scrollContainer.value) {
    const { scrollWidth, clientWidth, scrollLeft } = scrollContainer.value;
    const maxScroll = scrollWidth - clientWidth;
    scrollProgress.value = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0;
  }
};

const scrollLeft = () => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollBy({
      left: -300,
      behavior: "smooth",
    });
  }
};

const scrollRight = () => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollBy({
      left: 300,
      behavior: "smooth",
    });
  }
};

// Fetch products function
const fetchProducts = () => {
  loading.value = true;
  error.value = false;
  setTimeout(() => {
    loading.value = false;
  }, 1000);
};

// Initialize
onMounted(async () => {
  initializeCart();
  await nextTick();
  handleScroll();
});
</script>

<style scoped>
/* Styles tetap sama */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}
</style>