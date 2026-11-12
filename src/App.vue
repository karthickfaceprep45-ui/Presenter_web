<template>
  <div class="h-screen w-screen bg-[#f8fafc] flex flex-col text-gray-900 overflow-hidden select-none">
    <!-- Thin Top Navbar -->
    <Navbar
      :role="currentRole"
      :room-code="currentRoomCode"
      @go-home="handleLeave"
      @leave="handleLeave"
    />

    <!-- Main Content Area (Full width & height, no giant margins) -->
    <main class="flex-1 w-full min-h-0 flex flex-col overflow-y-auto md:overflow-hidden relative">
      <!-- 1. Home: Role Selector (Screenshot 1) -->
      <RoleSelector
        v-if="view === 'home'"
        :selected-role="currentRole"
        @select-role="handleSelectRole"
      />

      <!-- 2. Admin: Room Created (Screenshot 2) -->
      <AdminRoomView
        v-else-if="view === 'admin'"
        :room-code="currentRoomCode"
        @back-home="handleLeave"
        @join-as-mentor="joinAsMentor"
      />

      <!-- 3. Mentor: Login (Screenshot 3) -->
      <MentorLoginView
        v-else-if="view === 'mentor-login'"
        @enter-room="handleMentorEnterRoom"
        @back-home="handleLeave"
      />

      <!-- 4. Student: Join Room & Name Entry (Screenshots 5 & 6) -->
      <StudentJoinView
        v-else-if="view === 'student-join'"
        @join-room="handleStudentJoinRoom"
        @back-home="handleLeave"
      />

      <!-- 5. Student: Waiting for Class to Start (Screenshot 7) -->
      <StudentWaiting
        v-else-if="view === 'student-waiting'"
        :room-code="currentRoomCode"
        @leave="handleLeave"
      />

      <!-- 5b. Student: Class Already Ended -->
      <div
        v-else-if="view === 'student-ended'"
        class="w-full max-w-md mx-auto bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm text-center my-auto"
      >
        <div class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium text-xs mb-3">
          Room {{ currentRoomCode }}
        </div>
        <h2 class="text-xl font-bold text-gray-900 tracking-tight mb-2">
          This class has ended
        </h2>
        <p class="text-sm text-gray-500 mb-6">
          This session is no longer accepting participants.
        </p>
        <button
          type="button"
          @click="handleLeave"
          class="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition cursor-pointer"
        >
          Back to Home
        </button>
      </div>

      <!-- 6. Live Class: Presentation & MCQ View (Screenshots 4, 8-15) -->
      <ClassRoom
        v-else-if="view === 'classroom'"
        :is-mentor="currentRole === 'mentor'"
        :student-name="studentDisplayName"
        :student-id="studentId"
        :room-code="currentRoomCode"
        :initial-room-state="initialClassroomState"
        @leave="handleLeave"
      />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Navbar from './components/Navbar.vue'
import RoleSelector from './components/RoleSelector.vue'
import AdminRoomView from './components/AdminRoomView.vue'
import MentorLoginView from './components/MentorLoginView.vue'
import StudentJoinView from './components/StudentJoinView.vue'
import StudentWaiting from './components/StudentWaiting.vue'
import ClassRoom from './components/ClassRoom.vue'
import { RealtimeService } from './services/realtime'

// State
const view = ref('home') // 'home' | 'admin' | 'mentor-login' | 'student-join' | 'student-waiting' | 'student-ended' | 'classroom'
const currentRole = ref(null) // null | 'admin' | 'mentor' | 'student'
const currentRoomCode = ref(null)
const studentDisplayName = ref('')
const studentId = ref('')
const initialClassroomState = ref(null)

const TAB_SESSION_KEY = 'presenter_tab_session_v1'

let studentWaitingRealtime = null
let studentWaitingPollTimer = null

function createStudentId() {
  return `st_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`
}

function saveStudentTabSession(session) {
  try {
    sessionStorage.setItem(TAB_SESSION_KEY, JSON.stringify(session))
  } catch (_) {}
}

function clearStudentTabSession() {
  try {
    sessionStorage.removeItem(TAB_SESSION_KEY)
    const keysToRemove = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i)
      if (k && k.startsWith('presenter_hand_')) {
        keysToRemove.push(k)
      }
    }
    keysToRemove.forEach((k) => sessionStorage.removeItem(k))
  } catch (_) {}
}

function cleanupWaitingRealtime() {
  if (studentWaitingPollTimer) {
    clearInterval(studentWaitingPollTimer)
    studentWaitingPollTimer = null
  }
  if (studentWaitingRealtime) {
    studentWaitingRealtime.destroy()
    studentWaitingRealtime = null
  }
}

function generate6DigitCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function handleSelectRole(role) {
  if (role === 'admin') {
    currentRole.value = 'admin'
    currentRoomCode.value = generate6DigitCode()
    view.value = 'admin'
  } else if (role === 'mentor') {
    currentRole.value = 'mentor'
    view.value = 'mentor-login'
  } else if (role === 'student') {
    currentRole.value = 'student'
    view.value = 'student-join'
  }
}

function joinAsMentor(roomCode) {
  cleanupWaitingRealtime()
  initialClassroomState.value = null
  currentRole.value = 'mentor'
  currentRoomCode.value = roomCode
  view.value = 'classroom'
}

function handleMentorEnterRoom(code) {
  cleanupWaitingRealtime()
  initialClassroomState.value = null
  currentRole.value = 'mentor'
  currentRoomCode.value = code
  view.value = 'classroom'
}

function enterStudentSession({ roomCode, name, id }) {
  cleanupWaitingRealtime()
  initialClassroomState.value = null
  currentRole.value = 'student'
  currentRoomCode.value = roomCode
  studentDisplayName.value = name
  studentId.value = id || createStudentId()
  saveStudentTabSession({
    role: 'student',
    roomCode,
    name,
    studentId: studentId.value
  })

  // Check if class is already live or ended (e.g. from local storage cache written by Mentor)
  const cachedRaw = localStorage.getItem(`presenter_room_state_${roomCode}`)
  let alreadyLive = false
  if (cachedRaw) {
    try {
      const parsed = JSON.parse(cachedRaw)
      if (parsed && parsed.senderRole === 'mentor') {
        if (parsed.isClassEnded) {
          initialClassroomState.value = null
          view.value = 'student-ended'
          return
        }
        if (parsed.isClassLive) {
          initialClassroomState.value = parsed
          alreadyLive = true
        }
      }
    } catch (_) {}
  }

  if (alreadyLive) {
    view.value = 'classroom'
  } else {
    view.value = 'student-waiting'
    listenForClassStart(roomCode)
  }
}

function handleStudentJoinRoom({ roomCode, name }) {
  enterStudentSession({
    roomCode,
    name,
    id: createStudentId()
  })
}

function listenForClassStart(roomCode) {
  cleanupWaitingRealtime()

  studentWaitingRealtime = new RealtimeService(roomCode)

  const sendJoinAndRequest = () => {
    if (!studentWaitingRealtime) return
    if (studentDisplayName.value) {
      studentWaitingRealtime.publish('student-join', {
        name: studentDisplayName.value,
        studentId: studentId.value
      })
    } else {
      studentWaitingRealtime.publish('request-state', {
        name: 'Student',
        studentId: studentId.value
      })
    }
  }

  studentWaitingRealtime.on('class-start', (data) => {
    if (!data || data.senderRole !== 'mentor') return
    initialClassroomState.value = {
      senderRole: 'mentor',
      mentorId: data.mentorId,
      isClassLive: true,
      isClassEnded: false,
      currentStepIndex: 0
    }
    cleanupWaitingRealtime()
    view.value = 'classroom'
  })

  studentWaitingRealtime.on('class-end', (data) => {
    if (!data || data.senderRole !== 'mentor') return
    cleanupWaitingRealtime()
    initialClassroomState.value = null
    view.value = 'student-ended'
  })

  studentWaitingRealtime.on('state-sync', (state) => {
    if (!state || state.senderRole !== 'mentor') return
    if (state.isClassEnded) {
      cleanupWaitingRealtime()
      initialClassroomState.value = null
      view.value = 'student-ended'
      return
    }
    if (state.isClassLive && !state.isClassEnded) {
      initialClassroomState.value = state
      cleanupWaitingRealtime()
      view.value = 'classroom'
    }
  })

  studentWaitingRealtime.onSubscribed(() => {
    sendJoinAndRequest()
  })

  studentWaitingPollTimer = setInterval(() => {
    sendJoinAndRequest()
  }, 2000)
}

function handleLeave() {
  if (view.value === 'student-waiting' && studentWaitingRealtime && currentRole.value === 'student') {
    studentWaitingRealtime.publish('student-leave', {
      senderRole: 'student',
      studentId: studentId.value,
      studentName: studentDisplayName.value
    })
  }
  clearStudentTabSession()
  cleanupWaitingRealtime()
  view.value = 'home'
  currentRole.value = null
  currentRoomCode.value = null
  studentDisplayName.value = ''
  studentId.value = ''
  initialClassroomState.value = null
}

onMounted(() => {
  try {
    const raw = sessionStorage.getItem(TAB_SESSION_KEY)
    if (raw) {
      const saved = JSON.parse(raw)
      if (saved && saved.role === 'student' && saved.roomCode && saved.name) {
        enterStudentSession({
          roomCode: saved.roomCode,
          name: saved.name,
          id: saved.studentId
        })
      }
    }
  } catch (_) {}
})

onUnmounted(() => {
  cleanupWaitingRealtime()
})
</script>
