import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeType, ThemeConfig } from '../types';

interface ThemeContextType {
  theme: ThemeType;
  themeConfig: ThemeConfig;
  setTheme: (theme: ThemeType) => void;
  availableThemes: ThemeConfig[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const themeConfigs: Record<ThemeType, ThemeConfig> = {
  professional: {
    name: 'professional',
    displayName: 'Professional',
    colors: {
      primary: '#2563eb',
      secondary: '#64748b',
      accent: '#059669',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1e293b',
      textSecondary: '#64748b'
    },
    icons: {
      task: '📋',
      reward: '🏆',
      streak: '🔥',
      level: '⭐'
    },
    terminology: {
      task: 'Task',
      reward: 'Achievement',
      streak: 'Streak',
      level: 'Level'
    }
  },
  space: {
    name: 'space',
    displayName: 'Space Explorer',
    colors: {
      primary: '#7c3aed',
      secondary: '#6366f1',
      accent: '#06b6d4',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      textSecondary: '#94a3b8'
    },
    icons: {
      task: '🚀',
      reward: '🌟',
      streak: '⚡',
      level: '🛸'
    },
    terminology: {
      task: 'Mission',
      reward: 'Achievement',
      streak: 'Momentum',
      level: 'Rank'
    }
  },
  medieval: {
    name: 'medieval',
    displayName: 'Medieval Quest',
    colors: {
      primary: '#92400e',
      secondary: '#78716c',
      accent: '#059669',
      background: '#fef7ed',
      surface: '#fffbeb',
      text: '#451a03',
      textSecondary: '#78716c'
    },
    icons: {
      task: '⚔️',
      reward: '🏅',
      streak: '🔥',
      level: '👑'
    },
    terminology: {
      task: 'Quest',
      reward: 'Honor',
      streak: 'Victory Streak',
      level: 'Rank'
    }
  }
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeType>('professional');

  useEffect(() => {
    // Load theme from localStorage or user preferences
    const savedTheme = localStorage.getItem('questlyTheme');
    if (savedTheme && themeConfigs[savedTheme as ThemeType]) {
      setThemeState(savedTheme as ThemeType);
    }
  }, []);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update CSS custom properties
    const themeConfig = themeConfigs[theme];
    const root = document.documentElement;
    
    Object.entries(themeConfig.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}-color`, value);
    });
  }, [theme]);

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    localStorage.setItem('questlyTheme', newTheme);
  };

  const value: ThemeContextType = {
    theme,
    themeConfig: themeConfigs[theme],
    setTheme,
    availableThemes: Object.values(themeConfigs)
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 