import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Button, 
  Chip,
  Stack,
  Tabs,
  Tab
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';

interface HeaderProps {
  activeView: number;
  onViewChange: (view: number) => void;
}

const Header: React.FC<HeaderProps> = ({ activeView, onViewChange }) => {
  const { themeConfig } = useTheme();
  const { gameState, resetStreak } = useGame();
  const navigate = useNavigate();

  const views = [
    { label: `Today's ${themeConfig.terminology.task}s`, icon: themeConfig.icons.task },
    { label: 'Health Dashboard', icon: '📊' },
    { label: 'Leaderboard', icon: '🏆' },
    { label: 'Pipeline Overview', icon: '📈' }
  ];

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{ 
        bgcolor: 'background.default',
        borderBottom: 1,
        borderColor: 'divider'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: 3 }}>
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              bgcolor: 'primary.main',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              cursor: 'pointer'
            }}
            onClick={() => navigate('/dashboard')}
          >
            🎯
          </Box>
          <Typography
            variant="h5"
            component="div"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              cursor: 'pointer'
            }}
            onClick={() => navigate('/dashboard')}
          >
            Questly
          </Typography>
        </Box>

        {/* Navigation Tabs */}
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <Tabs 
            value={activeView} 
            onChange={(e, newValue) => onViewChange(newValue)}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.9rem'
              }
            }}
          >
            {views.map((view, index) => (
              <Tab 
                key={index}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>{view.icon}</span>
                    {view.label}
                  </Box>
                }
              />
            ))}
          </Tabs>
        </Box>

        {/* Persistent Info Bar */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Chip
            icon={<span>{themeConfig.icons.streak}</span>}
            label={`${gameState.streak} day ${themeConfig.terminology.streak.toLowerCase()}`}
            sx={{
              bgcolor: 'warning.main',
              color: 'warning.contrastText',
              fontWeight: 600,
              '& .MuiChip-icon': {
                fontSize: '16px'
              }
            }}
          />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: 'text.primary'
            }}
          >
            {gameState.points} points
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={handleProfileClick}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              minWidth: 'auto'
            }}
          >
            Profile
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={resetStreak}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              color: 'error.main',
              borderColor: 'error.main'
            }}
          >
            Reset
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 