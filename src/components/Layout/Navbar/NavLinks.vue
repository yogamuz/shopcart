<template>
  <div class="hidden md:flex items-center space-x-6 lg:space-x-8">
    <NavDropdown :categories="categories" @select-category="$emit('select-category', $event)" />
<a href="#deals"
  @click.prevent="scrollToDeals"
  class="text-white  hover:text-blue-600 font-medium transition-colors duration-200 cursor-pointer"
>
  Deals
</a>
<router-link
  to="/orders"
  class="text-white  hover:text-blue-600 font-medium transition-colors duration-200"
>
  Orders
</router-link>

    <router-link
      to="#"
      class="text-white  hover:text-blue-600 font-medium transition-colors duration-200"
    >
      Delivery
    </router-link>
  </div>
</template>

<script setup>
import NavDropdown from "./NavDropdown.vue";

defineProps({
  categories: {
    type: Array,
    required: true,
  },
});

defineEmits(["select-category"]);

const scrollToDeals = () => {
  const dealsSection = document.getElementById('deals');
  if (dealsSection) {
    dealsSection.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
  }
};
</script>