<!-- components/Modals/VoucherModal.vue -->
<template>
  <Transition name="modal-zoom">
    <Dialog :open="isOpen" @close="closeModal" class="relative z-50" v-if="isOpen">
    <!-- Background overlay -->
    <div class="fixed inset-0 bg-black/50" aria-hidden="true" />

    <!-- Modal container -->
    <div class="fixed inset-0 flex items-center justify-center p-4">
      <DialogPanel class="rounded-lg shadow-lg max-w-sm w-full p-6 relative modal-bg">
        <!-- Close button -->
        <button
          @click="closeModal"
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <DialogTitle class="text-xl font-bold mb-2 pr-8">
          🎉 Voucher Spesial!
        </DialogTitle>
        
        <p class="text-sm mb-4" style="color: hsl(189, 92%, 58%);">
          Pilih voucher favorit Anda
        </p>

        <!-- Cards Grid -->
        <div class="grid grid-cols-3 gap-2 mb-4 max-h-80 overflow-y-auto pr-2">
          <div
            v-for="(coupon, index) in coupons"
            :key="index"
            class="voucher-card-compact"
            @click="selectedIndex = index"
            :class="{ 'ring-2 ring-blue-500': selectedIndex === index }"
          >
            <div class="card__border">
              <div class="card__border_inner"></div>
            </div>
            <h3 class="card_title_compact">{{ coupon.code }}</h3>
            <p class="card_discount_compact">{{ coupon.discount }}% OFF</p>
            <div class="card__list_compact">
              <div class="card__list_item_compact">
                <div class="check_compact">
                  <svg class="check_svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                </div>
                <span class="list_text_compact">Max Rp {{ (coupon.maxDiscount / 1000).toFixed(0) }}K</span>
              </div>
            </div>
          </div>
        </div>


      </DialogPanel>
    </div>
  </Dialog>
  </Transition>
</template>

<script setup>
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'
import Swal from 'sweetalert2'
import { ref, computed } from 'vue'

const isOpen = ref(false)
const isCopied = ref(false)
const selectedIndex = ref(3) // Default ke TOYS15

const coupons = [
  { code: "FASH18", discount: 18, maxDiscount: 150000 },
  { code: "FURN25", discount: 25, maxDiscount: 200000 },
  { code: "GADG30", discount: 30, maxDiscount: 250000 },
  { code: "TOYS15", discount: 15, maxDiscount: 100000 },
  { code: "BEAUTY24", discount: 24, maxDiscount: 180000 },
  { code: "KERS40", discount: 40, maxDiscount: 200000 },
  { code: "SAVE10", discount: 10, maxDiscount: 50000 },
]

const selectedCoupon = computed(() => coupons[selectedIndex.value])

const openModal = () => {
  isOpen.value = true
}

const closeModal = () => {
  isOpen.value = false
  isCopied.value = false
}

const copyVoucher = async () => {
  try {
    await navigator.clipboard.writeText(selectedCoupon.value.code)
    isCopied.value = true
    
    Swal.fire({
      title: 'Berhasil!',
      text: `Kode ${selectedCoupon.value.code} sudah disalin`,
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    })
    
    setTimeout(() => {
      isCopied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
    Swal.fire({
      title: 'Gagal!',
      text: 'Terjadi kesalahan saat menyalin',
      icon: 'error',
      timer: 2000,
      showConfirmButton: false
    })
  }
}

defineExpose({
  openModal,
  closeModal
})
</script>

<style scoped>
:root {
  --white: hsl(0, 0%, 100%);
  --black: hsl(240, 15%, 9%);
  --paragraph: hsl(0, 0%, 83%);
  --line: hsl(240, 9%, 17%);
  --primary: hsl(189, 92%, 58%);
}

.modal-bg {
  background-color: hsla(240, 15%, 12%, 1);
  background-image: radial-gradient(
      at 88% 40%,
      hsla(240, 15%, 12%, 1) 0px,
      transparent 85%
    ),
    radial-gradient(at 49% 30%, hsla(240, 15%, 12%, 1) 0px, transparent 85%),
    radial-gradient(at 14% 26%, hsla(240, 15%, 12%, 1) 0px, transparent 85%),
    radial-gradient(at 0% 64%, hsl(189, 99%, 20%) 0px, transparent 85%),
    radial-gradient(at 41% 94%, hsl(189, 97%, 28%) 0px, transparent 85%),
    radial-gradient(at 100% 99%, hsl(188, 94%, 10%) 0px, transparent 85%);
}

.modal-bg :deep(.rounded-lg) {
  background-color: transparent;
}

.voucher-card-compact {
  --white: hsl(0, 0%, 100%);
  --black: hsl(240, 15%, 9%);
  --paragraph: hsl(0, 0%, 83%);
  --line: hsl(240, 9%, 17%);
  --primary: hsl(189, 92%, 58%);
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.7rem;
  background-color: hsla(240, 15%, 9%, 1);
  background-image: radial-gradient(
      at 88% 40%,
      hsla(240, 15%, 9%, 1) 0px,
      transparent 85%
    ),
    radial-gradient(at 49% 30%, hsla(240, 15%, 9%, 1) 0px, transparent 85%),
    radial-gradient(at 14% 26%, hsla(240, 15%, 9%, 1) 0px, transparent 85%),
    radial-gradient(at 0% 64%, hsl(189, 99%, 26%) 0px, transparent 85%),
    radial-gradient(at 41% 94%, hsl(189, 97%, 36%) 0px, transparent 85%),
    radial-gradient(at 100% 99%, hsl(188, 94%, 13%) 0px, transparent 85%);
  border-radius: 0.75rem;
  box-shadow: 0px -16px 24px 0px rgba(255, 255, 255, 0.25) inset;
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.voucher-card-compact:hover {
  transform: translateY(-1px);
  box-shadow: 0px -16px 24px 0px rgba(255, 255, 255, 0.35) inset;
}

.card__border {
  overflow: hidden;
  pointer-events: none;
  position: absolute;
  z-index: -10;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: calc(100% + 2px);
  height: calc(100% + 2px);
  background-image: linear-gradient(
    0deg,
    hsl(0, 0%, 100%) -50%,
    hsl(0, 0%, 40%) 100%
  );
  border-radius: 0.75rem;
}

.card__border_inner {
  width: 100%;
  height: 100%;
}

.card_title_compact {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--white);
  margin: 0;
}

.card_discount_compact {
  margin: 0;
  font-size: 0.75rem;
  color: var(--primary);
  font-weight: 600;
}

.card__list_compact {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.card__list_item_compact {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.check_compact {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 0.9rem;
  height: 0.9rem;
  background-color: var(--primary);
  border-radius: 50%;
  flex-shrink: 0;
}

.check_svg {
  width: 0.5rem;
  height: 0.5rem;
  fill: var(--black);
}

.list_text_compact {
  font-size: 0.65rem;
  color: var(--white);
}

/* Modal Zoom Transition */
.modal-zoom-enter-active,
.modal-zoom-leave-active {
  transition: all 0.4s ease;
}

.modal-zoom-enter-from,
.modal-zoom-leave-to {
  opacity: 0;
}

.modal-zoom-enter-from :deep(.fixed:nth-child(2)) {
  transform: scale(0.8);
  opacity: 0;
}

.modal-zoom-enter-to :deep(.fixed:nth-child(2)) {
  transform: scale(1);
  opacity: 1;
}

.modal-zoom-leave-to :deep(.fixed:nth-child(2)) {
  transform: scale(0.8);
  opacity: 0;
}
</style>