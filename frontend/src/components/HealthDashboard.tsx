import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  LinearProgress,
  Container,
  Alert
} from '@mui/material';

interface HealthScore {
  label: string;
  score: number;
  icon: string;
  color: 'success' | 'warning' | 'error';
}

const HealthDashboard: React.FC = () => {

  const healthScores: HealthScore[] = [
    {
      label: 'Overall Health',
      score: 84,
      icon: '📊',
      color: 'success'
    },
    {
      label: 'Prospecting Health', 
      score: 94,
      icon: '🎯',
      color: 'success'
    },
    {
      label: 'Nurturing Health',
      score: 73,
      icon: '📈',
      color: 'warning'
    },
    {
      label: 'Client Management',
      score: 82,
      icon: '🤝',
      color: 'success'
    }
  ];

  const getScoreColor = (score: number): 'success' | 'warning' | 'error' => {
    if (score >= 80) return 'success';
    if (score >= 50) return 'warning';
    return 'error';
  };

  const getProgressBarColor = (color: 'success' | 'warning' | 'error') => {
    switch (color) {
      case 'success': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return '#10b981';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Health Scores Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {healthScores.map((health, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              elevation={0}
              sx={{ 
                border: 1,
                borderColor: 'grey.200',
                borderRadius: 3,
                height: '100%',
                p: 2
              }}
            >
              <CardContent sx={{ p: '16px !important' }}>
                {/* Header with icon and label */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Typography variant="body2" sx={{ fontSize: '18px' }}>
                    {health.icon}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 600,
                      color: 'text.primary'
                    }}
                  >
                    {health.label}
                  </Typography>
                </Box>

                {/* Score */}
                <Typography
                  variant="h2"
                  component="div"
                  sx={{
                    fontWeight: 700,
                    color: getProgressBarColor(getScoreColor(health.score)),
                    mb: 2,
                    fontSize: '3rem'
                  }}
                >
                  {health.score}
                </Typography>

                {/* Progress Bar */}
                <LinearProgress
                  variant="determinate"
                  value={health.score}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      bgcolor: getProgressBarColor(getScoreColor(health.score))
                    }
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* AI Insights */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Alert 
            icon="💡"
            severity="info"
            sx={{
              bgcolor: '#e0e7ff',
              border: 1,
              borderColor: '#c7d2fe',
              borderRadius: 3,
              '& .MuiAlert-message': {
                fontSize: '1rem',
                fontWeight: 500
              },
              '& .MuiAlert-icon': {
                fontSize: '1.5rem'
              }
            }}
          >
            Your pipeline is healthy! Keep up the great prospecting work.
          </Alert>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HealthDashboard; 