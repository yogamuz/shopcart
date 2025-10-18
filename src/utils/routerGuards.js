// utils/routerGuards.js - FIXED VERSION
import { useAuthStore } from "@/stores/authStore";
import { useSellerProfileStore } from "@/stores/sellerProfileStore";

const getDefaultRouteForRole = role => {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "seller":
      return "/seller/dashboard";
    case "user":
    default:
      return "/dashboard";
  }
};

export const setupRouterGuards = router => {
  router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();

    // Check route meta properties
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const isGuestRoute = to.matched.some(record => record.meta.guest);
    const requiredRole = to.matched.find(record => record.meta.role)?.meta.role;

    // Handle guest-only routes (login, register)
    if (isGuestRoute) {
      if (authStore.isAuthenticated) {
        const redirectPath = getDefaultRouteForRole(authStore.userRole);
        return next(redirectPath);
      }
      return next();
    }

    // Handle routes that require authentication
    if (requiresAuth) {
      if (!authStore.isAuthenticated) {
        return next({
          path: "/login",
          query: to.path !== "/" ? { redirect: to.fullPath } : {},
        });
      }

      // ✅ FIXED: Wait for auth initialization to complete before role check
      if (authStore.isInitializing) {
        await new Promise(resolve => {
          const checkInterval = setInterval(() => {
            if (!authStore.isInitializing) {
              clearInterval(checkInterval);
              resolve();
            }
          }, 50);
          
          // Timeout after 3 seconds
          setTimeout(() => {
            clearInterval(checkInterval);
            resolve();
          }, 3000);
        });
      }

      // ✅ FIXED: Add extra delay for mobile to ensure token propagation
      const isMobile = window.innerWidth <= 768;
      if (isMobile && authStore.user?.accessToken) {
        await new Promise(resolve => setTimeout(resolve, 150));
      }

      // ✅ Auto-fetch seller profile when entering seller dashboard
      if (authStore.isSeller && to.path.startsWith("/seller")) {
        try {
          const sellerProfileStore = useSellerProfileStore();

          // Fetch profile if not already loaded or cache is stale
          if (!sellerProfileStore.profile || sellerProfileStore.error) {
            await sellerProfileStore.fetchProfile();
          }
        } catch (err) {
          console.warn("Failed to fetch seller profile:", err);
          // Don't block navigation - let component handle missing profile
        }
      }

      // ✅ FIXED: Better role checking with retry logic
      if (requiredRole) {
        const maxRetries = 3;
        let currentRole = authStore.userRole;
        let retryCount = 0;

        // Retry if role is still null (token might not be fully propagated)
        while (!currentRole && retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 100));
          currentRole = authStore.userRole;
          retryCount++;
        }

        // ✅ FIXED: Only block if we're sure role mismatch after retries
        if (requiredRole === "seller" && currentRole !== "seller") {
          console.warn("⛔ Access denied: Seller role required but user has:", currentRole);
          return next("/");
        }

        if (requiredRole === "admin" && currentRole !== "admin") {
          console.warn("⛔ Access denied: Admin role required but user has:", currentRole);
          return next("/");
        }

        if (requiredRole === "user" && !authStore.isAuthenticated) {
          return next("/login");
        }
      }
    }

    next();
  });

  // ✅ Clear seller profile on navigation away from seller routes
  router.afterEach((to, from) => {
    const authStore = useAuthStore();

    // If leaving seller dashboard and not a seller anymore (e.g., after logout)
    if (from.path?.startsWith("/seller") && !to.path.startsWith("/seller") && !authStore.isSeller) {
      try {
        const sellerProfileStore = useSellerProfileStore();
        sellerProfileStore.clearProfile();
      } catch (err) {
        console.warn("Failed to clear seller profile:", err);
      }
    }
  });
};