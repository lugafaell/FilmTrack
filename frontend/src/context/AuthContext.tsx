import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types/types';

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  login: () => {},
  logout: () => {},
  checkTokenValidity: () => false,
  forceValidateToken: () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkTokenValidity = (): boolean => {
    try {
      const storedToken = localStorage.getItem('token');
      
      if (!storedToken) {
        console.error("Token não encontrado");
        return false;
      }

      const tokenParts = storedToken.split('.');
      if (tokenParts.length !== 3) {
        console.error("Token JWT inválido: formato incorreto (deve ter 3 partes)");
        return false;
      }
      
      if (tokenParts.some(part => part.trim() === '')) {
        console.error("Token JWT inválido: contém partes vazias");
        return false;
      }
      
      if (tokenParts[0].length < 10 || tokenParts[1].length < 10 || tokenParts[2].length < 10) {
        console.error("Token JWT inválido: partes muito curtas");
        return false;
      }
      
      try {
        const header = tokenParts[0].replace(/-/g, '+').replace(/_/g, '/');
        const paddedHeader = header.length % 4 === 0 ? header : header + '='.repeat(4 - header.length % 4);
        
        const decodedHeader = JSON.parse(atob(paddedHeader));
        if (!decodedHeader.alg || !decodedHeader.typ) {
          console.error("Token JWT inválido: cabeçalho sem algoritmo ou tipo");
          return false;
        }
      } catch (e) {
        console.error("Token JWT inválido: erro ao decodificar cabeçalho", e);
        return false;
      }
      
      try {
        const payload = tokenParts[1].replace(/-/g, '+').replace(/_/g, '/');
        const paddedPayload = payload.length % 4 === 0 ? payload : payload + '='.repeat(4 - payload.length % 4);
        
        const decodedPayload = JSON.parse(atob(paddedPayload));
        
        if (!decodedPayload.exp) {
          console.error("Token JWT inválido: sem data de expiração");
          return false;
        }
        
        if (!decodedPayload.id) {
          console.error("Token JWT inválido: sem ID do usuário");
          return false;
        }
        
        if (!decodedPayload.iat) {
          console.error("Token JWT inválido: sem data de emissão");
          return false;
        }
        
        const currentTime = Math.floor(Date.now() / 1000);
        if (decodedPayload.exp < currentTime) {
          console.error("Token JWT expirado");
          return false;
        }
        
        if (decodedPayload.iat > currentTime) {
          console.error("Token JWT inválido: data de emissão no futuro");
          return false;
        }
        
        if (decodedPayload.exp <= decodedPayload.iat) {
          console.error("Token JWT inválido: data de expiração anterior ou igual à data de emissão");
          return false;
        }
        
        if (tokenParts[2].length < 20) {
          console.error("Token JWT inválido: assinatura muito curta");
          return false;
        }
        
        return true;
      } catch (e) {
        console.error("Erro ao decodificar token JWT:", e);
        return false;
      }
    } catch (error) {
      console.error("Erro ao verificar token:", error);
      return false;
    }
  };

  useEffect(() => {
    const loadStoredAuth = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        if (storedToken && storedUser) {
          if (checkTokenValidity()) {
            setUser(JSON.parse(storedUser));
            setToken(storedToken);
          } else {
            console.log("Token inválido detectado durante carregamento inicial");
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('activeMovieCategory');
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados de autenticação:", error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('activeMovieCategory');
      } finally {
        setLoading(false);
      }
    };

    loadStoredAuth();
    
    setTimeout(() => {
      if (!checkTokenValidity()) {
        logout();
      }
    }, 100);
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' && e.newValue !== e.oldValue) {
        if (!e.newValue || !checkTokenValidity()) {
          setUser(null);
          setToken(null);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          localStorage.removeItem('activeMovieCategory');
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (user && !checkTokenValidity()) {
        logout();
      }
    }, 60 * 1000);
    
    const handleUserActivity = () => {
      if (user && !checkTokenValidity()) {
        logout();
      }
    };
    
    window.addEventListener('click', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('mousemove', handleUserActivity);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('mousemove', handleUserActivity);
    };
  }, [user]);

  const login = (userData: User, userToken: string) => {
    setUser(userData);
    setToken(userToken);
    
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('activeMovieCategory');
  };

  const forceValidateToken = () => {
    if (!checkTokenValidity() && user !== null) {
      console.log("Token inválido detectado durante validação forçada");
      logout();
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    loading,
    login,
    logout,
    checkTokenValidity,
    forceValidateToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};