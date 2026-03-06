import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/components/MapDisplay.vue'),
      meta: { title: 'Road Report AI' },
    },
    {
      path: '/chat',
      name: 'chat',
      component: () => import('@/views/ChatView.vue'),
      meta: { title: 'Chat - Road Report AI' },
    },
    {
      path: '/report',
      name: 'report',
      component: () => import('@/views/ReportView.vue'),
      meta: { title: 'Risk Report - Road Report AI' },
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/AboutView.vue'),
      meta: { title: 'About - Road Report AI' },
    },
    {
      path: '/account',
      name: 'account',
      component: () => import('@/views/Account.vue'),
      meta: { title: 'Account - Road Report AI' },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'home',
      component: () => import('@/components/MapDisplay.vue'),
      meta: { title: 'Road Report AI' },
    },
  ],
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition ?? { top: 0, behavior: 'smooth' }
  },
})

router.afterEach((to) => {
  const title = to.meta.title as string | undefined
  document.title = title ?? 'Road Report AI'
})

export default router
