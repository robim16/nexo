import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/presentation/views/HomePage.vue'),
    meta: {
      requiresAuth: true,
      layout: 'DefaultLayout'
    }
  },
  {
    path: '/explore',
    name: 'Explore',
    component: () => import('@/presentation/views/ExplorePage.vue'),
    meta: {
      requiresAuth: true,
      layout: 'DefaultLayout'
    }
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: () => import('@/presentation/views/NotificationsPage.vue'),
    meta: {
      requiresAuth: true,
      layout: 'DefaultLayout'
    }
  },
  {
    path: '/profile/:id?',
    name: 'Profile',
    component: () => import('@/presentation/views/ProfilePage.vue'),
    meta: {
      requiresAuth: true,
      layout: 'DefaultLayout'
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/presentation/views/SettingsPage.vue'),
    meta: {
      requiresAuth: true,
      layout: 'DefaultLayout'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/presentation/views/auth/LoginPage.vue'),
    meta: {
      requiresGuest: true,
      layout: 'AuthLayout'
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/presentation/views/auth/RegisterPage.vue'),
    meta: {
      requiresGuest: true,
      layout: 'AuthLayout'
    }
  },
  {
    path: '/post/:id',
    name: 'SinglePost',
    component: () => import('@/presentation/views/SinglePostPage.vue'),
    meta: {
      requiresAuth: true,
      layout: 'DefaultLayout'
    }
  },
  {
    path: '/saved',
    name: 'Saved',
    component: () => import('@/presentation/views/SavedPostsPage.vue'),
    meta: {
      requiresAuth: true,
      layout: 'DefaultLayout'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/'
  }
]
