<!-- views/seller/Dashboard.vue - Parent view untuk dashboard overview -->
<template>
  <div class="dashboard-content">
    <SellerDashboardOverview @navigate-to-products="handleNavigateToProducts" />
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import SellerDashboardOverview from "@/components/Seller/Dashboard/SellerDashboardOverview.vue";

const router = useRouter();

const handleNavigateToProducts = () => {
  router.push({ name: "SellerProducts" });
};
</script>

<style scoped>
.dashboard-content {
  animation: fadeIn 0.3s ease-in-out;
  max-width: 100%;
  overflow-x: hidden;
  margin-top: 0;
  padding-top: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>