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
export const questionData = {
  id: 'q6',
  topic: 'Operating Systems',
  question: 'Which component of an operating system manages memory and CPU scheduling?',
  options: [
    { label: 'A', text: 'Terminal Shell' },
    { label: 'B', text: 'Kernel' },
    { label: 'C', text: 'File System Manager' },
    { label: 'D', text: 'Device Driver' }
  ],
  correctAnswer: 'B'
}
</script>

<script setup>
import QuestionView from '../../components/QuestionView.vue'

defineProps({
  questionNumber: {
    type: Number,
    default: 3
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

