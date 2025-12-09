const TOKEN_KEY = 'exam-gu-token';

export const tokenUtils = {
  // Sauvegarder le token
  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  // Récupérer le token
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Supprimer le token
  removeToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },

  // Vérifier si un token existe
  hasToken: (): boolean => {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  // Décoder le token JWT (sans vérification)
  decodeToken: (token: string): any => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  },

  // Vérifier si le token est expiré
  isTokenExpired: (token: string): boolean => {
    const decoded = tokenUtils.decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  },
};
