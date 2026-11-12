<template>
  <div class="mentor-login-view w-full max-w-sm mx-auto px-4 py-6 md:py-8 flex-1 flex flex-col justify-center">
    <div class="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm">
      <h1 class="text-xl font-bold text-gray-900 tracking-tight">
        Mentor Login
      </h1>
      <p class="text-xs text-gray-500 mt-0.5 mb-5">
        Enter the room code to access your controls
      </p>

      <form @submit.prevent="handleSubmit">
        <label for="mentor-room-code" class="block text-xs font-semibold text-gray-700 mb-1.5">
          Room Code
        </label>
        <input
          id="mentor-room-code"
          type="text"
          v-model="inputCode"
          maxlength="6"
          placeholder="211313"
          autofocus
          class="w-full text-center text-3xl font-extrabold tracking-[0.2em] py-3 px-4 rounded-xl border-2 border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 text-gray-900 placeholder-gray-300 font-mono whitespace-nowrap transition"
        />

        <p v-if="errorMsg" class="text-xs text-rose-500 mt-1.5 font-medium">
          {{ errorMsg }}
        </p>

        <button
          type="submit"
          :disabled="inputCode.trim().length !== 6"
          class="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition shadow-xs text-xs sm:text-sm active:scale-98 cursor-pointer"
        >
          Enter Room
        </button>

        <button
          type="button"
          @click="$emit('back-home')"
          class="mt-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-xl text-xs transition cursor-pointer"
        >
          Back
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['enter-room', 'back-home'])

const inputCode = ref('')
const errorMsg = ref('')

function handleSubmit() {
  const code = inputCode.value.replace(/\D/g, '').trim()
  if (code.length !== 6) {
    errorMsg.value = 'Please enter a valid 6-digit room code.'
    return
  }
  errorMsg.value = ''
  emit('enter-room', code)
}
</script>
