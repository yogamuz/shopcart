<!-- CheckoutHeader.vue -->
<template>
  <div class="mb-8 animate-fade-in-down">
    <!-- Breadcrumb -->
    <nav class="flex mb-6" aria-label="Breadcrumb">
      <ol class="inline-flex items-center space-x-1 md:space-x-3">
        <li class="inline-flex items-center">
          <router-link
            to="/"
            class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
          >
            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
            </svg>
            Home
          </router-link>
        </li>
        <li>
          <div class="flex items-center">
            <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
            </svg>
            <router-link
              to="/cart"
              class="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors md:ml-2"
            >
              Cart
            </router-link>
          </div>
        </li>
        <li aria-current="page">
          <div class="flex items-center">
            <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
            </svg>
            <span class="ml-1 text-sm font-medium text-gray-500 md:ml-2">Checkout</span>
          </div>
        </li>
      </ol>
    </nav>

    <!-- Page Header -->
    <div class="text-center">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">
        Complete Your Order
      </h1>
      <p class="text-lg text-gray-600 max-w-2xl mx-auto">
        Review your items and provide shipping details to place your order.
      </p>
    </div>

    <!-- Progress Steps -->
    <div class="mt-8 flex items-center justify-center">
      <div class="flex items-center space-x-4">
        <!-- Step 1: Cart -->
        <div class="flex items-center">
          <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
            </svg>
          </div>
          <span class="ml-2 text-sm font-medium text-gray-900">Cart</span>
        </div>

        <!-- Connector -->
        <div class="w-12 h-0.5 bg-gray-300"></div>

        <!-- Step 2: Checkout (Current) -->
        <div class="flex items-center">
          <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span class="text-sm font-semibold text-white">2</span>
          </div>
          <span class="ml-2 text-sm font-medium text-blue-600">Checkout</span>
        </div>

        <!-- Connector -->
        <div class="w-12 h-0.5 bg-gray-300"></div>

        <!-- Step 3: Payment -->
        <div class="flex items-center">
          <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span class="text-sm font-semibold text-gray-600">3</span>
          </div>
          <span class="ml-2 text-sm font-medium text-gray-500">Payment</span>
        </div>

        <!-- Connector -->
        <div class="w-12 h-0.5 bg-gray-300"></div>

        <!-- Step 4: Confirmation -->
        <div class="flex items-center">
          <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span class="text-sm font-semibold text-gray-600">4</span>
          </div>
          <span class="ml-2 text-sm font-medium text-gray-500">Complete</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// No props or logic needed for this component
</script>

<style scoped>
.animate-fade-in-down {
  animation: fadeInDown 0.6s ease-out forwards;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>