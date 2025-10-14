// services/productService.js - NORMALIZED PARAMETERS
import { useApiClient } from '@/composables/useApiClient'

export const productService = {
  /**
   * Fetch products with optional query parameters
   * @param {Object} params
   * @returns {Promise}
   */
  async getProducts(params = {}) {
    const { get } = useApiClient()

    const queryParams = new URLSearchParams()

    // Normalize category parameter to lowercase
    if (params.category) queryParams.append('category', params.category.toLowerCase())
    if (params.search) queryParams.append('search', params.search)
    if (params.page) queryParams.append('page', params.page)
    if (params.limit) queryParams.append('limit', params.limit)
    if (params.minPrice) queryParams.append('minPrice', params.minPrice)
    if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice)
    if (params.rating) queryParams.append('rating', params.rating)
    if (params.inStock !== undefined) queryParams.append('inStock', params.inStock)
    if (params.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder)

    const queryString = queryParams.toString()
    const endpoint = queryString ? `/api/products?${queryString}` : '/api/products'

    return await get(endpoint)
  },
  /**
 * Fetch single product by ID
 * @param {string} productId 
 * @returns {Promise}
 */
async getProduct(productId) {
  const { get } = useApiClient()
  return await get(`/api/products/${productId}`)
},
/**
 * Fetch single product by slug
 * @param {string} productSlug 
 * @returns {Promise}
 */
async getProductBySlug(productSlug) {
  const { get } = useApiClient()
  return await get(`/api/products/${productSlug}`) // Backend perlu endpoint ini
},
/**
 * Fetch product reviews by product ID
 * @param {string} productId - Internal product ID
 * @param {Object} params - Query parameters (page, limit, etc)
 * @returns {Promise}
 */
async getProductReviews(productId, params = {}) {
  const { get } = useApiClient()
  
  const queryParams = new URLSearchParams()
  if (params.page) queryParams.append('page', params.page)
  if (params.limit) queryParams.append('limit', params.limit)
  if (params.sortBy) queryParams.append('sortBy', params.sortBy)
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder)
  
  const queryString = queryParams.toString()
  const endpoint = queryString 
    ? `/api/products/${productId}/reviews?${queryString}` 
    : `/api/products/${productId}/reviews`
  
  return await get(endpoint)
},

/**
 * Fetch products by store slug (public store page)
 * @param {string} storeSlug - Store slug
 * @param {Object} params - Query parameters
 * @returns {Promise}
 */
async getStoreProducts(storeSlug, params = {}) {
  const { get } = useApiClient()
  
  const queryParams = new URLSearchParams()
  if (params.category) queryParams.append('category', params.category.toLowerCase())
  if (params.search) queryParams.append('search', params.search)
  if (params.page) queryParams.append('page', params.page)
  if (params.limit) queryParams.append('limit', params.limit)
  if (params.sortBy) queryParams.append('sortBy', params.sortBy)
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder)
  
  const queryString = queryParams.toString()
  const endpoint = queryString 
    ? `/api/stores/${storeSlug}/products?${queryString}` 
    : `/api/stores/${storeSlug}/products`
  
  return await get(endpoint)
},

/**
 * Fetch all active stores with pagination and filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.search - Search term
 * @param {string} params.city - Filter by city
 * @param {string} params.sortBy - Sort field
 * @param {string} params.sortOrder - Sort order (asc/desc)
 * @returns {Promise}
 */
async getAllStores(params = {}) {
  const { get } = useApiClient()
  
  const queryParams = new URLSearchParams()
  if (params.page) queryParams.append('page', params.page)
  if (params.limit) queryParams.append('limit', params.limit)
  if (params.search) queryParams.append('search', params.search)
  if (params.city) queryParams.append('city', params.city)
  if (params.sortBy) queryParams.append('sortBy', params.sortBy)
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder)
  
  const queryString = queryParams.toString()
  const endpoint = queryString 
    ? `/api/stores?${queryString}` 
    : '/api/stores'
  
  return await get(endpoint)
},

/**
 * Fetch public store profile by slug
 * @param {string} storeSlug - Store slug
 * @returns {Promise}
 */
async getStoreProfile(storeSlug) {
  const { get } = useApiClient()
  return await get(`/api/stores/${storeSlug}`)
},
/**
 * Get store review statistics
 * @param {string} storeSlug - Store slug
 * @returns {Promise}
 */
async getStoreReviewStats(storeSlug) {
  const { get } = useApiClient()  // ✅ Fix: Destructure get from useApiClient
  
  try {
    return await get(`/api/stores/${storeSlug}/reviews/stats`)
  } catch (error) {
    console.error('Failed to fetch store review stats:', error)
    return { 
      success: false, 
      message: error.message,
      data: {
        totalReviews: 0,
        averageRating: 0
      }
    }
  }
}

}