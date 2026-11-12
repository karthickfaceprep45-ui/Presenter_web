<template>
  <QuestionView
    :question-data="questionData"
    :question-number="questionNumber"
    :total-questions="totalQuestions"
    :is-mentor="isMentor"
    :student-name="studentName"
    :student-answers="studentAnswers"
    :all-responses="allResponses"
    :active-students="activeStudents"
    :is-revealed="isRevealed"
    @submit-answer="$emit('submit-answer', $event)"
    @reveal-answer="$emit('reveal-answer', $event)"
    @next-question="$emit('next-question', $event)"
  />
</template>

<script>
// Question metadata exported so it can be queried without mounting
export const questionData = {
  id: 'q1',
  topic: 'Networking',
  question: 'Which protocol is primarily used to assign IP addresses dynamically to devices on a network?',
  options: [
    { label: 'A', text: 'DNS' },
    { label: 'B', text: 'DHCP' },
    { label: 'C', text: 'FTP' },
    { label: 'D', text: 'SMTP' }
  ],
  correctAnswer: 'B'
}
</script>

<script setup>
import QuestionView from '../../components/QuestionView.vue'

defineProps({
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

defineEmits(['submit-answer', 'reveal-answer', 'next-question'])
</script>

