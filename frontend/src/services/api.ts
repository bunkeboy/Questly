import { UserProfile, Challenge, ApiResponse, DailyPlan, DailyTask, TaskAnalytics, TaskHistory } from '../types';

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
      console.log(`🔗 API Request: ${options.method || 'GET'} ${url}`);
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(`❌ API Error: ${response.status} - ${data.error || 'Unknown error'}`);
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`
        };
      }

      return {
        success: true,
        data: data.data || data
      };
    } catch (error) {
      console.error('💥 API request failed:', error);
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        return {
          success: false,
          error: 'Unable to connect to server. Please ensure the backend is running on port 5001.'
        };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'API request failed'
      };
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

  // Daily Task endpoints
  async getTodaysPlan(): Promise<ApiResponse<DailyPlan>> {
    return this.request('/daily-tasks/today');
  }

  async generateDailyPlan(): Promise<ApiResponse<DailyPlan>> {
    return this.request('/daily-tasks/generate', {
      method: 'POST',
    });
  }

  async completeTask(taskId: string): Promise<ApiResponse<{ task: DailyTask; gameState: any }>> {
    return this.request(`/daily-tasks/${taskId}/complete`, {
      method: 'POST',
    });
  }

  async updateTaskProgress(taskId: string, progress: number): Promise<ApiResponse<{ task: DailyTask }>> {
    return this.request(`/daily-tasks/${taskId}/progress`, {
      method: 'PUT',
      body: JSON.stringify({ progress }),
    });
  }

  async swapTask(removeTaskId: string, addTaskId: string): Promise<ApiResponse<{ swappedOut: any; swappedIn: any; selectedTasks: DailyTask[] }>> {
    return this.request('/daily-tasks/swap', {
      method: 'POST',
      body: JSON.stringify({ removeTaskId, addTaskId }),
    });
  }

  async getTaskAnalytics(days: number = 30): Promise<ApiResponse<TaskAnalytics>> {
    return this.request(`/daily-tasks/analytics?days=${days}`);
  }

  async getTaskHistory(days: number = 7): Promise<ApiResponse<{ history: TaskHistory[]; summary: any }>> {
    return this.request(`/daily-tasks/history?days=${days}`);
  }

  async getStreakInfo(): Promise<ApiResponse<{ streak: any; performance: any }>> {
    return this.request('/daily-tasks/streak');
  }

  async evaluateDailyCompletion(date?: Date): Promise<ApiResponse<{ message: string }>> {
    return this.request('/daily-tasks/evaluate', {
      method: 'POST',
      body: JSON.stringify({ date }),
    });
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