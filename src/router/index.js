// router/index.js
import { createRouter, createWebHistory } from "vue-router";
import { setupRouterGuards } from "@/utils/routerGuards";

// Import Layouts
import DefaultLayout from "@/layouts/DefaultLayout.vue";
// import DashboardLayout from "@/layouts/DashboardLayout.vue";
// import SellerLayout from "@/layouts/SellerLayout.vue";
// import AdminLayout from "@/layouts/AdminLayout.vue";
import StandaloneLayout from "@/layouts/StandaloneLayout.vue";

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
        component: () => import("@/views/Home.vue"),
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
        path: "products/:productId",
        name: "ProductDetail",
        component: () => import("@/views/ProductDetail.vue"),
        props: route => ({
          productId: route.params.productId,
          slug: route.params.productId, // Keep slug for backward compatibility
        }),
        meta: { title: "Product Details" },
      },
      // {
      //   path: "products/:slug",
      //   name: "ProductDetail",
      //   component: () => import("@/views/ProductDetail.vue"),
      //   props: true,
      //   meta: { title: "Product Details" },
      // },
    ],
  },

  // ========================================
  // STANDALONE LAYOUT (Cart, Orders, Stores)
  // ========================================
  {
    path: "/",
    component: StandaloneLayout,
    children: [
      {
        path: "cart",
        name: "CartPage",
        component: () => import("@/views/CartPage.vue"),
        meta: { title: "Shopping Cart" },
      },
      {
        path: "orders",
        name: "OrdersPage",
        component: () => import("@/views/OrdersPage.vue"),
        props: true,
        meta: {
          requiresAuth: true,
          title: "My Orders",
        },
      },
      {
        path: "orders/checkout",
        name: "OrderCheckout",
        component: () => import("@/views/OrdersPage.vue"),
        meta: {
          requiresAuth: true,
          title: "Checkout",
        },
      },
      {
        path: "orders/:orderId",
        name: "OrderDetail",
        component: () => import("@/views/OrdersPage.vue"),
        props: true,
        meta: {
          requiresAuth: true,
          title: "Order Details",
        },
      },
      {
        path: "stores/:slug",
        name: "StoreProfile",
        component: () => import("@/views/StoreProfile.vue"),
        props: true,
        meta: { title: "Store Profile" },
      },
    ],
  },

  // ========================================
  // DASHBOARD LAYOUT (User)
  // ========================================
  // {
  //   path: "/dashboard",
  //   component: DashboardLayout,
  //   meta: {
  //     requiresAuth: true,
  //     role: "user",
  //   },
  //   children: [
  //     {
  //       path: "",
  //       name: "UserDashboard",
  //       component: () => import("@/views/UserDashboard.vue"),
  //       meta: { title: "My Dashboard" },
  //     },
  //     // Add more user dashboard routes here
  //     // {
  //     //   path: "profile",
  //     //   name: "UserProfile",
  //     //   component: () => import("@/views/dashboard/Profile.vue"),
  //     // },
  //   ],
  // },

  // ========================================
  // SELLER LAYOUT
  // ========================================
  // {
  //   path: "/seller",
  //   component: SellerLayout,
  //   meta: {
  //     requiresAuth: true,
  //     role: "seller",
  //   },
  //   children: [
  //     {
  //       path: "dashboard",
  //       name: "SellerDashboard",
  //       component: () => import("@/views/SellerDashboard.vue"),
  //       meta: { title: "Seller Dashboard" },
  //     },
  //     // Add more seller routes here
  //     // {
  //     //   path: "products",
  //     //   name: "SellerProducts",
  //     //   component: () => import("@/views/seller/Products.vue"),
  //     // },
  //   ],
  // },

  // ========================================
  // ADMIN LAYOUT
  // ========================================
  // {
  //   path: "/admin",
  //   component: AdminLayout,
  //   meta: {
  //     requiresAuth: true,
  //     role: "admin",
  //   },
  //   children: [
  //     {
  //       path: "dashboard",
  //       name: "AdminDashboard",
  //       component: () => import("@/views/AdminDashboard.vue"),
  //       meta: { title: "Admin Dashboard" },
  //     },
  //     // Add more admin routes here
  //     // {
  //     //   path: "users",
  //     //   name: "AdminUsers",
  //     //   component: () => import("@/views/admin/Users.vue"),
  //     // },
  //   ],
  // },

  // ========================================
  // 404 NOT FOUND (No Layout)
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
