// router/index.js - UPDATED VERSION with checkout route
import { createRouter, createWebHistory } from "vue-router";
import { setupRouterGuards } from "@/utils/routerGuards";

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("../views/Home.vue"),
  },

  // Category routes - FIXED: Consistent naming
  {
    path: "/category/:categorySlug",
    name: "Category", // Changed from "CategoryPage" to match redirect
    component: () => import("../views/CategoryPage.vue"),
    props: route => ({
      categorySlug: route.params.categorySlug,
      page: route.query.page || 1,
      limit: route.query.limit || 12,
      sort: route.query.sort,
      search: route.query.search,
      minPrice: route.query.minPrice,
      maxPrice: route.query.maxPrice,
      sortBy: route.query.sortBy,
      sortOrder: route.query.sortOrder,
    }),
    meta: {
      title: route => `${route.params.categorySlug} Products`,
      description: route => `Browse ${route.params.categorySlug} products`,
    },
  },

  // Alternative route for explicit products endpoint (optional)
  {
    path: "/categories/:slug/products",
    name: "CategoryProducts",
    redirect: to => {
      // FIXED: Use correct route name
      return {
        name: "Category", // Changed from 'CategoryPage'
        params: { categorySlug: to.params.slug }, // Fixed param name
        query: to.query,
      };
    },
  },

  // Cart page
  {
    path: "/cart",
    name: "CartPage",
    component: () => import("../views/CartPage.vue"),
  },

  // Orders routes - UPDATED
  {
    path: "/orders/checkout",
    name: "OrderCheckout",
    component: () => import("../views/OrdersPage.vue"),
    meta: {
      requiresAuth: true,
      title: "Checkout",
    },
  },
  {
    path: "/orders/:orderId?", // ? = optional parameter
    name: "OrdersPage",
    component: () => import("../views/OrdersPage.vue"),
    props: true,
    meta: {
      requiresAuth: true,
      title: "My Orders",
    },
  },

  // Product detail page
  {
    path: "/products/:slug",
    name: "ProductDetail",
    component: () => import("../views/ProductDetail.vue"),
    props: true,
    meta: {
      title: "Product Details",
    },
  },
  // Store profile page
  {
    path: "/stores/:slug",
    name: "StoreProfile",
    component: () => import("../views/StoreProfile.vue"),
    props: true,
    meta: {
      title: "Store Profile",
    },
  },

  // Auth routes (guest only)
  {
    path: "/login",
    name: "LoginView",
    component: () => import("../views/LoginView.vue"),
    meta: {
      guest: true,
      title: "Login",
    },
  },
  {
    path: "/register",
    name: "RegisterView",
    component: () => import("../views/RegisterView.vue"),
    meta: {
      guest: true,
      title: "Register",
    },
  },

  // Protected routes
  {
    path: "/dashboard",
    name: "UserDashboard",
    component: () => import("../views/UserDashboard.vue"),
    meta: {
      requiresAuth: true,
      title: "Profile",
    },
  },
  {
    path: "/seller/dashboard",
    name: "SellerDashboard",
    component: () => import("../views/SellerDashboard.vue"),
    meta: {
      requiresAuth: true,
      role: "seller",
      title: "Seller Dashboard",
    },
  },
  {
    path: "/admin/dashboard",
    name: "AdminDashboard",
    component: () => import("../views/adminDashboard.vue"),
    meta: {
      requiresAuth: true,
      role: "admin",
      title: "Admin Dashboard",
    },
  },

  // Catch-all route for 404
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("../views/NotFound.vue"),
    meta: {
      title: "Page Not Found",
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else if (to.hash) {
      return {
        el: to.hash,
        behavior: "smooth",
      };
    } else {
      return { top: 0 };
    }
  },
});

setupRouterGuards(router);

export default router;
