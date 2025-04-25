export const environment = {
  production: true,
  apiUrl: 'https://api.qr-attendance.amalitech.org/api', // Production API URL
  auth: {
    baseUrl: 'https://api.qr-attendance.amalitech.org/api/auth',
    tokenKey: 'auth_token',
    refreshTokenKey: 'refresh_token'
  },
  charts: {
    enableMockData: false, // Don't use mock data in production
    cacheExpiration: 15 * 60 * 1000 // 15 minutes cache expiration
  }
};