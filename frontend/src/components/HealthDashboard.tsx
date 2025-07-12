import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  CircularProgress,
  Chip,
  LinearProgress
} from '@mui/material';
import { useTheme } from '../context/ThemeContext';
import { HealthScores } from '../types';
import apiService from '../services/api';

const HealthDashboard: React.FC = () => {
  const { themeConfig } = useTheme();
  const [healthScores, setHealthScores] = useState<HealthScores | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHealthScores();
  }, []);

  const fetchHealthScores = async () => {
    try {
      setLoading(true);
      const response = await apiService.getHealthScores();
      
      if (response.success && response.data) {
        setHealthScores(response.data);
      } else {
        console.error('Failed to fetch health scores:', response.error);
      }
    } catch (error) {
      console.error('Error fetching health scores:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Attention';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!healthScores) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          Health scores not available
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Complete some tasks to see your health scores
        </Typography>
      </Box>
    );
  }

  const scoreCategories = [
    { key: 'prospecting', label: 'Prospecting', score: healthScores.prospecting },
    { key: 'nurturing', label: 'Nurturing', score: healthScores.nurturing },
    { key: 'clientCare', label: 'Client Care', score: healthScores.clientCare },
    { key: 'administrative', label: 'Administrative', score: healthScores.administrative }
  ];

  return (
    <Box sx={{ py: 4 }}>
      <Typography 
        variant="h4" 
        component="h2"
        sx={{ 
          fontWeight: 700,
          color: 'text.primary',
          mb: 3
        }}
      >
        Health Dashboard
      </Typography>

      {/* Overall Health Score */}
      <Card elevation={0} sx={{ mb: 3, border: 1, borderColor: 'grey.200', borderRadius: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Overall Health
            </Typography>
            <Chip
              label={getScoreLabel(healthScores.overall)}
              sx={{
                bgcolor: getScoreColor(healthScores.overall),
                color: 'white',
                fontWeight: 600
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <CircularProgress
                variant="determinate"
                value={healthScores.overall}
                size={80}
                thickness={4}
                sx={{
                  color: getScoreColor(healthScores.overall),
                  '& .MuiCircularProgress-circle': {
                    strokeLinecap: 'round',
                  },
                }}
              />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                  {healthScores.overall}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Your overall business health score based on activity across all categories
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Category Scores */}
      <Grid container spacing={3}>
        {scoreCategories.map((category) => (
          <Grid item xs={12} sm={6} md={3} key={category.key}>
            <Card elevation={0} sx={{ border: 1, borderColor: 'grey.200', borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  {category.label}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={category.score}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getScoreColor(category.score),
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {category.score}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {getScoreLabel(category.score)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default HealthDashboard; 