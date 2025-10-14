<!-- OrderDetailModal.vue - Grouped by Seller -->
<template>
  <div
    v-if="orderWithCancelStatus"
    class="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 modal-backdrop"
  >
    <div class="bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto" @click.stop>
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-semibold text-gray-900">Order Details #{{ orderWithCancelStatus.orderNumber }}</h2>
            <p class="text-sm text-gray-500 mt-1">Order ID: {{ orderWithCancelStatus.id.slice(-12) }}</p>
          </div>
          <button @click="$emit('close')" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="p-8 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p class="text-gray-600 mt-4">Loading order details...</p>
      </div>

      <!-- Order Details Content -->
      <div v-else class="p-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Left Column: Order Info -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Order Items Grouped by Seller -->
            <div>
              <h3 class="font-semibold text-gray-900 mb-4">
                Order Items ({{ getTotalItemsCount(orderWithCancelStatus) }})
              </h3>

              <!-- Loop through parcels (grouped by seller) -->
              <div class="space-y-6">
                <div
                  v-for="parcel in orderWithCancelStatus.parcels"
                  :key="parcel.parcelId"
                  class="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <!-- Seller Header -->
                  <div class="bg-gradient-to-r from-blue-50 to-cyan-50 px-4 py-3 border-b border-gray-200">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center space-x-2">
                        <img
                          v-if="parcel.seller?.storeLogo"
                          :src="parcel.seller.storeLogo"
                          :alt="parcel.seller.storeName"
                          class="w-6 h-6 rounded-full object-cover border border-gray-300"
                          @error="e => (e.target.src = '')"
                        />
                        <Store v-else :size="20" class="text-blue-600" />
                        <span class="font-semibold text-gray-900">{{
                          parcel.seller?.storeName || "Unknown Store"
                        }}</span>
                      </div>
                      <OrderStatusBadge :status="parcel.status" :size="'sm'" />
                    </div>

                    <!-- Parcel Info -->
                    <div class="mt-2 text-xs text-gray-600 space-y-1">
                      <div v-if="parcel.trackingNumber" class="flex items-center">
                        <span class="font-medium">Tracking:</span>
                        <span class="ml-2 font-mono">{{ parcel.trackingNumber }}</span>
                      </div>
                      <div v-if="parcel.courier" class="flex items-center">
                        <span class="font-medium">Courier:</span>
                        <span class="ml-2">{{ parcel.courier }}</span>
                      </div>
                      <div v-if="parcel.estimatedDelivery" class="flex items-center">
                        <span class="font-medium">Est. Delivery:</span>
                        <span class="ml-2">{{ formatDate(parcel.estimatedDelivery) }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Parcel Items -->
                  <div class="bg-white divide-y divide-gray-100">
                    <div
                      v-for="item in parcel.items"
                      :key="getItemKey(item)"
                      class="flex items-center p-4 hover:bg-gray-50 transition-colors"
                    >
                      <img
                        :src="getItemImage(item)"
                        :alt="getItemName(item)"
                        class="w-16 h-16 rounded-lg object-cover mr-4 border border-gray-200"
                        @error="handleImageError"
                      />
                      <div class="flex-1">
                        <h4 class="font-medium text-gray-900">
                          {{ getItemName(item) }}
                        </h4>
                        <div class="flex items-center space-x-2 mt-1">
                          <p class="text-sm text-gray-500">
                            {{ formatCurrency(getItemPrice(item)) }} x {{ item.quantity }}
                          </p>
                        </div>

                        <div v-if="item.discountApplied" class="text-xs text-green-600 mt-1">
                          Discount: {{ item.discountApplied.couponCode }}
                        </div>

                        <!-- Show Review if Already Submitted OR Add Review Button -->
                        <div v-if="item.status === 'delivered' || item.status === 'received'" class="mt-2">
                          <!-- Existing Review Display -->
                          <div
                            v-if="hasExistingReview(item) && !isEditingReview(item)"
                            class="p-2 bg-green-50 rounded border border-green-200"
                          >
                            <div class="flex items-center justify-between mb-1">
                              <div class="flex items-center">
                                <svg
                                  class="w-3 h-3 text-green-600 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M5 13l4 4L19 7"
                                  ></path>
                                </svg>
                                <span class="text-xs font-semibold text-green-800">Received</span>
                              </div>
                              <button
                                @click="startEditReview(item)"
                                class="text-xs text-blue-600 hover:text-blue-700 font-medium"
                              >
                                Edit Review
                              </button>
                            </div>
                            <div v-if="item.customerFeedback?.rating" class="flex items-center mb-1">
                              <div class="flex text-yellow-400 mr-1">
                                <svg
                                  v-for="i in 5"
                                  :key="i"
                                  :class="i <= item.customerFeedback.rating ? 'text-yellow-400' : 'text-gray-300'"
                                  class="w-3 h-3"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                                  />
                                </svg>
                              </div>
                              <span class="text-xs text-gray-700">{{ item.customerFeedback.rating }}/5</span>
                            </div>
                            <p v-if="item.customerFeedback?.review" class="text-xs text-gray-700">
                              {{ truncateText(item.customerFeedback.review, 200) }}
                            </p>
                          </div>

                          <button
                            v-else-if="!isEditingReview(item) && canConfirmItem(item)"
                            @click="
                              debugItemStructure(item);
                              confirmSingleProduct(item);
                            "
                            class="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 font-medium"
                          >
                            Confirm Received
                          </button>

                          <button
                            v-else-if="!isEditingReview(item) && item.status === 'received'"
                            @click="startEditReview(item)"
                            class="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                          >
                            {{ hasExistingReview(item) ? "Edit Review" : "Add Review" }}
                          </button>

                          <!-- Review Edit Form -->
                          <div
                            v-if="isEditingReview(item)"
                            class="p-3 bg-blue-50 rounded-lg border border-blue-200 space-y-3"
                          >
                            <div class="flex items-center justify-between">
                              <span class="text-xs font-semibold text-blue-900"
                                >{{ hasExistingReview(item) ? "Edit" : "Add" }} Review</span
                              >
                              <button @click="cancelEditReview(item)" class="text-xs text-gray-500 hover:text-gray-700">
                                Cancel
                              </button>
                            </div>

                            <!-- Star Rating -->
                            <div>
                              <label class="text-xs text-gray-700 block mb-1">Rating (optional)</label>
                              <div class="flex space-x-1">
                                <button
                                  v-for="star in 5"
                                  :key="star"
                                  @click="setReviewRating(item, star)"
                                  type="button"
                                  class="focus:outline-none transition-colors"
                                >
                                  <svg
                                    :class="
                                      star <= (getEditingReview(item)?.rating || 0)
                                        ? 'text-yellow-400'
                                        : 'text-gray-300'
                                    "
                                    class="w-6 h-6"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </div>

                            <!-- Review Text -->
                            <div>
                              <label class="text-xs text-gray-700 block mb-1"
                                >Review (optional, min 10 characters)</label
                              >
                              <textarea
                                :value="getEditingReview(item)?.review || ''"
                                @input="updateEditingReview(item, $event.target.value)"
                                placeholder="Share your experience with this product..."
                                rows="3"
                                class="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                maxlength="1000"
                              ></textarea>
                              <div class="text-xs text-gray-500 mt-1 text-right">
                                {{ getEditingReview(item)?.review?.length || 0 }}/1000
                              </div>
                            </div>

                            <!-- Submit Button -->
                            <button
                              v-if="item.status === 'received'"
                              @click="submitReviewUpdate(item)"
                              :disabled="isSubmittingReview"
                              class="w-full text-xs px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {{
                                isSubmittingReview
                                  ? "Saving..."
                                  : hasExistingReview(item)
                                  ? "Update Review"
                                  : "Save Review"
                              }}
                            </button>

                            <button
                              v-else
                              @click="confirmSingleProduct(item)"
                              :disabled="isSubmittingReview"
                              class="w-full text-xs px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {{ isSubmittingReview ? "Confirming..." : "Confirm & Save Review" }}
                            </button>
                          </div>
                        </div>
                      </div>
                      <div class="text-right">
                        <div class="font-semibold text-gray-900">
                          {{ formatCurrency(item.subtotal || getItemPrice(item) * item.quantity) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Shipping Address -->
            <div v-if="orderWithCancelStatus.shippingAddress">
              <h3 class="font-semibold text-gray-900 mb-4">Shipping Address</h3>
              <div class="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div class="space-y-1 text-sm">
                  <div class="font-medium text-gray-900">
                    {{ orderWithCancelStatus.shippingAddress.recipientName }}
                  </div>
                  <div class="text-gray-700">{{ orderWithCancelStatus.shippingAddress.street || "N/A" }}</div>
                  <div class="text-gray-700">
                    {{ orderWithCancelStatus.shippingAddress.city || ""
                    }}{{
                      orderWithCancelStatus.shippingAddress.city && orderWithCancelStatus.shippingAddress.state
                        ? ", "
                        : ""
                    }}{{ orderWithCancelStatus.shippingAddress.state || "" }}
                    {{
                      orderWithCancelStatus.shippingAddress.postalCode ||
                      orderWithCancelStatus.shippingAddress.zipCode ||
                      ""
                    }}
                  </div>
                  <div class="text-gray-700">{{ orderWithCancelStatus.shippingAddress.country || "N/A" }}</div>
                  <div v-if="orderWithCancelStatus.shippingAddress.phone" class="text-gray-600 mt-2">
                    📞 {{ orderWithCancelStatus.shippingAddress.phone }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Order Timeline -->
            <div v-if="orderWithCancelStatus.timestamps">
              <h3 class="font-semibold text-gray-900 mb-4">Order Timeline</h3>
              <div class="relative">
                <div class="absolute left-1 top-0 bottom-0 w-0.5 bg-gray-300"></div>

                <div class="space-y-4">
                  <div
                    class="relative flex items-center"
                    v-if="orderWithCancelStatus.timestamps.createdAt || orderWithCancelStatus.createdAt"
                  >
                    <div class="w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-sm z-10 relative"></div>
                    <div class="flex-1 ml-4">
                      <span class="text-sm font-medium">Order Placed</span>
                      <div class="text-xs text-gray-500">
                        {{ formatDate(orderWithCancelStatus.timestamps.createdAt || orderWithCancelStatus.createdAt) }}
                      </div>
                    </div>
                  </div>

                  <div class="relative flex items-center" v-if="orderWithCancelStatus.timestamps.paidAt">
                    <div class="w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm z-10 relative"></div>
                    <div class="flex-1 ml-4">
                      <span class="text-sm font-medium">Payment Confirmed</span>
                      <div class="text-xs text-gray-500">
                        {{ formatDate(orderWithCancelStatus.timestamps.paidAt) }}
                      </div>
                    </div>
                  </div>

                  <div class="relative flex items-center" v-if="orderWithCancelStatus.timestamps.packedAt">
                    <div class="w-3 h-3 bg-yellow-500 rounded-full border-2 border-white shadow-sm z-10 relative"></div>
                    <div class="flex-1 ml-4">
                      <span class="text-sm font-medium">Order Packed</span>
                      <div class="text-xs text-gray-500">
                        {{ formatDate(orderWithCancelStatus.timestamps.packedAt) }}
                      </div>
                    </div>
                  </div>

                  <div class="relative flex items-center" v-if="orderWithCancelStatus.timestamps.shippedAt">
                    <div class="w-3 h-3 bg-purple-500 rounded-full border-2 border-white shadow-sm z-10 relative"></div>
                    <div class="flex-1 ml-4">
                      <span class="text-sm font-medium">Order Shipped</span>
                      <div class="text-xs text-gray-500">
                        {{ formatDate(orderWithCancelStatus.timestamps.shippedAt) }}
                      </div>
                    </div>
                  </div>

                  <div class="relative flex items-center" v-if="orderWithCancelStatus.timestamps.deliveredAt">
                    <div class="w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm z-10 relative"></div>
                    <div class="flex-1 ml-4">
                      <span class="text-sm font-medium">Order Delivered</span>
                      <div class="text-xs text-gray-500">
                        {{ formatDate(orderWithCancelStatus.timestamps.deliveredAt) }}
                      </div>
                    </div>
                  </div>

                  <div class="relative flex items-center" v-if="orderWithCancelStatus.timestamps.receivedAt">
                    <div
                      class="w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm z-10 relative"
                    ></div>
                    <div class="flex-1 ml-4">
                      <span class="text-sm font-medium">Order Received</span>
                      <div class="text-xs text-gray-500">
                        {{ formatDate(orderWithCancelStatus.timestamps.receivedAt) }}
                      </div>
                    </div>
                  </div>

                  <div class="relative flex items-center" v-if="orderWithCancelStatus.timestamps.cancelledAt">
                    <div class="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-sm z-10 relative"></div>
                    <div class="flex-1 ml-4">
                      <span class="text-sm font-medium">Order Cancelled</span>
                      <div class="text-xs text-gray-500">
                        {{ formatDate(orderWithCancelStatus.timestamps.cancelledAt) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Order Notes -->
            <div v-if="orderWithCancelStatus.notes">
              <h3 class="font-semibold text-gray-900 mb-3">Order Notes</h3>
              <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p class="text-gray-700">{{ orderWithCancelStatus.notes }}</p>
              </div>
            </div>

            <!-- Cancel Request Status -->
            <div v-if="hasCancelRequest(orderWithCancelStatus)" class="mt-6">
              <h3 class="font-semibold text-gray-900 mb-3">Cancel Request Status</h3>
              <div class="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div class="flex items-center mb-2">
                  <svg class="w-4 h-4 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <span class="text-sm font-medium text-orange-800">Waiting for seller approval</span>
                </div>
                <div class="space-y-2 text-sm">
                  <div>
                    <span class="text-gray-600">Reason:</span>
                    <span class="ml-2 text-gray-900">{{ getCancelRequestReason(orderWithCancelStatus) }}</span>
                  </div>
                  <div v-if="orderWithCancelStatus.cancelRequest?.submittedAt">
                    <span class="text-gray-600">Requested on:</span>
                    <span class="ml-2 text-gray-900">{{
                      formatDate(orderWithCancelStatus.cancelRequest.submittedAt)
                    }}</span>
                  </div>
                </div>
                <p class="text-xs text-orange-700 mt-2">Your cancellation request is being reviewed by the seller.</p>
              </div>
            </div>

            <!-- Your Review - Show per item reviews -->
            <div v-if="reviewedItems.length > 0" class="mt-6">
              <h3 class="font-semibold text-gray-900 mb-3">Your Reviews</h3>
              <div class="space-y-4">
                <div
                  v-for="item in reviewedItems"
                  :key="getItemKey(item)"
                  class="p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div class="flex items-start justify-between mb-2">
                    <div class="flex items-center space-x-2">
                      <img
                        :src="getItemImage(item)"
                        :alt="getItemName(item)"
                        class="w-8 h-8 rounded object-cover border border-gray-200"
                        @error="handleImageError"
                      />
                      <div>
                        <span class="text-sm font-medium text-gray-900">{{ getItemName(item) }}</span>
                        <div class="text-xs text-gray-500 mt-1">
                          From: {{ item.seller?.storeName || "Unknown Store" }}
                        </div>
                      </div>
                    </div>
                    <button
                      @click="startEditReview(item)"
                      class="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Edit Review
                    </button>
                  </div>

                  <div class="flex items-center mb-2">
                    <div class="flex text-yellow-400 mr-2">
                      <svg
                        v-for="i in 5"
                        :key="i"
                        :class="i <= item.customerFeedback.rating ? 'text-yellow-400' : 'text-gray-300'"
                        class="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                        />
                      </svg>
                    </div>
                    <span class="text-sm font-medium">{{ item.customerFeedback.rating }}/5</span>
                  </div>
                  <p class="text-sm text-gray-700">
                    {{ truncateText(item.customerFeedback.review, 200) }}
                  </p>
                  <div class="text-xs text-gray-500 mt-2">
                    Reviewed on
                    {{
                      formatDate(
                        item.customerFeedback.submittedAt ||
                          item.customerFeedback.updatedAt ||
                          orderWithCancelStatus.timestamps?.deliveredAt
                      )
                    }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Summary & Actions -->
          <div class="space-y-6">
            <!-- Order Summary -->
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 class="font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Status</span>
                  <OrderStatusBadge
                    :status="orderWithCancelStatus.status"
                    :hasCancelRequest="hasCancelRequest(orderWithCancelStatus)"
                  />
                </div>

                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Payment</span>
                  <PaymentStatusBadge :status="orderWithCancelStatus.paymentStatus" />
                </div>

                <div v-if="hasCancelRequest(orderWithCancelStatus)" class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Cancel Request</span>
                  <span class="text-sm font-medium text-orange-600">Pending Approval</span>
                </div>

                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Order Date</span>
                  <span class="text-sm">{{ formatDate(orderWithCancelStatus.createdAt) }}</span>
                </div>
                <div
                  v-if="orderWithCancelStatus.paymentStatus === 'pending' && orderWithCancelStatus.expiresAt"
                  class="flex justify-between items-center"
                >
                  <span class="text-sm text-gray-600">Payment Expires</span>
                  <span class="text-sm font-medium text-orange-600" :key="currentTime">
                    {{ getTimeUntilExpiry(orderWithCancelStatus) }}
                  </span>
                </div>

                <div class="border-t pt-3 space-y-2">
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">Subtotal:</span>
                    <span class="text-sm">{{
                      formatCurrency(orderWithCancelStatus.subtotal || orderWithCancelStatus.totalAmount)
                    }}</span>
                  </div>

                  <div v-if="orderWithCancelStatus.discountAmount > 0" class="flex justify-between text-green-600">
                    <span class="text-sm">Discount:</span>
                    <span class="text-sm">-{{ formatCurrency(orderWithCancelStatus.discountAmount) }}</span>
                  </div>

                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">Shipping:</span>
                    <span class="text-sm">{{
                      orderWithCancelStatus.shippingCost > 0
                        ? formatCurrency(orderWithCancelStatus.shippingCost)
                        : "Free"
                    }}</span>
                  </div>

                  <div class="flex justify-between items-center pt-2 border-t">
                    <span class="font-semibold text-gray-900">Total Amount</span>
                    <span class="text-lg font-bold text-gray-900">{{
                      formatCurrency(orderWithCancelStatus.totalAmount)
                    }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Payment Information -->
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200" v-if="orderWithCancelStatus.paymentInfo">
              <h3 class="font-semibold text-gray-900 mb-4">Payment Information</h3>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Method</span>
                  <span class="text-sm font-medium">{{ orderWithCancelStatus.paymentInfo.method }}</span>
                </div>
                <div class="flex justify-between items-start" v-if="orderWithCancelStatus.paymentInfo.transactionId">
                  <span class="text-sm text-gray-600 flex-shrink-0 mr-2">Transaction ID</span>
                  <span class="text-sm font-mono text-right break-all">{{
                    orderWithCancelStatus.paymentInfo.transactionId
                  }}</span>
                </div>
                <div class="flex justify-between" v-if="orderWithCancelStatus.paymentInfo.paidAt">
                  <span class="text-sm text-gray-600">Paid At</span>
                  <span class="text-sm">{{ formatDate(orderWithCancelStatus.paymentInfo.paidAt) }}</span>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="space-y-3">
              <button
                v-if="canPayOrder(orderWithCancelStatus)"
                @click="$emit('pay', orderWithCancelStatus)"
                class="w-full px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                Pay Now
              </button>

              <button
                v-if="canCancelOrder(orderWithCancelStatus) && !hasCancelRequest(orderWithCancelStatus)"
                @click="$emit('cancel', orderWithCancelStatus)"
                class="w-full px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Cancel
              </button>
              <button
                v-if="hasAnyDeliverableItems"
                @click="
                  console.log('🔵 Confirm All button clicked');
                  handleConfirmAllDelivered();
                "
                class="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Confirm All Received
              </button>

              <button
                @click="$emit('close')"
                class="w-full px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- No Order State -->
      <div v-if="!isLoading && !orderWithCancelStatus" class="p-8 text-center">
        <p class="text-gray-600">No order details available.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, ref, reactive, onMounted, onUnmounted } from "vue";
import { Store } from "lucide-vue-next";
import OrderStatusBadge from "./OrderStatusBadge.vue";
import PaymentStatusBadge from "./PaymentStatusBadge.vue";

const props = defineProps({
  order: {
    type: Object,
    default: null,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "pay", "cancel", "confirm-delivery", "update-review"]);

// State for editing reviews
const editingReview = reactive({});
const isSubmittingReview = ref(false);
const currentTime = ref(Date.now());
const preservedOrderData = computed(() => {
  if (!props.order) return null;
  return {
    expiresAt: props.order.expiresAt,
    paymentStatus: props.order.paymentStatus,
    createdAt: props.order.createdAt,
    orderNumber: props.order.orderNumber,
  };
});

const orderWithCancelStatus = computed(() => {
  if (!props.order) return null;

  // ✅ FIX: Jika pending payment DAN sudah di-normalize dengan benar, langsung return
  if (props.order.paymentStatus === "pending" && props.order.parcels) {
    // Jika parcels sudah ada dari store (sudah di-normalize), langsung pakai
    if (props.order.parcels.length === 1 && props.order.parcels[0].parcelId === "merged-pending") {
      return {
        ...props.order,
        expiresAt: preservedOrderData.value.expiresAt, // ✅ PRESERVE
      };
    }

    // ✅ HANYA merge jika ada > 1 parcel (belum di-normalize)
    if (props.order.parcels.length > 1) {
      const uniqueSellers = new Set(props.order.parcels.map(p => p.seller?.storeName));

      if (uniqueSellers.size === 1) {
        const firstSeller = props.order.sellers?.[0] || props.order.parcels[0].seller;
        const allItems = props.order.parcels.flatMap(p => p.items);

        return {
          ...props.order,
          expiresAt: preservedOrderData.value.expiresAt, // ✅ PRESERVE
          parcels: [
            {
              parcelId: "merged-pending",
              seller: {
                storeName: firstSeller.storeName,
                storeLogo: firstSeller.storeLogo,
                storeSlug: firstSeller.storeSlug,
              },
              status: "pending",
              items: allItems,
              canTrack: false,
              canCancel: true,
              canConfirmDelivery: false,
              subtotal: props.order.totalAmount,
            },
          ],
        };
      } else {
        const allItems = props.order.parcels.flatMap(p => p.items);

        return {
          ...props.order,
          expiresAt: preservedOrderData.value.expiresAt, // ✅ PRESERVE
          parcels: [
            {
              parcelId: "merged-pending",
              seller: {
                storeName: "Multiple Sellers",
                storeLogo: null,
                storeSlug: null,
              },
              status: "pending",
              items: allItems,
              canTrack: false,
              canCancel: true,
              canConfirmDelivery: false,
              subtotal: props.order.totalAmount,
            },
          ],
        };
      }
    }
  }

  // ✅ Paid orders atau single parcel - return as is
  return props.order;
});

// REPLACE helper hasExistingReview (sekitar line 460)
const hasExistingReview = item => {
  // ✅ FIX: Proper validation
  if (!item.customerFeedback) return false;

  const hasRating = item.customerFeedback.rating && item.customerFeedback.rating > 0;
  const hasReview = item.customerFeedback.review && item.customerFeedback.review.trim().length > 0;

  return hasRating || hasReview;
};

const isEditingReview = item => {
  const key = getItemKey(item);
  return !!editingReview[key];
};

const getEditingReview = item => {
  const key = getItemKey(item);
  return editingReview[key];
};

const updateEditingReview = (item, reviewText) => {
  const key = getItemKey(item);
  if (editingReview[key]) {
    editingReview[key].review = reviewText;
  }
};

// Start editing review for an item
const startEditReview = item => {
  const key = getItemKey(item);
  editingReview[key] = {
    rating: item.customerFeedback?.rating || 0,
    review: item.customerFeedback?.review || "",
  };
};

// Cancel editing review
const cancelEditReview = item => {
  const key = getItemKey(item);
  delete editingReview[key];
};

// Set rating for review
const setReviewRating = (item, rating) => {
  const key = getItemKey(item);
  if (editingReview[key]) {
    editingReview[key].rating = rating;
  } else {
    editingReview[key] = { rating, review: "" };
  }
};

const submitReviewUpdate = async item => {
  const key = getItemKey(item);
  const reviewData = editingReview[key];

  if (!reviewData) return;

  // Validate review if provided
  if (reviewData.review && reviewData.review.trim().length > 0) {
    if (reviewData.review.trim().length < 10) {
      alert("Review must be at least 10 characters");
      return;
    }
  }

  // Validate that at least rating or review is provided
  if (reviewData.rating === 0 && (!reviewData.review || reviewData.review.trim().length === 0)) {
    alert("Please provide either a rating or review");
    return;
  }

  try {
    isSubmittingReview.value = true;

    const feedbackData = {};
    if (reviewData.rating > 0) {
      feedbackData.rating = reviewData.rating;
    }
    if (reviewData.review && reviewData.review.trim().length >= 10) {
      feedbackData.review = reviewData.review.trim();
    }

    console.log("📝 Submitting review update:", {
      orderId: orderWithCancelStatus.value.id,
      productId: item.productId,
      feedbackData,
    });

    // Emit update-review event (untuk existing review)
    emit("update-review", orderWithCancelStatus.value.id, item.productId, feedbackData);

    // Close edit form
    delete editingReview[key];
  } catch (error) {
    console.error("Error updating review:", error);
    alert("Failed to update review. Please try again.");
  } finally {
    isSubmittingReview.value = false;
  }
};

// REPLACE entire function
const handleConfirmAllDelivered = () => {
  // ✅ FIX: Only confirm items with status "delivered"
  if (!orderWithCancelStatus.value?.parcels) {
    console.error("❌ No parcels found in order");
    return;
  }

  // Extract all delivered items across all parcels
  const deliveredProductIds = [];

  orderWithCancelStatus.value.parcels.forEach(parcel => {
    parcel.items.forEach(item => {
      if (item.status === "delivered") {
        // Extract productId correctly
        let productId = null;
        if (item.productId) {
          productId = item.productId;
        } else if (item.product) {
          if (typeof item.product === "string") {
            productId = item.product;
          } else if (item.product._id) {
            productId = item.product._id;
          } else if (item.product.id) {
            productId = item.product.id;
          }
        }

        if (productId) {
          deliveredProductIds.push(productId);
        }
      }
    });
  });

  if (deliveredProductIds.length === 0) {
    alert("No delivered items found to confirm");
    return;
  }

  console.log("🔍 Confirming all delivered items:", deliveredProductIds);

  // Send specific productIds instead of empty object
  emit("confirm-delivery", orderWithCancelStatus.value.id, {
    productIds: deliveredProductIds,
  });
};
// ✅ NEW: Debug helper to inspect item structure
const debugItemStructure = item => {
  console.log("🔍 Item Structure Debug:", {
    hasProductId: !!item.productId,
    productIdValue: item.productId,
    hasProduct: !!item.product,
    productValue: item.product,
    productType: typeof item.product,
    fullItem: item,
  });
};

const confirmSingleProduct = async item => {
  const key = getItemKey(item);
  const reviewData = editingReview[key];

  // ✅ FIX: Extract correct productId from item
  let productId = null;
  if (item.productId) {
    productId = item.productId;
  } else if (item.product) {
    if (typeof item.product === "string") {
      productId = item.product;
    } else if (item.product._id) {
      productId = item.product._id;
    } else if (item.product.id) {
      productId = item.product.id;
    }
  }

  if (!productId) {
    console.error("❌ Cannot extract productId from item:", item);
    alert("Failed to identify product. Please try again.");
    return;
  }

  console.log("🔍 Confirming product:", {
    extractedProductId: productId,
    itemKey: key,
    itemData: item,
  });

  if (!reviewData) {
    // Confirm without review
    emit("confirm-delivery", orderWithCancelStatus.value.id, {
      productIds: [productId], // ✅ Use extracted productId
    });
    return;
  }

  // Validate
  if (reviewData.review && reviewData.review.trim().length > 0) {
    if (reviewData.review.trim().length < 10) {
      alert("Review must be at least 10 characters");
      return;
    }
  }

  try {
    isSubmittingReview.value = true;

    const feedbackData = {
      productIds: [productId], // ✅ Use extracted productId
    };

    if (reviewData.rating > 0) {
      feedbackData.rating = reviewData.rating;
    }
    if (reviewData.review && reviewData.review.trim().length >= 10) {
      feedbackData.review = reviewData.review.trim();
    }

    console.log("📝 Confirming product with review:", feedbackData);

    emit("confirm-delivery", orderWithCancelStatus.value.id, feedbackData);

    delete editingReview[key];
  } catch (error) {
    console.error("Error confirming product:", error);
    alert("Failed to confirm product. Please try again.");
  } finally {
    isSubmittingReview.value = false;
  }
};
// Di OrderDetailModal.vue watch
watch(
  () => props.order,
  newOrder => {
    if (newOrder?.parcels) {
      console.log("📦 CHECKING REVIEWS:");
      newOrder.parcels.forEach((parcel, idx) => {
        console.log(`Parcel ${idx}:`, parcel.parcelId);
        parcel.items.forEach(item => {
          console.log(`  - ${item.productName}:`, {
            status: item.status,
            customerFeedback: item.customerFeedback, // ← Harus ada data
            hasReview: hasExistingReview(item),
          });
        });
      });
    }
  },
  { deep: true, immediate: true }
);

const formatCurrency = amount => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = dateString => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const truncateText = (text, maxLength = 200) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

const getTotalItemsCount = order => {
  if (!order.parcels) return 0;
  return order.parcels.reduce((total, parcel) => total + parcel.items.length, 0);
};

const getItemKey = item => {
  // ✅ FIX: Consistent product ID extraction
  if (item.productId) return item.productId.toString();
  if (item.product) {
    if (typeof item.product === "string") return item.product;
    if (item.product._id) return item.product._id.toString();
    if (item.product.id) return item.product.id.toString();
  }
  if (item._id) return item._id.toString();
  if (item.id) return item.id.toString();
  return Math.random().toString(); // Fallback
};

const getItemImage = item => {
  if (item.productImage) return item.productImage;
  if (item.product?.images?.[0]) {
    const image = item.product.images[0];
    return typeof image === "object" ? image.url : image;
  }
  if (item.product?.image) return item.product.image;
  if (item.image) return item.image;
  return "https://via.placeholder.com/150x150/f3f4f6/9ca3af?text=No+Image";
};

const getItemName = item => {
  if (item.productName) return item.productName;
  if (item.product?.title) return item.product.title;
  if (item.product?.name) return item.product.name;
  if (item.title) return item.title;
  if (item.name) return item.name;
  return "Unknown Product";
};

const getItemPrice = item => {
  if (item.price !== undefined) return item.price;
  return item.product?.price || item.priceAtAddition || 0;
};

const handleImageError = event => {
  event.target.src = "https://via.placeholder.com/150x150/f3f4f6/9ca3af?text=No+Image";
};

const getTimeUntilExpiry = order => {
  if (!order.expiresAt) return null;
  // ✅ Gunakan currentTime.value untuk reactivity
  const diff = new Date(order.expiresAt) - currentTime.value;
  if (diff <= 0) return "Expired";

  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const hours = Math.floor(diff / 1000 / 60 / 60);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")} left`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")} left`;
};
// REPLACE computed reviewedItems (sekitar line 500)
const reviewedItems = computed(() => {
  if (!orderWithCancelStatus.value?.parcels) return [];

  const allReviewedItems = [];
  orderWithCancelStatus.value.parcels.forEach(parcel => {
    parcel.items.forEach(item => {
      // ✅ FIX: Check customerFeedback dengan proper validation
      const hasFeedback =
        item.customerFeedback &&
        (item.customerFeedback.rating > 0 ||
          (item.customerFeedback.review && item.customerFeedback.review.trim().length > 0));

      if (hasFeedback) {
        allReviewedItems.push({
          ...item,
          parcelId: parcel.parcelId,
          seller: parcel.seller,
        });
      }
    });
  });

  return allReviewedItems;
});
// Setelah computed reviewedItems, tambahkan:

// REPLACE entire computed
const hasAnyDeliverableItems = computed(() => {
  if (!orderWithCancelStatus.value?.parcels) return false;

  // ✅ FIX: Check if there are ANY items with status "delivered"
  const hasDelivered = orderWithCancelStatus.value.parcels.some(parcel =>
    parcel.items.some(item => item.status === "delivered")
  );

  // ✅ DEBUG
  if (hasDelivered) {
    const deliveredItems = [];
    orderWithCancelStatus.value.parcels.forEach(parcel => {
      parcel.items.forEach(item => {
        if (item.status === "delivered") {
          deliveredItems.push({
            name: getItemName(item),
            productId: item.productId || item.product,
            status: item.status,
          });
        }
      });
    });
    console.log("📦 Deliverable items found:", deliveredItems);
  }

  return hasDelivered;
});

const hasCancelRequest = order => {
  if (!order) return false;
  return order.status === "cancellation_requested";
};

const canPayOrder = order => {
  return order.status === "pending" && order.paymentStatus === "pending";
};

const canCancelOrder = order => {
  return (
    ["pending", "packed"].includes(order.status) &&
    order.status !== "cancellation_requested" &&
    !hasCancelRequest(order)
  );
};

const canConfirmDelivery = order => {
  return order.status === "delivered" && !order.timestamps?.receivedAt;
};

// Setelah function canConfirmDelivery, tambahkan:

const canConfirmItem = item => {
  return item.status === "delivered";
};

const getCancelRequestReason = order => {
  if (!order || !hasCancelRequest(order)) return "No reason provided";

  // ✅ FIX: Cek semua kemungkinan lokasi reason

  // Priority 1: cancelRequest.reason (dari backend)
  if (order.cancelRequest?.reason) {
    return order.cancelRequest.reason;
  }

  // Priority 2: cancelRequest.generalReason (dari cancel request model)
  if (order.cancelRequest?.generalReason) {
    return order.cancelRequest.generalReason;
  }

  // Priority 3: order.notes (fallback)
  if (order.notes) {
    // Extract reason dari notes jika format: "Reason: ..."
    if (order.notes.includes("")) {
      return order.notes.split("")[1].trim();
    }
    return order.notes;
  }

  // Priority 4: order-level reason fields
  if (order.cancelReason) {
    return order.cancelReason;
  }

  if (order.reasonForCancel) {
    return order.reasonForCancel;
  }

  // Fallback
  return "Request submitted, waiting for seller approval";
};
onMounted(() => {
  const interval = setInterval(() => {
    currentTime.value = Date.now();
  }, 1000);

  onUnmounted(() => clearInterval(interval));
});
</script>

<style scoped>
.modal-backdrop {
  backdrop-filter: blur(4px);
  background-color: rgba(0, 0, 0, 0.6);
}

.fixed {
  animation: fadeIn 0.3s ease-out;
}

.bg-white {
  animation: slideIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
