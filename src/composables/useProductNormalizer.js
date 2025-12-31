// composables/useProductNormalizer.js

/**
 * Composable for normalizing product data from various API structures
 * Provides consistent product data format across the application
 */
export function useProductNormalizer() {
  /**
   * Normalizes a single product object to consistent format
   * @param {Object} product - Raw product data from API
   * @returns {Object} Normalized product object
   */
  const normalizeProduct = (product) => {
    if (!product) return null;

    return {
      // IDs - support both _id and id
      id: product.id || product._id,
      _id: product._id || product.id,

      // Names - support both title and name
      title: product.title || product.name || "Untitled Product",
      name: product.name || product.title || "Untitled Product",

      // Basic info
      slug: product.slug || "",
      description: product.description || "",
      price: Number(product.price) || 0,

      // Image - handle multiple structures
      image: normalizeImage(product),

      // Category - handle string or object
      category: normalizeCategory(product.category),

      // Seller info
      seller: product.seller || null,
      storeName: product.storeName || product.seller?.name || "Unknown Store",

      // Stock and availability
      stock: normalizeStock(product),
      isAvailable: normalizeAvailability(product),

      // Ratings and reviews
      rating: Number(product.rating) || Number(product.averageRating) || 0,
      reviews: Number(product.reviews) || Number(product.reviewCount) || 0,

      // User interaction
      isLiked: Boolean(product.isLiked),

      // Timestamps
      createdAt: product.createdAt || null,
      updatedAt: product.updatedAt || null,
    };
  };

  /**
   * Normalizes image data from various structures
   * @param {Object} product - Product object
   * @returns {Object|string|null} Normalized image
   */
  const normalizeImage = (product) => {
    // If image is already an object with url
    if (product.image?.url) {
      return product.image;
    }

    // If image is a string URL
    if (typeof product.image === "string") {
      return product.image;
    }

    // Fallback to other image fields
    return product.imageUrl || product.thumbnail || null;
  };

  /**
   * Normalizes category data
   * @param {string|Object} category - Category data
   * @returns {string} Category name
   */
  const normalizeCategory = (category) => {
    if (!category) return "";

    // If category is an object with name
    if (typeof category === "object" && category.name) {
      return category.name;
    }

    // If category is already a string
    if (typeof category === "string") {
      return category;
    }

    return "";
  };

  /**
   * Normalizes stock information
   * @param {Object} product - Product object
   * @returns {number} Stock quantity
   */
  const normalizeStock = (product) => {
    // If stock is explicitly a number
    if (typeof product.stock === "number") {
      return product.stock;
    }

    // If inStock is boolean
    if (typeof product.inStock === "boolean") {
      return product.inStock ? 1 : 0;
    }

    // If quantity exists
    if (typeof product.quantity === "number") {
      return product.quantity;
    }

    return 0;
  };

  /**
   * Normalizes availability status
   * @param {Object} product - Product object
   * @returns {boolean} Whether product is available
   */
  const normalizeAvailability = (product) => {
    // If isAvailable is explicitly set
    if (product.isAvailable !== undefined) {
      return Boolean(product.isAvailable);
    }

    // Otherwise, base on stock
    const stock = normalizeStock(product);
    return stock > 0;
  };

  /**
   * Normalizes an array of products
   * @param {Array} products - Array of raw product data
   * @returns {Array} Array of normalized products
   */
  const normalizeProductList = (products) => {
    if (!Array.isArray(products)) {
      console.warn("normalizeProductList: Expected array, got", typeof products);
      return [];
    }

    return products.map(normalizeProduct).filter(Boolean);
  };

  /**
   * Extracts and normalizes product data from API response
   * Handles various response structures
   * @param {Object} response - API response object
   * @returns {Object} Extracted data with products, pagination, and filters
   */
  const extractProductData = (response) => {
    if (!response || !response.success) {
      return {
        products: [],
        pagination: null,
        filters: null,
      };
    }

    // Extract raw product list from various structures
    const rawProducts =
      response.data?.products ||
      response.data?.data?.products ||
      response.data?.items ||
      [];

    // Extract pagination
    const pagination =
      response.data?.pagination ||
      response.data?.data?.pagination ||
      null;

    // Extract filters
    const filters =
      response.data?.filters ||
      response.data?.data?.filters ||
      null;

    return {
      products: normalizeProductList(rawProducts),
      pagination,
      filters,
    };
  };

  /**
   * Gets product image URL with fallback
   * @param {Object} product - Product object (normalized or raw)
   * @returns {string} Image URL
   */
  const getProductImageUrl = (product) => {
    if (!product) return getPlaceholderImageUrl();

    // If already normalized
    if (product.image?.url) {
      return product.image.url;
    }

    // If image is a string
    if (typeof product.image === "string") {
      return product.image;
    }

    // Fallback
    return product.imageUrl || product.thumbnail || getPlaceholderImageUrl();
  };

  /**
   * Gets product title with fallback
   * @param {Object} product - Product object
   * @returns {string} Product title
   */
  const getProductTitle = (product) => {
    if (!product) return "Unknown Product";
    return product.title || product.name || "Unknown Product";
  };

  /**
   * Gets seller name with fallback
   * @param {Object} product - Product object
   * @returns {string} Seller name
   */
  const getSellerName = (product) => {
    if (!product) return "Unknown Store";
    return product.storeName || product.seller?.name || "Unknown Store";
  };

  /**
   * Gets seller logo URL with fallback
   * @param {Object} product - Product object
   * @returns {string|null} Seller logo URL
   */
  const getSellerLogo = (product) => {
    if (!product?.seller) return null;

    // If logo is an object with url
    if (product.seller.logo?.url) {
      return product.seller.logo.url;
    }

    // If logo is a string
    if (typeof product.seller.logo === "string") {
      return product.seller.logo;
    }

    return null;
  };

  /**
   * Gets placeholder image URL
   * @returns {string} Placeholder image URL
   */
  const getPlaceholderImageUrl = () => {
    return "https://via.placeholder.com/400x400/f3f4f6/9ca3af?text=No+Image";
  };

  /**
   * Formats rating for display
   * @param {number} rating - Rating value
   * @returns {string} Formatted rating
   */
  const formatRating = (rating) => {
    const numRating = Number(rating);
    if (isNaN(numRating) || numRating === 0) return "0.0";
    return numRating.toFixed(1);
  };

  /**
   * Gets category slug for routing
   * @param {Object} product - Product object
   * @returns {string} Category slug
   */
  const getCategorySlug = (product) => {
    if (!product) return "";

    const category = product.category;

    // If category is an object with slug
    if (typeof category === "object" && category?.slug) {
      return category.slug;
    }

    // If category is a string, convert to slug
    if (typeof category === "string") {
      return category.toLowerCase().replace(/\s+/g, "-");
    }

    return "";
  };

  /**
   * Gets category name for display
   * @param {Object} product - Product object
   * @returns {string} Category name
   */
  const getCategoryName = (product) => {
    if (!product) return "";

    const category = product.category;

    // If category is an object
    if (typeof category === "object" && category?.name) {
      return category.name;
    }

    // If category is a string
    if (typeof category === "string") {
      return category;
    }

    return "";
  };

  // Return public API
  return {
    // Core normalization
    normalizeProduct,
    normalizeProductList,
    extractProductData,

    // Helper normalizers
    normalizeImage,
    normalizeCategory,
    normalizeStock,
    normalizeAvailability,

    // Getters with fallbacks
    getProductImageUrl,
    getProductTitle,
    getSellerName,
    getSellerLogo,
    getPlaceholderImageUrl,
    getCategorySlug,
    getCategoryName,

    // Formatters
    formatRating,
  };
}