<!-- views/seller/Settings.vue - Parent view untuk settings -->
<template>
  <div class="settings-content">
    <div class="bg-white rounded-lg lg:rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Settings</h3>
      <p class="text-gray-600">Settings panel coming soon...</p>
    </div>
  </div>
</template>

<style scoped>
.settings-content {
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