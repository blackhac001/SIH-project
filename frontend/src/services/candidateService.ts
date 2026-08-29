import { api } from './api';
import { RoleType } from '../types/user';

export interface CandidateItem {
  id: number;
  uuid: string;
  candidate_id: string;
  full_name: string;
  gender: string;
  education_level?: string;
  email?: string;
  phone?: string;
  district_id: number;
  district?: {
    id: number;
    name: string;
    code: string;
  };
  employment_status: string;
  profile?: {
    bio?: string;
    expected_salary_min?: number;
    external_references?: Record<string, any>;
  };
  candidate_skills?: Array<{
    id: number;
    proficiency_level: string;
    skill: {
      id: number;
      name: string;
      category: string;
      code: string;
    };
  }>;
  created_at: string;
}

export interface CandidateListResponse {
  items: CandidateItem[];
  total: number;
  page: number;
  page_size: number;
}

export const candidateService = {
  list: async (params?: {
    search?: string;
    district_id?: number;
    employment_status?: string;
    page?: number;
    page_size?: number;
  }): Promise<CandidateListResponse> => {
    const response = await api.get<CandidateListResponse>('/candidates', { params });
    return response.data;
  },

  getByIdOrRef: async (idOrRef: string): Promise<CandidateItem> => {
    const response = await api.get<CandidateItem>(`/candidates/${idOrRef}`);
    return response.data;
  },
};
