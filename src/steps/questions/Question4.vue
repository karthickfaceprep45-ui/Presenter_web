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
  id: 'q4',
  topic: 'JavaScript',
  question: 'Which method is used to add one or more elements to the end of an array?',
  options: [
    { label: 'A', text: 'push()' },
    { label: 'B', text: 'pop()' },
    { label: 'C', text: 'shift()' },
    { label: 'D', text: 'slice()' }
  ],
  correctAnswer: 'A'
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

