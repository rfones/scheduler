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
  router.push('/'); // Redirect to the scheduler page
};
</script>

<template>
  <h1>Add Availability</h1>
  <form @submit.prevent="addAvailability">
    <div>
      <label for="date">Date</label>
      <input type="date" id="date" v-model="date" />
    </div>
    <div>
      <label for="startTime">Start Time</label>
      <input type="time" id="startTime" v-model="startTime" />
    </div>
    <div>
      <label for="endTime">End Time</label>
      <input type="time" id="endTime" v-model="endTime" />
    </div>
    <button type="submit">Add Availability</button>
  </form>
</template>

<style scoped></style>
