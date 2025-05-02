// API URLs and common utilities
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9563';

// Helper function for API error handling
export const handleApiError = async (response: Response): Promise<string> => {
  try {
    const errorData = await response.json();
    return errorData.detail || `Error: ${response.status} ${response.statusText}`;
  } catch (error) {
    return `Error: ${response.status} ${response.statusText}, ${error}`;
  }
};