import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/auth/LoginView.vue'
import RegisterView from '../views/auth/RegisterView.vue'
import DashboardView from '../views/system/DashboardView.vue'
import ForbiddenView from '../views/errors/ForbiddenView.vue'
import NotFoundView from '../views/errors/NotFoundView.vue'
import { isAuthenticated, isAdmin } from '@/utilities/supabase'
import BrowseCamerasView from '@/views/system/BrowseCamerasView.vue'
import CheckoutView from '@/views/system/CheckoutView.vue'
import ProductManagementView from '@/views/admin/ProductManagementView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/system/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true },
    },
    {
      path: '/browse',
      name: 'browse',
      component: BrowseCamerasView,
      meta: { requiresAuth: true },
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: CheckoutView,
      meta: { requiresAuth: true },
    },
    // Admin Routes
    {
      path: '/admin/rentals',
      name: 'admin-rentals',
      component: () => import('@/views/admin/RentalManagementView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/products',
      name: 'product-management',
      component: ProductManagementView,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    // User Routes
    {
      path: '/my-rentals',
      name: 'my-rentals',
      component: () => import('@/views/user/MyRentalsView.vue'),
      meta: { requiresAuth: true },
    },
    //Error Pages
    {
      path: '/forbidden',
      name: 'forbidden',
      component: ForbiddenView,
    },
    {
      path: '/not-found',
      name: 'not-found',
      component: NotFoundView,
    },
  ],
})

router.beforeEach(async (to) => {
  const isLoggedIn = await isAuthenticated()

  // Redirect to appropriate page if accessing home route
  if (to.name === 'home') {
    return isLoggedIn ? { name: 'dashboard' } : { name: 'login' }
  }

  // Check if user is logged in
  if (isLoggedIn && (to.name === 'login' || to.name === 'register')) {
    return { name: 'dashboard' }
  }

  // Check authentication for protected routes
  if (to.meta.requiresAuth && !isLoggedIn) {
    return { name: 'login' }
  }

  // Check admin status for admin routes
  if (to.meta.requiresAdmin) {
    const userIsAdmin = await isAdmin()
    if (!userIsAdmin) {
      return { name: 'forbidden' }
    }
  }
})

export default router
