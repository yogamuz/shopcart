<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    @click.self="handleCancel"
  >
    <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">Crop Profile Picture</h3>
        <button @click="handleCancel" class="p-1 hover:bg-gray-100 rounded-lg transition-colors">
          <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Crop Area -->
      <div class="p-6">
        <div class="relative bg-gray-100 rounded-lg overflow-hidden" style="height: 400px">
          <vue-picture-cropper
            :boxStyle="{
              width: '100%',
              height: '100%',
              backgroundColor: '#1a1a1a',
              margin: 'auto',
            }"
            :img="imageSrc"
            :options="{
              viewMode: 1,
              dragMode: 'move',
              aspectRatio: 1,
              cropBoxResizable: false,
              cropBoxMovable: false,
              guides: false,
              center: true,
              highlight: false,
              background: false, // ← Ubah jadi false
              modal: true, // ← Tambahkan ini
              autoCropArea: 0.8,
            }"
            @ready="handleReady"
          />
        </div>

        <!-- Controls -->
        <div class="flex items-center justify-center gap-4 mt-4">
          <button @click="rotateLeft" class="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Rotate Left">
            <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
              />
            </svg>
          </button>

          <button @click="rotateRight" class="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Rotate Right">
            <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6"
              />
            </svg>
          </button>

          <button @click="zoomIn" class="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Zoom In">
            <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
              />
            </svg>
          </button>

          <button @click="zoomOut" class="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Zoom Out">
            <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
              />
            </svg>
          </button>

          <button @click="reset" class="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Reset">
            <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
        <button
          @click="handleCancel"
          class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          @click="handleCrop"
          :disabled="!isReady"
          class="px-6 py-2 bg-[#6C5CE7] text-white text-sm font-medium rounded-lg hover:bg-[#5B4FD7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Apply Crop
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import VuePictureCropper, { cropper } from "vue-picture-cropper";

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  imageSrc: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    default: "cropped-image.jpg",
  },
});

const emit = defineEmits(["update:modelValue", "crop", "cancel"]);

const isReady = ref(false);

const handleReady = () => {
  isReady.value = true;
};

const handleCancel = () => {
  emit("update:modelValue", false);
  emit("cancel");
};

const handleCrop = async () => {
  if (!isReady.value) return;

  try {
    const blob = await cropper.getBlob();
    const file = new File([blob], props.fileName, { type: blob.type });

    emit("crop", file);
    emit("update:modelValue", false);
  } catch (error) {
    console.error("Error cropping image:", error);
  }
};

// Control functions
const rotateLeft = () => {
  cropper.rotate(-90);
};

const rotateRight = () => {
  cropper.rotate(90);
};

const zoomIn = () => {
  cropper.zoom(0.1);
};

const zoomOut = () => {
  cropper.zoom(-0.1);
};

const reset = () => {
  cropper.reset();
};
</script>

<style scoped>
/* Modal animation */
.fixed {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
