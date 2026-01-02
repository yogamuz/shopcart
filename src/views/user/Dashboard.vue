<!-- views/user/Dashboard.vue - Dashboard Overview Component -->
<template>
  <div class="dashboard-content">
    <!-- ✅ Ini adalah konten dari UserDashboardOverview.vue -->
    <UserDashboardOverview />
  </div>
</template>

<script setup>
import UserDashboardOverview from "@/components/User/UserDashboardOverview.vue";
</script>

<style scoped>
.dashboard-content {
  animation: fadeIn 0.3s ease-in-out;
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