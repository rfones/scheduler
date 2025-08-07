<script setup lang="ts">
import { useScheduleStore, type SchedulerItem } from '@/stores/schedule';
import { computed, ref } from 'vue';

const ROW_HEIGHT = 25
const scheduleStore = useScheduleStore();

const props = defineProps<{
  date: Date;
  day: number;
}>();

const columnDate = computed(() => {
  const date = new Date(props.date);
  date.setDate(date.getDate() + props.day - 1);
  date.setHours(0, 0, 0, 0);
  console.log('date', date.toISOString());
  return date;
});

// get all events for the day
const schedule = computed(() => {
  console.log(scheduleStore.availability);
  return scheduleStore.availability.filter((availability) => {
    return availability.startTime.getDate() === columnDate.value.getDate() && availability.startTime.getMonth() === columnDate.value.getMonth() && availability.startTime.getFullYear() === columnDate.value.getFullYear();
  });
});

function convertTimeToGridRow(time: Date) {
  const hour = time.getHours()
  const minute = time.getMinutes()
  return hour * 2 + 1 + (minute / 30)
}

const calculateGridPosition = (availability: SchedulerItem) => {
  const gridRowStart = convertTimeToGridRow(availability.startTime);
  const gridRowEnd = convertTimeToGridRow(availability.endTime);
  console.log({ gridRowStart, gridRowEnd, availability, date: columnDate.value });
  return {
    gridRowStart,
    gridRowEnd
  };
}

const grid = ref<HTMLElement | null>(null)
const startHour = ref<number | null>(null)
const endHour = ref<number | null>(null)

function handleGridMouseDown(event: MouseEvent) {
  const gridRect = grid.value?.getBoundingClientRect()
  if (!gridRect) return
  const clickY = event.clientY - gridRect.top
  const clickedHour = Math.floor(clickY / ROW_HEIGHT) + 1
  startHour.value = clickedHour
}

function handleGridMouseMove(event: MouseEvent) {
  if (!startHour.value) return
  const gridRect = grid.value?.getBoundingClientRect()
  if (!gridRect) return
  const clickY = event.clientY - gridRect.y
  const clickedHour = Math.floor(clickY / ROW_HEIGHT) + 1
  endHour.value = clickedHour
}

function handleGridMouseUp(event: MouseEvent) {
  const gridRect = grid.value?.getBoundingClientRect()
  if (!gridRect) return
  const clickY = event.clientY - gridRect.top
  const clickedHour = Math.floor(clickY / ROW_HEIGHT) + 1
  console.log("up hour:", clickedHour)
  if (startHour.value && endHour.value) {
    // if start is greater than end, flip times
    if (startHour.value > endHour.value) {
      const temp = startHour.value
      startHour.value = endHour.value
      endHour.value = temp
    }

    scheduleStore.addAvailability({
      startTime: new Date(`${columnDate.value.toISOString().split('T')[0]}T${convertGridRowToTime(startHour.value)}`),
      endTime: new Date(`${columnDate.value.toISOString().split('T')[0]}T${convertGridRowToTime(endHour.value)}`)
    })
    console.log("date:", columnDate.value.toISOString().split('T')[0], "start:", convertGridRowToTime(startHour.value), "end:", convertGridRowToTime(endHour.value))
  }
  startHour.value = null
  endHour.value = null
}

function formatTimeRange(startTime: Date, endTime: Date) {
  const startHour = startTime.getHours()
  const startMinute = startTime.getMinutes()
  const endHour = endTime.getHours()
  const endMinute = endTime.getMinutes()

  const startMinuteStr = startMinute === 0 ? '' : `:${startMinute.toString().padStart(2, '0')}`
  const endMinuteStr = endMinute === 0 ? '' : `:${endMinute.toString().padStart(2, '0')}`
  if (startHour > 12) {
    return `${startHour - 12}${startMinuteStr} &ndash; ${endHour - 12}${endMinuteStr}pm`
  } else if (endHour > 12) {
    return `${startHour}${startMinuteStr}am &ndash; ${endHour - 12}${endMinuteStr}pm`
  } else {
    return `${startHour}${startMinuteStr} &ndash; ${endHour}${endMinuteStr}am`
  }
}

function convertGridRowToTime(gridRow: number) {
  const hour = Math.floor((gridRow - 1) / 2)
  const minute = ((gridRow - 1) % 2) * 30
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
}
</script>

<template>
  <div class="day-column" ref="grid" @mousedown="handleGridMouseDown" @mouseup="handleGridMouseUp"
    @mousemove="handleGridMouseMove">

    <div v-for="availability in schedule" :key="availability.id" class="time-slot-scheduled"
      :style="calculateGridPosition(availability)">
      <span class="time-slot-scheduled-text"
        v-html="formatTimeRange(availability.startTime, availability.endTime)"></span>
      <v-btn-group variant="outlined" divided class="time-slot-scheduled-btn-group" density="compact">
        <v-btn @click="scheduleStore.deleteAvailability(availability.id)" icon="mdi-delete" size="small"></v-btn>
        <v-btn @click="$router.push(`/scheduler/${availability.id}`)" icon="mdi-pencil" size="small"></v-btn>
      </v-btn-group>
    </div>

    <div v-if="startHour && endHour" class="time-slot-scheduled"
      :style="{ gridRowStart: startHour, gridRowEnd: endHour }">
      <span class="time-slot-scheduled-text" v-html="formatTimeRange(new Date(`${columnDate.toISOString().split('T')[0]}T${convertGridRowToTime(startHour)}`), new
        Date(`${columnDate.toISOString().split('T')[0]}T${convertGridRowToTime(endHour)}`))"></span>
    </div>

  </div>
</template>

<style scoped>
.day-column {
  display: grid;
  grid-template-rows: repeat(48, 25px);
  flex-basis: 100%;
}

.time-slot-scheduled {
  position: relative;
  background-color: #00ff0080;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid black;
  z-index: 10;
  margin: 1px;
  font-size: .75rem;
}


.time-slot-scheduled-text {
  user-select: none;
}
</style>
