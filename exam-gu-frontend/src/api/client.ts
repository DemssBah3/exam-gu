import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { tokenUtils } from '../utils/token';
import { toast } from 'sonner';

// Configuration de base
const API_BASE_URL = 'https://exam-gu-production.up.railway.app/api/v1';


// Créer l'instance axios
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenUtils.getToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    // Erreur 401 : Token invalide ou expiré
    if (error.response?.status === 401) {
      tokenUtils.removeToken();
      window.location.href = '/login';
      toast.error('Session expirée. Veuillez vous reconnecter.');
    }
    
    // Erreur 403 : Accès refusé
    if (error.response?.status === 403) {
      toast.error('Accès refusé. Vous n\'avez pas les permissions nécessaires.');
    }
    
    // Erreur 404 : Ressource non trouvée
    if (error.response?.status === 404) {
      toast.error('Ressource non trouvée.');
    }
    
    // Erreur 500 : Erreur serveur
    if (error.response?.status === 500) {
      toast.error('Erreur serveur. Veuillez réessayer plus tard.');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
