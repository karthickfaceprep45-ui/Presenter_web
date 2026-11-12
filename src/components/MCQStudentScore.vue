<template>
  <div class="mcq-student-score w-full max-w-2xl mx-auto my-auto flex flex-col justify-center p-2">
    <!-- Header -->
    <div class="mb-3">
      <h2 class="text-base sm:text-lg font-bold text-gray-900 tracking-tight leading-tight">
        Your Results
      </h2>
      <p class="text-[11px] text-gray-500">
        MCQ session complete
      </p>
    </div>

    <!-- Score Summary Banner Card (Compact) -->
    <div class="bg-gray-50/70 border border-gray-100 rounded-xl p-3 sm:p-4 flex items-center gap-4 mb-3 shadow-2xs">
      <!-- Circular Ring Score -->
      <div
        :class="[
          'w-14 h-14 sm:w-16 sm:h-16 rounded-full border-3 flex flex-col items-center justify-center shrink-0 bg-white shadow-2xs',
          scoreAccuracy >= 70 ? 'border-emerald-500 text-emerald-700' : 'border-rose-400 text-rose-600'
        ]"
      >
        <span class="text-base sm:text-lg font-extrabold leading-none">
          {{ correctCount }}
        </span>
        <span class="text-[9px] font-semibold text-gray-400 mt-0.5">
          / {{ questions.length }}
        </span>
      </div>

      <!-- Feedback Text -->
      <div>
        <h3 class="text-sm sm:text-base font-bold text-gray-900">
          {{ feedbackHeadline }}
        </h3>
        <p class="text-xs text-gray-500 mt-0.5">
          You answered {{ correctCount }} of {{ questions.length }} questions correctly ({{ scoreAccuracy }}%).
        </p>
      </div>
    </div>

    <!-- Question-by-Question Detailed Review (Compact scrollable list) -->
    <div class="space-y-2.5 max-h-64 overflow-y-auto pr-1">
      <div
        v-for="(q, idx) in questions"
        :key="q.id"
        class="bg-white rounded-xl border border-gray-100 p-3 shadow-2xs"
      >
        <!-- Header -->
        <div class="flex items-center justify-between gap-2 mb-1.5">
          <span class="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
            Question {{ idx + 1 }} — {{ q.topic }}
          </span>

          <span
            v-if="isQuestionCorrect(q.id)"
            class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold"
          >
            Correct
          </span>
          <span
            v-else
            class="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-semibold"
          >
            Incorrect
          </span>
        </div>

        <!-- Question text -->
        <h4 class="text-xs sm:text-sm font-bold text-gray-900 mb-2 leading-snug">
          {{ q.question }}
        </h4>

        <!-- Options Review -->
        <div class="space-y-1.5">
          <div
            v-for="opt in q.options"
            :key="opt.label"
            :class="[
              'p-2 rounded-lg border text-xs font-medium flex items-center gap-2.5 transition',
              getReviewOptionClass(q, opt.label)
            ]"
          >
            <span
              :class="[
                'w-5 h-5 rounded-full font-bold text-[10px] flex items-center justify-center shrink-0',
                getReviewBadgeClass(q, opt.label)
              ]"
            >
              {{ opt.label }}
            </span>
            <span class="flex-1">{{ opt.text }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  questions: {
    type: Array,
    default: () => []
  },
  studentAnswers: {
    type: Object,
    default: () => ({})
  }
})

function getStudentAnswer(qId) {
  return props.studentAnswers[qId]?.selectedOption || null
}

function isQuestionCorrect(qId) {
  const ans = props.studentAnswers[qId]
  return Boolean(ans && ans.isCorrect)
}

const correctCount = computed(() => {
  return props.questions.filter(q => isQuestionCorrect(q.id)).length
})

const scoreAccuracy = computed(() => {
  if (props.questions.length === 0) return 0
  return Math.round((correctCount.value / props.questions.length) * 100)
})

const feedbackHeadline = computed(() => {
  if (scoreAccuracy.value === 100) return 'Outstanding — perfect score!'
  if (scoreAccuracy.value >= 70) return 'Well done — great understanding!'
  if (scoreAccuracy.value >= 40) return 'Keep studying — you will improve!'
  return 'Review the material and try again!'
})

function getReviewOptionClass(q, label) {
  const studentAns = getStudentAnswer(q.id)
  const isCorrectOption = label === q.correctAnswer
  const isSelectedByStudent = label === studentAns

  if (isCorrectOption) {
    return 'border-2 border-emerald-500 bg-emerald-50/50 text-emerald-950 font-semibold'
  }
  if (isSelectedByStudent && !isCorrectOption) {
    return 'border-2 border-rose-400 bg-rose-50/50 text-rose-950 font-semibold'
  }
  return 'border-gray-200 bg-gray-50/40 text-gray-600'
}

function getReviewBadgeClass(q, label) {
  const studentAns = getStudentAnswer(q.id)
  const isCorrectOption = label === q.correctAnswer
  const isSelectedByStudent = label === studentAns

  if (isCorrectOption) {
    return 'bg-emerald-600 text-white font-bold'
  }
  if (isSelectedByStudent && !isCorrectOption) {
    return 'bg-rose-600 text-white font-bold'
  }
  return 'bg-gray-100 text-gray-500'
}
</script>

<style scoped>
.mcq-student-score {
  padding-bottom: calc(96px + env(safe-area-inset-bottom, 0px));
}
</style>
