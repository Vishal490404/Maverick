import { API_URL, handleApiError } from './utils';
import { ApiResponse, Standard, Subject, Chapter, QuestionType, QuestionBank } from './types';

/**
 * Paper generation and management API client
 */
export const paperApi = {
  /**
   * Get all standards/grades
   */
  getStandards: async (token: string): Promise<ApiResponse<Standard[]>> => {
    try {
      const response = await fetch(`${API_URL}/curriculum/standards`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      
      if (!response.ok) {
        const errorMessage = await handleApiError(response);
        return { error: errorMessage, statusCode: response.status };
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Get standards error:', error);
      return { error: 'Network error. Please check your connection and try again.' };
    }
  },
  
  /**
   * Get subjects for a standard
   */
  getSubjects: async (standardId: string, token: string): Promise<ApiResponse<Subject[]>> => {
    try {
      const response = await fetch(`${API_URL}/curriculum/standards/${standardId}/subjects`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      
      if (!response.ok) {
        const errorMessage = await handleApiError(response);
        return { error: errorMessage, statusCode: response.status };
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Get subjects error:', error);
      return { error: 'Network error. Please check your connection and try again.' };
    }
  },
  
  /**
   * Get chapters for a subject (Fixed route to match API)
   */
  getChapters: async (subjectId: string, token: string): Promise<ApiResponse<Chapter[]>> => {
    try {
      // Fixed route to use curriculum/subjects/{subjectId}/chapters instead
      const response = await fetch(`${API_URL}/curriculum/subjects/${subjectId}/chapters`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      
      if (!response.ok) {
        const errorMessage = await handleApiError(response);
        return { error: errorMessage, statusCode: response.status };
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Get chapters error:', error);
      return { error: 'Network error. Please check your connection and try again.' };
    }
  },
  
  /**
   * Get question types
   */
  getQuestionTypes: async (token: string): Promise<ApiResponse<QuestionType[]>> => {
    try {
      const response = await fetch(`${API_URL}/curriculum/question-types`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      
      if (!response.ok) {
        const errorMessage = await handleApiError(response);
        return { error: errorMessage, statusCode: response.status };
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Get question types error:', error);
      return { error: 'Network error. Please check your connection and try again.' };
    }
  },
  
  /**
   * Get question banks
   */
  getQuestionBanks: async (token: string): Promise<ApiResponse<QuestionBank[]>> => {
    try {
      const response = await fetch(`${API_URL}/questions/banks`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      
      if (!response.ok) {
        const errorMessage = await handleApiError(response);
        return { error: errorMessage, statusCode: response.status };
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Get question banks error:', error);
      return { error: 'Network error. Please check your connection and try again.' };
    }
  },
  
  /**
   * Generate paper - for both custom and random generation
   */
  generatePaper: async (paperData: any, token: string): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_URL}/papers/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(paperData),
      });
      
      if (!response.ok) {
        const errorMessage = await handleApiError(response);
        return { error: errorMessage, statusCode: response.status };
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Generate paper error:', error);
      return { error: 'Network error. Please check your connection and try again.' };
    }
  }
};