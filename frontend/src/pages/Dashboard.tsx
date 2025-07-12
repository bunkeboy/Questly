import React, { useState } from 'react';
import { Box } from '@mui/material';
import { useUser } from '../context/UserContext';
import Header from '../components/Header';
import GoalProgressSection from '../components/GoalProgressSection';
import HealthDashboard from '../components/HealthDashboard';
import PipelineOverview from '../components/PipelineOverview';
import TodaysChallenges from '../components/TodaysChallenges';
import Leaderboard from '../components/Leaderboard';
import ThemeSwitcher from '../components/ThemeSwitcher';

const Dashboard: React.FC = () => {
  const { user } = useUser();
  const [activeView, setActiveView] = useState<number>(0);

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <div>Please complete onboarding first</div>
      </Box>
    );
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 0: // Today's Tasks
        return <TodaysChallenges />;
      case 1: // Health Dashboard  
        return (
          <>
            <GoalProgressSection />
            <HealthDashboard />
          </>
        );
      case 2: // Leaderboard
        return <Leaderboard />;
      case 3: // Pipeline Overview
        return <PipelineOverview />;
      default:
        return <TodaysChallenges />;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header 
        activeView={activeView} 
        onViewChange={setActiveView} 
      />
      
      {renderActiveView()}
      
      {/* Theme Switcher for testing - remove in production */}
      <ThemeSwitcher />
    </Box>
  );
};

export default Dashboard; 