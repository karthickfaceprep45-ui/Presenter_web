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
  id: 'q5',
  topic: 'Cloud & DevOps',
  question: 'What is the primary function of Docker in modern software deployment?',
  options: [
    { label: 'A', text: 'Source code version control' },
    { label: 'B', text: 'Application containerization' },
    { label: 'C', text: 'Domain name management' },
    { label: 'D', text: 'Continuous database indexing' }
  ],
  correctAnswer: 'B'
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

