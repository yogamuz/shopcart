<template>
  <section id="promos" class="py-12 px-4 sm:px-6 lg:px-8 bg-white">
    <div class="max-w-7xl mx-auto">
      <h2 class="text-3xl font-bold text-gray-900 mb-8">Get Up To 70% Off</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" >
        <div v-for="(promo, index) in promos" :key="index" class="promo-card">
          <div class="text-content p-4 " :style="{ backgroundColor: promo.bgColor }">
            <span class="save-badge">Save</span>
            <span class="price" :style="{ color: promo.priceColor }"
              >${{ promo.amount }}</span
            >
            <p class="description">{{ promo.text }}</p>
          </div>
          <div class="image-container">
            <img :src="promo.image" :alt="promo.text" class="promo-image" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";
import promosData from "@/data/promos.json"; // Assuming this contains array of {image, text, amount} objects
const promos = ref(promosData);
</script>

<style scoped>
.promo-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.text-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.save-badge {
  background-color: #ff4757;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  align-self: flex-start;
}

.price {
  font-size: 40px;
  font-weight: 700;
  color: #2f3542;
}

.description {
  font-size: 16px;
  font-weight: 600;
  color: black;
  margin: 0;
}

.image-container {
  overflow: hidden;
  border-radius: 0 0 12px 12px;
}

.promo-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.promo-card:hover .promo-image {
  transform: scale(1.17);
}

/* Hanya gambar yang berubah saat hover */
.promo-card:hover {
  transform: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Shadow tetap sama */
}

@media (max-width: 768px) {
  .price {
    font-size: 24px;
  }

  .description {
    font-size: 14px;
  }

  .promo-image {
    height: 160px;
  }
}
</style>
