<script setup lang="ts">
import { ref } from 'vue';
import { useScheduleStore } from '@/stores/schedule';
import { useRouter } from 'vue-router';

const router = useRouter();
const scheduleStore = useScheduleStore();
const date = ref('');
const startTime = ref('');
const endTime = ref('');


const addAvailability = () => {
  scheduleStore.addAvailability({
    startTime: new Date(`${date.value}T${startTime.value}`),
    endTime: new Date(`${date.value}T${endTime.value}`),
  });
  router.push('/scheduler'); // Redirect to the scheduler page
};
</script>

<template>
  <h1>Add Availability</h1>
  <v-form @submit.prevent="addAvailability">
    <v-text-field label="Date" v-model="date" type="date" />
    <v-text-field label="Start Time" v-model="startTime" type="time" step="1800" />
    <v-text-field label="End Time" v-model="endTime" type="time" step="1800" />
    <v-btn type="submit" color="primary">Add Availability</v-btn>
  </v-form>
</template>

<style scoped></style>
