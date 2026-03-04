import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { title: 'Road Report AI' },
    },
    {
      path: '/chat',
      name: 'chat',
      component: () => import('@/views/ChatView.vue'),
      meta: { title: 'Chat — Road Report AI' },
    },
    {
      path: '/report',
      name: 'report',
      component: () => import('@/views/ReportView.vue'),
      meta: { title: 'Risk Report — Road Report AI' },
    },
    // TODO: Add dynamic route once backend serves per-road reports
    // { path: '/report/:roadId', name: 'report-detail', ... }
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/AboutView.vue'),
      meta: { title: 'About — Road Report AI' },
    },
    {
      // Catch-all → redirect to home (matches your existing behavior)
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
  scrollBehavior(_to, _from, savedPosition) {
    // Scroll to top on navigation, or restore position on back/forward
    return savedPosition ?? { top: 0, behavior: 'smooth' }
  },
})

// Auto-update document title on route change
router.afterEach((to) => {
  const title = to.meta.title as string | undefined
  document.title = title ?? 'Road Report AI'
})

export default router
