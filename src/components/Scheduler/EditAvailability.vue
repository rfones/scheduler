<script setup lang="ts">
import { computed, ref } from 'vue';
import { useScheduleStore } from '@/stores/schedule';
import { useRouter } from 'vue-router';

const router = useRouter();
const scheduleStore = useScheduleStore();

const scheduledItem = computed(() => {
  return scheduleStore.availability.find((availability) => availability.id === router.currentRoute.value.params.id);
});

const date = ref(scheduledItem.value?.startTime.toISOString().split('T')[0]);
const startTime = ref(scheduledItem.value?.startTime.toLocaleTimeString('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
}));
const endTime = ref(scheduledItem.value?.endTime.toLocaleTimeString('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
}));


const editAvailability = () => {
  scheduleStore.editAvailability(scheduledItem.value?.id as string, {
    startTime: new Date(`${date.value}T${startTime.value}`),
    endTime: new Date(`${date.value}T${endTime.value}`),
  });
  router.push('/scheduler'); // Redirect to the scheduler page
};
</script>

<template>
  <h1>Edit Availability</h1>
  <v-form @submit.prevent="editAvailability">
    <v-text-field label="Date" v-model="date" type="date" />
    <v-text-field label="Start Time" v-model="startTime" type="time" step="1800" />
    <v-text-field label="End Time" v-model="endTime" type="time" step="1800" />
    <v-btn type="submit" color="primary">Save Availability</v-btn>
  </v-form>
</template>

<style scoped></style>
