<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import CalendarHeader from './CalendarHeader.vue';
import DayColumn from './DayColumn.vue';
import TimeColumn from './TimeColumn.vue';

const aiAgent = ref('');

const now = new Date();
console.log('now', now);

const startofWeek = computed(() => {
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek;
  const startofWeek = new Date(now.setDate(diff));
  return startofWeek;
});

const date = (day: number) => {
  const date = new Date(startofWeek.value);
  date.setDate(date.getDate() + day - 1);
  return date;
};

const calendarBody = ref<HTMLDivElement | null>(null);

const timezone = computed(() => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
});

onMounted(() => {
  // scroll body down to middle
  if (calendarBody.value) {
    calendarBody.value.scrollTo({
      top: 250,
      behavior: 'instant',
    });
  }
});

const generateAvailability = () => {
  console.log('generateAvailability', aiAgent.value);
};

</script>

<template>
  <h2>Calendar</h2>
  {{ timezone || 'no timezone' }}
  <div class="calendar-week-view">
    <div class="calendar-week-view-header">
      <CalendarHeader v-for="i in 7" :key="i" :date="date(i)" />
    </div>
    <div class="calendar-week-view-body" ref="calendarBody">
      <TimeColumn class="calendar-week-view-time" />
      <div class="calendar-week-view-day-container">
        <DayColumn v-for="i in 7" :key="i" :date="startofWeek" :day="i" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.calendar-week-view {
  display: grid;
  grid-template-columns: 1fr repeat(7, 2fr);
  grid-template-areas: '. header header header header header header header'
    'body body body body body body body body';
}

.calendar-week-view-header {
  /* placholder for scrollbar width */
  padding-right: 10px;

  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  grid-area: header;
  border-bottom: 1px solid grey;
}

.calendar-week-view-body {
  grid-area: body;
  display: grid;
  grid-template-columns: 1fr repeat(7, 2fr);
  grid-template-areas: 'time day day day day day day day';
  height: 768px;
  overflow-y: scroll;

}

.calendar-week-view-time {
  grid-area: time;
}

.calendar-week-view-day-container {
  grid-area: day;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: repeating-linear-gradient(to bottom,
        transparent,
        transparent 49px,
        #ccc 50px);
    pointer-events: none;
  }
}
</style>
