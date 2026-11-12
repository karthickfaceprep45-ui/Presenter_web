<template>
  <div class="role-selector-view w-full max-w-4xl mx-auto px-4 py-6 md:py-10 text-center flex-1 flex flex-col justify-center">
    <!-- Header -->
    <h1 class="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
      Welcome to Presenter
    </h1>
    <p class="text-xs md:text-sm text-gray-500 mt-1 mb-6 md:mb-8">
      Select your role to get started
    </p>

    <!-- 3 Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto items-stretch w-full">
      <!-- Admin Card -->
      <button
        type="button"
        @click="$emit('select-role', 'admin')"
        class="bg-white rounded-2xl p-5 md:p-6 border-2 border-secondary border-opacity-10 hover:border-blue-500 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col items-center text-center cursor-pointer group text-left"
        :class="{ 'border-blue-500': selectedRole === 'admin' }"
      >
        <div class="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-3.5 group-hover:scale-105 transition-transform">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>

        <h2 class="text-base font-bold text-gray-900 mb-1">
          Admin
        </h2>

        <p class="text-xs text-gray-500 leading-relaxed">
          Create a room and generate a class code for participants
        </p>
      </button>

      <!-- Mentor Card -->
      <button
        type="button"
        @click="$emit('select-role', 'mentor')"
        class="bg-white rounded-2xl p-5 md:p-6 border-2 border-secondary border-opacity-10 hover:border-blue-500 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col items-center text-center cursor-pointer group text-left"
        :class="{ 'border-blue-500': selectedRole === 'mentor' }"
      >
        <div class="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-3.5 group-hover:scale-105 transition-transform">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>

        <h2 class="text-base font-bold text-gray-900 mb-1">
          Mentor
        </h2>

        <p class="text-xs text-gray-500 leading-relaxed">
          Lead the session and control what students see in real time
        </p>
      </button>

      <!-- Student Card -->
      <button
        type="button"
        @click="$emit('select-role', 'student')"
        class="bg-white rounded-2xl p-5 md:p-6 border-2 border-secondary border-opacity-10 hover:border-blue-500 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col items-center text-center cursor-pointer group text-left"
        :class="{ 'border-blue-500': selectedRole === 'student' }"
      >
        <div class="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-3.5 group-hover:scale-105 transition-transform">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 14v7" />
          </svg>
        </div>

        <h2 class="text-base font-bold text-gray-900 mb-1">
          Student
        </h2>

        <p class="text-xs text-gray-500 leading-relaxed">
          Join a room using the 6-digit code provided by your admin
        </p>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  selectedRole: {
    type: String,
    default: null
  }
})

defineEmits(['select-role'])
</script>
