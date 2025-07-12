import React from 'react';
import { 
  Box, 
  Chip, 
  Typography, 
  Stack 
} from '@mui/material';
import { useTheme } from '../context/ThemeContext';
import { ThemeType } from '../types';

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme, availableThemes } = useTheme();

  return (
    <Box sx={{ 
      position: 'fixed', 
      bottom: 20, 
      right: 20, 
      p: 2, 
      bgcolor: 'background.paper',
      border: 1,
      borderColor: 'divider',
      borderRadius: 2,
      boxShadow: 2,
      zIndex: 1000
    }}>
      <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
        Test Themes:
      </Typography>
      <Stack direction="column" spacing={1}>
        {availableThemes.map((themeConfig) => (
          <Chip
            key={themeConfig.name}
            label={`${themeConfig.displayName} ${themeConfig.icons.task}`}
            onClick={() => setTheme(themeConfig.name as ThemeType)}
            color={theme === themeConfig.name ? 'primary' : 'default'}
            variant={theme === themeConfig.name ? 'filled' : 'outlined'}
            size="small"
            sx={{ justifyContent: 'flex-start' }}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default ThemeSwitcher; 