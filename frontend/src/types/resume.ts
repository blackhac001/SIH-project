export interface ResumeData {
  id: number;
  uuid: string;
  user_id: number;
  candidate_id?: number | null;
  filename: string;
  file_size: number;
  content_type: string;
  is_active: boolean;
  char_count?: number;
  word_count?: number;
  extraction_status?: string;
  extraction_error?: string | null;
  created_at: string;
  updated_at: string;
  download_url: string;
}

export interface ResumeStatus {
  has_resume: boolean;
  resume: ResumeData | null;
}

export interface ResumeUploadResponse {
  message: string;
  resume: ResumeData;
  extracted_text_preview?: string | null;
}

export interface ResumeExtractedText {
  resume_id: number;
  filename: string;
  extracted_text: string | null;
  char_count: number;
  word_count: number;
  extraction_status: string;
  extraction_error: string | null;
  has_extractable_text: boolean;
}

export interface EducationItem {
  institution: string;
  degree: string;
  field_of_study?: string | null;
  graduation_year?: string | number | null;
  grade_or_gpa?: string | null;
}

export interface ExperienceItem {
  title: string;
  company: string;
  location?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_current?: boolean;
  highlights?: string[];
}

export interface ProjectItem {
  name: string;
  description: string;
  technologies?: string[];
  link?: string | null;
}

export interface ResumeAnalysisResult {
  id: number;
  uuid: string;
  user_id: number;
  resume_id?: number | null;
  candidate_id?: number | null;
  target_role?: string;
  seniority: string;
  resume_score: number;
  ats_score: number;
  job_readiness: number;
  summary?: string | null;
  skills: string[];
  technical_skills: string[];
  soft_skills: string[];
  education: EducationItem[] | any[];
  experience: ExperienceItem[] | any[];
  projects: ProjectItem[] | any[];
  certifications: string[] | any[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  missing_sections: string[];
  extracted_skills?: Array<{ name: string; category: string; proficiency: number }>;
  missing_keywords?: string[];
  job_match_comparisons?: any[];
  analysis_status: string;
  error_message?: string | null;
  model_used?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ResumeAnalysisStatus {
  has_analysis: boolean;
  analysis: ResumeAnalysisResult | null;
}
