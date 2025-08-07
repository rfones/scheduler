import { reactive } from 'vue'
import { defineStore } from 'pinia'

export interface SchedulerItem {
  id: string
  startTime: Date
  endTime: Date
}

export const useScheduleStore = defineStore('schedule', () => {
  const availability = reactive<SchedulerItem[]>([])
  function addAvailability(newAvailability: Omit<SchedulerItem, 'id'>) {
    // check for overlapping schedule
    const overlapping = availability.find((availability) => {
      return (
        (newAvailability.startTime >= availability.startTime &&
          newAvailability.startTime <= availability.endTime) ||
        (newAvailability.endTime >= availability.startTime &&
          newAvailability.endTime <= availability.endTime)
      )
    })
    if (overlapping) {
      // if the new availability is completely within the overlapping availability, do nothing
      if (
        newAvailability.startTime >= overlapping.startTime &&
        newAvailability.endTime <= overlapping.endTime
      ) {
        return
      }

      // merge the times
      if (newAvailability.startTime > overlapping.startTime) {
        newAvailability.startTime = overlapping.startTime
      }
      if (newAvailability.endTime < overlapping.endTime) {
        newAvailability.endTime = overlapping.endTime
      }
      deleteAvailability(overlapping.id)
    }
    availability.push({ ...newAvailability, id: crypto.randomUUID() })
  }

  function editAvailability(id: string, newAvailability: Omit<SchedulerItem, 'id'>) {
    const idx = availability.findIndex((availability) => availability.id === id)
    if (idx !== -1) {
      availability[idx] = { ...newAvailability, id }
    }
  }

  function deleteAvailability(id: string) {
    const idx = availability.findIndex((availability) => availability.id === id)
    if (idx !== -1) {
      availability.splice(idx, 1)
    }
  }

  return { availability, addAvailability, deleteAvailability, editAvailability }
})
