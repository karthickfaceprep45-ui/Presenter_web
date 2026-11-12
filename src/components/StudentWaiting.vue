<template>
  <div class="student-waiting-view w-full max-w-sm mx-auto px-4 py-8 md:py-12 flex-1 flex flex-col justify-center">
    <div class="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm text-center flex flex-col items-center">
      <!-- Animated 3-Dots Loader -->
      <div
        class="loading-dots h-10 flex items-center justify-center gap-2 mb-4"
        aria-hidden="true"
      >
        <span class="loading-dot w-2.5 h-2.5 rounded-full bg-blue-600"></span>
        <span class="loading-dot w-2.5 h-2.5 rounded-full bg-blue-600"></span>
        <span class="loading-dot w-2.5 h-2.5 rounded-full bg-blue-600"></span>
      </div>

      <!-- Text -->
      <h2 class="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
        Waiting for class to start
      </h2>

      <p class="text-xs text-gray-500 mt-1.5">
        You have joined room <span class="font-semibold text-gray-700 font-mono">{{ roomCode }}</span>.
      </p>
      <p class="text-xs text-gray-500 mt-0.5">
        The Mentor will begin the session shortly.
      </p>

      <!-- Leave Room Button -->
      <button
        type="button"
        @click="$emit('leave')"
        class="mt-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-5 py-2 rounded-xl text-xs transition cursor-pointer active:scale-98"
      >
        Leave Room
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  roomCode: {
    type: String,
    required: true
  }
})

defineEmits(['leave'])
</script>

<style scoped>
.loading-dot {
  animation: waiting-dot-bounce 1.2s ease-in-out infinite;
}

.loading-dot:nth-child(1) {
  animation-delay: 0s;
}

.loading-dot:nth-child(2) {
  animation-delay: 0.16s;
}

.loading-dot:nth-child(3) {
  animation-delay: 0.32s;
}

@keyframes waiting-dot-bounce {
  0%, 80%, 100% {
    transform: translateY(0) scale(0.78);
    opacity: 0.45;
  }
  40% {
    transform: translateY(-6px) scale(1);
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .loading-dot {
    animation: none;
    opacity: 0.85;
  }
}
</style>
