<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  date: Date;
}>();

const dayOfWeek = computed(() => {
  return props.date.toLocaleDateString('en-US', { weekday: 'short' });
});

const day = computed(() => {
  return props.date.toLocaleDateString('en-US', { day: 'numeric' });
});
</script>

<template>
  <div class="calendar-header">
    <div class="calendar-header-day-of-week">{{ dayOfWeek }}</div>
    <div class="calendar-header-day">{{ day }}</div>
  </div>
</template>

<style scoped>
.calendar-header {
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 1rem;
  flex-grow: 1;
}
</style>