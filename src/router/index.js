import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/auth/LoginView.vue'
import RegisterView from '../views/auth/RegisterView.vue'
import DashboardView from '../views/system/DashboardView.vue'
import ForbiddenView from '../views/errors/ForbiddenView.vue'
import NotFoundView from '../views/errors/NotFoundView.vue'
import { getUserInformation, isAuthenticated } from '@/utilities/supabase'
import BrowseCamerasView from '@/views/system/BrowseCamerasView.vue'
import CheckoutView from '@/views/system/CheckoutView.vue'
import ProductManagementView from '@/views/admin/ProductManagementView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
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
    },

    {
      path: '/browse',
      name: 'browse',
      component: BrowseCamerasView,
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: CheckoutView,
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
      path: '/forbidden ',
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

  //Redirect to appropriate page if accessing home route

  if (to.name === 'home') {
    return isLoggedIn ? { name: 'dashboard' } : { name: 'login' }
  }

  //Check if user is logged in
  if (isLoggedIn && (to.name === 'login' || to.name == 'register')) {
    return { name: 'dashboard' }
  }

  //Check if user is logged in and wants to go back to homepage
  if (isLoggedIn && to.name === 'home') {
    return { name: 'dashboard' }
  }

  //check if the user is logged in and not admin
  if (isLoggedIn) {
    //retrieve information
    const userMetadata = await getUserInformation()
    //get the user role
    const is_admin = userMetadata.is_admin

    //check if the user is  not admin
    if (!is_admin) {
      //check the user if the user is going to forbidden pages
      if (to.name.startsWith('system/users')) {
        return { name: 'forbidden' }
      }
    }
  }

  //if not logged in and going to system pages
  if (!isLoggedIn && to.path.startsWith('/system')) {
    //redirect user to the login page
    return { name: 'login' }
  }

  if (!isLoggedIn && to.path.startsWith('/dashboard')) {
    //redirect user to the login page
    return { name: 'login' }
  }

  // Redirect to 404 Not Found if the route does not exist
  if (router.resolve(to).matched.length === 0) {
    return { name: 'not-found' }
  }
})

export default router
