export const environment = {
  production: true,
  auth: {
    baseUrl: 'https://api.example.com/api/auth', // Replace with your production auth API URL
    tokenKey: 'auth_token'
  },
  api: {
    baseUrl: 'https://api.example.com/api', // Replace with your production API URL
  },
  apiUrl: 'https://api.example.com/api', // For backward compatibility
  charts: {
    cacheExpiration: 600000, // 10 minutes in milliseconds
    enableMockData: false // Disable mock data in production
  }
};
