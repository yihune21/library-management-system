import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, RegisterData, ApiResponse } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<ApiResponse<User>>;
  register: (data: RegisterData) => Promise<ApiResponse<User>>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Validate token and get user info
      authApi.getCurrentUser()
        .then(response => {
          if (response.success && response.data) {
            setUser(response.data);
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials: LoginCredentials): Promise<ApiResponse<User>> => {
    try {
      const response = await authApi.login(credentials);
      if (response.success && response.data) {
        setUser(response.data);
        localStorage.setItem('token', response.data.id); // Mock token
      }
      return response;
    } catch (error) {
      return {
        success: false,
        error: 'Login failed'
      };
    }
  };

  const register = async (data: RegisterData): Promise<ApiResponse<User>> => {
    try {
      const response = await authApi.register(data);
      if (response.success && response.data) {
        setUser(response.data);
        localStorage.setItem('token', response.data.id); // Mock token
      }
      return response;
    } catch (error) {
      return {
        success: false,
        error: 'Registration failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};