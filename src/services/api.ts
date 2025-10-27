import { GetRoundResponse, ApiResponse } from '../shared/types';

const API_BASE_URL = '/api';

class ApiService {
  private async request<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      return { 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  async getRound(): Promise<ApiResponse<GetRoundResponse>> {
    const result = await this.request<GetRoundResponse>('/get-round');
    
    if (result.data && !Array.isArray(result.data)) {
      return { error: 'Invalid response format' };
    }
    
    if (result.data && result.data.length !== 2) {
      return { error: 'Invalid response format - expected 2 characters' };
    }
    
    return result;
  }

  async getStats(): Promise<ApiResponse<{ totalCharacters: number }>> {
    return this.request<{ totalCharacters: number }>('/stats');
  }
}

export const apiService = new ApiService();

