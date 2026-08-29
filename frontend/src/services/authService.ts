import { api } from './api';
import {
  LoginCredentials,
  RegisterPayload,
  CandidateRegisterPayload,
  CompanyRegisterPayload,
  RecruiterRegisterPayload,
  ProviderRegisterPayload,
  AuthResponse
} from '../types/auth';
import { UserProfile, RoleInfo } from '../types/user';
import { storage } from '../utils/storage';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    const data = response.data;
    storage.setToken(data.access_token);
    storage.setUser(data.user);
    return data;
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', payload);
    const data = response.data;
    storage.setToken(data.access_token);
    storage.setUser(data.user);
    return data;
  },

  registerCandidate: async (payload: CandidateRegisterPayload): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register/candidate', payload);
    const data = response.data;
    storage.setToken(data.access_token);
    storage.setUser(data.user);
    return data;
  },

  registerCompany: async (payload: CompanyRegisterPayload): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register/company', payload);
    const data = response.data;
    storage.setToken(data.access_token);
    storage.setUser(data.user);
    return data;
  },

  registerRecruiter: async (payload: RecruiterRegisterPayload): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register/recruiter', payload);
    const data = response.data;
    storage.setToken(data.access_token);
    storage.setUser(data.user);
    return data;
  },

  registerProvider: async (payload: ProviderRegisterPayload): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register/provider', payload);
    const data = response.data;
    storage.setToken(data.access_token);
    storage.setUser(data.user);
    return data;
  },

  getCurrentUser: async (): Promise<UserProfile> => {
    const response = await api.get<UserProfile>('/auth/me');
    const user = response.data;
    storage.setUser(user);
    return user;
  },

  updateConsent: async (consentGiven: boolean): Promise<UserProfile> => {
    const response = await api.post<UserProfile>(`/auth/consent?consent_given=${consentGiven}`);
    const user = response.data;
    storage.setUser(user);
    return user;
  },

  getRoles: async (): Promise<RoleInfo[]> => {
    const response = await api.get<RoleInfo[]>('/auth/roles');
    return response.data;
  },

  getHealth: async (): Promise<{ status: string; service: string; database: string }> => {
    const response = await api.get('/health');
    return response.data;
  },

  logout: (): void => {
    try {
      api.post('/auth/logout').catch(() => {});
    } finally {
      storage.clear();
    }
  },
};
