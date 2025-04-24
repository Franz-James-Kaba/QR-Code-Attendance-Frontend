export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api', // Development API URL
  auth: {
    baseUrl: 'http://localhost:3000/api/auth',
    tokenKey: 'auth_token',
    refreshTokenKey: 'refresh_token'
  },
  charts: {
    enableMockData: true, // Use mock data in development
    cacheExpiration: 5 * 60 * 1000 // 5 minutes cache expiration
  }
};
