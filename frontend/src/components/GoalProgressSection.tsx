import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  LinearProgress,
  Container
} from '@mui/material';
import { useUser } from '../context/UserContext';

const GoalProgressSection: React.FC = () => {
  const { user, calculateGoals } = useUser();

  if (!user) {
    return null;
  }

  const goals = calculateGoals();
  
  // Calculate progress percentage (for demo, using current closings vs needed)
  const currentClosings = 8; // This would come from actual data
  const progressPercentage = goals.closingsNeeded > 0 
    ? Math.min((currentClosings / goals.closingsNeeded) * 100, 100)
    : 0;

  // Display "Infinity%" if no goal is set, otherwise show actual percentage
  const displayPercentage = goals.annualGoal === 0 ? "Infinity" : Math.round(progressPercentage);

  const metrics = [
    {
      value: `$${goals.annualGoal.toLocaleString()}`,
      label: 'Annual Goal',
      color: 'primary.main'
    },
    {
      value: goals.closingsNeeded.toString(),
      label: 'Closings Needed', 
      color: 'primary.main'
    },
    {
      value: goals.leadsNeeded.toString(),
      label: 'Leads Needed',
      color: 'primary.main'
    },
    {
      value: currentClosings.toString(),
      label: 'Current Closings',
      color: 'primary.main'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Annual Goal Progress Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography 
            variant="h4" 
            component="h1"
            sx={{ 
              fontWeight: 700,
              color: 'text.primary'
            }}
          >
            Annual Goal Progress
          </Typography>
          <Typography 
            variant="h3"
            sx={{ 
              fontWeight: 700,
              color: 'primary.main'
            }}
          >
            {displayPercentage}%
          </Typography>
        </Box>
        
        {/* Progress Bar */}
        <LinearProgress
          variant="determinate"
          value={goals.annualGoal === 0 ? 100 : progressPercentage}
          sx={{
            height: 12,
            borderRadius: 6,
            bgcolor: 'grey.200',
            '& .MuiLinearProgress-bar': {
              borderRadius: 6,
              bgcolor: 'success.main'
            }
          }}
        />
      </Box>

      {/* Metrics Cards Grid */}
      <Grid container spacing={3}>
        {metrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              elevation={0}
              sx={{ 
                border: 1,
                borderColor: 'grey.200',
                borderRadius: 3,
                height: '100%'
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography
                  variant="h3"
                  component="div"
                  sx={{
                    fontWeight: 700,
                    color: metric.color,
                    mb: 1
                  }}
                >
                  {metric.value}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ fontWeight: 500 }}
                >
                  {metric.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default GoalProgressSection; 