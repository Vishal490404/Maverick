import { API_URL, handleApiError } from './utils';
import { ApiResponse, TokenResponse, UserData, RegisterUserData } from './types';

/**
 * Authentication API client
 */
export const authApi = {
  /**
   * Authenticate user and get access token
   */
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
  
  /**
   * Register a new user (requires admin token)
   */
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
  
  /**
   * Initial admin setup (only used when no users exist)
   */
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
  
  /**
   * Get current user info
   */
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
  
  /**
   * Log out (optional - if your API has a logout endpoint)
   */
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