// services/categoryService.js
import { productService } from '@/services/productService'

export const categoryService = {
  /**
   * Get products by category using products API endpoint
   * @param {string} categoryId - Category ID (will be converted to name)
   * @param {Object} params - Query parameters
   * @returns {Promise}
   */
  async getProductsByCategory(categoryId, params = {}) {
    // Map category IDs to names for API call (normalized to lowercase)
    const categoryMap = {
      "66d1a2b3c4e5f6789abcdef0": "beauty",
      "66d1a2b3c4e5f6789abcdef1": "fashion", 
      "66d1a2b3c4e5f6789abcdef2": "sneakers",
      "66d1a2b3c4e5f6789abcdef3": "toys",
      "66d1a2b3c4e5f6789abcdef4": "furniture",
      "66d1a2b3c4e5f6789abcdef5": "gadgets"
    }

    const categoryName = categoryMap[categoryId] || categoryId.toLowerCase()

    // Use productService with category parameter
    return await productService.getProducts({
      ...params,
      category: categoryName
    })
  }
}