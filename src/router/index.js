// router/index.js
import { createRouter, createWebHistory } from "vue-router";
import { setupRouterGuards } from "@/utils/routerGuards";

// Import Layouts
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import StandaloneLayout from "@/layouts/StandaloneLayout.vue";
import SellerLayout from "@/layouts/SellerLayout.vue";

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
          slug: route.params.productId,
        }),
        meta: { title: "Product Details" },
      },
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
  // ✅ SELLER LAYOUT (Proper SPA Structure)
  // ========================================
  {
    path: "/seller",
    component: SellerLayout,
    redirect: "/seller/dashboard",
    meta: {
      requiresAuth: true,
      role: "seller",
    },
    children: [
      {
        path: "dashboard",
        name: "SellerDashboard",
        component: () => import("@/views/seller/Dashboard.vue"),
        meta: { title: "Dashboard Overview" },
      },
      {
        path: "products",
        name: "SellerProducts",
        component: () => import("@/views/seller/Products.vue"),
        meta: { title: "Product Management" },
      },
      {
        path: "orders",
        name: "SellerOrders",
        component: () => import("@/views/seller/Orders.vue"),
        meta: { title: "Orders Dashboard" },
      },
      {
        path: "analytics",
        name: "SellerAnalytics",
        component: () => import("@/views/seller/Analytics.vue"),
        meta: { title: "Analytics & Reports" },
      },
      {
        path: "wallet",
        name: "SellerWallet",
        component: () => import("@/views/seller/Wallet.vue"),
        meta: { title: "Seller Wallet" },
      },
      {
        path: "profile",
        name: "SellerProfile",
        component: () => import("@/views/seller/Profile.vue"),
        meta: { title: "Seller Profile" },
      },
      {
        path: "settings",
        name: "SellerSettings",
        component: () => import("@/views/seller/Settings.vue"),
        meta: { title: "Settings" },
      },
    ],
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