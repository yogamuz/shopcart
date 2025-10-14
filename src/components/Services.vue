<template>
  <section id="services" class="py-12 px-4 sm:px-6 lg:px-8 bg-white">
    <div class="max-w-7xl mx-auto">
      <h2 class="text-3xl font-bold text-gray-900 mb-8">
        Services To Help You Shop Better!
      </h2>

      <!-- Grid Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <!-- Looping setiap card -->
        <div
          v-for="(card, index) in cards"
          :key="index"
          class="bg-gray-100 rounded-lg overflow-hidden shadow-md flex flex-col hover:shadow-lg transition-shadow duration-300 h-[400px]"
        >
          <!-- Text Content -->
          <div class="p-6 flex-1 flex flex-col justify-center">
            <h3 class="text-xl font-semibold text-gray-800 mb-2">
              <span
                v-for="(line, i) in splitText(card.title)"
                :key="'title-' + i"
                class="block"
              >
                {{ line }}
              </span>
            </h3>
            <p class="text-gray-800 font-semibold mt-4">
              <span
                v-for="(line, i) in splitText(card.description)"
                :key="'desc-' + i"
                class="block"
              >
                {{ line }}
              </span>
            </p>
          </div>

          <!-- Image at bottom -->
          <div class="mt-auto overflow-hidden">
            <img
              :src="card.image"
              :alt="card.title"
              class="w-full h-50 object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const splitText = (text) => {
  return text.split("\n");
};

const cards = [
  {
    title: "Frequently Asked\nQuestion",
    description: "Updates on safe Shopping in\nour Stores",
    image: "../icons/family-icons.png",
  },
  {
    title: "Online Payment Process",
    description: "Updates on safe Shopping in\nour Stores",
    image: "../icons/order-icons.png",
  },
  {
    title: "Home Delivery Options",
    description: "Updates on safe Shopping in\nour Stores",
    image: "../icons/delivery-icons.png",
  },
  // Add more cards as needed with \n for line breaks
];
</script>
