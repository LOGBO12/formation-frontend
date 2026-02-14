import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Charger l'utilisateur au montage
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      
      if (storedToken) {
        try {
          // Vérifier que le token est valide
          const response = await api.get('/me');
          setUser(response.data.user);
          setToken(storedToken);
        } catch (error) {
          console.error('Token invalide, déconnexion:', error);
          // Token invalide, nettoyer
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/me');
      setUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    }
  };

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    
    // ✅ Vérifier si l'email est vérifié
    if (response.data.email_verified === false) {
      throw {
        response: {
          data: {
            message: response.data.message,
            email_verified: false,
            email: response.data.email,
          }
        }
      };
    }
    
    const { token: newToken, user: newUser } = response.data;
    
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    
    setToken(newToken);
    setUser(newUser);
    
    return newUser;
  };

  const register = async (name, email, password, password_confirmation) => {
    const response = await api.post('/auth/register', {
      name,
      email,
      password,
      password_confirmation,
    });
    
    // ✅ Ne PAS connecter l'utilisateur après inscription
    // Il doit d'abord vérifier son email
    return response.data;
  };

  const logout = async () => {
    try {
      await api.post('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    fetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};