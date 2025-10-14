// main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/stores/authStore'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

// ✅ QueryClient dengan built-in cache (no external persister)
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 60 * 1000, // 10 jam - lebih lama
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})



// Enhanced error handling for router and general Vue errors
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue Error:', err.message || err, 'Info:', info)
  
  // Handle router navigation errors specifically
  if (err.name === 'NavigationDuplicated' || err.message?.includes('No match for')) {
    console.warn('Router navigation issue:', err.message)
    return // Don't throw for navigation errors
  }
  
  // Log other errors but don't break the app
  console.error('Component Error Stack:', err.stack)
}

// Handle unhandled promise rejections (including router)
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason
  
  // Handle router-related promise rejections
  if (reason?.message?.includes('NavigationDuplicated') || 
      reason?.name === 'NavigationDuplicated' ||
      reason?.message?.includes('No match for')) {
    console.warn('Router Promise Rejection:', reason.message || reason)
    event.preventDefault()
    return
  }
  
  console.warn('Unhandled Promise Rejection:', reason?.message || reason)
  event.preventDefault()
})

// Setup Pinia first
app.use(pinia)

// Setup TanStack Query
app.use(VueQueryPlugin, { queryClient })

// Add router error handling before using router
router.onError((error, to, from) => {
  console.error('Router Error:', error.message, {
    to: to?.path,
    from: from?.path
  })
})

// Handle failed navigation attempts
router.beforeEach((to, from, next) => {
  // Check if route exists
  if (to.matched.length === 0) {
    console.warn('Route not found:', to.path)
    // You can redirect to 404 or handle as needed
    next('/') // Redirect to home for now
    return
  }
  
  next()
})

// Use router
app.use(router)

// Make router globally available for auth store
window.$router = router

// Initialize auth state after pinia is setup
const initApp = async () => {
  try {
    // Always initialize auth store untuk restore state dari localStorage
    const authStore = useAuthStore()
    await authStore.initialize()
    console.log('Auth initialized successfully')
  } catch (err) {
    console.warn('Auth initialization failed:', err)
  } finally {
    // Mount app regardless of auth initialization result
    app.mount('#app')
    console.log('App mounted successfully')
  }
}

// Handle router ready state
router.isReady().then(() => {
  console.log('Router is ready')
  initApp()
}).catch(err => {
  console.error('Router initialization failed:', err)
  // Still try to mount the app
  initApp()
})

export default app