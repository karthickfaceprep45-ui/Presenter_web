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
  id: 'q2',
  topic: 'Databases',
  question: 'Which of the following is a NoSQL database?',
  options: [
    { label: 'A', text: 'PostgreSQL' },
    { label: 'B', text: 'MySQL' },
    { label: 'C', text: 'MongoDB' },
    { label: 'D', text: 'SQLite' }
  ],
  correctAnswer: 'C'
}
</script>

<script setup>
import QuestionView from '../../components/QuestionView.vue'

defineProps({
  questionNumber: {
    type: Number,
    default: 2
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

