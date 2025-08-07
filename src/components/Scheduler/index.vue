<script setup lang="ts">
import Calendar from './WeekViewCalendar.vue';

</script>

<template>
  <h1>Scheduler</h1>

  <v-btn color="primary" to="/scheduler/add">Add Availability</v-btn>

  <Calendar />
</template>

<style scoped></style>
