import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8001/api',
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
    console.log('🚀 Requête envoyée:', config.method.toUpperCase(), config.url); // DEBUG
    console.log('🔑 Token:', token ? 'Présent' : 'Absent'); // DEBUG
    return config;
  },
  (error) => {
    console.error('❌ Erreur requête:', error); // DEBUG
    return Promise.reject(error);
  }
);

// Gérer les réponses et erreurs
api.interceptors.response.use(
  (response) => {
    console.log('✅ Réponse reçue:', response.status, response.config.url); // DEBUG
    return response;
  },
  (error) => {
    console.error('❌ Erreur réponse:', error.response); // DEBUG
    console.error('Status:', error.response?.status); // DEBUG
    console.error('Data:', error.response?.data); // DEBUG
    
    // NE DÉCONNECTER QUE si c'est vraiment une erreur d'authentification
    if (error.response?.status === 401) {
      console.error('🚫 Erreur 401 - Déconnexion'); // DEBUG
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Pour les autres erreurs, NE PAS déconnecter
    return Promise.reject(error);
  }
);

export default api;