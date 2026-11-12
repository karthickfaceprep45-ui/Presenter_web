<template>
  <div class="mcq-mentor-summary w-full max-w-4xl mx-auto flex flex-col justify-center p-2">
    <!-- Subheader -->
    <div class="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
      <div>
        <h2 class="text-base sm:text-lg font-bold text-gray-900 tracking-tight leading-tight">
          MCQ Results
        </h2>
        <p class="text-[11px] text-gray-500">
          Session complete
        </p>
      </div>

      <button
        v-if="!isClassEnded"
        type="button"
        @click="$emit('end-class')"
        class="inline-flex items-center px-3 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold text-xs transition cursor-pointer"
      >
        End Class
      </button>
      <span
        v-else
        class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium text-xs"
      >
        Class ended
      </span>
    </div>

    <!-- 3 Stat Cards in a row (Compact) -->
    <div class="grid grid-cols-3 gap-3 mb-4">
      <div class="bg-gray-50/70 border border-gray-100 rounded-xl p-3 text-center shadow-2xs">
        <div class="text-2xl font-bold text-gray-900">
          {{ questions.length }}
        </div>
        <div class="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mt-0.5">
          Questions
        </div>
      </div>

      <div class="bg-gray-50/70 border border-gray-100 rounded-xl p-3 text-center shadow-2xs">
        <div class="text-2xl font-bold text-emerald-600">
          {{ totalCorrectAnswers }}
        </div>
        <div class="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mt-0.5">
          Correct Answers
        </div>
      </div>

      <div class="bg-gray-50/70 border border-gray-100 rounded-xl p-3 text-center shadow-2xs">
        <div class="text-2xl font-bold text-blue-600">
          {{ overallAccuracy }}%
        </div>
        <div class="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mt-0.5">
          Accuracy
        </div>
      </div>
    </div>

    <!-- Detailed Questions Table (Compact) -->
    <div class="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-2xs">
      <div class="overflow-x-auto max-h-56 overflow-y-auto">
        <table class="w-full text-left text-xs">
          <thead class="sticky top-0 bg-gray-50/95 backdrop-blur-xs z-10">
            <tr class="text-gray-400 font-semibold text-[10px] uppercase tracking-wider border-b border-gray-100">
              <th class="py-2 px-3 md:px-4">Question</th>
              <th class="py-2 px-3">Topic</th>
              <th class="py-2 px-2 text-center">Responded</th>
              <th class="py-2 px-2 text-center">Correct</th>
              <th class="py-2 px-3 md:px-4 text-right">Accuracy</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 font-medium text-gray-700">
            <tr
              v-for="(q, idx) in questionStats"
              :key="q.id"
              class="hover:bg-gray-50/50 transition"
            >
              <td class="py-2.5 px-3 md:px-4 text-gray-900 font-semibold">
                <div class="truncate max-w-[220px] md:max-w-[360px]" :title="q.question">
                  {{ idx + 1 }}. {{ q.question }}
                </div>
              </td>
              <td class="py-2.5 px-3 text-gray-500">
                <span class="inline-flex px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-medium">
                  {{ q.topic }}
                </span>
              </td>
              <td class="py-2.5 px-2 text-center text-gray-800">
                {{ q.responded }}
              </td>
              <td class="py-2.5 px-2 text-center font-semibold text-emerald-600">
                {{ q.correct }}
              </td>
              <td class="py-2.5 px-3 md:px-4 text-right font-bold" :class="q.accuracy >= 50 ? 'text-blue-600' : 'text-gray-600'">
                {{ q.accuracy }}%
              </td>
            </tr>
          </tbody>
        </table>
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
  allResponses: {
    type: Object,
    default: () => ({})
  },
  isClassEnded: {
    type: Boolean,
    default: false
  }
})

defineEmits(['end-class'])

const questionStats = computed(() => {
  return props.questions.map((q) => {
    const qResponses = props.allResponses[q.id] || {}
    const responderCount = Object.keys(qResponses).length
    const correctCount = Object.values(qResponses).filter(r => r.isCorrect).length
    const accuracy = responderCount > 0 ? Math.round((correctCount / responderCount) * 100) : 0

    return {
      id: q.id,
      question: q.question,
      topic: q.topic,
      responded: responderCount,
      correct: correctCount,
      accuracy
    }
  })
})

const totalResponsesCount = computed(() => {
  return questionStats.value.reduce((acc, q) => acc + q.responded, 0)
})

const totalCorrectAnswers = computed(() => {
  return questionStats.value.reduce((acc, q) => acc + q.correct, 0)
})

const overallAccuracy = computed(() => {
  if (totalResponsesCount.value === 0) return 0
  return Math.round((totalCorrectAnswers.value / totalResponsesCount.value) * 100)
})
</script>
