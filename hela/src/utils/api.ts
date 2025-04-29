// API URLs
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9563';

// Define types for API responses
interface ApiResponse<T> {
  data?: T;
  error?: string;
  statusCode?: number;
}

// User related types
interface UserData {
  username: string;
  email: string;
  full_name: string;
  is_superuser: boolean;
  contact_number?: string;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

interface RegisterUserData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  full_name: string;
  contact_number?: string;
  is_superuser?: boolean;
}

// Paper and question related types
export interface Standard {
  id: string;
  name: string;
  description?: string;
}

export interface Subject {
  id: string;
  name: string;
  description?: string;
}

export interface Topic {
  id: string;
  title: string;
  name?: string; // For curriculum APIs that use name instead of title
  description?: string;
  selected?: boolean;
}

export interface Chapter {
  id: string;
  title: string;
  name?: string; // For curriculum APIs that use name instead of title
  description?: string;
  selected?: boolean;
  topics?: Topic[];
}

export interface QuestionType {
  id: string;
  title: string;
  name?: string; // For curriculum APIs that use name instead of title
  description?: string;
  selected?: boolean;
}

export interface Tag {
  id: string;
  name: string;
  description?: string;
  color: string;
  usage_count?: number;
}

export interface QuestionBank {
  id: string;
  name: string;
  description?: string;
}

// Helper functions for API requests
const handleApiError = async (response: Response): Promise<string> => {
  try {
    const errorData = await response.json();
    return errorData.detail || `Error: ${response.status} ${response.statusText}`;
  } catch (error) {
    return `Error: ${response.status} ${response.statusText}, ${error}`;
  }
};

export const authApi = {
  login: async (username: string, password: string): Promise<ApiResponse<TokenResponse>> => {
    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorMessage = await handleApiError(response);
        return { error: errorMessage, statusCode: response.status };
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Login error:', error);
      return { error: 'Network error. Please check your connection and try again.' };
    }
  },
  
  // Register a new user (requires admin token)
  register: async (userData: RegisterUserData, token: string): Promise<ApiResponse<UserData>> => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const errorMessage = await handleApiError(response);
        return { error: errorMessage, statusCode: response.status };
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Registration error:', error);
      return { error: 'Network error. Please check your connection and try again.' };
    }
  },
  
  // Initial admin setup (only used when no users exist)
  initialAdminSetup: async (userData: RegisterUserData): Promise<ApiResponse<UserData>> => {
    try {
      const response = await fetch(`${API_URL}/auth/initial-admin-setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const errorMessage = await handleApiError(response);
        return { error: errorMessage, statusCode: response.status };
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Admin setup error:', error);
      return { error: 'Network error. Please check your connection and try again.' };
    }
  },
  
  // Get current user info
  getCurrentUser: async (token: string): Promise<ApiResponse<UserData>> => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
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
      console.error('Get user info error:', error);
      return { error: 'Network error. Please check your connection and try again.' };
    }
  },
  
  // Log out (optional - if your API has a logout endpoint)
  logout: async (token: string): Promise<ApiResponse<null>> => {
    try {
      // If your backend doesn't have a logout endpoint, you can omit this call
      // and just return { data: null }
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Even if the server response isn't ok, we still consider the client logged out
      if (!response.ok) {
        console.warn('Logout API error, but continuing client logout');
      }
      
      return { data: null };
    } catch (error) {
      console.warn('Logout error:', error);
      // Still return success as we want the client to log out
      return { data: null };
    }
  },
};

export const paperApi = {
  // Get all standards/grades
  getStandards: async (token: string): Promise<ApiResponse<Standard[]>> => {
    try {
      const response = await fetch(`${API_URL}/standards`, {
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
  
  // Get subjects for a standard
  getSubjects: async (standardId: string, token: string): Promise<ApiResponse<Subject[]>> => {
    try {
      const response = await fetch(`${API_URL}/standards/${standardId}/subjects`, {
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
  
  // Get chapters for a subject in a standard
  getChapters: async (standardId: string, subjectId: string, token: string): Promise<ApiResponse<Chapter[]>> => {
    try {
      const response = await fetch(`${API_URL}/standards/${standardId}/subjects/${subjectId}/chapters`, {
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
  
  // Get question types
  getQuestionTypes: async (token: string): Promise<ApiResponse<QuestionType[]>> => {
    try {
      const response = await fetch(`${API_URL}/question-types`, {
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
  
  // Get question banks
  getQuestionBanks: async (token: string): Promise<ApiResponse<QuestionBank[]>> => {
    try {
      const response = await fetch(`${API_URL}/question-banks`, {
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
  
  // Generate paper - for both custom and random generation
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

// New API object for curriculum management
export const curriculumApi = {
  // STANDARDS (GRADES) ENDPOINTS
  
  // Get all standards
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
  
  // Create a new standard
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
  
  // Update a standard
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
  
  // Delete a standard
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
  
  // Get subjects for a standard
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
  
  // Create a subject for a standard
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
  
  // Update a subject
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
  
  // Delete a subject
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
  
  // Get chapters for a subject
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
  
  // Create a chapter for a subject
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
  
  // Update a chapter
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
  
  // Delete a chapter
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
  
  // Get topics for a chapter
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
  
  // Create a topic for a chapter
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
  
  // Update a topic
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
  
  // Delete a topic
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
  
  // Get all question types
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
  
  // Create a question type
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

  // Add missing deleteQuestionType function to the curriculumApi object
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

  // Add missing updateQuestionType function to the curriculumApi object
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

  // Get all tags
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

  // Create a tag
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

  // Update a tag
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

  // Delete a tag
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

export interface Question {
  id: string;
  question_text: string;
  question_type_id: string;
  question_type_name: string;
  difficulty_level: string;
  marks: number;
  image_required: boolean;
  images?: string[];
  topic_id: string;
  chapter_id: string;
  subject_id: string;
  standard_id: string;
  tags?: string[];
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
}

export interface QuestionType {
  id: string;
  name: string;
  description?: string;
  usage_count?: number;
  selected?: boolean;
}

export interface ScanResult {
  questions: Array<{
    question_text: string;
    image_required: boolean;
    difficulty_level?: string;
    marks?: number;
  }>;
}

// Question API handling
export const questionApi = {
  // Scan PDF document to extract questions
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

  // Scan Excel/CSV document to extract questions
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

  // Scan Image to extract questions
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

  // Create a new question
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

  // Get question image URL
  getQuestionImageUrl: (questionId: string, imageId: string): string => {
    return `${API_URL}/questions/${questionId}/images/${imageId}`;
  },

  // Get questions by topic
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
};