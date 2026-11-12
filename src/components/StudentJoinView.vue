<template>
  <div class="student-join-view w-full max-w-sm mx-auto px-4 py-6 md:py-8 flex-1 flex flex-col justify-center">
    <div class="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm">
      <!-- STEP 1: Enter Room Code -->
      <div v-if="step === 1">
        <h1 class="text-xl font-bold text-gray-900 tracking-tight">
          Join a Room
        </h1>
        <p class="text-xs text-gray-500 mt-0.5 mb-5">
          Enter the 6-digit code provided by your Admin
        </p>

        <form @submit.prevent="handleCodeSubmit">
          <label for="student-room-code" class="block text-xs font-semibold text-gray-700 mb-1.5">
            Room Code
          </label>
          <input
            id="student-room-code"
            type="text"
            v-model="inputCode"
            maxlength="6"
            placeholder="211313"
            autofocus
            class="w-full text-center text-3xl font-extrabold tracking-[0.2em] py-3 px-4 rounded-xl border-2 border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 text-gray-900 placeholder-gray-300 font-mono whitespace-nowrap transition"
          />

          <p v-if="codeError" class="text-xs text-rose-500 mt-1.5 font-medium">
            {{ codeError }}
          </p>

          <button
            type="submit"
            :disabled="inputCode.trim().length !== 6"
            class="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition shadow-xs text-xs sm:text-sm active:scale-98 cursor-pointer"
          >
            Continue
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

      <!-- STEP 2: Enter Student Display Name -->
      <div v-else-if="step === 2">
        <h1 class="text-xl font-bold text-gray-900 tracking-tight">
          Your Name
        </h1>
        <p class="text-xs text-gray-500 mt-0.5 mb-5">
          This name will be shown to the Mentor during the MCQ
        </p>

        <form @submit.prevent="handleNameSubmit">
          <label for="student-display-name" class="block text-xs font-semibold text-gray-700 mb-1.5">
            Display Name
          </label>
          <input
            id="student-display-name"
            type="text"
            v-model="displayName"
            placeholder="e.g. Alex Smith"
            autofocus
            class="w-full py-2.5 px-3.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 text-gray-900 text-xs sm:text-sm transition"
            :class="{ 'border-rose-400': nameError }"
          />

          <p v-if="nameError" class="text-xs text-rose-500 mt-1.5 font-medium">
            Please enter your name.
          </p>

          <button
            type="submit"
            class="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition shadow-xs text-xs sm:text-sm active:scale-98 cursor-pointer"
          >
            Join Room
          </button>

          <button
            type="button"
            @click="step = 1"
            class="mt-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-xl text-xs transition cursor-pointer"
          >
            Back
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['join-room', 'back-home'])

const step = ref(1)
const inputCode = ref('')
const displayName = ref('')
const codeError = ref('')
const nameError = ref(false)

function handleCodeSubmit() {
  const code = inputCode.value.replace(/\D/g, '').trim()
  if (code.length !== 6) {
    codeError.value = 'Please enter a valid 6-digit room code.'
    return
  }
  codeError.value = ''
  step.value = 2
}

function handleNameSubmit() {
  const trimmed = displayName.value.trim()
  if (!trimmed) {
    nameError.value = true
    return
  }
  nameError.value = false
  emit('join-room', {
    roomCode: inputCode.value.trim(),
    name: trimmed
  })
}
</script>
