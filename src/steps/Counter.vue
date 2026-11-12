<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <main class="page">
    <section class="card">
      <h1 class="title">Counter</h1>
      <p class="value" aria-live="polite">{{ count }}</p>

      <div class="actions">
        <button class="btn btn-primary" @click="count++">Count +1</button>
        <button class="btn btn-secondary" :disabled="count === 0" @click="count = 0">
          Reset
        </button>
      </div>
    </section>
  </main>
</template>

<style scoped>
.page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: #f4f6f8;
  color: #1f2933;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.card {
  width: 100%;
  max-width: 360px;
  padding: 32px;
  text-align: center;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
}

.title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #52606d;
}

.value {
  margin: 20px 0 28px;
  font-size: 72px;
  font-weight: 600;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  color: #1f2933;
}

.actions {
  display: flex;
  gap: 12px;
}

.btn {
  flex: 1;
  padding: 11px 16px;
  font: inherit;
  font-size: 15px;
  font-weight: 500;
  border-radius: 8px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: background-color 0.15s, border-color 0.15s;
}

.btn:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

.btn-primary {
  background: #2563eb;
  color: #ffffff;
}

.btn-primary:hover {
  background: #1d4ed8;
}

.btn-secondary {
  background: #ffffff;
  color: #323f4b;
  border-color: #cbd2d9;
}

.btn-secondary:hover:not(:disabled) {
  background: #f4f6f8;
}

.btn-secondary:disabled {
  color: #9aa5b1;
  cursor: not-allowed;
}
</style>
