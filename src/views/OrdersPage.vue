<!-- orderspage.vue -->
<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <!-- Checkout Mode -->
      <div v-if="isCheckoutMode">
        <CheckoutHeader />
        <CheckoutForm
          :cart-items="cartStore.cartItems"
          :subtotal="cartStore.subtotal"
          :discount-amount="cartStore.discountAmount"
          :applied-coupon="cartStore.appliedCoupon"
          :shipping-cost="shippingCost"
          :tax="tax"
          :total="cartStore.total"
          :is-loading="isCreatingOrder"
          @create-order="handleCreateOrder"
        />
      </div>

      <!-- Orders Listing Mode -->
      <div v-else>
        <OrdersHeader
          :active-status="activeStatus"
          :order-stats="orderStats"
          :orders="orderStore.orders"
          @status-change="handleStatusChange"
        />
        <OrdersContent
          :orders="orders"
          :current-order="currentOrder"
          :is-loading="isLoading"
          :error="error"
          :pagination="pagination"
          :active-status="activeStatus"
          @refresh="refreshOrders"
          @load-more="loadMoreOrders"
          @view-order="viewOrderDetail"
          @pay-order="handlePayOrder"
          @cancel-order="handleCancelOrder"
          @confirm-delivery="handleConfirmDelivery"
        />
      </div>

      <OrderDetailModal
        v-if="showOrderDetail && displayOrder"
        :order="displayOrder"
        :is-loading="isLoading"
        @close="showOrderDetail = false"
        @pay="handlePayOrder"
        @cancel="handleCancelOrder"
        @confirm-delivery="handleConfirmDelivery"
        @update-review="handleUpdateReview"
      />
      <PaymentPinModal
        v-if="showPaymentModal"
        :order="orderToPay"
        :is-processing="isPayingOrder"
        @confirm="processPayment"
        @cancel="showPaymentModal = false"
      />

      <ConfirmationModal
        v-if="showConfirmModal"
        :title="confirmModal.title"
        :message="confirmModal.message"
        :confirm-text="confirmModal.confirmText"
        :type="confirmModal.type"
        :is-processing="confirmModal.isProcessing"
        @confirm="confirmModal.onConfirm"
        @cancel="showConfirmModal = false"
      />
    </div>

    <CancelReasonModal
      :show="showCancelModal"
      :order="orderToCancel"
      :is-processing="isCancellingOrder"
      @confirm="handleCancelConfirm"
      @close="handleCancelClose"
    />
  </div>
</template>
<script setup>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCartStore } from "@/stores/cartStore";
import { useOrderStore } from "@/stores/orderStore";
import { useAuthStore } from "@/stores/authStore";
import { useWallet } from "@/composables/useWallet";
import { useOrderUtils } from "@/composables/useOrderUtils";

// Import components
import CheckoutHeader from "@/components/Order/CheckoutHeader.vue";
import CheckoutForm from "@/components/Order/CheckoutForm.vue";
import OrdersHeader from "@/components/Order/OrdersHeader.vue";
import OrdersContent from "@/components/Order/OrdersContent.vue";
import OrderDetailModal from "@/components/Order/OrdersDetailModal.vue";
import PaymentPinModal from "@/components/Order/PaymentPinModal.vue";
import ConfirmationModal from "@/components/Order/ConfirmationModal.vue";
import CancelReasonModal from "@/components/Order/CancelReasonModal.vue";

const props = defineProps({
  orderId: String,
});

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();
const orderStore = useOrderStore();
const orderUtils = useOrderUtils();
const authStore = useAuthStore();
const { payOrder } = useWallet();

// Reactive state
const isCheckoutMode = computed(() => route.path === "/orders/checkout");
const activeStatus = ref("all");
const showOrderDetail = ref(false);
const showPaymentModal = ref(false);
const showConfirmModal = ref(false);
const orderToPay = ref(null);
const confirmModal = ref({});
const showCancelModal = ref(false);
const orderToCancel = ref(null);
const isCancellingOrder = ref(false);
const isCreatingOrder = ref(false);
const isPayingOrder = ref(false);

// Computed properties
const orders = computed(() => orderStore.orders);
const currentOrder = computed(() => orderStore.currentOrder);
const isLoading = computed(() => orderStore.isLoading);
const error = computed(() => orderStore.error);
const pagination = computed(() => orderStore.pagination);
const orderStats = computed(() => orderStore.orderStats);
const displayOrder = computed(() => orderStore.displayOrder);

const shippingCost = computed(() => {
  if (cartStore.appliedCoupon?.freeShipping || cartStore.subtotal > 50000) return 0;
  return 10000;
});

const tax = computed(() => {
  const taxableAmount = cartStore.subtotal - cartStore.discountAmount;
  return taxableAmount * 0.08;
});

// ✅ DEBUG WATCHES
watch(
  () => orderStore.displayOrder,

  { deep: true, immediate: true }
);

watch(
  () => orderStore.selectedParcelId,

  { immediate: true }
);

const viewOrderDetail = async (order, parcel = null) => {
  try {
    if (parcel?.parcelId) {
      orderStore.setSelectedParcel(parcel.parcelId);

      // Verify it was set
    }

    await orderStore.fetchOrderById(order.id, true);
    await nextTick();

    showOrderDetail.value = true;
  } catch (error) {
    console.error("Failed to load order details:", error);
  }
};

// Other handlers (unchanged)
const handleCreateOrder = async orderData => {
  try {
    isCreatingOrder.value = true;
    const result = await orderStore.createOrder({
      paymentMethod: "shop_pay",
      address_id: orderData.addressId,
      notes: orderData.notes || "",
    });

    if (result.success) {
      await cartStore.clearCart();
      await router.push({
        name: "OrdersPage",
        query: { status: "pending" },
      });

      showConfirmModal.value = true;
      confirmModal.value = {
        title: "Order Created Successfully!",
        message: `Your order #${result.data.orderNumber} has been created. Please proceed with payment.`,
        confirmText: "View Order",
        type: "success",
        onConfirm: () => {
          showConfirmModal.value = false;
        },
      };
    } else {
      throw new Error(result.error || "Failed to create order");
    }
  } catch (error) {
    console.error("Create order error:", error);
    showConfirmModal.value = true;
    confirmModal.value = {
      title: "Error Creating Order",
      message: error.message || "Failed to create order. Please try again.",
      confirmText: "OK",
      type: "error",
      onConfirm: () => {
        showConfirmModal.value = false;
      },
    };
  } finally {
    isCreatingOrder.value = false;
  }
};

const handleStatusChange = async status => {
  activeStatus.value = status;
  await router.replace({
    name: "OrdersPage",
    query: status === "all" ? {} : { status },
  });
  await fetchOrders();
};

const handlePayOrder = order => {
  orderToPay.value = order;
  showPaymentModal.value = true;
};

const processPayment = async pinValue => {
  if (!orderToPay.value) return;

  try {
    isPayingOrder.value = true;
    const result = await payOrder(orderToPay.value.id, pinValue);

    if (result.success) {
      showPaymentModal.value = false;
      orderToPay.value = null;

      showConfirmModal.value = true;
      confirmModal.value = {
        title: "Payment Successful!",
        message: "Your payment has been processed successfully.",
        confirmText: "OK",
        type: "success",
        onConfirm: () => {
          showConfirmModal.value = false;
          refreshOrders();
        },
      };
    } else {
      if (result.error?.includes("already processed") || result.code === "PAYMENT_ALREADY_PROCESSED") {
        showPaymentModal.value = false;
        orderToPay.value = null;

        showConfirmModal.value = true;
        confirmModal.value = {
          title: "Payment Successful!",
          message: "Your payment has been processed successfully.",
          confirmText: "OK",
          type: "success",
          onConfirm: () => {
            showConfirmModal.value = false;
            refreshOrders();
          },
        };
        return;
      }

      throw new Error(result.error || "Payment failed");
    }
  } catch (error) {
    console.error("Payment error:", error);
    showConfirmModal.value = true;
    confirmModal.value = {
      title: "Payment Failed",
      message: error.message || "Payment failed. Please try again.",
      confirmText: "OK",
      type: "error",
      onConfirm: () => {
        showConfirmModal.value = false;
      },
    };
  } finally {
    isPayingOrder.value = false;
  }
};

const handleCancelOrder = order => {
  orderToCancel.value = order;
  showCancelModal.value = true;
};

const handleCancelConfirm = async cancelData => {
  const currentOrderRef = orderToCancel.value;
  const orderNumber = currentOrderRef?.orderNumber;

  try {
    isCancellingOrder.value = true;

    // ✅ FIXED: Pass reason directly, backend handles formatting
    const result = await orderStore.cancelOrder(cancelData.orderId, cancelData.reason);

    if (result.success) {
      showCancelModal.value = false;
      orderToCancel.value = null;

      showConfirmModal.value = true;
      confirmModal.value = {
        title: "Cancel Request Submitted",
        message: `Your cancellation request for order #${
          orderNumber || "Unknown"
        } has been submitted. The seller will review your request.`,
        confirmText: "OK",
        type: "success",
        onConfirm: () => {
          showConfirmModal.value = false;
        },
      };
    } else {
      throw new Error(result.error?.message || result.error || "Failed to submit cancellation request");
    }
  } catch (error) {
    console.error("Cancel order error:", error);
    showConfirmModal.value = true;
    confirmModal.value = {
      title: "Cancellation Failed",
      message: error.message || "Failed to submit cancellation request. Please try again.",
      confirmText: "OK",
      type: "error",
      onConfirm: () => {
        showConfirmModal.value = false;
      },
    };
  } finally {
    isCancellingOrder.value = false;
  }
};

const handleCancelClose = () => {
  showCancelModal.value = false;
  orderToCancel.value = null;
};

const handleConfirmDelivery = async (orderId, confirmData = {}) => {
  try {
    // Use new dynamic endpoint
    const result = await orderStore.confirmItemsDelivery(String(orderId), confirmData);

    if (result.success) {
      showConfirmModal.value = true;
      confirmModal.value = {
        title: "Delivery Confirmed!",
        message: result.message || "Items confirmed as received successfully.",
        confirmText: "OK",
        type: "success",
        onConfirm: () => {
          showConfirmModal.value = false;
        },
      };
    }
  } catch (error) {
    console.error("Confirm delivery error:", error);
    showConfirmModal.value = true;
    confirmModal.value = {
      title: "Confirmation Failed",
      message: error.message || "Failed to confirm delivery. Please try again.",
      confirmText: "OK",
      type: "error",
      onConfirm: () => {
        showConfirmModal.value = false;
      },
    };
  }
};

// Di OrdersPage.vue - tambahkan handler baru

const handleUpdateReview = async (orderId, productId, reviewData) => {
  try {
    const result = await orderStore.updateProductReview(orderId, productId, reviewData);

    if (result.success) {
      showConfirmModal.value = true;
      confirmModal.value = {
        title: "Review Updated!",
        message: "Your review has been saved successfully.",
        confirmText: "OK",
        type: "success",
        onConfirm: () => {
          showConfirmModal.value = false;
        },
      };
    }
  } catch (error) {
    console.error("Update review error:", error);
    showConfirmModal.value = true;
    confirmModal.value = {
      title: "Update Failed",
      message: error.message || "Failed to update review. Please try again.",
      confirmText: "OK",
      type: "error",
      onConfirm: () => {
        showConfirmModal.value = false;
      },
    };
  }
};

const fetchOrders = async () => {
  const params = {
    page: 1,
    limit: 10,
  };

  if (activeStatus.value !== "all") {
    params.status = activeStatus.value;
  }

  const result = await orderStore.fetchOrders(params);
  return result;
};

const refreshOrders = async () => {
  await fetchOrders();
};

const loadMoreOrders = async () => {
  if (pagination.value.hasNextPage) {
    await orderStore.loadNextPage();
  }
};

onMounted(async () => {
  if (isCheckoutMode.value) {
    if (cartStore.cartCount === 0) {
      router.push("/cart");
      return;
    }

    if (cartStore.cartItems.length === 0) {
      await cartStore.initializeCart();
    }
  } else {
    if (route.query.status) {
      activeStatus.value = route.query.status;
    }

    if (props.orderId) {
      await orderStore.fetchOrderById(props.orderId);
      showOrderDetail.value = true;
    } else {
      await fetchOrders();
    }
  }
});

watch(
  () => route.query,
  async newQuery => {
    if (newQuery.status && newQuery.status !== activeStatus.value) {
      activeStatus.value = newQuery.status;
      await fetchOrders();
    }
  },
  { immediate: true }
);

watch(
  () => route.path,
  async (newPath, oldPath) => {
    if (newPath === "/orders/checkout") {
      if (cartStore.cartCount === 0) {
        router.push("/cart");
      }
    } else if (newPath === "/orders" && oldPath !== "/orders") {
      // ✅ Only fetch if coming FROM different route (not just closing modal)
      showOrderDetail.value = false;
      if (route.query.status) {
        activeStatus.value = route.query.status;
      }
      await fetchOrders();
    }
  }
);

watch(showOrderDetail, newValue => {
  if (!newValue) {
    orderStore.clearSelectedParcel();
  }
});
</script>

<style scoped>
/* Add any specific styles here */
.animate-fade-in-down {
  animation: fadeInDown 0.6s ease-out forwards;
}

.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
