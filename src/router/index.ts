import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/scheduler',
    },
    {
      path: '/scheduler',
      component: () => import('../components/Scheduler/SchedulerView.vue'),
    },
    {
      path: '/scheduler/add',
      component: () => import('../components/Scheduler/AddAvailability.vue'),
    },
    {
      path: '/scheduler/:id',
      component: () => import('../components/Scheduler/EditAvailability.vue'),
    },
  ],
})

export default router
