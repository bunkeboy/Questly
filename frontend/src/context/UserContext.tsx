import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, GoalCalculation } from '../types';
import apiService from '../services/api';

interface UserContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  calculateGoals: () => GoalCalculation;
  setUser: (user: UserProfile) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing authentication on mount
    const initializeAuth = async () => {
      const token = localStorage.getItem('questlyToken');
      if (token) {
        try {
          // Verify token with backend and get user profile
          const response = await apiService.getProfile();
          if (response.success && response.data) {
            setUser(response.data);
          } else {
            // Token is invalid, remove it
            localStorage.removeItem('questlyToken');
            localStorage.removeItem('questlyUser');
          }
        } catch (error) {
          console.error('Failed to verify token:', error);
          // Token is invalid, remove it
          localStorage.removeItem('questlyToken');
          localStorage.removeItem('questlyUser');
        }
      } else {
        // No token found, create a demo user for onboarding
        try {
          console.log('No token found, creating demo user...');
          const response = await apiService.register('demo@questly.com', 'demo123', 'Demo User');
          if (response.success && response.token && response.data) {
            console.log('Demo user created successfully');
            apiService.setAuthToken(response.token);
            localStorage.setItem('questlyToken', response.token);
            setUser(response.data);
            localStorage.setItem('questlyUser', JSON.stringify(response.data));
          }
        } catch (error) {
          console.log('Demo user already exists or failed to create, trying to login...');
          try {
            const loginResponse = await apiService.login('demo@questly.com', 'demo123');
            if (loginResponse.success && loginResponse.token && loginResponse.data) {
              console.log('Demo user login successful');
              apiService.setAuthToken(loginResponse.token);
              localStorage.setItem('questlyToken', loginResponse.token);
              setUser(loginResponse.data);
              localStorage.setItem('questlyUser', JSON.stringify(loginResponse.data));
            }
          } catch (loginError) {
            console.error('Failed to create or login demo user:', loginError);
          }
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await apiService.login(email, password);
      
      if (response.success && response.token && response.data) {
        // Store the token
        apiService.setAuthToken(response.token);
        localStorage.setItem('questlyToken', response.token);
        // Set the user
        setUser(response.data);
        // Also store user in localStorage for offline access
        localStorage.setItem('questlyUser', JSON.stringify(response.data));
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage and state
      apiService.removeAuthToken();
      localStorage.removeItem('questlyToken');
      localStorage.removeItem('questlyUser');
      setUser(null);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!user) {
      throw new Error('No user logged in');
    }

    try {
      const response = await apiService.updateProfile(updates);
      
      if (response.success && response.data) {
        setUser(response.data);
        // Also store user in localStorage for offline access
        localStorage.setItem('questlyUser', JSON.stringify(response.data));
      } else {
        throw new Error(response.error || 'Profile update failed');
      }
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  };

  const calculateGoals = (): GoalCalculation => {
    if (!user) {
      throw new Error('User must be authenticated to calculate goals');
    }

    const { commissionGoal, averageSalesPrice, commissionRate, conversionRate } = user;

    const closingsNeeded = Math.ceil(commissionGoal / (averageSalesPrice * commissionRate));
    const leadsNeeded = Math.ceil(closingsNeeded / conversionRate);
    const monthlyClosings = Math.ceil(closingsNeeded / 12);
    const monthlyLeads = Math.ceil(leadsNeeded / 12);
    const weeklyClosings = Math.ceil(closingsNeeded / 52);
    const weeklyLeads = Math.ceil(leadsNeeded / 52);
    const dailyLeads = Math.ceil(leadsNeeded / 365);

    return {
      annualGoal: commissionGoal,
      averageSalesPrice,
      commissionRate,
      conversionRate,
      closingsNeeded,
      leadsNeeded,
      monthlyClosings,
      monthlyLeads,
      weeklyClosings,
      weeklyLeads,
      dailyLeads
    };
  };

  const value: UserContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateProfile,
    calculateGoals,
    setUser
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}; 