import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GameState, Badge, Challenge } from '../types';

interface GameContextType {
  gameState: GameState;
  addPoints: (points: number) => void;
  completeChallenge: (challenge: Challenge) => void;
  resetStreak: () => void;
  incrementStreak: () => void;
  earnBadge: (badge: Badge) => void;
  getLevel: () => number;
  getPointsForNextLevel: () => number;
  getTotalPointsForLevel: (level: number) => number;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

const POINTS_PER_LEVEL = 1000;
const STREAK_BONUS_MULTIPLIER = 1.5;

const getInitialGameState = (): GameState => {
  const saved = localStorage.getItem('questlyGameState');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        lastActiveDate: new Date(parsed.lastActiveDate),
        badges: parsed.badges.map((badge: any) => ({
          ...badge,
          earnedAt: new Date(badge.earnedAt)
        }))
      };
    } catch (error) {
      console.error('Failed to parse saved game state:', error);
    }
  }
  
  return {
    points: 0,
    streak: 1, // Set to 1 day as shown in design
    level: 1,
    badges: [],
    completedChallenges: 0,
    totalChallenges: 0,
    lastActiveDate: new Date()
  };
};

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>(getInitialGameState);

  useEffect(() => {
    // Check if streak should be reset (if more than 24 hours have passed)
    const now = new Date();
    const timeDiff = now.getTime() - gameState.lastActiveDate.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
      setGameState(prev => ({ ...prev, streak: 0 }));
    }
  }, [gameState.lastActiveDate]);

  useEffect(() => {
    // Save game state to localStorage whenever it changes
    localStorage.setItem('questlyGameState', JSON.stringify(gameState));
  }, [gameState]);

  const addPoints = (points: number) => {
    setGameState(prev => {
      const streakBonus = prev.streak > 0 ? Math.floor(points * (STREAK_BONUS_MULTIPLIER - 1)) : 0;
      const totalPoints = points + streakBonus;
      
      return {
        ...prev,
        points: prev.points + totalPoints,
        lastActiveDate: new Date()
      };
    });
  };

  const completeChallenge = (challenge: Challenge) => {
    setGameState(prev => ({
      ...prev,
      completedChallenges: prev.completedChallenges + 1,
      totalChallenges: prev.totalChallenges + 1,
      lastActiveDate: new Date()
    }));
    
    addPoints(challenge.points);
    
    // Check for milestone badges
    checkMilestoneBadges(gameState.completedChallenges + 1);
  };

  const resetStreak = () => {
    setGameState(prev => ({ ...prev, streak: 0 }));
  };

  const incrementStreak = () => {
    setGameState(prev => ({ 
      ...prev, 
      streak: prev.streak + 1,
      lastActiveDate: new Date()
    }));
    
    // Check for streak badges
    checkStreakBadges(gameState.streak + 1);
  };

  const earnBadge = (badge: Badge) => {
    setGameState(prev => ({
      ...prev,
      badges: [...prev.badges, badge]
    }));
  };

  const getLevel = (): number => {
    return Math.floor(gameState.points / POINTS_PER_LEVEL) + 1;
  };

  const getPointsForNextLevel = (): number => {
    const currentLevel = getLevel();
    return (currentLevel * POINTS_PER_LEVEL) - gameState.points;
  };

  const getTotalPointsForLevel = (level: number): number => {
    return (level - 1) * POINTS_PER_LEVEL;
  };

  const checkMilestoneBadges = (completedChallenges: number) => {
    const milestones = [
      { count: 10, name: 'First Steps', description: 'Complete 10 challenges', rarity: 'bronze' as const },
      { count: 50, name: 'Getting Started', description: 'Complete 50 challenges', rarity: 'silver' as const },
      { count: 100, name: 'Challenger', description: 'Complete 100 challenges', rarity: 'gold' as const },
      { count: 500, name: 'Master', description: 'Complete 500 challenges', rarity: 'platinum' as const }
    ];

    milestones.forEach(milestone => {
      if (completedChallenges === milestone.count) {
        earnBadge({
          id: `milestone_${milestone.count}`,
          name: milestone.name,
          description: milestone.description,
          icon: '🏆',
          rarity: milestone.rarity,
          earnedAt: new Date()
        });
      }
    });
  };

  const checkStreakBadges = (streak: number) => {
    const streakMilestones = [
      { count: 7, name: 'Week Warrior', description: '7-day streak', rarity: 'bronze' as const },
      { count: 30, name: 'Month Master', description: '30-day streak', rarity: 'silver' as const },
      { count: 100, name: 'Streak Legend', description: '100-day streak', rarity: 'gold' as const }
    ];

    streakMilestones.forEach(milestone => {
      if (streak === milestone.count) {
        earnBadge({
          id: `streak_${milestone.count}`,
          name: milestone.name,
          description: milestone.description,
          icon: '🔥',
          rarity: milestone.rarity,
          earnedAt: new Date()
        });
      }
    });
  };

  const value: GameContextType = {
    gameState,
    addPoints,
    completeChallenge,
    resetStreak,
    incrementStreak,
    earnBadge,
    getLevel,
    getPointsForNextLevel,
    getTotalPointsForLevel
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}; 