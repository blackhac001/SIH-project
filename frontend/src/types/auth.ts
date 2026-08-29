import { UserProfile, RoleType } from './user';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface CandidateRegisterPayload {
  full_name: string;
  email: string;
  password: string;
  phone_number?: string;
  district?: string;
  country?: string;
  education_level?: string;
  skills?: string[];
  consent_given?: boolean;
}

export interface CompanyRegisterPayload {
  company_name: string;
  email: string;
  password: string;
  industry_sector?: string;
  company_type?: string;
  district?: string;
  country?: string;
  website?: string;
  address?: string;
  phone_number?: string;
}

export interface RecruiterRegisterPayload {
  full_name: string;
  email: string;
  password: string;
  company_name: string;
  phone_number?: string;
  job_title?: string;
}

export interface ProviderRegisterPayload {
  name: string;
  email: string;
  password: string;
  provider_type?: string;
  district?: string;
  country?: string;
  address?: string;
  phone_number?: string;
  accreditation_status?: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  phone_number?: string;
  role_name: RoleType;
  district?: string;
  organization_name?: string;
  consent_given?: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: UserProfile;
}

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
