// router/index.js
import { createRouter, createWebHistory } from "vue-router";
import { setupRouterGuards } from "@/utils/routerGuards";

// Import Layouts
import DefaultLayout from "@/layouts/DefaultLayout.vue";

const routes = [
  // ========================================
  // DEFAULT LAYOUT (Navbar + Footer)
  // ========================================
  {
    path: "/",
    component: DefaultLayout,
    children: [
      { 
        path: "", 
        name: "Home", 
        component: () => import("@/views/Home.vue")
      },
      { 
        path: "category/:categorySlug",
        name: "Category", 
        component: () => import("@/views/CategoryPage.vue"),
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
        },
      },
      {
        path: "categories/:slug/products",
        name: "CategoryProducts",
        redirect: to => ({
          name: "Category",
          params: { categorySlug: to.params.slug },
          query: to.query,
        }),
      },
      { 
        path: "products/:slug", 
        name: "ProductDetail", 
        component: () => import("@/views/ProductDetail.vue"),
        props: true,
        meta: { title: "Product Details" },
      },
      {
        path: "stores/:slug",
        name: "StoreProfile",
        component: () => import("@/views/StoreProfile.vue"),
        props: true,
        meta: { title: "Store Profile" },
      },
      { 
        path: "login", 
        name: "LoginView", 
        component: () => import("@/views/LoginView.vue"),
        meta: { 
          guest: true,
          title: "Login" 
        },
      },
      { 
        path: "register", 
        name: "RegisterView", 
        component: () => import("@/views/RegisterView.vue"),
        meta: { 
          guest: true,
          title: "Register" 
        },
      },
    ],
  },

  // ========================================
  // STANDALONE PAGES (No Layout)
  // ========================================
  {
    path: "/cart",
    name: "CartPage",
    component: () => import("@/views/CartPage.vue"),
    meta: { title: "Shopping Cart" },
  },
  {
    path: "/orders",
    name: "OrdersPage",
    component: () => import("@/views/OrdersPage.vue"),
    props: true,
    meta: { 
      requiresAuth: true,
      title: "My Orders" 
    },
  },
  {
    path: "/orders/checkout",
    name: "OrderCheckout",
    component: () => import("@/views/OrdersPage.vue"),
    meta: { 
      requiresAuth: true,
      title: "Checkout" 
    },
  },
  {
    path: "/orders/:orderId",
    name: "OrderDetail",
    component: () => import("@/views/OrdersPage.vue"),
    props: true,
    meta: { 
      requiresAuth: true,
      title: "Order Details" 
    },
  },

  // ========================================
  // DASHBOARD ROUTES (Temporary - No Layout)
  // ========================================
  {
    path: "/dashboard",
    name: "UserDashboard",
    component: () => import("@/views/UserDashboard.vue"),
    meta: {
      requiresAuth: true,
      title: "My Dashboard",
    },
  },
  {
    path: "/seller/dashboard",
    name: "SellerDashboard",
    component: () => import("@/views/SellerDashboard.vue"),
    meta: {
      requiresAuth: true,
      role: "seller",
      title: "Seller Dashboard",
    },
  },
  {
    path: "/admin/dashboard",
    name: "AdminDashboard",
    component: () => import("@/views/AdminDashboard.vue"),
    meta: {
      requiresAuth: true,
      role: "admin",
      title: "Admin Dashboard",
    },
  },

  // ========================================
  // 404 NOT FOUND
  // ========================================
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/NotFound.vue"),
    meta: { title: "Page Not Found" },
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