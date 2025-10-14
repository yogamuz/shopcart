<template>
  <section
    id="cashback2"
    class="py-12 sm:py-16 md:py-20 lg:py-1 relative overflow-hidden"
    :style="{ 
      background: `linear-gradient(135deg, ${colors.background.gradient.from} 0%, ${colors.background.gradient.to} 100%)`
    }"
  >


    <!-- Content Container -->
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mr-30">
      <div
        class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[400px]"
      >
        <!-- Left Side - Text Content -->
        <div
          class="container mx-auto mr-20 px-4 sm:px-6 lg:px-8 relative z-30 lg:z-10"
        >
          <div
            class="max-w-2xl text-left backdrop-blur-sm p-8 rounded-3xl shadow-xl border-0 relative overflow-hidden"
            :style="{ 
              background: `linear-gradient(135deg, ${colors.background.card.from}E6, ${colors.background.card.to}F0)`
            }"
          >
            <!-- Card decorative gradient overlay -->
            <div 
              class="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20 -translate-y-16 translate-x-16"
              :style="{ background: `radial-gradient(circle, ${colors.accent.light}, transparent)` }"
            ></div>
            
            <h1
              class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight relative z-10"
              :style="{ color: colors.text.primary }"
            >
              <span>Get </span>
              <span
                class="inline-block px-3 py-1 rounded-xl text-white font-extrabold shadow-lg transform -rotate-2"
                :style="{ background: `linear-gradient(135deg, ${colors.primary.main}, ${colors.primary.dark})` }"
              >5%</span>
              <br />
              <span
                class="block text-xl sm:text-2xl md:text-3xl lg:text-4xl lg:mt-3 lg:mb-4 bg-gradient-to-r bg-clip-text text-transparent font-extrabold"
                :style="{ 
                  backgroundImage: `linear-gradient(135deg, ${colors.accent.main}, ${colors.secondary.main}, ${colors.primary.main})`
                }"
              >Cash back on $200</span>
            </h1>
            <p 
              class="text-base sm:text-lg md:text-lg mb-8 leading-relaxed relative z-10" 
              :style="{ color: colors.text.secondary }"
            >
              Shopping is a bit of a relaxing hobby for me, which is sometimes
              troubling for the bank balance. Get rewarded for every purchase!
            </p>
            <button
              class="px-8 py-3 sm:py-4 rounded-full border-2 transition-all duration-500 hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 font-semibold text-lg relative z-10 overflow-hidden group"
              :style="{
                borderColor: colors.primary.main,
                color: colors.background.white,
                background: `linear-gradient(135deg, ${colors.primary.main}, ${colors.primary.dark})`
              }"
              @mouseover="handleButtonHover"
              @mouseleave="handleButtonLeave"
              ref="learnMoreBtn"
            >
              <span class="relative z-10">Learn More</span>
              <div 
                class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                :style="{ background: `linear-gradient(135deg, ${colors.secondary.main}, ${colors.accent.main})` }"
              ></div>
            </button>
          </div>
        </div>

        <!-- Right Side - Floating Landscape ATM Cards -->
        <div class="relative flex justify-center lg:justify-end z-10 lg:z-auto">
          <div class="relative w-80 h-64">
            <!-- Card 3 - Sophisticated Purple-Blue Gradient (Bottom/Back) -->
            <div
              class="absolute top-12 left-6 w-64 h-40 group cursor-pointer transform rotate-6 floating-card-3"
            >
              <div
                class="relative w-full h-full transform-style-3d transition-transform duration-700 group-hover:rotate-y-180"
              >
                <!-- Front -->
                <div
                  class="absolute inset-0 w-full h-full backface-hidden rounded-xl p-4 shadow-2xl hover:shadow-3xl transition-all duration-500 relative overflow-hidden"
                  :style="{ background: `linear-gradient(135deg, ${colors.cards.purple.main}, ${colors.cards.purple.dark})` }"
                >
                  <!-- Decorative circles -->
                  <div class="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-20" :style="{ backgroundColor: colors.cards.purple.light }"></div>
                  <div class="absolute -bottom-2 -left-2 w-12 h-12 rounded-full opacity-15" :style="{ backgroundColor: colors.cards.purple.light }"></div>
                  
                  <div class="flex justify-between items-start mb-6 relative z-10">
                    <div
                      class="w-10 h-6 rounded-md shadow-lg"
                      :style="{ background: `linear-gradient(135deg, ${colors.accent.light}, ${colors.accent.main})` }"
                    ></div>
                    <div class="text-white font-bold text-sm bg-black bg-opacity-20 px-2 py-1 rounded">AMEX</div>
                  </div>

                  <div class="text-white font-mono text-lg mb-4 tracking-wider relative z-10">
                    •••• •••• •••• 9012
                  </div>

                  <div class="flex justify-between items-end relative z-10">
                    <div>
                      <p class="text-gray-200 text-xs uppercase tracking-wide mb-1">
                        Card Holder
                      </p>
                      <p class="text-white font-semibold text-sm">ALEX JOHNSON</p>
                    </div>
                    <div>
                      <p class="text-gray-200 text-xs uppercase tracking-wide mb-1">
                        Expires
                      </p>
                      <p class="text-white font-semibold text-sm">03/30</p>
                    </div>
                  </div>
                </div>

                <!-- Back -->
                <div
                  class="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-xl p-4 shadow-2xl"
                  :style="{ background: `linear-gradient(135deg, ${colors.cards.purple.dark}, ${colors.cards.purple.darker})` }"
                >
                  <div class="w-full h-8 bg-gray-900 mt-3 mb-4 rounded"></div>
                  <div class="flex justify-end mb-3">
                    <div class="w-14 h-6 bg-white rounded flex items-center justify-center">
                      <span class="text-gray-800 text-xs font-bold">789</span>
                    </div>
                  </div>
                  <p class="text-gray-200 text-xs leading-relaxed">
                    Purple Elite - Premium business card with exclusive travel benefits and enhanced cashback rewards.
                  </p>
                </div>
              </div>
            </div>

            <!-- Card 2 - Elegant Teal-Green Gradient (Middle) -->
            <div
              class="absolute top-6 left-3 w-64 h-40 group cursor-pointer transform rotate-3 floating-card-2 z-10"
            >
              <div
                class="relative w-full h-full transform-style-3d transition-transform duration-700 group-hover:rotate-y-180"
              >
                <!-- Front -->
                <div
                  class="absolute inset-0 w-full h-full backface-hidden rounded-xl p-4 shadow-2xl hover:shadow-3xl transition-all duration-500 relative overflow-hidden"
                  :style="{ background: `linear-gradient(135deg, ${colors.cards.teal.main}, ${colors.cards.teal.dark})` }"
                >
                  <!-- Decorative elements -->
                  <div class="absolute top-0 right-0 w-20 h-20 opacity-10" :style="{ background: `radial-gradient(circle, ${colors.cards.teal.light}, transparent)` }"></div>
                  
                  <div class="flex justify-between items-start mb-6 relative z-10">
                    <div
                      class="w-10 h-6 rounded-md shadow-lg"
                      :style="{ background: `linear-gradient(135deg, ${colors.accent.main}, ${colors.accent.dark})` }"
                    ></div>
                    <div class="text-white font-bold text-sm bg-black bg-opacity-20 px-2 py-1 rounded">MASTERCARD</div>
                  </div>

                  <div class="text-white font-mono text-lg mb-4 tracking-wider relative z-10">
                    •••• •••• •••• 5678
                  </div>

                  <div class="flex justify-between items-end relative z-10">
                    <div>
                      <p class="text-gray-200 text-xs uppercase tracking-wide mb-1">
                        Card Holder
                      </p>
                      <p class="text-white font-semibold text-sm">JANE SMITH</p>
                    </div>
                    <div>
                      <p class="text-gray-200 text-xs uppercase tracking-wide mb-1">
                        Expires
                      </p>
                      <p class="text-white font-semibold text-sm">08/29</p>
                    </div>
                  </div>
                </div>

                <!-- Back -->
                <div
                  class="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-xl p-4 shadow-2xl"
                  :style="{ background: `linear-gradient(135deg, ${colors.cards.teal.dark}, ${colors.cards.teal.darker})` }"
                >
                  <div class="w-full h-8 bg-gray-900 mt-3 mb-4 rounded"></div>
                  <div class="flex justify-end mb-3">
                    <div class="w-14 h-6 bg-white rounded flex items-center justify-center">
                      <span class="text-gray-800 text-xs font-bold">456</span>
                    </div>
                  </div>
                  <p class="text-gray-200 text-xs leading-relaxed">
                    Teal Premium - Smart rewards program with enhanced cashback and exclusive member benefits.
                  </p>
                </div>
              </div>
            </div>

            <!-- Card 1 - Vibrant Coral-Orange Gradient (Top/Front) -->
            <div
              class="absolute top-0 left-0 w-64 h-40 group cursor-pointer transform -rotate-3 floating-card-1 z-20"
            >
              <div
                class="relative w-full h-full transform-style-3d transition-transform duration-700 group-hover:rotate-y-180"
              >
                <!-- Front -->
                <div
                  class="absolute inset-0 w-full h-full backface-hidden rounded-xl p-4 shadow-2xl hover:shadow-3xl transition-all duration-500 relative overflow-hidden"
                  :style="{ background: `linear-gradient(135deg, ${colors.cards.coral.main}, ${colors.cards.coral.dark})` }"
                >
                  <!-- Decorative wave pattern -->
                  <div class="absolute -bottom-4 -right-8 w-24 h-24 opacity-15" 
                       :style="{ background: `conic-gradient(from 0deg, ${colors.cards.coral.light}, transparent, ${colors.cards.coral.light})` }"></div>
                  
                  <div class="flex justify-between items-start mb-6 relative z-10">
                    <div
                      class="w-10 h-6 rounded-md shadow-lg"
                      :style="{ background: `linear-gradient(135deg, ${colors.accent.light}, ${colors.primary.light})` }"
                    ></div>
                    <div class="text-white font-bold text-sm bg-black bg-opacity-20 px-2 py-1 rounded">VISA</div>
                  </div>

                  <div class="text-white font-mono text-lg mb-4 tracking-wider relative z-10">
                    •••• •••• •••• 1234
                  </div>

                  <div class="flex justify-between items-end relative z-10">
                    <div>
                      <p class="text-gray-200 text-xs uppercase tracking-wide mb-1">
                        Card Holder
                      </p>
                      <p class="text-white font-semibold text-sm">JOHN DOE</p>
                    </div>
                    <div>
                      <p class="text-gray-200 text-xs uppercase tracking-wide mb-1">
                        Expires
                      </p>
                      <p class="text-white font-semibold text-sm">12/28</p>
                    </div>
                  </div>
                </div>

                <!-- Back -->
                <div
                  class="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-xl p-4 shadow-2xl"
                  :style="{ background: `linear-gradient(135deg, ${colors.cards.coral.dark}, ${colors.cards.coral.darker})` }"
                >
                  <div class="w-full h-8 bg-gray-900 mt-3 mb-4 rounded"></div>
                  <div class="flex justify-end mb-3">
                    <div class="w-14 h-6 bg-white rounded flex items-center justify-center">
                      <span class="text-gray-800 text-xs font-bold">123</span>
                    </div>
                  </div>
                  <p class="text-gray-200 text-xs leading-relaxed">
                    Coral Smart - Perfect for everyday spending with superior cashback rewards and lifestyle benefits.
                  </p>
                </div>
              </div>
            </div>

            <!-- Card Selection Indicators with gradient backgrounds -->
            <div
              class="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3"
            >
              <div
                class="w-3 h-3 rounded-full shadow-lg floating-dot-1 border-2 border-white"
                :style="{ background: `linear-gradient(135deg, ${colors.cards.coral.main}, ${colors.cards.coral.dark})` }"
              ></div>
              <div
                class="w-3 h-3 rounded-full shadow-lg floating-dot-2 border-2 border-white"
                :style="{ background: `linear-gradient(135deg, ${colors.cards.teal.main}, ${colors.cards.teal.dark})` }"
              ></div>
              <div
                class="w-3 h-3 rounded-full shadow-lg floating-dot-3 border-2 border-white"
                :style="{ background: `linear-gradient(135deg, ${colors.cards.purple.main}, ${colors.cards.purple.dark})` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Harmonious color palette with complementary colors
const colors = ref({
  primary: {
    main: '#4F46E5',      // Indigo - calm and trustworthy
    dark: '#3730A3',      // Dark Indigo
    light: '#818CF8',     // Light Indigo
  },
  secondary: {
    main: '#059669',      // Emerald - growth and prosperity
    dark: '#047857',      // Dark Emerald  
    light: '#10B981',     // Light Emerald
  },
  accent: {
    main: '#F59E0B',      // Amber - energy and optimism
    dark: '#D97706',      // Dark Amber
    light: '#FCD34D',     // Light Amber
  },
  text: {
    primary: '#1F2937',   // Charcoal Gray
    secondary: '#6B7280', // Medium Gray
    light: '#9CA3AF'      // Light Gray
  },
  background: {
    white: '#FFFFFF',
    gradient: {
      from: '#F8FAFC',    // Very light blue-gray
      to: '#F1F5F9'       // Light blue-gray
    },
    card: {
      from: '#FFFFFF',    // Pure white
      to: '#F8FAFC'       // Very light blue-gray
    }
  },
  cards: {
    coral: {
      main: '#FF6B6B',    // Warm coral
      dark: '#EE5A52',    // Deeper coral
      light: '#FFE0E0',   // Light coral
      darker: '#DC2626'   // Deep red
    },
    teal: {
      main: '#4ECDC4',    // Fresh teal
      dark: '#26A69A',    // Deep teal
      light: '#B2DFDB',   // Light teal
      darker: '#00695C'   // Dark teal
    },
    purple: {
      main: '#9C88FF',    // Soft purple
      dark: '#7C3AED',    // Deep purple
      light: '#DDD6FE',   // Light purple
      darker: '#5B21B6'   // Dark purple
    }
  }
})

const learnMoreBtn = ref(null)

const handleButtonHover = () => {
  if (learnMoreBtn.value) {
    learnMoreBtn.value.style.transform = 'scale(1.05) translateY(-2px)'
    learnMoreBtn.value.style.boxShadow = '0 20px 40px rgba(79, 70, 229, 0.3)'
  }
}

const handleButtonLeave = () => {
  if (learnMoreBtn.value) {
    learnMoreBtn.value.style.transform = 'scale(1) translateY(0px)'
    learnMoreBtn.value.style.boxShadow = '0 10px 20px rgba(79, 70, 229, 0.2)'
  }
}

// Optional: Accept colors as props to make it even more flexible
const props = defineProps({
  customColors: {
    type: Object,
    default: () => ({})
  }
})

onMounted(() => {
  // Merge custom colors if provided
  if (props.customColors && Object.keys(props.customColors).length > 0) {
    colors.value = { ...colors.value, ...props.customColors }
  }
})
</script>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}

.transform-style-3d {
  transform-style: preserve-3d;
}

.backface-hidden {
  backface-visibility: hidden;
}

.rotate-y-180 {
  transform: rotateY(180deg);
}

/* Enhanced floating animations with different timings */
@keyframes floatUp {
  0%, 100% {
    transform: translateY(0px) rotate(var(--rotation)) scale(1);
  }
  50% {
    transform: translateY(-12px) rotate(var(--rotation)) scale(1.02);
  }
}

@keyframes floatMiddle {
  0%, 100% {
    transform: translateY(0px) rotate(var(--rotation)) scale(1);
  }
  50% {
    transform: translateY(-8px) rotate(var(--rotation)) scale(1.01);
  }
}

@keyframes floatDown {
  0%, 100% {
    transform: translateY(0px) rotate(var(--rotation)) scale(1);
  }
  50% {
    transform: translateY(-15px) rotate(var(--rotation)) scale(1.03);
  }
}

@keyframes floatDot {
  0%, 100% {
    transform: translateY(0px) scale(1);
  }
  50% {
    transform: translateY(-4px) scale(1.15);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.1;
    transform: scale(1);
  }
  50% {
    opacity: 0.15;
    transform: scale(1.05);
  }
}

.floating-card-1 {
  --rotation: -3deg;
  animation: floatUp 5s ease-in-out infinite;
}

.floating-card-2 {
  --rotation: 3deg;
  animation: floatMiddle 4.5s ease-in-out infinite 0.8s;
}

.floating-card-3 {
  --rotation: 6deg;
  animation: floatDown 5.5s ease-in-out infinite 1.5s;
}

.floating-dot-1 {
  animation: floatDot 2.5s ease-in-out infinite;
}

.floating-dot-2 {
  animation: floatDot 2.5s ease-in-out infinite 0.4s;
}

.floating-dot-3 {
  animation: floatDot 2.5s ease-in-out infinite 0.8s;
}

/* Enhanced shadow effects */
.hover\:shadow-3xl:hover {
  box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
}

/* Smooth gradient text effect */
.bg-gradient-to-r {
  background-size: 200% auto;
  animation: gradient-shift 3s ease infinite;
}

@keyframes gradient-shift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

/* Mobile optimizations */
@media (max-width: 1023px) {
  .container.mx-auto.mr-20 {
    margin-right: 0;
    z-index: 30;
    position: relative;
  }

  .relative.flex.justify-center.lg\:justify-end {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
    opacity: 0.8;
    transform: scale(0.85) translateY(8%);
  }

  .relative.w-80.h-64 {
    width: 100%;
    max-width: 100%;
    margin: 0 auto;
  }

  .grid.min-h-\[400px\] {
    min-height: 380px;
  }
}

/* Enhanced button animation */
button {
  position: relative;
  overflow: hidden;
}

button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

button:hover::before {
  left: 100%;
}
</style>