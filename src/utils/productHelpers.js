// utils/productHelpers.js - Pure Functions Only
import { useApiClient } from "@/composables/useApiClient";

/**
 * Utility functions for product data handling and formatting
 * Extracted from useProductUtils.js - Pure functions only
 */

// Product property accessors
export const getProductTitle = (product) => {
  if (!product) return "Product";
  return product.title || product.name || "Untitled Product";
};

export const getCategoryName = (product) => {
  if (!product) return "Products";
  return product.category?.name || product.category || "General";
};

export const getCategorySlug = (product) => {
  if (!product) return "products";
  const categoryName = getCategoryName(product);
  return categoryName.toLowerCase().replace(/\s+/g, "-");
};

// Image handling utilities
export const getPlaceholderImage = () => {
  const apiClient = useApiClient();
  return `${apiClient.baseUrl}/uploads/products/placeholder.jpg`;
};

export const getProductImage = (product) => {
  if (!product) return getPlaceholderImage();

  const apiClient = useApiClient();

  // Handle image object from API response
  if (product.image && typeof product.image === "object" && product.image.url) {
    return product.image.url;
  }

  // If product has imageUrl field
  if (product.imageUrl && product.imageUrl.startsWith("http")) {
    return product.imageUrl;
  }

  // If product has image field as string
  if (product.image && typeof product.image === "string") {
    if (product.image.startsWith("http")) {
      return product.image;
    }
    // If it's a relative path, construct full URL
    const imageName = product.image
      .replace(/^.*[\\\/]/, "")
      .replace(/^\.\.\/.*\//, "");
    return `${apiClient.baseUrl}/uploads/products/${imageName}`;
  }

  // If product has images array
  if (product.images && product.images.length > 0) {
    const firstImage = product.images[0];
    if (firstImage.startsWith("http")) {
      return firstImage;
    }
    const imageName = firstImage
      .replace(/^.*[\\\/]/, "")
      .replace(/^\.\.\/.*\//, "");
    return `${apiClient.baseUrl}/uploads/products/${imageName}`;
  }

  // Fallback to placeholder
  return getPlaceholderImage();
};

// Seller information utilities
export const getSellerLogo = (product) => {
  if (product?.seller && product.seller.logo) {
    return product.seller.logo;
  }
  if (product?.sellerLogo) return product.sellerLogo;
  if (product?.store && product.store.logo) return product.store.logo;

  return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iI2Y3ZjdmNyIgc3Ryb2tlPSIjZTBlMGUwIi8+CiAgPHRleHQgeD0iMjAiIHk9IjI0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM5OTkiPlM8L3RleHQ+Cjwvc3ZnPgo=";
};

export const getSellerName = (product) => {
  if (product?.seller && product.seller.name) {
    return product.seller.name;
  }
  if (product?.sellerName) return product.sellerName;
  if (product?.store && product.store.name) return product.store.name;
  if (product?.storeName) return product.storeName;

  return "Unknown Store";
};

// Formatting utilities
export const formatPrice = (price) => {
  if (!price || isNaN(price)) return "0";
  return parseInt(price).toLocaleString("id-ID");
};

export const formatRatingDisplay = (rating) => {
  if (!rating || isNaN(rating) || rating === 0) return "0";
  return Number(rating).toFixed(1);
};

// Error handling utilities
export const handleImageError = (event, fallback = null) => {
  console.error("Failed to load product image:", event.target.src);
  event.target.src = fallback || getPlaceholderImage();
};

export const handleLogoError = (event) => {
  console.warn("Logo failed to load:", event.target.src);
  event.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iI2Y3ZjdmNyIgc3Ryb2tlPSIjZTBlMGUwIi8+CiAgPHRleHQgeD0iMjAiIHk9IjI0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM5OTkiPlM8L3RleHQ+Cjwvc3ZnPgo=";
};

// Product navigation utilities
export const getProductSlug = (product) => {
  if (!product) return null;
  
  // Prioritas: slug dari API -> fallback ke ID jika slug tidak ada
  if (product.slug && typeof product.slug === 'string') {
    return product.slug;
  }
  
  // Fallback ke ID jika slug tidak tersedia
  return product._id || product.id;
};