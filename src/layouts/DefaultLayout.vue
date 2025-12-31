<!-- layouts/DefaultLayout.vue -->
<template>
  <div class="default-layout min-h-screen flex flex-col">
    <Navbar />
    <main class="flex-1">
      <RouterView />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import Navbar from "@/components/Layout/Navbar/Navbar.vue";
import Footer from "@/components/Layout/Footer.vue";
</script>

<style scoped>
.default-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  flex: 1;
  padding-top: 25px; /* Height of fixed navbar */
}
</style>