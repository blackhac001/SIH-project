import { api } from './api';
import {
  ResumeData, ResumeStatus, ResumeUploadResponse, ResumeExtractedText,
  ResumeAnalysisResult, ResumeAnalysisStatus
} from '../types/resume';

export const resumeService = {
  /**
   * Fetch the current authenticated user's active CV status.
   */
  getStatus: async (): Promise<ResumeStatus> => {
    const response = await api.get<ResumeStatus>('/resume');
    return response.data;
  },

  /**
   * Fetch clean, structured extracted text from the authenticated user's active CV.
   */
  getExtractedText: async (resumeId?: number): Promise<ResumeExtractedText> => {
    const url = resumeId ? `/resume/${resumeId}/text` : '/resume/text';
    const response = await api.get<ResumeExtractedText>(url);
    return response.data;
  },

  /**
   * Upload or replace a CV for the authenticated user.
   * Sends multipart/form-data with file.
   */
  upload: async (file: File): Promise<ResumeUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<ResumeUploadResponse>('/resume/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Trigger AI-powered CV analysis for the authenticated user.
   */
  analyze: async (targetRole?: string): Promise<ResumeAnalysisResult> => {
    const response = await api.post<ResumeAnalysisResult>('/resume/analyze', {
      target_role: targetRole || "General / As Described in CV"
    });
    return response.data;
  },

  /**
   * Fetch the latest saved AI analysis for the authenticated user's current CV.
   */
  getLatestAnalysis: async (resumeId?: number): Promise<ResumeAnalysisStatus> => {
    const url = resumeId ? `/resume/${resumeId}/analysis` : '/resume/analysis';
    const response = await api.get<ResumeAnalysisStatus>(url);
    return response.data;
  },

  /**
   * Download the authenticated user's active CV as a blob.
   */
  download: async (resumeId?: number): Promise<{ blob: Blob; filename?: string }> => {
    const url = resumeId ? `/resume/${resumeId}/download` : '/resume/download';
    const response = await api.get(url, {
      responseType: 'blob',
    });

    // Extract filename from content-disposition header if present
    let filename = 'my_cv.pdf';
    const disposition = response.headers['content-disposition'];
    if (disposition && disposition.indexOf('filename=') !== -1) {
      const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (match && match[1]) {
        filename = match[1].replace(/['"]/g, '');
      }
    }

    return { blob: response.data, filename };
  },

  /**
   * Delete the authenticated user's active CV.
   */
  delete: async (resumeId?: number): Promise<{ message: string }> => {
    const url = resumeId ? `/resume/${resumeId}` : '/resume';
    const response = await api.delete<{ message: string }>(url);
    return response.data;
  },
};
