import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, RoleType } from '../types/user';
import {
  LoginCredentials,
  RegisterPayload,
  CandidateRegisterPayload,
  CompanyRegisterPayload,
  RecruiterRegisterPayload,
  ProviderRegisterPayload,
  AuthResponse
} from '../types/auth';
import { authService } from '../services/authService';
import { storage } from '../utils/storage';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<UserProfile>;
  register: (payload: RegisterPayload) => Promise<UserProfile>;
  registerCandidate: (payload: CandidateRegisterPayload) => Promise<UserProfile>;
  registerCompany: (payload: CompanyRegisterPayload) => Promise<UserProfile>;
  registerRecruiter: (payload: RecruiterRegisterPayload) => Promise<UserProfile>;
  registerProvider: (payload: ProviderRegisterPayload) => Promise<UserProfile>;
  logout: () => void;
  updateConsent: (consentGiven: boolean) => Promise<void>;
  hasRole: (roles: RoleType | RoleType[]) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => storage.getUser());
  const [token, setToken] = useState<string | null>(() => storage.getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = storage.getToken();
      if (savedToken) {
        try {
          const freshUser = await authService.getCurrentUser();
          setUser(freshUser);
          setToken(savedToken);
        } catch {
          storage.clear();
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const data = await authService.login(credentials);
      setUser(data.user);
      setToken(data.access_token);
      return data.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const data = await authService.register(payload);
      setUser(data.user);
      setToken(data.access_token);
      return data.user;
    } finally {
      setIsLoading(false);
    }
  };

  const registerCandidate = async (payload: CandidateRegisterPayload): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const data = await authService.registerCandidate(payload);
      setUser(data.user);
      setToken(data.access_token);
      return data.user;
    } finally {
      setIsLoading(false);
    }
  };

  const registerCompany = async (payload: CompanyRegisterPayload): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const data = await authService.registerCompany(payload);
      setUser(data.user);
      setToken(data.access_token);
      return data.user;
    } finally {
      setIsLoading(false);
    }
  };

  const registerRecruiter = async (payload: RecruiterRegisterPayload): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const data = await authService.registerRecruiter(payload);
      setUser(data.user);
      setToken(data.access_token);
      return data.user;
    } finally {
      setIsLoading(false);
    }
  };

  const registerProvider = async (payload: ProviderRegisterPayload): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const data = await authService.registerProvider(payload);
      setUser(data.user);
      setToken(data.access_token);
      return data.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const updateConsent = async (consentGiven: boolean) => {
    const updatedUser = await authService.updateConsent(consentGiven);
    setUser(updatedUser);
  };

  const refreshUser = async () => {
    if (storage.getToken()) {
      const freshUser = await authService.getCurrentUser();
      setUser(freshUser);
    }
  };

  const hasRole = (roles: RoleType | RoleType[]): boolean => {
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        registerCandidate,
        registerCompany,
        registerRecruiter,
        registerProvider,
        logout,
        updateConsent,
        hasRole,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
