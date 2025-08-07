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
      component: () => import('../components/Scheduler/index.vue'),
    },
    {
      path: '/scheduler/add',
      component: () => import('../components/Scheduler/AddAvailability.vue'),
    },
  ],
})

export default router
