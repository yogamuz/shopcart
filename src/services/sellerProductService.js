// services/sellerProductService.js - FLAT PATTERN
import { useApiClient } from "@/composables/useApiClient";

const apiClient = useApiClient();

export const sellerProductService = {
  async getProducts(params = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value);
      }
    });
    const queryString = queryParams.toString();
    return apiClient.get(`/api/seller/products${queryString ? `?${queryString}` : ""}`);
  },

  async getProductById(productId) {
    return apiClient.get(`/api/seller/products/${productId}`);
  },

  async createProduct(productData) {
    return apiClient.post("/api/seller/products", productData);
  },

  async updateProduct(productId, productData) {
    return apiClient.patch(`/api/seller/products/${productId}`, productData);
  },

  async deleteProduct(productId) {
    return apiClient.delete(`/api/seller/products/${productId}`);
  },

  async toggleProductStatus(productId, isActive) {
    return apiClient.patch(`/api/seller/products/${productId}/status`, { isActive });
  },

  async uploadProductImage(productId, imageFile, onUploadProgress = null) {
    return apiClient.uploadFile(`/api/seller/products/${productId}/images`, imageFile, {
      onUploadProgress,
      fieldName: "image",
    });
  },

  async getProductStats() {
    return apiClient.get("/api/seller/products/stats");
  },

  async bulkToggleStatus(productIds, isActive) {
    return apiClient.patch("/api/seller/products/bulk/status", { productIds, isActive });
  },

  async bulkDeleteProducts(productIds) {
    return apiClient.delete("/api/seller/products/bulk", { data: { productIds } });
  },

  async getStoreInfo() {
    return apiClient.get("/api/seller/profile");
  },

  async getDashboardStats(period = "30d") {
    const queryParams = new URLSearchParams({ period });
    return apiClient.get(`/api/seller/analytics/dashboard?${queryParams}`);
  },

  async getProductAnalytics(period = "30d") {
    const queryParams = new URLSearchParams({ period });
    return apiClient.get(`/api/seller/analytics/products?${queryParams}`);
  },
};