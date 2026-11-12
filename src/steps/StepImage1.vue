<template>
  <div class="w-full h-full flex flex-col items-center justify-center relative min-h-0 overflow-hidden">
    <!-- Image fills available content area while keeping aspect ratio without cropping -->
    <img
      :src="imageSrc"
      :alt="title"
      class="max-w-full max-h-full object-contain rounded-xl select-none shadow-xs"
    />

    <!-- Subtle bottom overlay caption tag -->
    <div class="absolute bottom-3 left-4 bg-black/65 backdrop-blur-xs text-white text-xs sm:text-sm font-medium px-3.5 py-1.5 rounded-lg shadow-sm">
      {{ title }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  isMentor: {
    type: Boolean,
    default: false
  },
  isClassLive: {
    type: Boolean,
    default: false
  }
})

const title = 'Introduction — 1 of 3'
const imageSrc = '/images/slide1.jpg'
</script>
