// utils/routerGuards.js - UPDATED with seller profile fetch
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

      // ✅ Auto-fetch seller profile when entering seller dashboard
      if (authStore.isSeller && to.path.startsWith("/seller")) {
        try {
          const sellerProfileStore = useSellerProfileStore();

          // Fetch profile if not already loaded or cache is stale
          if (!sellerProfileStore.profile || sellerProfileStore.error) {
            console.log("Auto-fetching seller profile for dashboard access");
            await sellerProfileStore.fetchProfile();
          }
        } catch (err) {
          console.warn("Failed to fetch seller profile:", err);
          // Don't block navigation - let component handle missing profile
        }
      }

      // Check role-specific access
      if (requiredRole) {
        // ✅ STRICT: Hanya seller yang boleh
        if (requiredRole === "seller" && authStore.userRole !== "seller") {
          return next("/");
        }

        if (requiredRole === "admin" && authStore.userRole !== "admin") {
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
        console.log("Cleared seller profile on navigation away from seller dashboard");
      } catch (err) {
        console.warn("Failed to clear seller profile:", err);
      }
    }
  });
};
