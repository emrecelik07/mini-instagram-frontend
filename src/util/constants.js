export const AppConstants = {
    BACKEND_URL_DEV: 'http://localhost:8080/api/v1.0',
    BACKEND_URL_PROD: 'https://your-production-domain.com/api/v1.0', // Update this when you deploy
    
    getBackendUrl: () => {
        return AppConstants.BACKEND_URL_DEV;
    },
    
    getBaseUrl: () => {
        return AppConstants.getBackendUrl().replace('/api/v1.0', '');
    }
}