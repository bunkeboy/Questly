import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Container,
  Chip,
  Button,
  CircularProgress
} from '@mui/material';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';
import { Challenge } from '../types';
import apiService from '../services/api';

const TodaysChallenges: React.FC = () => {
  const { themeConfig } = useTheme();
  const { completeChallenge } = useGame();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingChallenge, setCompletingChallenge] = useState<string | null>(null);

  useEffect(() => {
    fetchDailyChallenges();
  }, []);

  const fetchDailyChallenges = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDailyChallenges();
      
      if (response.success && response.data) {
        setChallenges(response.data);
      } else {
        console.error('Failed to fetch challenges:', response.error);
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteChallenge = async (challenge: Challenge) => {
    if (challenge.completed) return;

    try {
      setCompletingChallenge(challenge.id);
      const response = await apiService.completeChallenge(challenge.id);
      
      if (response.success && response.data) {
        // Update the challenge in state
        setChallenges(prev => 
          prev.map(c => 
            c.id === challenge.id 
              ? { ...c, completed: true, completedAt: new Date() }
              : c
          )
        );
        
        // Update game state
        completeChallenge(challenge);
      } else {
        console.error('Failed to complete challenge:', response.error);
      }
    } catch (error) {
      console.error('Error completing challenge:', error);
    } finally {
      setCompletingChallenge(null);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Prospecting': return '#3b82f6';
      case 'Nurturing': return '#10b981';
      case 'Client Management': return '#f59e0b';
      case 'Administrative': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Typography variant="body1" sx={{ fontSize: '24px' }}>
          {themeConfig.icons.task}
        </Typography>
        <Typography 
          variant="h4" 
          component="h2"
          sx={{ 
            fontWeight: 700,
            color: 'text.primary'
          }}
        >
          Today's {themeConfig.terminology.task}s
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {challenges.map((challenge) => (
          <Grid item xs={12} md={6} key={challenge.id}>
            <Card 
              elevation={0}
              sx={{ 
                border: 1,
                borderColor: challenge.completed ? 'success.main' : 'grey.200',
                borderRadius: 3,
                bgcolor: challenge.completed ? 'success.50' : 'background.paper',
                opacity: challenge.completed ? 0.8 : 1
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: 'text.primary',
                      textDecoration: challenge.completed ? 'line-through' : 'none'
                    }}
                  >
                    {challenge.title}
                  </Typography>
                  <Chip
                    label={`${challenge.points} pts`}
                    size="small"
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      fontWeight: 600
                    }}
                  />
                </Box>
                
                <Chip
                  label={challenge.category}
                  size="small"
                  sx={{
                    bgcolor: getCategoryColor(challenge.category),
                    color: 'white',
                    mb: 2
                  }}
                />

                <Box sx={{ mt: 2 }}>
                  <Button
                    variant={challenge.completed ? "outlined" : "contained"}
                    fullWidth
                    disabled={challenge.completed || completingChallenge === challenge.id}
                    onClick={() => handleCompleteChallenge(challenge)}
                    sx={{ textTransform: 'none' }}
                  >
                    {completingChallenge === challenge.id ? (
                      <CircularProgress size={20} />
                    ) : challenge.completed ? (
                      '✓ Completed'
                    ) : (
                      'Mark Complete'
                    )}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default TodaysChallenges; 