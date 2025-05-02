import { API_URL, handleApiError } from './utils';
import { ApiResponse, Standard, Subject, Chapter, Topic, QuestionType, Tag } from './types';

/**
 * Curriculum management API client
 */
export const curriculumApi = {
  // STANDARDS (GRADES) ENDPOINTS
  
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
   * Create a new standard
   */
  createStandard: async (standard: { name: string, description?: string }, token: string): Promise<ApiResponse<Standard>> => {
    try {
      const response = await fetch(`${API_URL}/curriculum/standards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(standard),
      });
      
      if (!response.ok) {
        const errorMessage = await handleApiError(response);
        return { error: errorMessage, statusCode: response.status };
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Create standard error:', error);
      return { error: 'Network error. Please check your connection and try again.' };
    }
  },
  
  /**
   * Update a standard
   */
  updateStandard: async (standardId: string, standard: { name?: string, description?: string }, token: string): Promise<ApiResponse<Standard>> => {
    try {
      const response = await fetch(`${API_URL}/curriculum/standards/${standardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(standard),
      });
      
      if (!response.ok) {
        const errorMessage = await handleApiError(response);
        return { error: errorMessage, statusCode: response.status };
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Update standard error:', error);
      return { error: 'Network error. Please check your connection and try again.' };
    }
  },
  
  /**
   * Delete a standard
   */
  deleteStandard: async (standardId: string, token: string): Promise<ApiResponse<null>> => {
    try {
      const response = await fetch(`${API_URL}/curriculum/standards/${standardId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      
      if (!response.ok) {
        const errorMessage = await handleApiError(response);
        return { error: errorMessage, statusCode: response.status };
      }
      
      return { data: null };
    } catch (error) {
      console.error('Delete standard error:', error);
      return { error: 'Network error. Please check your connection and try again.' };
    }
  },
  
  // SUBJECTS ENDPOINTS
  
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
   * Create a subject for a standard
   */
  createSubject: async (standardId: string, subject: { name: string, description?: string }, token: string): Promise<ApiResponse<Subject>> => {
    try {
      const response = await fetch(`${API_URL}/curriculum/standards/${standardId}/subjects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(subject),
      });
      
      if (!response.ok) {
        const errorMessage = await handleApiError(response);
        return { error: errorMessage, statusCode: response.status };
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Create subject error:', error);
      return { error: 'Network error. Please check your connection and try again.' };
    }
  },
  
  /**
   * Update a subject
   */
  updateSubject: async (subjectId: string, subject: { name?: string, description?: string }, token: string): Promise<ApiResponse<Subject>> => {
    try {
      const response = await fetch(`${API_URL}/curriculum/subjects/${subjectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(subject),
      });
      
      if (!response.ok) {
        const errorMessage = await handleApiError(response);
        return { error: errorMessage, statusCode: response.status };
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Update subject error:', error);
      return { error: 'Network error. Please check your connection and try again.' };
    }
  },
  
  /**
   * Delete a subject
   */
  deleteSubject: async (subjectId: string, token: string): Promise<ApiResponse<null>> => {
    try {
      const response = await fetch(`${API_URL}/curriculum/subjects/${subjectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      
      if (!response.ok) {
        const errorMessage = await handleApiError(response);
        return { error: errorMessage, statusCode: response.status };
      }
      
      return { data: null };
    } catch (error) {
      console.error('Delete subject error:', error);
      return { error: 'Network error. Please check your connection and try again.' };
    }
  },
  
  // CHAPTERS ENDPOINTS
  
  /**
   * Get chapters for a subject
   */
  getChapters: async (subjectId: string, token: string): Promise<ApiResponse<Chapter[]>> => {
    try {
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
   * Create a chapter for a subject
   */
  createChapter: async (subjectId: string, chapter: { name: string, description?: string }, token: string): Promise<ApiResponse<Chapter>> => {
    try {
      const response = await fetch(`${API_URL}/curriculum/subjects/${subjectId}/chapters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(chapter),
      });
      
      if (!response.ok) {
        const errorMessage = await handleApiError(response);
        return { error: errorMessage, statusCode: response.status };
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Create chapter error:', error);
      return { error: 'Network error. Please check your connection and try again.' };
    }
  },
  
  /**
   * Update a chapter
   */
  updateChapter: async (chapterId: string, chapter: { name?: string, description?: string }, token: string): Promise<ApiResponse<Chapter>> => {
    try {
      const response = await fetch(`${API_URL}/curriculum/chapters/${chapterId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(chapter),
      });
      
      if (!response.ok) {
        const errorMessage = await handleApiError(response);
        return { error: errorMessage, statusCode: response.status };
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Update chapter error:', error);
      return { error: 'Network error. Please check your connection and try again.' };
    }
  },
  
  /**
   * Delete a chapter
   */
  deleteChapter: async (chapterId: string, token: string): Promise<ApiResponse<null>> => {
    try {
      const response = await fetch(`${API_URL}/curriculum/chapters/${chapterId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      
      if (!response.ok) {
        const errorMessage = await handleApiError(response);
        return { error: errorMessage, statusCode: response.status };
      }
      
      return { data: null };
    } catch (error) {
      console.error('Delete chapter error:', error);
      return { error: 'Network error. Please check your connection and try again.' };
    }
  },
  
  // TOPICS ENDPOINTS
  
  /**
   * Get topics for a chapter
   */
  getTopics: async (chapterId: string, token: string): Promise<ApiResponse<Topic[]>> => {
    try {
      const response = await fetch(`${API_URL}/curriculum/chapters/${chapterId}/topics`, {
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
      console.error('Get topics error:', error);
      return { error: 'Network error. Please check your connection and try again.' };
    }
  },
  
  /**
   * Create a topic for a chapter
   */
  createTopic: async (chapterId: string, topic: { name: string, description?: string }, token: string): Promise<ApiResponse<Topic>> => {
    try {
      const response = await fetch(`${API_URL}/curriculum/chapters/${chapterId}/topics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(topic),
      });
      
      if (!response.ok) {
        const errorMessage = await handleApiError(response);
        return { error: errorMessage, statusCode: response.status };
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Create topic error:', error);
      return { error: 'Network error. Please check your connection and try again.' };
    }
  },
  
  /**
   * Update a topic
   */
  updateTopic: async (topicId: string, topic: { name?: string, description?: string }, token: string): Promise<ApiResponse<Topic>> => {
    try {
      const response = await fetch(`${API_URL}/curriculum/topics/${topicId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(topic),
      });
      
      if (!response.ok) {
        const errorMessage = await handleApiError(response);
        return { error: errorMessage, statusCode: response.status };
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Update topic error:', error);
      return { error: 'Network error. Please check your connection and try again.' };
    }
  },
  
  /**
   * Delete a topic
   */
  deleteTopic: async (topicId: string, token: string): Promise<ApiResponse<null>> => {
    try {
      const response = await fetch(`${API_URL}/curriculum/topics/${topicId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      
      if (!response.ok) {
        const errorMessage = await handleApiError(response);
        return { error: errorMessage, statusCode: response.status };
      }
      
      return { data: null };
    } catch (error) {
      console.error('Delete topic error:', error);
      return { error: 'Network error. Please check your connection and try again.' };
    }
  },
  
  // QUESTION TYPE ENDPOINTS
  
  /**
   * Get all question types
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
   * Create a question type
   */
  createQuestionType: async (questionType: { name: string, description?: string }, token: string): Promise<ApiResponse<QuestionType>> => {
    try {
      const response = await fetch(`${API_URL}/curriculum/question-types`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(questionType),
      });
      
      if (!response.ok) {
        const errorMessage = await handleApiError(response);
        return { error: errorMessage, statusCode: response.status };
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Create question type error:', error);
      return { error: 'Network error. Please check your connection and try again.' };
    }
  },

  /**
   * Delete a question type
   */
  deleteQuestionType: async (questionTypeId: string, token: string): Promise<ApiResponse<null>> => {
    try {
      const response = await fetch(`${API_URL}/curriculum/question-types/${questionTypeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      
      if (!response.ok) {
        const errorMessage = await handleApiError(response);
        return { error: errorMessage, statusCode: response.status };
      }
      
      return { data: null };
    } catch (error) {
      console.error('Delete question type error:', error);
      return { error: 'Network error. Please check your connection and try again.' };
    }
  },

  /**
   * Update a question type
   */
  updateQuestionType: async (questionTypeId: string, questionType: { name?: string, description?: string }, token: string): Promise<ApiResponse<QuestionType>> => {
    try {
      const response = await fetch(`${API_URL}/curriculum/question-types/${questionTypeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(questionType),
      });
      
      if (!response.ok) {
        const errorMessage = await handleApiError(response);
        return { error: errorMessage, statusCode: response.status };
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Update question type error:', error);
      return { error: 'Network error. Please check your connection and try again.' };
    }
  },

  // TAG ENDPOINTS

  /**
   * Get all tags
   */
  getTags: async (token: string): Promise<ApiResponse<Tag[]>> => {
    try {
      const response = await fetch(`${API_URL}/curriculum/tags`, {
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
      console.error('Get tags error:', error);
      return { error: 'Network error. Please check your connection and try again.' };
    }
  },

  /**
   * Create a tag
   */
  createTag: async (tag: { name: string, description?: string, color: string }, token: string): Promise<ApiResponse<Tag>> => {
    try {
      const response = await fetch(`${API_URL}/curriculum/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(tag),
      });
      
      if (!response.ok) {
        const errorMessage = await handleApiError(response);
        return { error: errorMessage, statusCode: response.status };
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Create tag error:', error);
      return { error: 'Network error. Please check your connection and try again.' };
    }
  },

  /**
   * Update a tag
   */
  updateTag: async (tagId: string, tag: { name?: string, description?: string, color?: string }, token: string): Promise<ApiResponse<Tag>> => {
    try {
      const response = await fetch(`${API_URL}/curriculum/tags/${tagId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(tag),
      });
      
      if (!response.ok) {
        const errorMessage = await handleApiError(response);
        return { error: errorMessage, statusCode: response.status };
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Update tag error:', error);
      return { error: 'Network error. Please check your connection and try again.' };
    }
  },

  /**
   * Delete a tag
   */
  deleteTag: async (tagId: string, force: boolean = false, token: string): Promise<ApiResponse<null>> => {
    try {
      const response = await fetch(`${API_URL}/curriculum/tags/${tagId}?force=${force}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      
      if (!response.ok) {
        const errorMessage = await handleApiError(response);
        return { error: errorMessage, statusCode: response.status };
      }
      
      return { data: null };
    } catch (error) {
      console.error('Delete tag error:', error);
      return { error: 'Network error. Please check your connection and try again.' };
    }
  }
};