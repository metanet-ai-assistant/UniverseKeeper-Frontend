import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/splash',
    },
    {
      path: '/splash',
      name: 'splash',
      component: () => import('@/features/auth/pages/SplashPage.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/features/auth/pages/LoginPage.vue'),
    },
    {
      path: '/join',
      name: 'join',
      component: () => import('@/features/auth/pages/JoinPage.vue'),
    },
    {
      path: '/findpw',
      name: 'find-password',
      component: () => import('@/features/auth/pages/FindPasswordPage.vue'),
    },
    {
      path: '/workspaces',
      name: 'workspace-list',
      component: () => import('@/features/workspace/pages/WorkspaceListPage.vue'),
    },
  ],
})

export default router
