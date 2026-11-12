<template>
  <div
    :class="[
      'question-view-wrapper w-full flex flex-col justify-center max-w-5xl mx-auto p-1 sm:p-2',
      isMentor ? 'h-full' : 'my-auto'
    ]"
  >
    <!-- STUDENT VIEW (Compact) -->
    <div v-if="!isMentor" class="question-view-student w-full max-w-2xl mx-auto flex flex-col justify-center">
      <!-- Badges -->
      <div class="flex items-center gap-2 mb-2">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 font-semibold text-xs">
          Question {{ questionNumber }} / {{ totalQuestions }}
        </span>
        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 font-medium text-xs">
          <span class="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse"></span>
          MCQ Active
        </span>
      </div>

      <!-- Alert Banner (shown only to unanswered students when alerted by Mentor) -->
      <div
        v-if="visibleStudentAlert"
        role="alert"
        class="student-question-alert mb-2.5 flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs sm:text-sm text-amber-900 shadow-2xs"
      >
        <div class="flex items-center gap-2 min-w-0">
          <span class="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
          <span class="font-medium">{{ visibleStudentAlert.message }}</span>
        </div>
        <button
          type="button"
          @click="dismissStudentAlert"
          class="px-2.5 py-0.5 rounded-md border border-amber-200/80 bg-white hover:bg-amber-100/60 text-amber-900 font-semibold text-[11px] shrink-0 transition cursor-pointer"
        >
          Dismiss
        </button>
      </div>

      <!-- Question Text -->
      <h2 class="text-sm sm:text-base md:text-lg font-bold text-gray-900 leading-snug mb-3">
        {{ questionData.question }}
      </h2>

      <!-- Options List -->
      <div class="space-y-2">
        <button
          v-for="opt in questionData.options"
          :key="opt.label"
          type="button"
          :disabled="isSubmitted || isRevealed"
          @click="selectOption(opt.label)"
          :class="[
            'w-full p-2.5 sm:p-3 rounded-xl border text-left font-medium flex items-center gap-3 transition text-xs sm:text-sm',
            getStudentOptionClass(opt.label)
          ]"
        >
          <!-- Option letter circle badge -->
          <span
            :class="[
              'w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center shrink-0 transition',
              getStudentOptionBadgeClass(opt.label)
            ]"
          >
            {{ opt.label }}
          </span>

          <span class="flex-1">{{ opt.text }}</span>
        </button>
      </div>

      <!-- Bottom Banner States -->
      <!-- State 1: Answer submitted, waiting for mentor to reveal -->
      <div
        v-if="isSubmitted && !isRevealed"
        class="w-full bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs sm:text-sm font-medium py-2 px-3 rounded-xl text-center mt-3"
      >
        Answer submitted. Waiting for results...
      </div>

      <!-- State 2: Answer revealed by mentor -->
      <div
        v-else-if="isRevealed"
        :class="[
          'w-full border text-xs sm:text-sm font-semibold py-2 px-3 rounded-xl text-center mt-3',
          isStudentCorrect
            ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
            : 'bg-rose-50 border-rose-100 text-rose-800'
        ]"
      >
        <span v-if="isStudentCorrect">Correct! Well done.</span>
        <span v-else>
          Incorrect! The correct answer is {{ questionData.correctAnswer }}.
        </span>
      </div>
    </div>

    <!-- MENTOR VIEW (Two columns, compact) -->
    <div v-else class="w-full grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
      <!-- Left Column: Question & Controls (7 of 12) -->
      <div class="lg:col-span-7 flex flex-col">
        <!-- Badges -->
        <div class="flex items-center gap-2 mb-2">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 font-semibold text-xs">
            Question {{ questionNumber }} / {{ totalQuestions }}
          </span>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium text-xs">
            {{ questionData.topic }}
          </span>
        </div>

        <!-- Question Text -->
        <h2 class="text-sm sm:text-base md:text-lg font-bold text-gray-900 leading-snug mb-3">
          {{ questionData.question }}
        </h2>

        <!-- Options List -->
        <div class="space-y-2 mb-3">
          <div
            v-for="opt in questionData.options"
            :key="opt.label"
            :class="[
              'w-full p-2.5 sm:p-3 rounded-xl border font-medium flex items-center gap-3 transition text-xs sm:text-sm',
              getMentorOptionClass(opt.label)
            ]"
          >
            <span
              :class="[
                'w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center shrink-0 transition',
                getMentorOptionBadgeClass(opt.label)
              ]"
            >
              {{ opt.label }}
            </span>
            <span class="flex-1">{{ opt.text }}</span>
          </div>
        </div>

        <!-- Mentor Action Buttons (Inline & Compact) -->
        <div class="flex flex-wrap items-center gap-2.5 pt-1">
          <button
            v-if="!isRevealed"
            type="button"
            @click="emitReveal"
            class="px-3.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs transition cursor-pointer"
          >
            Show Correct Answer
          </button>
          <button
            v-else
            type="button"
            disabled
            class="px-3.5 py-1.5 rounded-lg bg-gray-100 text-gray-400 font-medium text-xs cursor-default"
          >
            Answer Revealed
          </button>

          <button
            type="button"
            @click="emitNext"
            :disabled="!isRevealed"
            :class="[
              'px-3.5 py-1.5 rounded-lg font-semibold text-xs transition',
              isRevealed
                ? 'bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-xs'
                : 'bg-purple-100 text-purple-400 cursor-not-allowed'
            ]"
          >
            Next Question
          </button>

          <div class="flex items-center gap-2 sm:ml-auto sm:pl-2.5 sm:border-l sm:border-gray-200">
            <button
              type="button"
              @click="emitAlert"
              :disabled="isAlertDisabled"
              :class="[
                'px-3 py-1.5 rounded-lg font-semibold text-xs border transition',
                isAlertDisabled
                  ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200 cursor-pointer shadow-2xs'
              ]"
            >
              {{ alertCooldownSeconds > 0 ? `Alert (${alertCooldownSeconds}s)` : 'Alert' }}
            </button>
            <span class="text-xs text-gray-500 font-medium whitespace-nowrap">
              {{ unansweredCountText }}
            </span>
          </div>
        </div>
      </div>

      <!-- Right Column: Live Responses Card (5 of 12) -->
      <div class="lg:col-span-5 bg-gray-50/80 border border-gray-100 rounded-xl p-3 sm:p-4 shadow-xs">
        <h3 class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">
          Live Responses
        </h3>

        <!-- 3 Stat Tiles -->
        <div class="grid grid-cols-3 gap-2 mb-3">
          <div class="bg-white rounded-lg p-2 border border-gray-100 text-center shadow-2xs">
            <div class="text-xl font-bold text-blue-600">
              {{ activeStudentsCount }}
            </div>
            <div class="text-[10px] text-gray-400 font-medium">Active</div>
          </div>

          <div class="bg-white rounded-lg p-2 border border-gray-100 text-center shadow-2xs">
            <div class="text-xl font-bold text-emerald-600">
              {{ correctCount }}
            </div>
            <div class="text-[10px] text-gray-400 font-medium">Correct</div>
          </div>

          <div class="bg-white rounded-lg p-2 border border-gray-100 text-center shadow-2xs">
            <div class="text-xl font-bold text-rose-500">
              {{ incorrectCount }}
            </div>
            <div class="text-[10px] text-gray-400 font-medium">Incorrect</div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="mb-3">
          <div class="flex items-center justify-between text-[11px] text-gray-500 font-medium mb-1">
            <span>Answered {{ answeredCount }}</span>
            <span v-if="activeStudentsCount > 0">
              {{ Math.round((answeredCount / activeStudentsCount) * 100) }}%
            </span>
          </div>
          <div class="w-full bg-gray-200/80 rounded-full h-1.5 overflow-hidden">
            <div
              class="bg-blue-600 h-full rounded-full transition-all duration-300"
              :style="{ width: progressPercentage + '%' }"
            ></div>
          </div>
        </div>

        <!-- Student Responses List (Compact with scrollbar if long) -->
        <div class="border-t border-gray-200/60 pt-2.5">
          <div class="text-[11px] font-semibold text-gray-500 mb-2">
            Participants ({{ studentResponsesList.length }})
          </div>

          <div
            v-if="studentResponsesList.length === 0"
            class="text-[11px] text-gray-400 italic text-center py-3 bg-white/60 rounded-lg border border-dashed border-gray-200"
          >
            Waiting for student responses...
          </div>

          <div v-else class="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            <div
              v-for="st in studentResponsesList"
              :key="st.studentName"
              class="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-gray-100 text-xs shadow-2xs"
            >
              <span class="font-medium text-gray-800 truncate max-w-[120px]" :title="st.studentName">
                {{ st.studentName }}
              </span>

              <div class="flex items-center gap-1.5">
                <span v-if="st.selectedOption" class="font-bold text-gray-700 text-xs">
                  {{ st.selectedOption }}
                </span>

                <span
                  v-if="!st.selectedOption"
                  class="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium text-[10px]"
                >
                  Waiting
                </span>
                <span
                  v-else-if="st.isCorrect"
                  class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[10px]"
                >
                  Correct
                </span>
                <span
                  v-else
                  class="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 font-semibold text-[10px]"
                >
                  Incorrect
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue'

const mcqAlertContext = inject('mcqAlertContext', null)

const props = defineProps({
  questionData: {
    type: Object,
    required: true
  },
  questionNumber: {
    type: Number,
    default: 1
  },
  totalQuestions: {
    type: Number,
    default: 3
  },
  isMentor: {
    type: Boolean,
    default: false
  },
  studentName: {
    type: String,
    default: ''
  },
  studentAnswers: {
    type: Object,
    default: () => ({})
  },
  allResponses: {
    type: Object,
    default: () => ({})
  },
  activeStudents: {
    type: Array,
    default: () => []
  },
  isRevealed: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit-answer', 'reveal-answer', 'next-question'])

// --- Student Logic ---
const studentSelectedOption = computed(() => {
  return props.studentAnswers[props.questionData.id]?.selectedOption || null
})

const isSubmitted = computed(() => {
  return Boolean(studentSelectedOption.value)
})

const isStudentCorrect = computed(() => {
  return studentSelectedOption.value === props.questionData.correctAnswer
})

function selectOption(label) {
  if (isSubmitted.value || props.isRevealed) return
  const isCorrect = label === props.questionData.correctAnswer
  emit('submit-answer', {
    questionId: props.questionData.id,
    selectedOption: label,
    isCorrect
  })
}

function getStudentOptionClass(label) {
  if (props.isRevealed) {
    if (label === props.questionData.correctAnswer) {
      return 'border-2 border-emerald-500 bg-emerald-50/50 text-emerald-950 font-semibold'
    }
    if (label === studentSelectedOption.value && !isStudentCorrect.value) {
      return 'border-2 border-rose-400 bg-rose-50/50 text-rose-950 font-semibold'
    }
    return 'border-gray-200 bg-rose-50/20 text-gray-500 opacity-80'
  }

  if (label === studentSelectedOption.value) {
    return 'border-2 border-blue-500 bg-blue-50/40 text-blue-900 font-semibold shadow-xs'
  }

  if (isSubmitted.value) {
    return 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
  }

  return 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50 text-gray-700 cursor-pointer'
}

function getStudentOptionBadgeClass(label) {
  if (props.isRevealed) {
    if (label === props.questionData.correctAnswer) {
      return 'bg-emerald-600 text-white font-bold'
    }
    if (label === studentSelectedOption.value && !isStudentCorrect.value) {
      return 'bg-rose-600 text-white font-bold'
    }
    return 'bg-gray-100 text-gray-500'
  }

  if (label === studentSelectedOption.value) {
    return 'bg-blue-600 text-white font-bold'
  }

  return 'bg-gray-100 text-gray-600'
}

// --- Mentor Logic ---
function emitReveal() {
  emit('reveal-answer', { questionId: props.questionData.id })
}

function emitNext() {
  emit('next-question', { questionId: props.questionData.id })
}

function getMentorOptionClass(label) {
  if (props.isRevealed) {
    if (label === props.questionData.correctAnswer) {
      return 'border-2 border-emerald-500 bg-emerald-50/50 text-emerald-950 font-semibold shadow-xs'
    }
    return 'border-gray-200 bg-white text-gray-600'
  }
  return 'border-gray-200 bg-white text-gray-700'
}

function getMentorOptionBadgeClass(label) {
  if (props.isRevealed && label === props.questionData.correctAnswer) {
    return 'bg-emerald-600 text-white font-bold'
  }
  return 'bg-gray-100 text-gray-600'
}

// --- Live Responses Analytics ---
const currentQResponses = computed(() => {
  return props.allResponses[props.questionData.id] || {}
})

const unansweredCount = computed(() => {
  return studentResponsesList.value.filter(st => !st.selectedOption).length
})

const unansweredCountText = computed(() => {
  return unansweredCount.value === 1
    ? '1 student has not answered'
    : `${unansweredCount.value} students have not answered`
})

const alertCooldownSeconds = computed(() => {
  if (!mcqAlertContext) return 0
  const until = mcqAlertContext.alertCooldownUntilByQuestion.value[props.questionData.id] || 0
  const remainingMs = until - mcqAlertContext.cooldownNow.value
  return remainingMs > 0 ? Math.ceil(remainingMs / 1000) : 0
})

const isAlertDisabled = computed(() => {
  return props.isRevealed || unansweredCount.value === 0 || alertCooldownSeconds.value > 0
})

function emitAlert() {
  if (!props.isMentor || isAlertDisabled.value || !mcqAlertContext) return
  mcqAlertContext.sendQuestionAlert(props.questionData.id)
}

const visibleStudentAlert = computed(() => {
  if (props.isMentor || !mcqAlertContext) return null
  if (isSubmitted.value || props.isRevealed) return null
  const qId = props.questionData.id
  const alert = mcqAlertContext.questionAlerts.value[qId]
  if (!alert) return null
  if (mcqAlertContext.dismissedAlertIds.value[qId] === alert.alertId) return null
  return alert
})

function dismissStudentAlert() {
  if (!mcqAlertContext) return
  const alert = visibleStudentAlert.value
  if (!alert) return
  mcqAlertContext.dismissQuestionAlert(props.questionData.id, alert.alertId)
}

const activeStudentsCount = computed(() => {
  const knownActive = props.activeStudents.length
  const responderCount = Object.keys(currentQResponses.value).length
  return Math.max(knownActive, responderCount, 1)
})

const answeredCount = computed(() => {
  return Object.keys(currentQResponses.value).length
})

const correctCount = computed(() => {
  return Object.values(currentQResponses.value).filter(r => r.isCorrect).length
})

const incorrectCount = computed(() => {
  return Object.values(currentQResponses.value).filter(r => !r.isCorrect).length
})

const progressPercentage = computed(() => {
  if (activeStudentsCount.value === 0) return 0
  return Math.min(100, Math.round((answeredCount.value / activeStudentsCount.value) * 100))
})

const studentResponsesList = computed(() => {
  const list = []
  const recorded = new Set()

  for (const [stName, resp] of Object.entries(currentQResponses.value)) {
    list.push({
      studentName: stName,
      selectedOption: resp.selectedOption,
      isCorrect: resp.isCorrect
    })
    recorded.add(stName)
  }

  for (const st of props.activeStudents) {
    const name = typeof st === 'string' ? st : st.name
    if (name && !recorded.has(name)) {
      list.push({
        studentName: name,
        selectedOption: null,
        isCorrect: false
      })
      recorded.add(name)
    }
  }

  return list
})
</script>

<style scoped>
.question-view-student {
  padding-bottom: calc(96px + env(safe-area-inset-bottom, 0px));
}
</style>
