export type RoleType =
  | 'CANDIDATE'
  | 'EMPLOYER'
  | 'TRAINING_PROVIDER'
  | 'DISTRICT_OFFICER'
  | 'STATE_ADMIN'
  | 'SUPER_ADMIN';

export interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  phone_number?: string;
  role: RoleType;
  role_display: string;
  district?: string;
  organization_name?: string;
  consent_given: boolean;
  is_active: boolean;
  is_verified: boolean;
}

export interface RoleInfo {
  id: number;
  name: RoleType;
  display_name: string;
  description?: string;
}
