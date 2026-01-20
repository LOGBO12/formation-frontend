import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
});

// Ajouter le token à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Gérer les réponses et erreurs
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Seulement déconnecter en cas de 401 sur les routes protégées
    // ET si ce n'est pas une route de login/register
    if (error.response?.status === 401) {
      const isAuthRoute = error.config.url?.includes('/auth/login') || 
                         error.config.url?.includes('/auth/register');
      
      if (!isAuthRoute) {
        console.error('🚫 Session expirée - Déconnexion');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Rediriger seulement si on n'est pas déjà sur login
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;