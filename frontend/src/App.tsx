import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider as CustomThemeProvider } from './context/ThemeContext';
import { UserProvider } from './context/UserContext';
import { GameProvider } from './context/GameContext';
import { useCustomTheme } from './hooks/useCustomTheme';
import { useUser } from './context/UserContext';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Challenges from './pages/Challenges';
import Profile from './pages/Profile';
import TeamDashboard from './pages/TeamDashboard';
import './App.css';

const AppContent: React.FC = () => {
  const theme = useCustomTheme();
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <Routes>
            <Route 
              path="/" 
              element={
                user ? <Navigate to="/dashboard" replace /> : <Onboarding />
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                user ? <Dashboard /> : <Navigate to="/" replace />
              } 
            />
            <Route 
              path="/challenges" 
              element={
                user ? <Challenges /> : <Navigate to="/" replace />
              } 
            />
            <Route 
              path="/profile" 
              element={
                user ? <Profile /> : <Navigate to="/" replace />
              } 
            />
            <Route 
              path="/team" 
              element={
                user ? <TeamDashboard /> : <Navigate to="/" replace />
              } 
            />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
};

const App: React.FC = () => {
  return (
    <CustomThemeProvider>
      <UserProvider>
        <GameProvider>
          <AppContent />
        </GameProvider>
      </UserProvider>
    </CustomThemeProvider>
  );
};

export default App; 