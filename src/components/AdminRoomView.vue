<template>
  <div class="admin-room-view w-full max-w-lg mx-auto px-4 py-4 md:py-6 flex-1 flex flex-col justify-center">
    <div class="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm relative">
      <h1 class="text-xl font-bold text-gray-900 tracking-tight">
        Room Created
      </h1>
      <p class="text-xs text-gray-500 mt-0.5 mb-4">
        Share the code below with your Mentor and Students
      </p>

      <!-- Dashed Room Code Box (Guaranteed single line, never wraps) -->
      <div class="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center bg-gray-50/50 mb-3">
        <div class="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-2">
          Room Code
        </div>
        
        <!-- 6 Individual Digit Cells in a Non-Wrapping Flex Row -->
        <div class="flex items-center justify-center gap-2 sm:gap-3.5 select-all whitespace-nowrap flex-nowrap font-mono text-3xl sm:text-4xl font-extrabold text-blue-600">
          <span
            v-for="(digit, i) in codeDigits"
            :key="i"
            class="inline-flex items-center justify-center w-8 sm:w-10 h-10 sm:h-12 text-center"
          >
            {{ digit }}
          </span>
        </div>
      </div>

      <!-- Copy Code Button -->
      <button
        type="button"
        @click="copyCode"
        class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition text-xs sm:text-sm cursor-pointer active:scale-98"
      >
        <svg class="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        <span>Copy Code</span>
      </button>

      <!-- Copy Toast Notification -->
      <transition name="fade">
        <div
          v-if="showCopiedToast"
          class="absolute bottom-16 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-medium px-3.5 py-1.5 rounded-full shadow-lg pointer-events-none"
        >
          Code copied!
        </div>
      </transition>

      <!-- Instructions Section -->
      <div class="mt-4 pt-4 border-t border-gray-100">
        <div class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">
          Instructions
        </div>

        <div class="space-y-2">
          <div class="flex items-start gap-2.5 text-xs text-gray-600">
            <span class="w-4 h-4 rounded-full bg-blue-50 text-blue-600 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
              1
            </span>
            <p>Share this code with the Mentor so they can start the class</p>
          </div>

          <div class="flex items-start gap-2.5 text-xs text-gray-600">
            <span class="w-4 h-4 rounded-full bg-blue-50 text-blue-600 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
              2
            </span>
            <p>Share this same code with Students so they can join the room</p>
          </div>

          <div class="flex items-start gap-2.5 text-xs text-gray-600">
            <span class="w-4 h-4 rounded-full bg-blue-50 text-blue-600 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
              3
            </span>
            <p>The Mentor will begin the session once everyone is ready</p>
          </div>
        </div>
      </div>

      <!-- Back / Actions -->
      <div class="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
        <button
          type="button"
          @click="$emit('back-home')"
          class="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-xl text-xs transition cursor-pointer"
        >
          Back to Home
        </button>

        <button
          type="button"
          @click="$emit('join-as-mentor', roomCode)"
          class="text-blue-600 hover:text-blue-700 font-semibold text-xs flex items-center gap-1 cursor-pointer"
        >
          <span>Open Mentor view</span>
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  roomCode: {
    type: String,
    required: true
  }
})

defineEmits(['back-home', 'join-as-mentor'])

const showCopiedToast = ref(false)

const codeDigits = computed(() => {
  const clean = String(props.roomCode).replace(/\D/g, '')
  return clean.split('')
})

async function copyCode() {
  try {
    await navigator.clipboard.writeText(props.roomCode)
  } catch (_) {}
  showCopiedToast.value = true
  setTimeout(() => {
    showCopiedToast.value = false
  }, 2000)
}
</script>
