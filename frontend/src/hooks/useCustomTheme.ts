import { createTheme, Theme } from '@mui/material/styles';
import { useTheme } from '../context/ThemeContext';

export const useCustomTheme = (): Theme => {
  const { themeConfig } = useTheme();

  return createTheme({
    palette: {
      mode: themeConfig.name === 'space' ? 'dark' : 'light',
      primary: {
        main: themeConfig.colors.primary,
      },
      secondary: {
        main: themeConfig.colors.secondary,
      },
      success: {
        main: themeConfig.colors.accent,
      },
      background: {
        default: themeConfig.colors.background,
        paper: themeConfig.colors.surface,
      },
      text: {
        primary: themeConfig.colors.text,
        secondary: themeConfig.colors.textSecondary,
      },
    },
    typography: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      h1: {
        fontWeight: 700,
      },
      h2: {
        fontWeight: 600,
      },
      h3: {
        fontWeight: 600,
      },
      h4: {
        fontWeight: 600,
      },
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 600,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
            },
          },
        },
      },
    },
  });
}; 