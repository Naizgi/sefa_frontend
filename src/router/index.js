import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const routes = [
  {
    path: '/',
    name: 'Splash',
    component: () => import('./../components/SplashScreen.vue'),
    meta: { public: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('./../views/auth/Login.vue'),
    meta: { public: true, requiresGuest: true }
  },
  {
    path: '/',
    component: () => import('./../components/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      // ==================== ADMIN DASHBOARD ====================
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/Dashboard.vue'),
        meta: { requiresAuth: true, role: 'admin' }
      },

      // ==================== SALES ROUTES (All sales roles can access all of these) ====================
      {
        path: 'sales',
        name: 'SalesDashboard',
        component: () => import('@/views/salesman/Dashboard.vue'),
        meta: { requiresAuth: true, role: 'salesman' }  // Both salesman and privileged_sales can access
      },
      {
        path: 'sales/pos',
        name: 'SalesPOS',
        component: () => import('@/views/salesman/Sales.vue'),
        meta: { requiresAuth: true, role: 'salesman' }  // Both salesman and privileged_sales can access
      },
      {
        path: 'sales/products',
        name: 'SalesProducts',
        component: () => import('@/views/salesman/Products.vue'),
        meta: { requiresAuth: true, role: 'salesman' }  // Both salesman and privileged_sales can access
      },
      {
        path: 'sales/stock',
        name: 'SalesmanStock',
        component: () => import('@/views/salesman/Stock.vue'),
        meta: { requiresAuth: true, role: 'salesman' }  // Both salesman and privileged_sales can access
      },
      {
        path: 'sales/temp-items',
        name: 'SalesmanTempItems',
        component: () => import('@/views/salesman/TempItems.vue'),
        meta: { requiresAuth: true, role: 'salesman' }  // Both salesman and privileged_sales can access
      },

      // ==================== PRIVILEGED ONLY ROUTES (Only admin and privileged_sales can access) ====================
      {
        path: 'sales/loans',
        name: 'SalesLoans',
        component: () => import('@/views/salesman/Loans.vue'),
        meta: { requiresAuth: true, role: 'privileged_sales' }  // Only privileged_sales and admin
      },
      {
        path: 'sales/loans/create',
        name: 'SalesCreateLoan',
        component: () => import('@/views/salesman/CreateLoan.vue'),
        meta: { requiresAuth: true, role: 'privileged_sales' }  // Only privileged_sales and admin
      },
      {
        path: 'sales/refund',
        name: 'SalesmanRefund',
        component: () => import('@/views/salesman/SaleRefund.vue'),
        meta: { requiresAuth: true, role: 'privileged_sales' }  // Only privileged_sales and admin
      },

      // ==================== ADMIN ONLY ROUTES ====================
      {
        path: 'products',
        name: 'AdminProducts',
        component: () => import('@/views/admin/Products.vue'),
        meta: { requiresAuth: true, role: 'admin' }
      },
      {
        path: 'branches',
        name: 'Branches',
        component: () => import('@/views/admin/Branches.vue'),
        meta: { requiresAuth: true, role: 'admin' }
      },
      {
        path: 'stock',
        name: 'AdminStock',
        component: () => import('@/views/admin/Stock.vue'),
        meta: { requiresAuth: true, role: 'admin' }
      },
      {
        path: 'reports',
        name: 'Reports',
        component: () => import('@/views/admin/Reports.vue'),
        meta: { requiresAuth: true, role: 'admin' }
      },
      {
        path: 'allreports',
        name: 'AllReports',
        component: () => import('@/views/admin/ComprehensiveReports.vue'),
        meta: { requiresAuth: true, role: 'admin' }
      },
      {
        path: 'alerts',
        name: 'Alerts',
        component: () => import('@/views/admin/Alerts.vue'),
        meta: { requiresAuth: true, role: 'admin' }
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/admin/Users.vue'),
        meta: { requiresAuth: true, role: 'admin' }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/admin/Settings.vue'),
        meta: { requiresAuth: true, role: 'admin' }
      },
      {
        path: 'purchases',
        name: 'AdminPurchases',
        component: () => import('@/views/admin/Purchases.vue'),
        meta: { requiresAuth: true, role: 'admin' }
      },
      {
        path: 'purchases/create',
        name: 'CreatePurchaseOrder',
        component: () => import('@/views/admin/CreatePurchaseOrder.vue'),
        meta: { requiresAuth: true, role: 'admin' }
      },
      {
        path: 'loans',
        name: 'AdminLoans',
        component: () => import('@/views/admin/Loans.vue'),
        meta: { requiresAuth: true, role: 'admin' }
      },
      {
        path: 'loans/create',
        name: 'CreateLoan',
        component: () => import('@/views/admin/CreateLoan.vue'),
        meta: { requiresAuth: true, role: 'admin' }
      },
      {
        path: 'loans/:id',
        name: 'LoanDetails',
        component: () => import('@/views/admin/LoanDetails.vue'),
        meta: { requiresAuth: true, role: 'admin' }
      },
      {
        path: 'temp-items',
        name: 'AdminTempItems',
        component: () => import('@/views/admin/TempItems.vue'),
        meta: { requiresAuth: true, role: 'admin' }
      },

      // ==================== COMMON ROUTES ====================
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/common/Profile.vue'),
        meta: { requiresAuth: true }
      }
    ]
  },
  {
    path: '/unauthorized',
    name: 'Unauthorized',
    component: () => import('@/views/common/Unauthorized.vue'),
    meta: { public: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/common/NotFound.vue'),
    meta: { public: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  }
})

// Dashboard route by role
const getDashboardRoute = (role) => {
  const map = {
    admin: '/dashboard',
    salesman: '/sales',
    privileged_sales: '/sales'
  }
  return map[role] || '/dashboard'
}

// Role check - THIS IS THE KEY FUNCTION
const hasRequiredRole = (userRole, requiredRole) => {
  if (!requiredRole) return true
  
  // Admin can access everything
  if (userRole === 'admin') return true
  
  // For 'salesman' role routes: BOTH regular salesman AND privileged_sales can access
  if (requiredRole === 'salesman') {
    return userRole === 'salesman' || userRole === 'privileged_sales'
  }
  
  // For 'privileged_sales' role routes: ONLY privileged_sales (and admin) can access
  if (requiredRole === 'privileged_sales') {
    return userRole === 'privileged_sales'
  }
  
  return userRole === requiredRole
}

// Router Guard
router.beforeEach(async (to, from, next) => {
  console.log('🔄 Navigation:', from.path, '→', to.path)

  const authStore = useAuthStore()

  // Splash always allowed
  if (to.name === 'Splash') {
    return next()
  }

  // Initialize auth FIRST
  if (!authStore.isInitialized) {
    console.log('🕒 Initializing auth...')
    await authStore.initializeAuth()

    // Fetch user if missing but token exists
    if (authStore.token && !authStore.user) {
      try {
        console.log('📡 Fetching user after init...')
        await authStore.fetchCurrentUser()
      } catch (error) {
        console.log('❌ Failed to fetch user, redirecting to login')
        return next('/login')
      }
    }
  }

  const isAuthenticated = !!authStore.token
  const userRole = authStore.userRole

  console.log('🔐 Auth state:', {
    isAuthenticated,
    userRole,
    token: !!authStore.token,
    user: !!authStore.user
  })

  // Public routes
  if (to.meta.public) {
    if (to.meta.requiresGuest && isAuthenticated) {
      return next(getDashboardRoute(userRole))
    }
    return next()
  }

  // Check token
  if (!authStore.token) {
    console.log('🚫 No token, redirecting to login')
    sessionStorage.setItem('redirectAfterLogin', to.fullPath)
    return next('/login')
  }

  // Role check
  const requiredRole = to.meta.role
  if (requiredRole && !hasRequiredRole(userRole, requiredRole)) {
    console.log(`❌ Access denied: ${userRole} cannot access ${to.path} (requires ${requiredRole})`)
    return next('/unauthorized')
  }

  console.log(`✅ Access granted: ${userRole} → ${to.path}`)
  next()
})

// Router error handler
router.onError((error) => {
  console.error('Router error:', error)
})

// Set page title after each route
router.afterEach((to) => {
  document.title = `${getPageTitle(to.name)} | Inventory System`
})

const getPageTitle = (routeName) => {
  const titles = {
    // Auth & Common
    Splash: 'Loading',
    Login: 'Sign In',
    Profile: 'My Profile',
    Unauthorized: 'Unauthorized',
    NotFound: 'Page Not Found',
    
    // Admin Routes
    AdminDashboard: 'Admin Dashboard',
    AdminProducts: 'Products Management',
    Branches: 'Branches Management',
    AdminStock: 'Stock Management',
    Reports: 'Sales Reports',
    AllReports: 'Comprehensive Reports',
    Alerts: 'Stock Alerts',
    Users: 'User Management',
    Settings: 'System Settings',
    
    // Purchase Routes
    AdminPurchases: 'Purchase Orders',
    CreatePurchaseOrder: 'Create Purchase Order',
    PurchaseOrderDetails: 'Purchase Order Details',
    
    // Loan Routes
    AdminLoans: 'Loan Management',
    CreateLoan: 'Create New Loan',
    LoanDetails: 'Loan Details',
    
    // Temp Items
    AdminTempItems: 'Pending Approvals',
    SalesmanTempItems: 'Register Item',
    
    // Salesman Routes
    SalesDashboard: 'Sales Dashboard',
    SalesPOS: 'Point of Sale',
    SalesProducts: 'Products Catalog',
    SalesmanStock: 'Stock Management',
    SalesInvoice: 'Sales Invoice',
    SalesLoans: 'Customer Loans',
    SalesCreateLoan: 'Create Customer Loan',
    SalesmanRefund: 'Process Refund'
  }
  return titles[routeName] || 'Inventory System'
}

// Log all registered routes for debugging
console.log('📋 Registered Routes:')
routes.forEach(route => {
  if (route.children) {
    route.children.forEach(child => {
      console.log(`  /${child.path} -> ${child.name} (required role: ${child.meta?.role || 'any'})`)
    })
  }
})

export default router