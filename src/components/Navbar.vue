<template>
  <header class="bg-white border-b border-gray-200/80 sticky top-0 z-30 shrink-0 h-11 w-full px-4 sm:px-6 flex items-center justify-between">
    <!-- Brand / Logo -->
    <button
      type="button"
      @click="$emit('go-home')"
      class="text-lg font-bold text-blue-600 hover:text-blue-700 tracking-tight transition cursor-pointer select-none flex items-center gap-2"
    >
      <span>Presenter</span>
    </button>

    <!-- Right Controls -->
    <div v-if="role" class="flex items-center gap-2 text-xs">
      <!-- Room Code Badge -->
      <span
        v-if="roomCode"
        class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-semibold text-xs tracking-wide"
      >
        Room {{ roomCode }}
      </span>

      <!-- Role Badge -->
      <span
        class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium text-xs capitalize"
      >
        {{ role }}
      </span>

      <!-- Leave Link -->
      <button
        type="button"
        @click="$emit('leave')"
        class="text-blue-600 hover:text-blue-700 font-semibold text-xs transition ml-1 cursor-pointer"
      >
        Leave
      </button>
    </div>
  </header>
</template>

<script setup>
defineProps({
  role: {
    type: String,
    default: null
  },
  roomCode: {
    type: String,
    default: null
  }
})

defineEmits(['go-home', 'leave'])
</script>
