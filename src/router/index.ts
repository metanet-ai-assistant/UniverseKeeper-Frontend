import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from '@/features/auth/stores/authStore'

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
      meta: {
        guestOnly: true,
      },
    },
    {
      path: '/join',
      name: 'join',
      component: () => import('@/features/auth/pages/JoinPage.vue'),
      meta: {
        guestOnly: true,
      },
    },
    {
      path: '/findpw',
      name: 'find-password',
      component: () => import('@/features/auth/pages/FindPasswordPage.vue'),
      meta: {
        guestOnly: true,
      },
    },
    {
      path: '/workspaces',
      name: 'workspace-list',
      component: () => import('@/features/workspace/pages/WorkspaceListPage.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/workspaces/new',
      name: 'workspace-new',
      component: () => import('@/features/workspace/pages/NewWorkspacePage.vue'),
      meta: {
        requiresAuth: true,
      },
    },
  ],
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      return {
        path: '/login',
        query: {
          redirect: to.fullPath,
        },
      }
    }

    try {
      await authStore.ensureAuthenticated()
    } catch {
      return {
        path: '/login',
        query: {
          redirect: to.fullPath,
        },
      }
    }
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    try {
      await authStore.ensureAuthenticated()
      return '/workspaces'
    } catch {
      return true
    }
  }

  return true
})

export default router
