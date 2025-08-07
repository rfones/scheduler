<script setup lang="ts">
import { computed, ref } from 'vue';
import Calendar from './WeekViewCalendar.vue';
import { useScheduleStore } from '@/stores/schedule';

const scheduleStore = useScheduleStore();

const aiAgent = ref('');

const scheduledDates = computed(() => {
  return scheduleStore.availability.map(availability => {
    return new Date(availability.startTime).toISOString().split('T')[0];
  });
});

const allowedDates = (date: unknown): boolean => {
  // return a boolean if the data is today or in the next 90 days
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const checkDate = new Date(date as string);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate >= now && checkDate <= new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
};

const selectedDate = ref(new Date());

const updateDate = (date: unknown) => {
  selectedDate.value = new Date(date as string);
};

const isScheduled = (item: { isoDate: string }): boolean => {
  console.log('isScheduled', { item, scheduledDates: scheduledDates.value });
  return scheduledDates.value.includes(item.isoDate);
};

const timezone = computed(() => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
});

const generatingSchedule = ref(false);

const generateSchedule = async () => {
  generatingSchedule.value = true;
  try {
    const response = await fetch('/api/ai-scheduler', {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({ message: aiAgent.value, timezone: timezone.value, currentSchedule: scheduleStore.availability }),
    });
    console.log('response', response);
    const data = await response.json();
    data.delete?.forEach((item: { id: string }) => {
      console.log('delete', item);
      scheduleStore.deleteAvailability(item.id);
    });
    data.update?.forEach((item: { id: string; startTime: string; endTime: string }) => {
      console.log('update', item);
      scheduleStore.editAvailability(item.id, {
        startTime: new Date(item.startTime),
        endTime: new Date(item.endTime),
      });
    });
    data.add?.forEach((item: { startTime: string; endTime: string }) => {
      console.log('add', item);
      scheduleStore.addAvailability({
        startTime: new Date(item.startTime),
        endTime: new Date(item.endTime),
      });
    });
    console.log('generateSchedule', data);
    console.log('generateSchedule', aiAgent.value);
    aiAgent.value = '';
  } catch (error) {
    console.error('Error generating schedule', error);
  } finally {
    generatingSchedule.value = false;
  }
};

</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <h1>Scheduler</h1>
      </v-col>
      <v-col>
        <v-form @submit.prevent="generateSchedule">
          <v-text-field variant="solo" v-model="aiAgent" placeholder="What is your schedule?"
            prepend-icon="mdi-robot-outline" :loading="generatingSchedule" :disabled="generatingSchedule" />
        </v-form>
      </v-col>
      <v-col align="end">
        <v-btn color="primary" to="/scheduler/add" prepend-icon="mdi-plus">Add Availability</v-btn>
      </v-col>
    </v-row>
  </v-container>

  <v-container fluid>
    <v-row align="start" justify="space-between">
      <v-col class="flex-grow-0" cols="auto">
        <v-date-picker hide-header :allowed-dates="allowedDates" show-adjacent-months @update:model-value="updateDate">
          <template #day="{ props, item }">
            <v-btn v-bind="props" :color="isScheduled(item) ? 'green' : ''"
              :variant="isScheduled(item) ? 'flat' : 'text'" @click="updateDate(item.isoDate)">
              {{ item.localized }}
            </v-btn>
          </template>
        </v-date-picker>
        <p>{{ timezone }}</p>
      </v-col>
      <v-col>
        <Calendar :date="selectedDate" />
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped></style>
