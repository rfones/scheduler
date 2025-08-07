<script setup lang="ts"></script>

<template>
  <div class="time-column">
    <!-- start at 1 AM and end at 11 PM for labels, spacing should be there though -->
    <div v-for="i in 23" :key="i" class="time-slot-hour">
      {{ i > 12 ? i - 12 : i }} {{ i < 12 ? 'AM' : 'PM' }} </div>
    </div>
</template>

<style scoped>
.time-column {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  padding-top: 26px;
  padding-right: 10px;
}

.time-slot-hour {
  height: 50px;
  text-align: right;
}
</style>
