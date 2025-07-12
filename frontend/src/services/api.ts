import { UserProfile, Challenge, ApiResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

class ApiService {
  private getAuthToken(): string | null {
    return localStorage.getItem('questlyToken');
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = this.getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = this.getHeaders();

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async register(email: string, password: string, name: string): Promise<ApiResponse<UserProfile> & { token: string }> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }) as Promise<ApiResponse<UserProfile> & { token: string }>;
  }

  async login(email: string, password: string): Promise<ApiResponse<UserProfile> & { token: string }> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }) as Promise<ApiResponse<UserProfile> & { token: string }>;
  }

  async logout(): Promise<ApiResponse<{ message: string }>> {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getProfile(): Promise<ApiResponse<UserProfile>> {
    return this.request('/auth/profile');
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    return this.request<UserProfile>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Challenge endpoints
  async getDailyChallenges(): Promise<ApiResponse<Challenge[]>> {
    return this.request('/challenges/daily');
  }

  async getAllChallenges(): Promise<ApiResponse<Challenge[]>> {
    return this.request('/challenges');
  }

  async completeChallenge(challengeId: string): Promise<ApiResponse<{ challenge: Challenge; gameState: any }>> {
    return this.request(`/challenges/${challengeId}/complete`, {
      method: 'POST',
    });
  }

  async getCompletedChallenges(page: number = 1, limit: number = 10): Promise<ApiResponse<Challenge[]>> {
    return this.request(`/challenges/completed?page=${page}&limit=${limit}`);
  }

  // Pipeline endpoints
  async getPipeline(): Promise<ApiResponse<any>> {
    return this.request('/pipeline');
  }

  async getHealthScores(): Promise<ApiResponse<any>> {
    return this.request('/pipeline/health');
  }

  async updatePipeline(data: any): Promise<ApiResponse<any>> {
    return this.request('/pipeline', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getPipelineStats(): Promise<ApiResponse<any>> {
    return this.request('/pipeline/stats');
  }

  // Follow Up Boss endpoints
  async connectFub(fubApiKey: string): Promise<ApiResponse<{ fubConnected: boolean }>> {
    return this.request('/auth/connect-fub', {
      method: 'POST',
      body: JSON.stringify({ fubApiKey }),
    });
  }

  async disconnectFub(): Promise<ApiResponse<{ fubConnected: boolean }>> {
    return this.request('/auth/disconnect-fub', {
      method: 'POST',
    });
  }

  async syncFubData(): Promise<ApiResponse<any>> {
    return this.request('/fub/sync', {
      method: 'POST',
    });
  }

  async getFubContacts(page: number = 1, limit: number = 50): Promise<ApiResponse<any>> {
    return this.request(`/fub/contacts?page=${page}&limit=${limit}`);
  }

  async getFubDeals(page: number = 1, limit: number = 50): Promise<ApiResponse<any>> {
    return this.request(`/fub/deals?page=${page}&limit=${limit}`);
  }

  async getFubActivities(page: number = 1, limit: number = 50): Promise<ApiResponse<any>> {
    return this.request(`/fub/activities?page=${page}&limit=${limit}`);
  }

  // Utility methods
  setAuthToken(token: string): void {
    localStorage.setItem('questlyToken', token);
  }

  removeAuthToken(): void {
    localStorage.removeItem('questlyToken');
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }
}

export const apiService = new ApiService();
export default apiService; 