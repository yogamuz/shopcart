// services/sellerCancelRequestService.js - FIXED untuk match backend
import { useApiClient } from "@/composables/useApiClient";

export class CancelRequestService {
  constructor(token = null) {
    this.api = useApiClient(token);
  }

  // Get pending cancel requests for seller
  async getPendingRequests(params = {}) {
    try {
      const { page = 1, limit = 10 } = params;
      // FIXED: URL harus match backend route
      const response = await this.api.get("/api/seller/requests", {
        params: { page, limit },
      });

      // Backend return: { success, message, data: { requests, pagination } }
      return response; // Return full response object
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get cancel request details
  async getRequestDetails(requestId) {
    try {
      // FIXED: URL harus match backend route /cancel-requests/:requestId
      const response = await this.api.get(`/api/seller/requests/${requestId}`);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async respondToRequest(requestId, itemResponses = []) {
    try {
      // itemResponses harus berupa array dengan struktur:
      // [{ productId: "xxx", response: "approved"|"rejected", responseReason?: "reason" }, ...]

      if (!Array.isArray(itemResponses) || itemResponses.length === 0) {
        throw new Error("itemResponses must be a non-empty array");
      }

      const response = await this.api.post(`/api/seller/requests/${requestId}/respond`, {
        itemResponses, // FIXED: Kirim array langsung, sesuai backend expectation
      });

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // IMPROVED: Error handling sesuai dengan useApiClient error structure
  handleError(error) {
    return {
      message: error.message || "An error occurred",
      status: error.status || 500,
      errors: error.errors || [],
      isNetworkError: error.isNetworkError || false,
    };
  }
}
