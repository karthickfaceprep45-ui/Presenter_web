<template>
  <div class="w-full h-full flex-1 flex flex-col min-h-0 bg-white md:bg-[#f8fafc] md:p-2.5 overflow-hidden">
    <!-- Card fills available width and height without narrow box or empty side gutters -->
    <div class="w-full h-full flex-1 flex flex-col min-h-0 bg-white md:rounded-2xl md:border md:border-gray-200/70 md:shadow-xs overflow-hidden">
      
      <!-- Thin Top Header Bar (Compact header, leaving rest of screen for content) -->
      <div class="h-10 px-3 sm:px-4 flex items-center justify-between border-b border-gray-100 shrink-0 bg-white">
        <!-- Left: Titles -->
        <div class="flex items-center gap-2 overflow-hidden">
          <span class="text-xs sm:text-sm font-bold text-gray-900 tracking-tight whitespace-nowrap">
            {{ isMentor ? 'Presentation View' : 'Live Session' }}
          </span>
          <span class="text-gray-300">·</span>
          <span class="text-xs text-gray-500 font-medium truncate">
            {{ currentStepSubtitle }}
          </span>
        </div>

        <!-- Right: Badges & Actions -->
        <div class="flex items-center gap-2 shrink-0">
          <template v-if="isMentor">
            <!-- Waiting State -->
            <template v-if="!isClassLive && !isClassEnded">
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60 font-medium text-[11px]">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                Waiting
              </span>
              <button
                type="button"
                @click="startClass"
                class="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-semibold text-xs transition cursor-pointer"
              >
                Start Class
              </button>
            </template>

            <!-- Live State -->
            <template v-else-if="isClassLive && !isClassEnded">
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-medium text-[11px]">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                Live
              </span>
            </template>

            <!-- Raised Hands Panel Toggle (shows count even when collapsed) -->
            <button
              v-if="!isClassEnded"
              type="button"
              @click="isRaisedHandsOpen = !isRaisedHandsOpen"
              :aria-expanded="isRaisedHandsOpen"
              :class="[
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer border',
                raisedHands.length > 0
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                  : isRaisedHandsOpen
                    ? 'bg-gray-100 text-gray-800 border-gray-300'
                    : 'bg-white hover:bg-gray-50 text-gray-600 border-gray-200'
              ]"
            >
              <span
                v-if="raisedHands.length > 0"
                class="w-1.5 h-1.5 rounded-full bg-amber-500"
              ></span>
              Raised Hands ({{ raisedHands.length }})
            </button>

            <!-- End Class button available on every step before class ends -->
            <button
              v-if="!isClassEnded"
              type="button"
              @click="requestEndClass"
              class="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold text-xs transition cursor-pointer"
            >
              End Class
            </button>

            <!-- Ended State -->
            <span
              v-else
              class="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium text-[11px]"
            >
              Class ended
            </span>
          </template>

          <template v-else>
            <span
              v-if="isClassLive && !isClassEnded"
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-medium text-[11px]"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              Live
            </span>
            <span
              v-else-if="isClassEnded"
              class="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium text-[11px]"
            >
              Class ended
            </span>
          </template>
        </div>
      </div>

      <!-- MAIN BODY: Content Pane + Optional Narrow Mentor Raised Hands Side Panel -->
      <div class="flex-1 min-h-0 w-full flex flex-col md:flex-row overflow-hidden">
        <!-- Student: Class Ended closing page (replaces any active step/MCQ immediately, non-interactive) -->
        <div
          v-if="!isMentor && isClassEnded"
          key="student-class-ended"
          class="student-step-mirror flex-1 min-w-0 min-h-0 w-full p-2 sm:p-3 flex items-center justify-center overflow-hidden relative pointer-events-none select-none"
          inert
        >
          <div class="w-full max-w-md bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm text-center">
            <div class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium text-xs mb-3">
              Class ended
            </div>
            <h2 class="text-xl font-bold text-gray-900 tracking-tight mb-2">
              {{ endedViaReconnect ? 'This class has ended' : 'Thank you for attending the session.' }}
            </h2>
            <p class="text-sm text-gray-500">
              {{ endedViaReconnect
                ? 'This session is no longer accepting participants.'
                : 'The mentor has ended the live class.'
              }}
            </p>
          </div>
        </div>

        <!-- Mentor OR interactive MCQ/result steps for students -->
        <div
          v-else-if="!isStepMirroredForStudent"
          key="live-step-wrapper"
          ref="stepWrapperRef"
          :class="[
            'flex-1 min-w-0 min-h-0 w-full p-2 sm:p-3 flex relative',
            !isMentor
              ? 'flex-col items-center overflow-y-auto'
              : 'items-center justify-center overflow-y-auto md:overflow-hidden'
          ]"
        >
          <component
            :is="currentStepComponent"
            v-bind="stepComponentProps"
            v-on="stepComponentListeners"
          />
        </div>

        <!-- Student view for all non-MCQ Vue steps: live read-only mirror of Mentor screen -->
        <div
          v-else
          key="mirror-step-wrapper"
          ref="mirrorWrapperRef"
          class="student-step-mirror flex-1 min-w-0 min-h-0 w-full p-2 sm:p-3 flex items-center justify-center overflow-y-auto md:overflow-hidden relative pointer-events-none select-none"
          inert
        ></div>

        <!-- Mentor: Collapsible Narrow Side Panel for Raised Hands (FIFO order, never overlaps content) -->
        <aside
          v-if="isMentor && !isClassEnded && isRaisedHandsOpen"
          aria-label="Raised Hands"
          class="w-full md:w-60 shrink-0 border-t md:border-t-0 md:border-l border-gray-100 bg-gray-50/50 flex flex-col max-h-44 md:max-h-none min-h-0"
        >
          <div class="px-3 py-2 border-b border-gray-100 bg-white flex items-center justify-between shrink-0">
            <span class="text-xs font-bold text-gray-800">
              Raised Hands ({{ raisedHands.length }})
            </span>
            <button
              type="button"
              @click="isRaisedHandsOpen = false"
              class="text-[11px] text-gray-500 hover:text-gray-700 font-medium cursor-pointer"
            >
              Hide
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-2 space-y-1.5">
            <p
              v-if="raisedHands.length === 0"
              class="text-[11px] text-gray-400 text-center py-4 px-2"
            >
              No students have their hand raised.
            </p>

            <div
              v-for="(item, idx) in raisedHands"
              :key="item.studentId"
              class="flex items-center justify-between gap-2 bg-white border border-gray-200/80 rounded-lg px-2.5 py-1.5 shadow-2xs"
            >
              <div class="flex items-center gap-1.5 min-w-0">
                <span class="text-[10px] font-semibold text-gray-400 w-3.5 shrink-0">
                  {{ idx + 1 }}.
                </span>
                <span class="text-xs font-medium text-gray-800 truncate">
                  {{ item.studentName }}
                </span>
              </div>
              <button
                type="button"
                @click="lowerStudentHandByMentor(item)"
                class="px-2 py-0.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-[11px] transition cursor-pointer shrink-0 whitespace-nowrap"
              >
                Hand Down
              </button>
            </div>
          </div>
        </aside>
      </div>

      <!-- Thin Bottom Navigation Bar (Mentor only, takes thin compact bar) -->
      <div
        v-if="isMentor && isClassLive && !isClassEnded"
        class="h-10 px-3 sm:px-4 flex items-center justify-between border-t border-gray-100 shrink-0 bg-gray-50/50"
      >
        <button
          type="button"
          @click="handlePrevStep"
          :disabled="currentStepIndex === 0"
          :class="[
            'px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer border',
            currentStepIndex === 0
              ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
              : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 shadow-2xs'
          ]"
        >
          Previous
        </button>

        <!-- Pagination Indicator Dots -->
        <div class="flex items-center gap-1.5">
          <button
            v-for="(step, idx) in totalStepsCount"
            :key="idx"
            type="button"
            @click="jumpToStep(idx)"
            class="transition-all cursor-pointer p-0.5"
            :title="'Step ' + (idx + 1)"
          >
            <span
              v-if="idx !== totalStepsCount - 1"
              :class="[
                'block rounded-full transition-all duration-200',
                idx === currentStepIndex
                  ? 'w-2 h-2 bg-blue-600 scale-125'
                  : 'w-1.5 h-1.5 bg-gray-200 hover:bg-gray-300'
              ]"
            ></span>
            <span
              v-else
              :class="[
                'block transition-all duration-200',
                idx === currentStepIndex
                  ? 'w-2 h-2 bg-emerald-600 rotate-45 scale-125'
                  : 'w-1.5 h-1.5 bg-gray-200 rotate-45 hover:bg-gray-300'
              ]"
            ></span>
          </button>
        </div>

        <button
          type="button"
          @click="handleNextStep"
          :disabled="currentStepIndex >= totalStepsCount - 1"
          :class="[
            'px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer border',
            currentStepIndex >= totalStepsCount - 1
              ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
              : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 shadow-2xs'
          ]"
        >
          Next
        </button>
      </div>

      <!-- Mentor End Class Confirmation Modal -->
      <div
        v-if="isMentor && showEndClassConfirm"
        class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/35 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="end-class-dialog-title"
        @click.self="cancelEndClass"
      >
        <div class="w-full max-w-sm bg-white rounded-2xl border border-gray-200 shadow-lg p-5">
          <h3 id="end-class-dialog-title" class="text-base font-bold text-gray-900 mb-1.5">
            End the class for everyone?
          </h3>
          <p class="text-xs text-gray-600 mb-4 leading-relaxed">
            Every student will immediately see the closing screen and will no longer be able to interact with the session. Final MCQ results will remain available for you to review.
          </p>
          <div class="flex items-center justify-end gap-2">
            <button
              type="button"
              @click="cancelEndClass"
              class="px-3.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              @click="confirmEndClass"
              class="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition cursor-pointer"
            >
              End Class
            </button>
          </div>
        </div>
      </div>

    </div>

    <!-- Student Floating Raise Hand Button (fixed bottom-right, outside view-only & inert wrappers) -->
    <div
      v-if="!isMentor && !isClassEnded"
      class="student-floating-hand fixed z-50 group inline-flex items-center"
    >
      <button
        type="button"
        @click="toggleStudentHand"
        aria-label="Raise hand"
        :aria-pressed="isStudentHandRaised"
        :class="[
          'peer w-14 h-14 rounded-full inline-flex items-center justify-center transition cursor-pointer',
          isStudentHandRaised
            ? 'bg-blue-50 hover:bg-blue-100 border-2 border-blue-600 ring-4 ring-blue-100 shadow-md'
            : 'bg-white hover:bg-gray-50 border border-gray-200 shadow-md'
        ]"
      >
        <img
          :src="handIcon"
          alt=""
          class="w-7 h-7 object-contain pointer-events-none select-none"
        />
      </button>
      <span
        role="tooltip"
        class="pointer-events-none opacity-0 group-hover:opacity-100 peer-focus-visible:opacity-100 transition-opacity absolute right-full top-1/2 -translate-y-1/2 mr-2.5 px-2.5 py-1 rounded-md bg-gray-900 text-white text-[11px] font-medium whitespace-nowrap shadow-sm"
      >
        Raise hand
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, provide, onMounted, onUnmounted } from 'vue'
import { RealtimeService } from '../services/realtime'
import handIcon from '../assets/hand.png'
import {
  captureStepSnapshot,
  applyStepSnapshot,
  showMirrorWaitingPlaceholder
} from '../utils/stepMirror'

// =========================================================================
// 1. ORDERED LIST OF STEPS
// -------------------------------------------------------------------------
// The order of this list is the order in which steps appear on the web.
// To add a new step:
// 1. Create a new Vue component (e.g. MyNewStep.vue)
// 2. Import it and add it to `baseSteps` array below.
// =========================================================================
import StepImage1 from '../steps/StepImage1.vue'
import StepImage2 from '../steps/StepImage2.vue'
import StepImage3 from '../steps/StepImage3.vue'
import Counter from '../steps/Counter.vue'

const baseSteps = [
  StepImage1,
  StepImage2,
  StepImage3,
  Counter
]

// =========================================================================
// 2. MCQ QUESTION POOL (Sample of 6 questions)
// -------------------------------------------------------------------------
// 3 questions are randomly selected once per room and shared with everyone.
// =========================================================================
import Question1, { questionData as qData1 } from '../steps/questions/Question1.vue'
import Question2, { questionData as qData2 } from '../steps/questions/Question2.vue'
import Question3, { questionData as qData3 } from '../steps/questions/Question3.vue'
import Question4, { questionData as qData4 } from '../steps/questions/Question4.vue'
import Question5, { questionData as qData5 } from '../steps/questions/Question5.vue'
import Question6, { questionData as qData6 } from '../steps/questions/Question6.vue'

import MCQMentorSummary from './MCQMentorSummary.vue'
import MCQStudentScore from './MCQStudentScore.vue'

const questionPool = [
  { component: Question1, data: qData1 },
  { component: Question2, data: qData2 },
  { component: Question3, data: qData3 },
  { component: Question4, data: qData4 },
  { component: Question5, data: qData5 },
  { component: Question6, data: qData6 }
]

// =========================================================================
// PROPS & EMITS
// =========================================================================
const props = defineProps({
  isMentor: {
    type: Boolean,
    default: false
  },
  studentName: {
    type: String,
    default: ''
  },
  studentId: {
    type: String,
    default: ''
  },
  roomCode: {
    type: String,
    required: true
  },
  initialRoomState: {
    type: Object,
    default: null
  }
})

defineEmits(['leave'])

// =========================================================================
// REACTIVE ROOM STATE
// =========================================================================
const currentStepIndex = ref(0)
const isClassLive = ref(false)
const isClassEnded = ref(false)
const showEndClassConfirm = ref(false)
const endedViaReconnect = ref(false)
const revealedQuestions = ref({})
const studentAnswers = ref({})
const allResponses = ref({})
const activeStudents = ref([])
const raisedHands = ref([])
const isRaisedHandsOpen = ref(false)
const ackSeqByStudent = ref({})
const isStudentHandRaised = ref(false)
const questionAlerts = ref({})
const dismissedAlertIds = ref({})
const alertCooldownUntilByQuestion = ref({})
const cooldownNow = ref(Date.now())

const stepWrapperRef = ref(null)
const mirrorWrapperRef = ref(null)
const mirroredSnapshotsByStep = ref({})

const storageKey = `presenter_room_state_${props.roomCode}`
const mentorInstanceId = `m_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`
const lastAcceptedMirrorByStep = new Map()

function resolveEffectiveStudentId() {
  if (props.isMentor) return ''
  if (props.studentId) return props.studentId
  try {
    const raw = sessionStorage.getItem('presenter_tab_session_v1')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed?.studentId) return parsed.studentId
    }
  } catch (_) {}
  return `st_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`
}
const effectiveStudentId = resolveEffectiveStudentId()
const handStorageKey = `presenter_hand_${props.roomCode}_${effectiveStudentId}`

// =========================================================================
// DETERMINISTIC QUESTION SELECTION PER ROOM
// =========================================================================
function getDeterministicQuestionIndices(code, poolSize, count = 3) {
  let seed = 0
  const cleanCode = String(code).trim()
  for (let i = 0; i < cleanCode.length; i++) {
    seed = (seed * 31 + cleanCode.charCodeAt(i)) >>> 0
  }

  const indices = Array.from({ length: poolSize }, (_, i) => i)
  for (let i = indices.length - 1; i > 0; i--) {
    seed = (seed * 9301 + 49297) % 233280
    const rnd = seed / 233280
    const j = Math.floor(rnd * (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }

  return indices.slice(0, count)
}

const selectedQuestionIndices = ref(
  getDeterministicQuestionIndices(props.roomCode, questionPool.length, 3)
)

const selectedQuestions = computed(() => {
  return selectedQuestionIndices.value.map(idx => questionPool[idx] || questionPool[0])
})

const selectedQuestionsData = computed(() => {
  return selectedQuestions.value.map(q => q.data)
})

// =========================================================================
// DYNAMIC STEPS LIST
// =========================================================================
const allRoomSteps = computed(() => {
  const steps = [...baseSteps]
  selectedQuestions.value.forEach(q => {
    steps.push(q.component)
  })
  const summaryComponent = props.isMentor ? MCQMentorSummary : MCQStudentScore
  steps.push(summaryComponent)
  return steps
})

const totalStepsCount = computed(() => allRoomSteps.value.length)

const currentStepComponent = computed(() => {
  return allRoomSteps.value[currentStepIndex.value] || allRoomSteps.value[0]
})

const baseStepsCount = computed(() => baseSteps.length)
const isBaseStep = computed(() => {
  return currentStepIndex.value < baseStepsCount.value
})

const isMcqStep = computed(() => {
  const idx = currentStepIndex.value
  return idx >= baseStepsCount.value && idx < baseStepsCount.value + selectedQuestions.value.length
})

const isStepMirroredForStudent = computed(() => {
  return !props.isMentor && isBaseStep.value
})

const currentQuestionNumber = computed(() => {
  if (!isMcqStep.value) return 1
  return (currentStepIndex.value - baseStepsCount.value) + 1
})

const currentQuestionData = computed(() => {
  if (!isMcqStep.value) return null
  const qIdx = currentStepIndex.value - baseStepsCount.value
  return selectedQuestions.value[qIdx]?.data || null
})

const isCurrentQuestionRevealed = computed(() => {
  if (!currentQuestionData.value) return false
  return Boolean(revealedQuestions.value[currentQuestionData.value.id])
})

// Pass only declared props to arbitrary base step components so standalone Vue
// files do not receive unexpected fallthrough attributes on their root node.
const stepComponentProps = computed(() => {
  if (!isBaseStep.value) {
    return {
      isMentor: props.isMentor,
      isClassLive: isClassLive.value,
      isClassEnded: isClassEnded.value,
      studentName: props.studentName,
      roomCode: props.roomCode,
      questionNumber: currentQuestionNumber.value,
      totalQuestions: selectedQuestions.value.length,
      studentAnswers: studentAnswers.value,
      allResponses: allResponses.value,
      activeStudents: activeStudents.value,
      isRevealed: isCurrentQuestionRevealed.value,
      questions: selectedQuestionsData.value
    }
  }

  const declared = currentStepComponent.value?.props
  if (!declared) return {}
  const keys = Array.isArray(declared) ? declared : Object.keys(declared)
  const available = {
    isMentor: props.isMentor,
    isClassLive: isClassLive.value,
    isClassEnded: isClassEnded.value,
    roomCode: props.roomCode
  }
  const matched = {}
  for (const key of keys) {
    if (key in available) matched[key] = available[key]
  }
  return matched
})

const stepComponentListeners = computed(() => {
  if (!isBaseStep.value) {
    return {
      'submit-answer': handleStudentAnswer,
      'reveal-answer': handleRevealAnswer,
      'next-question': handleNextStep,
      'end-class': requestEndClass
    }
  }
  return {}
})

const currentStepSubtitle = computed(() => {
  if (!isClassLive.value && !isClassEnded.value) {
    return 'Start when ready'
  }
  if (isClassEnded.value) {
    return 'Session complete'
  }

  const idx = currentStepIndex.value
  if (idx === 0) return 'Introduction'
  if (idx === 1) return 'Key Concepts'
  if (idx === 2) return 'Practical Application'
  if (idx < baseStepsCount.value) return 'Interactive Demo'
  if (isMcqStep.value) return 'Knowledge Check'
  return 'MCQ Results'
})

// =========================================================================
// MENTOR-TO-STUDENT LIVE SCREEN MIRRORING ENGINE
// =========================================================================
let realtime = null
let mirrorSeq = 0
let lastCapturedSignature = ''
let mirrorObserver = null
let observedWrapperEl = null
let mirrorFlushTimer = null
let lastMirrorPublishAt = 0
let unsubscribeRealtimeReady = null
let retrySyncTimer = null
let alertCooldownTimer = null
let alertSeq = 0
let lastPresenceReannounceAt = 0
let wasConnectionInterrupted = false
let localHandActionSeq = 0
let localHandTarget = false
let hasPendingHandAction = false
let lastKnownMentorAckSeq = 0
let didSendDisconnectSignal = false
const pendingDisconnectTimers = new Map()

const ALERT_COOLDOWN_MS = 5000
const MIRROR_EVENTS = ['input', 'change', 'click', 'pointerup', 'keyup', 'scroll']

function isFromMentor(payload) {
  return Boolean(payload && payload.senderRole === 'mentor')
}

function getMirrorThrottleMs() {
  return realtime && realtime.hasPusherConfigured() ? 85 : 30
}

function readStoredHandState() {
  if (props.isMentor) return null
  try {
    const raw = sessionStorage.getItem(handStorageKey)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed.raised === 'boolean') {
      return {
        raised: parsed.raised,
        actionSeq: Number(parsed.actionSeq || 0)
      }
    }
  } catch (_) {}
  return null
}

function writeStoredHandState(raised, actionSeq) {
  if (props.isMentor) return
  try {
    sessionStorage.setItem(
      handStorageKey,
      JSON.stringify({ raised: Boolean(raised), actionSeq: Number(actionSeq || 0) })
    )
  } catch (_) {}
}

function clearStoredHandState() {
  if (props.isMentor) return
  try {
    sessionStorage.removeItem(handStorageKey)
  } catch (_) {}
}

function buildRoomStatePayload() {
  const stepMirror = isBaseStep.value
    ? mirroredSnapshotsByStep.value[currentStepIndex.value] || null
    : null

  return {
    senderRole: 'mentor',
    mentorId: mentorInstanceId,
    currentStepIndex: currentStepIndex.value,
    isClassLive: isClassLive.value,
    isClassEnded: isClassEnded.value,
    revealedQuestions: revealedQuestions.value,
    selectedQuestionIndices: selectedQuestionIndices.value,
    allResponses: allResponses.value,
    activeStudents: activeStudents.value,
    raisedHands: raisedHands.value,
    ackSeqByStudent: ackSeqByStudent.value,
    stepMirror
  }
}

function saveRoomStateCache() {
  if (!props.isMentor) return
  try {
    localStorage.setItem(storageKey, JSON.stringify(buildRoomStatePayload()))
  } catch (_) {}
}

function broadcastRoomState() {
  if (!props.isMentor) return
  const payload = buildRoomStatePayload()
  try {
    localStorage.setItem(storageKey, JSON.stringify(payload))
  } catch (_) {}

  if (realtime) {
    realtime.publish('state-sync', payload)
  }
}

function captureMentorStepSnapshot({ broadcastMirrorEvent = true, forceNewSnapshot = false } = {}) {
  if (!props.isMentor || !isBaseStep.value || isClassEnded.value) return false
  const el = stepWrapperRef.value
  if (!el) return false

  const captured = captureStepSnapshot(el, currentStepIndex.value)
  if (!captured) return false

  const { snapshot, signature } = captured
  if (!forceNewSnapshot && signature === lastCapturedSignature) {
    return false
  }

  lastCapturedSignature = signature
  mirrorSeq += 1
  const enrichedSnapshot = {
    ...snapshot,
    senderRole: 'mentor',
    mentorId: mentorInstanceId,
    seq: mirrorSeq
  }

  mirroredSnapshotsByStep.value = {
    ...mirroredSnapshotsByStep.value,
    [currentStepIndex.value]: enrichedSnapshot
  }
  saveRoomStateCache()
  lastMirrorPublishAt = Date.now()

  if (broadcastMirrorEvent && isClassLive.value && realtime) {
    realtime.publish('step-mirror', enrichedSnapshot)
  }

  return true
}

function scheduleMentorSnapshot(preferImmediate = false) {
  if (!props.isMentor || !isClassLive.value || isClassEnded.value || !isBaseStep.value) return
  if (mirrorFlushTimer) return

  const throttleMs = getMirrorThrottleMs()
  const elapsed = Date.now() - lastMirrorPublishAt
  const delay = preferImmediate || elapsed >= throttleMs ? 0 : throttleMs - elapsed

  mirrorFlushTimer = setTimeout(() => {
    mirrorFlushTimer = null
    captureMentorStepSnapshot({ broadcastMirrorEvent: true })
  }, delay)
}

function handleMentorMirrorInteraction(event) {
  const preferImmediate = event.type === 'input' || event.type === 'change'
  scheduleMentorSnapshot(preferImmediate)
}

function teardownMentorMirrorObserver() {
  if (mirrorFlushTimer) {
    clearTimeout(mirrorFlushTimer)
    mirrorFlushTimer = null
  }
  if (mirrorObserver) {
    mirrorObserver.disconnect()
    mirrorObserver = null
  }
  if (observedWrapperEl) {
    for (const evt of MIRROR_EVENTS) {
      observedWrapperEl.removeEventListener(evt, handleMentorMirrorInteraction, true)
    }
    observedWrapperEl = null
  }
}

async function setupMentorMirrorObserver() {
  teardownMentorMirrorObserver()

  if (!props.isMentor || isClassEnded.value || !isBaseStep.value) return
  await nextTick()

  const el = stepWrapperRef.value
  if (!el || !props.isMentor || isClassEnded.value || !isBaseStep.value) return

  lastCapturedSignature = ''

  if (isClassLive.value) {
    captureMentorStepSnapshot({ broadcastMirrorEvent: true, forceNewSnapshot: true })
    broadcastRoomState()
  }

  observedWrapperEl = el
  mirrorObserver = new MutationObserver(() => {
    scheduleMentorSnapshot(false)
  })
  mirrorObserver.observe(el, {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true
  })

  for (const evt of MIRROR_EVENTS) {
    el.addEventListener(evt, handleMentorMirrorInteraction, { capture: true, passive: true })
  }
}

function markStudentClassEnded(viaReconnect = false) {
  if (props.isMentor) return
  if (!isClassEnded.value) {
    const offlineNow = typeof navigator !== 'undefined' && navigator.onLine === false
    endedViaReconnect.value = Boolean(viaReconnect || wasConnectionInterrupted || offlineNow)
  }
  isClassLive.value = false
  isClassEnded.value = true
  questionAlerts.value = {}
  raisedHands.value = []
  isStudentHandRaised.value = false
  hasPendingHandAction = false
  localHandTarget = false
  clearStoredHandState()
  if (retrySyncTimer) {
    clearTimeout(retrySyncTimer)
    retrySyncTimer = null
  }
}

function acceptMentorMirrorSnapshot(data) {
  if (props.isMentor || isClassEnded.value) return
  if (!isFromMentor(data)) {
    console.warn('[Security] Ignored step mirror update: Only the Mentor can control step state.')
    return
  }
  if (typeof data.stepIndex !== 'number' || typeof data.html !== 'string') return

  const prev = lastAcceptedMirrorByStep.get(data.stepIndex)
  if (prev && data.mentorId && prev.mentorId === data.mentorId && typeof data.seq === 'number') {
    if (data.seq <= prev.seq) return
  }

  if (data.mentorId && typeof data.seq === 'number') {
    lastAcceptedMirrorByStep.set(data.stepIndex, {
      mentorId: data.mentorId,
      seq: data.seq
    })
  }

  mirroredSnapshotsByStep.value = {
    ...mirroredSnapshotsByStep.value,
    [data.stepIndex]: data
  }
}

function applySyncedRoomState(state, { fromInitialLoad = false } = {}) {
  if (props.isMentor || !state || !isFromMentor(state)) return
  if (isClassEnded.value) return

  if (state.isClassEnded === true) {
    markStudentClassEnded(fromInitialLoad || wasConnectionInterrupted)
    return
  }

  wasConnectionInterrupted = false

  if (typeof state.currentStepIndex === 'number') {
    currentStepIndex.value = state.currentStepIndex
  }
  if (typeof state.isClassLive === 'boolean') {
    isClassLive.value = state.isClassLive
  }
  if (typeof state.isClassEnded === 'boolean') {
    isClassEnded.value = state.isClassEnded
  }
  if (state.revealedQuestions) {
    revealedQuestions.value = { ...revealedQuestions.value, ...state.revealedQuestions }
  }
  if (Array.isArray(state.selectedQuestionIndices) && state.selectedQuestionIndices.length === 3) {
    selectedQuestionIndices.value = state.selectedQuestionIndices
  }
  if (state.allResponses) {
    allResponses.value = { ...allResponses.value, ...state.allResponses }
  }
  syncRaisedHandsFromMentor(state, { fromInitialLoad })

  if (Array.isArray(state.activeStudents) && props.studentName && !state.activeStudents.includes(props.studentName)) {
    const now = Date.now()
    if (realtime && now - lastPresenceReannounceAt > 3000) {
      lastPresenceReannounceAt = now
      realtime.publish('student-join', { name: props.studentName, studentId: effectiveStudentId })
    }
  }
  if (state.stepMirror && typeof state.stepMirror.stepIndex === 'number') {
    acceptMentorMirrorSnapshot(state.stepMirror)
  }
}

function syncRaisedHandsFromMentor(state, { fromInitialLoad = false } = {}) {
  if (props.isMentor || !state || !isFromMentor(state) || isClassEnded.value) return

  if (Array.isArray(state.raisedHands)) {
    raisedHands.value = state.raisedHands
  }

  const serverHands = raisedHands.value
  const ackMap = state.ackSeqByStudent && typeof state.ackSeqByStudent === 'object' ? state.ackSeqByStudent : {}
  const ackSeq = Number(ackMap[effectiveStudentId] || 0)
  lastKnownMentorAckSeq = Math.max(lastKnownMentorAckSeq, ackSeq)
  const inServerList = serverHands.some(
    (entry) =>
      entry &&
      (entry.studentId === effectiveStudentId ||
        (!entry.studentId && props.studentName && entry.studentName === props.studentName))
  )

  if (ackSeq >= localHandActionSeq) {
    localHandActionSeq = Math.max(localHandActionSeq, ackSeq)
    hasPendingHandAction = false
    localHandTarget = inServerList
    isStudentHandRaised.value = inServerList
    writeStoredHandState(inServerList, localHandActionSeq)
  } else if (hasPendingHandAction) {
    isStudentHandRaised.value = localHandTarget
    if (!fromInitialLoad && realtime && localHandTarget !== inServerList) {
      realtime.publish(localHandTarget ? 'raise-hand' : 'lower-hand', {
        senderRole: 'student',
        studentId: effectiveStudentId,
        actorStudentId: effectiveStudentId,
        studentName: props.studentName || 'Student',
        actionSeq: localHandActionSeq,
        raisedAt: Date.now()
      })
    }
  }
}

function requestLatestStateFromMentor() {
  if (props.isMentor || !realtime || isClassEnded.value) return
  if (props.studentName) {
    realtime.publish('student-join', { name: props.studentName, studentId: effectiveStudentId })
  } else {
    realtime.publish('request-state', {
      name: 'Student',
      studentId: effectiveStudentId
    })
  }
}

function scheduleStudentSyncRetryIfNeeded() {
  if (props.isMentor) return
  if (retrySyncTimer) {
    clearTimeout(retrySyncTimer)
    retrySyncTimer = null
  }
  if (!isClassLive.value || isClassEnded.value || !isBaseStep.value) return
  if (mirroredSnapshotsByStep.value[currentStepIndex.value]) return

  retrySyncTimer = setTimeout(() => {
    retrySyncTimer = null
    if (!props.isMentor && isClassLive.value && !isClassEnded.value && isBaseStep.value && !mirroredSnapshotsByStep.value[currentStepIndex.value]) {
      requestLatestStateFromMentor()
    }
  }, 1200)
}

function handleStudentOffline() {
  if (props.isMentor) return
  wasConnectionInterrupted = true
}

function handleStudentWakeOrOnline() {
  if (props.isMentor || isClassEnded.value) return
  if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return
  requestLatestStateFromMentor()
}

function handleWindowKeydown(event) {
  if (props.isMentor && showEndClassConfirm.value && event.key === 'Escape') {
    cancelEndClass()
  }
}

// =========================================================================
// RAISE HAND FEATURE
// =========================================================================
function getHandKey(studentId, studentName) {
  const sid = typeof studentId === 'string' ? studentId.trim() : ''
  if (sid) return sid
  const sname = typeof studentName === 'string' ? studentName.trim() : ''
  return sname ? `name:${sname}` : ''
}

function cancelDisconnectTimer(studentId, studentName) {
  const cleanName = typeof studentName === 'string' ? studentName.trim() : ''
  const keys = [
    typeof studentId === 'string' ? studentId.trim() : '',
    cleanName ? `name:${cleanName}` : ''
  ].filter(Boolean)

  for (const key of keys) {
    const timer = pendingDisconnectTimers.get(key)
    if (timer) {
      clearTimeout(timer)
      pendingDisconnectTimers.delete(key)
    }
  }
}

function broadcastRaisedHandsState() {
  if (!props.isMentor) return
  saveRoomStateCache()
  if (realtime) {
    realtime.publish('raised-hands-sync', {
      senderRole: 'mentor',
      mentorId: mentorInstanceId,
      raisedHands: raisedHands.value,
      ackSeqByStudent: ackSeqByStudent.value
    })
  }
}

function addRaisedHandByStudent({ studentId, studentName, raisedAt, actionSeq }) {
  if (!props.isMentor || isClassEnded.value) return
  const cleanName = typeof studentName === 'string' ? studentName.trim() : ''
  if (!cleanName) return
  const key = getHandKey(studentId, cleanName)
  if (!key) return

  cancelDisconnectTimer(key, cleanName)

  if (!activeStudents.value.includes(cleanName)) {
    activeStudents.value.push(cleanName)
  }

  if (typeof actionSeq === 'number' && actionSeq > 0) {
    ackSeqByStudent.value = {
      ...ackSeqByStudent.value,
      [key]: Math.max(Number(ackSeqByStudent.value[key] || 0), actionSeq)
    }
  }

  const alreadyRaised = raisedHands.value.some((entry) => entry.studentId === key)
  if (!alreadyRaised) {
    raisedHands.value = [
      ...raisedHands.value,
      {
        studentId: key,
        studentName: cleanName,
        raisedAt: typeof raisedAt === 'number' ? raisedAt : Date.now()
      }
    ]
  }
  broadcastRaisedHandsState()
}

function removeRaisedHand({
  studentId,
  studentName,
  actionSeq,
  removeFromActive = false,
  resetAckOnDisconnect = false
}) {
  if (!props.isMentor) return
  const cleanName = typeof studentName === 'string' ? studentName.trim() : ''
  const key = getHandKey(studentId, cleanName)
  if (!key && !cleanName) return

  if (resetAckOnDisconnect && key) {
    const nextAck = { ...ackSeqByStudent.value }
    delete nextAck[key]
    ackSeqByStudent.value = nextAck
  } else if (typeof actionSeq === 'number' && actionSeq > 0 && key) {
    ackSeqByStudent.value = {
      ...ackSeqByStudent.value,
      [key]: Math.max(Number(ackSeqByStudent.value[key] || 0), actionSeq)
    }
  }

  raisedHands.value = raisedHands.value.filter((entry) => {
    if (key && entry.studentId === key) return false
    if (!key && cleanName && entry.studentName === cleanName) return false
    return true
  })

  if (removeFromActive && cleanName) {
    activeStudents.value = activeStudents.value.filter((name) => name !== cleanName)
  }

  broadcastRaisedHandsState()
}

function lowerStudentHandByMentor(entry) {
  if (!props.isMentor || isClassEnded.value || !entry) return
  const key = entry.studentId
  const cleanName = entry.studentName

  raisedHands.value = raisedHands.value.filter((item) => item.studentId !== key)

  const nextAck = Number(ackSeqByStudent.value[key] || 0) + 1
  ackSeqByStudent.value = {
    ...ackSeqByStudent.value,
    [key]: nextAck
  }

  if (realtime) {
    realtime.publish('mentor-lower-hand', {
      senderRole: 'mentor',
      mentorId: mentorInstanceId,
      studentId: key,
      studentName: cleanName,
      ackSeq: nextAck
    })
  }
  broadcastRaisedHandsState()
}

function toggleStudentHand() {
  if (props.isMentor || isClassEnded.value) return
  const nextRaised = !isStudentHandRaised.value
  localHandActionSeq = Math.max(localHandActionSeq, lastKnownMentorAckSeq) + 1
  localHandTarget = nextRaised
  hasPendingHandAction = true
  isStudentHandRaised.value = nextRaised
  writeStoredHandState(nextRaised, localHandActionSeq)

  if (realtime) {
    realtime.publish(nextRaised ? 'raise-hand' : 'lower-hand', {
      senderRole: 'student',
      studentId: effectiveStudentId,
      actorStudentId: effectiveStudentId,
      studentName: props.studentName || 'Student',
      actionSeq: localHandActionSeq,
      raisedAt: Date.now()
    })
  }
}

function handleStudentPageHide() {
  if (props.isMentor || didSendDisconnectSignal) return
  didSendDisconnectSignal = true
  if (realtime) {
    realtime.publishUnload('student-disconnecting', {
      senderRole: 'student',
      studentId: effectiveStudentId,
      studentName: props.studentName || 'Student'
    })
  }
}

// =========================================================================
// REAL-TIME SYNCHRONIZATION VIA PUSHER
// =========================================================================
function initRealtime() {
  realtime = new RealtimeService(props.roomCode)

  realtime.on('state-sync', (state) => {
    if (props.isMentor) return
    if (!isFromMentor(state)) {
      console.warn('[Security] Ignored state-sync: Only the Mentor can sync room state.')
      return
    }
    applySyncedRoomState(state)
  })

  realtime.on('step-change', (data) => {
    if (props.isMentor || isClassEnded.value) return
    if (!isFromMentor(data)) {
      console.warn('[Security] Ignored step-change: Only the Mentor can change steps.')
      return
    }
    if (typeof data.stepIndex === 'number') {
      const targetIdx = data.stepIndex
      const existingSnapshot = mirroredSnapshotsByStep.value[targetIdx]
      if (
        existingSnapshot &&
        typeof data.minMirrorSeq === 'number' &&
        existingSnapshot.mentorId === data.mentorId &&
        typeof existingSnapshot.seq === 'number' &&
        existingSnapshot.seq <= data.minMirrorSeq
      ) {
        const copy = { ...mirroredSnapshotsByStep.value }
        delete copy[targetIdx]
        mirroredSnapshotsByStep.value = copy
      }
      currentStepIndex.value = targetIdx
    }
  })

  realtime.on('step-mirror', (data) => {
    acceptMentorMirrorSnapshot(data)
  })

  realtime.on('reveal-answer', (data) => {
    if (props.isMentor || isClassEnded.value) return
    if (!isFromMentor(data)) {
      console.warn('[Security] Ignored reveal-answer: Only the Mentor can reveal answers.')
      return
    }
    if (data && data.questionId) {
      revealedQuestions.value = {
        ...revealedQuestions.value,
        [data.questionId]: true
      }
    }
  })

  realtime.on('student-answer', (data) => {
    if (isClassEnded.value) return
    if (data && data.questionId && data.studentName) {
      const qId = data.questionId
      const stName = data.studentName

      if (!activeStudents.value.includes(stName)) {
        activeStudents.value.push(stName)
      }

      if (!allResponses.value[qId]) {
        allResponses.value[qId] = {}
      }
      allResponses.value[qId][stName] = {
        selectedOption: data.selectedOption,
        isCorrect: data.isCorrect
      }

      if (props.isMentor) {
        broadcastRoomState()
      }
    }
  })

  realtime.on('question-alert', (data) => {
    if (props.isMentor || isClassEnded.value) return
    if (!isFromMentor(data)) {
      console.warn('[Security] Ignored question-alert: Only the Mentor can send alerts.')
      return
    }
    if (!data || !data.questionId || !data.alertId || typeof data.message !== 'string') return
    if (!Array.isArray(data.targetStudents)) return

    const stName = props.studentName
    if (!stName || !data.targetStudents.includes(stName)) return
    if (studentAnswers.value[data.questionId]?.selectedOption) return
    if (revealedQuestions.value[data.questionId]) return

    questionAlerts.value = {
      ...questionAlerts.value,
      [data.questionId]: {
        alertId: data.alertId,
        questionId: data.questionId,
        message: data.message,
        sentAt: data.sentAt || Date.now()
      }
    }
  })

  realtime.on('raised-hands-sync', (data) => {
    if (props.isMentor || isClassEnded.value) return
    if (!isFromMentor(data)) {
      console.warn('[Security] Ignored raised-hands-sync: Only the Mentor can sync raised hands.')
      return
    }
    syncRaisedHandsFromMentor(data)
  })

  realtime.on('raise-hand', (data) => {
    if (!props.isMentor || isClassEnded.value) return
    if (!data || data.senderRole !== 'student') {
      console.warn('[Security] Ignored raise-hand: Only students can raise their own hand.')
      return
    }
    if (data.actorStudentId && data.studentId && data.actorStudentId !== data.studentId) {
      console.warn('[Security] Ignored raise-hand: Actor mismatch.')
      return
    }
    if (data.targetStudentId && data.studentId && data.targetStudentId !== data.studentId) {
      console.warn('[Security] Ignored raise-hand: Students cannot raise another student hand.')
      return
    }
    addRaisedHandByStudent(data)
  })

  realtime.on('lower-hand', (data) => {
    if (!props.isMentor || isClassEnded.value) return
    if (!data || data.senderRole !== 'student') {
      console.warn('[Security] Ignored lower-hand: Invalid sender role.')
      return
    }
    if (data.actorStudentId && data.studentId && data.actorStudentId !== data.studentId) {
      console.warn('[Security] Ignored lower-hand: Only the Mentor can lower another student hand.')
      return
    }
    if (data.targetStudentId && data.studentId && data.targetStudentId !== data.studentId) {
      console.warn('[Security] Ignored lower-hand: Students cannot lower another student hand.')
      return
    }
    if (data.targetStudentName && data.studentName && data.targetStudentName !== data.studentName) {
      console.warn('[Security] Ignored lower-hand: Target name mismatch.')
      return
    }
    removeRaisedHand({
      studentId: data.studentId,
      studentName: data.studentName,
      actionSeq: data.actionSeq,
      removeFromActive: false
    })
  })

  realtime.on('mentor-lower-hand', (data) => {
    if (props.isMentor || isClassEnded.value) return
    if (!isFromMentor(data)) {
      console.warn('[Security] Ignored mentor-lower-hand: Only the Mentor can lower another student hand.')
      return
    }
    const matchesSelf =
      (data.studentId && data.studentId === effectiveStudentId) ||
      (!data.studentId && data.studentName && data.studentName === props.studentName) ||
      (data.studentId === `name:${props.studentName}`)
    if (!matchesSelf) return

    if (typeof data.ackSeq === 'number' && data.ackSeq > 0) {
      localHandActionSeq = Math.max(localHandActionSeq, data.ackSeq)
      lastKnownMentorAckSeq = Math.max(lastKnownMentorAckSeq, data.ackSeq)
    }
    hasPendingHandAction = false
    localHandTarget = false
    isStudentHandRaised.value = false
    writeStoredHandState(false, localHandActionSeq)
  })

  realtime.on('student-leave', (data) => {
    if (!props.isMentor) return
    if (!data || data.senderRole !== 'student') return
    const cleanName = typeof data.studentName === 'string' ? data.studentName.trim() : ''
    const key = getHandKey(data.studentId, cleanName)
    if (!key && !cleanName) return
    cancelDisconnectTimer(key, cleanName)
    removeRaisedHand({
      studentId: data.studentId,
      studentName: cleanName,
      removeFromActive: true
    })
  })

  realtime.on('student-disconnecting', (data) => {
    if (!props.isMentor) return
    if (!data || data.senderRole !== 'student') return
    const cleanName = typeof data.studentName === 'string' ? data.studentName.trim() : ''
    const key = getHandKey(data.studentId, cleanName)
    if (!key) return

    cancelDisconnectTimer(key, cleanName)
    const timer = setTimeout(() => {
      pendingDisconnectTimers.delete(key)
      removeRaisedHand({
        studentId: key,
        studentName: cleanName,
        removeFromActive: true,
        resetAckOnDisconnect: true
      })
    }, 3500)
    pendingDisconnectTimers.set(key, timer)
  })

  realtime.on('student-join', (data) => {
    if (data && data.name) {
      if (props.isMentor) {
        cancelDisconnectTimer(data.studentId, data.name)
      }
      if (isClassEnded.value) {
        if (props.isMentor) broadcastRoomState()
        return
      }
      if (!activeStudents.value.includes(data.name)) {
        activeStudents.value.push(data.name)
      }
      if (props.isMentor) {
        captureMentorStepSnapshot({ broadcastMirrorEvent: false })
        broadcastRoomState()
      }
    }
  })

  realtime.on('request-state', () => {
    if (props.isMentor) {
      if (!isClassEnded.value) {
        captureMentorStepSnapshot({ broadcastMirrorEvent: false })
      }
      broadcastRoomState()
    }
  })

  realtime.on('class-start', (data) => {
    if (props.isMentor || isClassEnded.value) return
    if (!isFromMentor(data)) {
      console.warn('[Security] Ignored class-start: Only the Mentor can start the class.')
      return
    }
    isClassLive.value = true
    isClassEnded.value = false
  })

  realtime.on('class-end', (data) => {
    if (props.isMentor) return
    if (!isFromMentor(data)) {
      console.warn('[Security] Ignored class-end: Only the Mentor can end the class.')
      return
    }
    markStudentClassEnded(wasConnectionInterrupted)
  })

  if (!props.isMentor) {
    // Announce presence right away over BroadcastChannel/localStorage & REST trigger
    // so page reloads cancel Mentor's disconnect timer before Pusher finishes connecting.
    requestLatestStateFromMentor()
    scheduleStudentSyncRetryIfNeeded()

    unsubscribeRealtimeReady = realtime.onSubscribed((info) => {
      if (info && info.isReconnect) {
        wasConnectionInterrupted = true
      }
      if (info?.isReconnect || realtime.hasPusherConfigured()) {
        requestLatestStateFromMentor()
        scheduleStudentSyncRetryIfNeeded()
      }
    })
  } else {
    broadcastRoomState()
  }
}

function loadInitialOrCachedState() {
  if (!props.isMentor) {
    const storedHand = readStoredHandState()
    if (storedHand) {
      isStudentHandRaised.value = storedHand.raised
      localHandTarget = storedHand.raised
      localHandActionSeq = storedHand.actionSeq
      hasPendingHandAction = storedHand.actionSeq > 0
    }
  }

  if (!props.isMentor && props.initialRoomState && isFromMentor(props.initialRoomState)) {
    applySyncedRoomState(props.initialRoomState, { fromInitialLoad: true })
    return
  }

  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return
    const cached = JSON.parse(raw)
    if (!isFromMentor(cached)) return

    if (props.isMentor) {
      if (typeof cached.currentStepIndex === 'number') currentStepIndex.value = cached.currentStepIndex
      if (typeof cached.isClassLive === 'boolean') isClassLive.value = cached.isClassLive
      if (typeof cached.isClassEnded === 'boolean') isClassEnded.value = cached.isClassEnded
      if (cached.revealedQuestions) revealedQuestions.value = cached.revealedQuestions
      if (cached.allResponses) allResponses.value = cached.allResponses
      if (Array.isArray(cached.activeStudents)) activeStudents.value = cached.activeStudents
      if (Array.isArray(cached.raisedHands)) {
        raisedHands.value = cached.isClassEnded ? [] : cached.raisedHands
      }
      if (cached.ackSeqByStudent && typeof cached.ackSeqByStudent === 'object') {
        ackSeqByStudent.value = cached.ackSeqByStudent
      }
      if (Array.isArray(cached.selectedQuestionIndices) && cached.selectedQuestionIndices.length === 3) {
        selectedQuestionIndices.value = cached.selectedQuestionIndices
      }
      return
    }

    applySyncedRoomState(cached, { fromInitialLoad: true })
  } catch (_) {}
}

// Watchers for Mentor observation and Student DOM mirroring
watch(
  [() => props.isMentor, currentStepIndex, isClassLive, isClassEnded, isBaseStep, stepWrapperRef],
  () => {
    if (props.isMentor) {
      setupMentorMirrorObserver()
    }
  },
  { immediate: true }
)

watch(
  [
    mirrorWrapperRef,
    currentStepIndex,
    isStepMirroredForStudent,
    () => mirroredSnapshotsByStep.value[currentStepIndex.value]
  ],
  ([el, idx, mirrored, snapshot]) => {
    if (!el || !mirrored) return
    if (snapshot && snapshot.stepIndex === idx) {
      if (retrySyncTimer) {
        clearTimeout(retrySyncTimer)
        retrySyncTimer = null
      }
      applyStepSnapshot(el, snapshot)
    } else {
      showMirrorWaitingPlaceholder(
        el,
        isClassLive.value ? 'Syncing live view...' : 'Waiting for class to start...'
      )
      scheduleStudentSyncRetryIfNeeded()
    }
  },
  { immediate: true, flush: 'post' }
)

// Ensure async step components load their scoped styles cleanly even when mirrored
watch(
  currentStepComponent,
  (comp) => {
    if (!props.isMentor && comp && typeof comp.__asyncLoader === 'function') {
      comp.__asyncLoader().catch(() => {})
    }
  },
  { immediate: true }
)

// =========================================================================
// MENTOR CLASS NAVIGATION & ACTIONS
// =========================================================================
function clearStaleStepMirrorIfBase(idx) {
  if (idx < baseStepsCount.value && idx in mirroredSnapshotsByStep.value) {
    const copy = { ...mirroredSnapshotsByStep.value }
    delete copy[idx]
    mirroredSnapshotsByStep.value = copy
  }
}

function startClass() {
  if (!props.isMentor || isClassEnded.value) return
  const wasLive = isClassLive.value
  isClassLive.value = true
  isClassEnded.value = false
  currentStepIndex.value = 0
  mirroredSnapshotsByStep.value = {}
  lastCapturedSignature = ''

  nextTick(() => {
    if (realtime) {
      realtime.publish('class-start', {
        senderRole: 'mentor',
        mentorId: mentorInstanceId
      })
    }
    if (wasLive) {
      captureMentorStepSnapshot({ broadcastMirrorEvent: true, forceNewSnapshot: true })
      broadcastRoomState()
    }
  })
}

function requestEndClass() {
  if (!props.isMentor || isClassEnded.value) return
  showEndClassConfirm.value = true
}

function cancelEndClass() {
  showEndClassConfirm.value = false
}

function confirmEndClass() {
  if (!props.isMentor || isClassEnded.value) return
  showEndClassConfirm.value = false
  isClassLive.value = false
  isClassEnded.value = true
  questionAlerts.value = {}
  raisedHands.value = []
  isRaisedHandsOpen.value = false
  for (const timer of pendingDisconnectTimers.values()) {
    clearTimeout(timer)
  }
  pendingDisconnectTimers.clear()
  if (alertCooldownTimer) {
    clearInterval(alertCooldownTimer)
    alertCooldownTimer = null
  }
  teardownMentorMirrorObserver()
  // Switch Mentor view to final MCQ summary so final results are immediately available to review
  currentStepIndex.value = Math.max(0, totalStepsCount.value - 1)
  if (realtime) {
    realtime.publish('class-end', {
      senderRole: 'mentor',
      mentorId: mentorInstanceId
    })
  }
  broadcastRoomState()
}

function publishStepChange(idx) {
  if (!realtime) return
  realtime.publish('step-change', {
    stepIndex: idx,
    minMirrorSeq: mirrorSeq,
    senderRole: 'mentor',
    mentorId: mentorInstanceId
  })
}

function handleNextStep() {
  if (!props.isMentor || isClassEnded.value) return
  if (currentStepIndex.value < totalStepsCount.value - 1) {
    const nextIdx = currentStepIndex.value + 1
    clearStaleStepMirrorIfBase(nextIdx)
    currentStepIndex.value = nextIdx
    publishStepChange(nextIdx)
    if (nextIdx >= baseStepsCount.value) {
      broadcastRoomState()
    }
  }
}

function handlePrevStep() {
  if (!props.isMentor || isClassEnded.value) return
  if (currentStepIndex.value > 0) {
    const prevIdx = currentStepIndex.value - 1
    clearStaleStepMirrorIfBase(prevIdx)
    currentStepIndex.value = prevIdx
    publishStepChange(prevIdx)
    if (prevIdx >= baseStepsCount.value) {
      broadcastRoomState()
    }
  }
}

function jumpToStep(idx) {
  if (!props.isMentor || isClassEnded.value) return
  if (idx >= 0 && idx < totalStepsCount.value) {
    clearStaleStepMirrorIfBase(idx)
    currentStepIndex.value = idx
    publishStepChange(idx)
    if (idx >= baseStepsCount.value) {
      broadcastRoomState()
    }
  }
}

function handleRevealAnswer(payload) {
  if (!props.isMentor || isClassEnded.value) return
  if (!payload || !payload.questionId) return
  revealedQuestions.value = {
    ...revealedQuestions.value,
    [payload.questionId]: true
  }
  if (realtime) {
    realtime.publish('reveal-answer', {
      questionId: payload.questionId,
      senderRole: 'mentor',
      mentorId: mentorInstanceId
    })
  }
  broadcastRoomState()
}

function getUnansweredStudentsForQuestion(questionId) {
  if (!questionId) return []
  const qResponses = allResponses.value[questionId] || {}
  const uniqueNames = []
  const seen = new Set()

  for (const st of activeStudents.value) {
    const name = typeof st === 'string' ? st : st?.name
    if (name && !seen.has(name)) {
      seen.add(name)
      uniqueNames.push(name)
    }
  }

  return uniqueNames.filter(name => !qResponses[name]?.selectedOption)
}

function startCooldownTicker() {
  if (alertCooldownTimer) return
  alertCooldownTimer = setInterval(() => {
    const now = Date.now()
    cooldownNow.value = now
    const hasActive = Object.values(alertCooldownUntilByQuestion.value).some(ts => ts > now)
    if (!hasActive) {
      clearInterval(alertCooldownTimer)
      alertCooldownTimer = null
    }
  }, 250)
}

function sendQuestionAlert(questionId) {
  if (!props.isMentor || isClassEnded.value || !questionId) return
  if (revealedQuestions.value[questionId]) return

  const now = Date.now()
  const cooldownUntil = alertCooldownUntilByQuestion.value[questionId] || 0
  if (now < cooldownUntil) return

  const targetStudents = getUnansweredStudentsForQuestion(questionId)
  if (targetStudents.length === 0) return

  alertCooldownUntilByQuestion.value = {
    ...alertCooldownUntilByQuestion.value,
    [questionId]: now + ALERT_COOLDOWN_MS
  }
  cooldownNow.value = now
  startCooldownTicker()

  alertSeq += 1
  if (realtime) {
    realtime.publish('question-alert', {
      senderRole: 'mentor',
      mentorId: mentorInstanceId,
      alertId: `alert_${mentorInstanceId}_${alertSeq}_${now}`,
      questionId,
      targetStudents,
      message: 'Please select an option.',
      sentAt: now
    })
  }
}

function dismissQuestionAlert(questionId, alertId) {
  if (!questionId || !alertId) return
  dismissedAlertIds.value = {
    ...dismissedAlertIds.value,
    [questionId]: alertId
  }
}

provide('mcqAlertContext', {
  questionAlerts,
  dismissedAlertIds,
  alertCooldownUntilByQuestion,
  cooldownNow,
  sendQuestionAlert,
  dismissQuestionAlert
})

function handleStudentAnswer(payload) {
  if (props.isMentor || isClassEnded.value) return
  if (!payload || !payload.questionId) return
  const { questionId, selectedOption, isCorrect } = payload

  studentAnswers.value = {
    ...studentAnswers.value,
    [questionId]: { selectedOption, isCorrect }
  }

  const activeAlert = questionAlerts.value[questionId]
  if (activeAlert) {
    dismissQuestionAlert(questionId, activeAlert.alertId)
  }

  if (realtime) {
    realtime.publish('student-answer', {
      questionId,
      studentName: props.studentName || 'Student',
      selectedOption,
      isCorrect
    })
  }
}

onMounted(() => {
  loadInitialOrCachedState()
  initRealtime()

  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleWindowKeydown)
    if (!props.isMentor) {
      window.addEventListener('offline', handleStudentOffline)
      window.addEventListener('online', handleStudentWakeOrOnline)
      window.addEventListener('pagehide', handleStudentPageHide)
      document.addEventListener('visibilitychange', handleStudentWakeOrOnline)
    }
  }
})

onUnmounted(() => {
  teardownMentorMirrorObserver()
  for (const timer of pendingDisconnectTimers.values()) {
    clearTimeout(timer)
  }
  pendingDisconnectTimers.clear()
  if (alertCooldownTimer) {
    clearInterval(alertCooldownTimer)
    alertCooldownTimer = null
  }
  if (retrySyncTimer) {
    clearTimeout(retrySyncTimer)
    retrySyncTimer = null
  }
  if (unsubscribeRealtimeReady) {
    unsubscribeRealtimeReady()
    unsubscribeRealtimeReady = null
  }
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleWindowKeydown)
    if (!props.isMentor) {
      window.removeEventListener('offline', handleStudentOffline)
      window.removeEventListener('online', handleStudentWakeOrOnline)
      window.removeEventListener('pagehide', handleStudentPageHide)
      document.removeEventListener('visibilitychange', handleStudentWakeOrOnline)
    }
  }
  if (!props.isMentor && realtime) {
    let hasTabSession = false
    try {
      hasTabSession = Boolean(sessionStorage.getItem('presenter_tab_session_v1'))
    } catch (_) {}
    if (!hasTabSession) {
      realtime.publish('student-leave', {
        senderRole: 'student',
        studentId: effectiveStudentId,
        studentName: props.studentName || 'Student'
      })
    }
  }
  if (realtime) realtime.destroy()
})
</script>

<style scoped>
.student-step-mirror,
.student-step-mirror :deep(*) {
  pointer-events: none !important;
}

.student-floating-hand {
  bottom: calc(24px + env(safe-area-inset-bottom, 0px));
  right: calc(24px + env(safe-area-inset-right, 0px));
}
</style>
