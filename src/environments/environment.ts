export const environment = {
  production: false,
  auth: {
    baseUrl: 'http://qrcode-alb-1355304988.us-east-1.elb.amazonaws.com/api/auth',
    tokenKey: 'auth_token'
  },
  api: {
    baseUrl: 'http://qrcode-alb-1355304988.us-east-1.elb.amazonaws.com/api',
  },
  apiUrl: 'http://qrcode-alb-1355304988.us-east-1.elb.amazonaws.com/api',
  charts: {
    cacheExpiration: 300000,
    enableMockData: true
  }
};
