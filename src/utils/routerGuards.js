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

    // ✅ CRITICAL: Wait for auth initialization FIRST
    if (!authStore.isInitialized) {
      await authStore.initialize();
    }

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
      // ✅ Check AFTER initialization
      if (!authStore.isAuthenticated) {
        console.warn("❌ Not authenticated, redirecting to login");
        return next({
          path: "/",
          query: to.path !== "/" ? { redirect: to.fullPath } : {},
        });
      }

      // ✅ Check role
      if (requiredRole) {
        const currentRole = authStore.userRole;

        if (requiredRole === "seller" && currentRole !== "seller") {
          console.warn("⛔ Access denied: Seller role required but user has:", currentRole);
          return next("/");
        }

        if (requiredRole === "admin" && currentRole !== "admin") {
          console.warn("⛔ Access denied: Admin role required but user has:", currentRole);
          return next("/");
        }
      }

      // ✅ Auto-fetch seller profile when entering seller routes
      if (authStore.isSeller && to.path.startsWith("/seller")) {
        try {
          const sellerProfileStore = useSellerProfileStore();
          if (!sellerProfileStore.profile) {
            await sellerProfileStore.fetchProfile();
          }
        } catch (err) {
          console.warn("Failed to fetch seller profile:", err);
        }
      }
      // ✅ TAMBAHAN: Auto-fetch user profile when entering user dashboard routes
      if (authStore.userRole === "user" && to.path.startsWith("/dashboard")) {
        try {
          const { useUserProfileStore } = await import("@/stores/userProfileStore");
          const userProfileStore = useUserProfileStore();

          // Force fetch jika belum ada data
          if (!userProfileStore.profile) {
            await userProfileStore.fetchProfile(true);
          }
        } catch (err) {
          console.warn("Failed to fetch user profile:", err);
        }
      }
    }

    next();
  });

  // ✅ Clear seller profile on logout
  router.afterEach((to, from) => {
    const authStore = useAuthStore();

    if (from.path?.startsWith("/seller") && !to.path.startsWith("/seller") && !authStore.isSeller) {
      try {
        const sellerProfileStore = useSellerProfileStore();
        sellerProfileStore.clearProfile();
      } catch (err) {
        console.warn("Failed to clear seller profile:", err);
      }
    }
    if (from.path?.startsWith("/dashboard") && !to.path.startsWith("/dashboard")) {
      try {
        import("@/stores/userProfileStore").then(({ useUserProfileStore }) => {
          const userProfileStore = useUserProfileStore();
          // Optional: hanya clear jika logout, biarkan cache jika hanya navigasi
          if (!authStore.isAuthenticated) {
            userProfileStore.clearProfile();
          }
        });
      } catch (err) {
        console.warn("Failed to clear user profile:", err);
      }
    }
  });
};
