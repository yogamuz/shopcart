// utils/logger.js
import log from 'loglevel';

// Set log level berdasarkan environment
if (import.meta.env.MODE === 'production') {
  log.setLevel('error'); // Production: hanya error
} else {
  log.setLevel('debug'); // Development: semua log
}

// Custom logger dengan prefix untuk kategori
export const logger = {
  // General logging
  log: (...args) => log.info(...args),
  info: (...args) => log.info(...args),
  warn: (...args) => log.warn(...args),
  error: (...args) => log.error(...args),
  debug: (...args) => log.debug(...args),

  // API-specific logging dengan prefix
  apiRequest: (url, config = {}) => {
    log.debug('🌐 API Request:', { url, config });
  },

  apiSuccess: (url, response) => {
    log.debug('✅ API Success:', url, response);
  },

  apiError: (url, error) => {
    log.error('❌ API Error:', {
      url,
      status: error.status,
      message: error.message,
      error
    });
  },

  tokenSet: (url) => {
    log.debug('🔑 Token set in request:', url);
  },

  tokenMissing: (url) => {
    log.debug('⚠️ No token available for request:', url);
  },

  tokenRefresh: (message, data = null) => {
    log.info('🔄', message, data || '');
  },

  tokenRefreshSuccess: () => {
    log.info('✅ Token refreshed successfully');
  },

  tokenRefreshFailed: (error = null) => {
    log.error('❌ Token refresh failed', error || '');
  }
};

// Export raw loglevel juga kalau butuh akses langsung
export default log;