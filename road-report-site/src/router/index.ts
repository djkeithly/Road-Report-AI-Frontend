import { createRouter, createWebHistory } from 'vue-router';
import Home from "@/views/Home.vue";
import Account from "@/views/Account.vue"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/account',
      name: 'account',
      component: Account,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ],
});

export default router;
