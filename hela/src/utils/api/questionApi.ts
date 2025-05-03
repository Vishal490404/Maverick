import { API_URL, handleApiError } from './utils';
import { ApiResponse, Question, ScanResult, QuestionBank } from './types';

/**
 * Question management API client
 */
export const questionApi = {
  /**
   * Scan PDF document to extract questions
   */
  scanPdf: async (file: File, token: string): Promise<ApiResponse<ScanResult>> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/question-extractor/scan-pdf`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorMessage = await handleApiError(response);
        return { error: errorMessage, statusCode: response.status };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Scan PDF error:', error);
      return { error: 'Network error. Please check your connection and try again.' };
    }
  },

  /**
   * Scan Excel/CSV document to extract questions
   */
  scanExcel: async (file: File, token: string): Promise<ApiResponse<ScanResult>> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/question-extractor/scan-excel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorMessage = await handleApiError(response);
        return { error: errorMessage, statusCode: response.status };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Scan Excel/CSV error:', error);
      return { error: 'Network error. Please check your connection and try again.' };
    }
  },

  /**
   * Scan Image to extract questions
   */
  scanImage: async (file: File, token: string): Promise<ApiResponse<ScanResult>> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/question-extractor/scan-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorMessage = await handleApiError(response);
        return { error: errorMessage, statusCode: response.status };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Scan image error:', error);
      return { error: 'Network error. Please check your connection and try again.' };
    }
  },

  /**
   * Create a new question
   */
  createQuestion: async (question: any, token: string): Promise<ApiResponse<Question>> => {
    try {
      const formData = new FormData();
      
      // Add all question fields to the form data
      Object.entries(question).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'image' && value instanceof File) {
            formData.append('image', value);
          } else if (key === 'tags' && typeof value === 'string' && value.trim()) {
            // Convert comma-separated tags string to appropriate format
            formData.append('tags', value.trim());
          } else {
            formData.append(key, String(value));
          }
        }
      });

      const response = await fetch(`${API_URL}/questions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorMessage = await handleApiError(response);
        return { error: errorMessage, statusCode: response.status };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Create question error:', error);
      return { error: 'Network error. Please check your connection and try again.' };
    }
  },
  getQuestions: async (token: string): Promise<ApiResponse<Question[]>> => {
    try {
      const response = await fetch(`${API_URL}/questions`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorMessage = await handleApiError(response);
        return { error: errorMessage, statusCode: response.status };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Get questions error:', error);
      return { error: 'Network error. Please check your connection and try again.' };
    }
  },

  /**
   * Get a single question by ID
   */
  getQuestion: async (questionId: string, token: string): Promise<ApiResponse<Question>> => {
    try {
      const response = await fetch(`${API_URL}/questions/${questionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorMessage = await handleApiError(response);
        return { error: errorMessage, statusCode: response.status };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Get question error:', error);
      return { error: 'Network error. Please check your connection and try again.' };
    }
  },

  /**
   * Get questions by topic
   */
  getQuestionsByTopic: async (topicId: string, token: string): Promise<ApiResponse<Question[]>> => {
    try {
      const response = await fetch(`${API_URL}/questions/topic/${topicId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorMessage = await handleApiError(response);
        return { error: errorMessage, statusCode: response.status };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Get questions by topic error:', error);
      return { error: 'Network error. Please check your connection and try again.' };
    }
  },

  /**
   * Update a question
   */
  updateQuestion: async (questionId: string, question: any, token: string): Promise<ApiResponse<Question>> => {
    try {
      const formData = new FormData();
      
      // Add all question fields to the form data
      Object.entries(question).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'image' && value instanceof File) {
            formData.append('image', value);
          } else if (key === 'tags' && typeof value === 'string' && value.trim()) {
            // Convert comma-separated tags string to appropriate format
            formData.append('tags', value.trim());
          } else {
            formData.append(key, String(value));
          }
        }
      });

      const response = await fetch(`${API_URL}/questions/${questionId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorMessage = await handleApiError(response);
        return { error: errorMessage, statusCode: response.status };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Update question error:', error);
      return { error: 'Network error. Please check your connection and try again.' };
    }
  },

  /**
   * Delete a question
   */
  deleteQuestion: async (questionId: string, token: string): Promise<ApiResponse<null>> => {
    try {
      const response = await fetch(`${API_URL}/questions/${questionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorMessage = await handleApiError(response);
        return { error: errorMessage, statusCode: response.status };
      }

      return { data: null };
    } catch (error) {
      console.error('Delete question error:', error);
      return { error: 'Network error. Please check your connection and try again.' };
    }
  },

  /**
   * Get question image URL
   */
  getQuestionImageUrl: (questionId: string, imageId: string): string => {
    return `${API_URL}/questions/${questionId}/images/${imageId}`;
  },

  /**
   * Create a new question bank
   */
  createQuestionBank: async (questionBank: { description?: string, standard_id: string, subject_id: string }, token?: string): Promise<ApiResponse<QuestionBank>> => {
    try {
      const response = await fetch(`${API_URL}/question-banks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(questionBank)
      });

      if (!response.ok) {
        const errorMessage = await handleApiError(response);
        return { error: errorMessage, statusCode: response.status };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Create question bank error:', error);
      return { error: 'Network error. Please check your connection and try again.' };
    }
  },
  
  /**
   * Add a question to a question bank
   */
  addQuestionToBank: async (bankId: string, questionId: string, token: string): Promise<ApiResponse<null>> => {
    try {
      const response = await fetch(`${API_URL}/question-banks/${bankId}/questions/${questionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorMessage = await handleApiError(response);
        return { error: errorMessage, statusCode: response.status };
      }

      return { data: null };
    } catch (error) {
      console.error('Add question to bank error:', error);
      return { error: 'Network error. Please check your connection and try again.' };
    }
  },

  /**
   * Get questions in a bank
   */
  getQuestionsInBank: async (bankId: string, token: string): Promise<ApiResponse<Question[]>> => {
    try {
      const response = await fetch(`${API_URL}/question-banks/${bankId}/questions`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorMessage = await handleApiError(response);
        return { error: errorMessage, statusCode: response.status };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Get questions in bank error:', error);
      return { error: 'Network error. Please check your connection and try again.' };
    }
  },
  
  /**
   * Remove a question from a bank
   */
  removeQuestionFromBank: async (bankId: string, questionId: string, token: string): Promise<ApiResponse<null>> => {
    try {
      const response = await fetch(`${API_URL}/question-banks/${bankId}/questions/${questionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorMessage = await handleApiError(response);
        return { error: errorMessage, statusCode: response.status };
      }

      return { data: null };
    } catch (error) {
      console.error('Remove question from bank error:', error);
      return { error: 'Network error. Please check your connection and try again.' };
    }
  }
};