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
  CircularProgress,
  LinearProgress
} from '@mui/material';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';
import { useUser } from '../context/UserContext';
import { DailyTask, DailyPlan } from '../types';
import apiService from '../services/api';

const TodaysChallenges: React.FC = () => {
  const { themeConfig } = useTheme();
  const { addPoints } = useGame();
  const { logout } = useUser();
  const [dailyPlan, setDailyPlan] = useState<DailyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [completingTask, setCompletingTask] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchTodaysPlan();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTodaysPlan = async (forceRefresh = false) => {
    try {
      setLoading(true);
      console.log('📋 Fetching today\'s plan...');
      
      // Add cache-busting for forced refresh
      const response = forceRefresh ? 
        await apiService.getTodaysPlan() : 
        await apiService.getTodaysPlan();
      
      console.log('📊 Today\'s plan response:', response);
      
      if (response.success && response.data) {
        setDailyPlan(response.data);
        console.log('✅ Daily plan fetched successfully');
      } else {
        console.error('❌ Failed to fetch daily plan:', response.error);
        // If no plan exists, generate one
        if (response.error?.includes('not found') || response.error?.includes('No plan found')) {
          console.log('🔄 No plan found, generating new one...');
          await generateDailyPlan();
        }
      }
    } catch (error) {
      console.error('💥 Error fetching daily plan:', error);
      console.log('🔄 Attempting to generate new plan due to error...');
      await generateDailyPlan();
    } finally {
      setLoading(false);
    }
  };

  const generateDailyPlan = async () => {
    try {
      setGenerating(true);
      console.log('🔄 Generating daily plan...');
      const response = await apiService.generateDailyPlan();
      
      console.log('📊 Generate plan response:', response);
      
      if (response.success && response.data) {
        setDailyPlan(response.data);
        console.log('✅ Daily plan generated successfully');
      } else {
        console.error('❌ Failed to generate daily plan:', response.error);
        alert(`Failed to generate daily plan: ${response.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('💥 Error generating daily plan:', error);
      alert(`Error generating daily plan: ${error}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleCompleteTask = async (task: DailyTask) => {
    if (task.completed) return;

    try {
      setCompletingTask(task.id);
      const response = await apiService.completeTask(task.id);
      
      if (response.success && response.data) {
        // Update the task in the daily plan
        setDailyPlan(prev => {
          if (!prev || !prev.selectedTasks) return null;
          
          const updatedTasks = prev.selectedTasks.map(t => 
            t.id === task.id 
              ? { ...t, completed: true, completedAt: new Date() }
              : t
          );
          
          return {
            ...prev,
            selectedTasks: updatedTasks,
            completedTasks: prev.completedTasks + 1,
            completedPoints: prev.completedPoints + task.points
          };
        });
        
        // Update game state
        addPoints(task.points);
      } else {
        console.error('Failed to complete task:', response.error);
      }
    } catch (error) {
      console.error('Error completing task:', error);
    } finally {
      setCompletingTask(null);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'prospecting': return '#3b82f6';
      case 'nurturing': return '#10b981';
      case 'clientCare': return '#f59e0b';
      case 'administrative': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'prospecting': return 'Prospecting';
      case 'nurturing': return 'Nurturing';
      case 'clientCare': return 'Client Care';
      case 'administrative': return 'Administrative';
      default: return category;
    }
  };

  const completionPercentage = dailyPlan && dailyPlan.totalPossiblePoints > 0 ? 
    (dailyPlan.completedPoints / dailyPlan.totalPossiblePoints * 100) : 0;

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!dailyPlan) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" gutterBottom>
            No daily plan found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Generate your personalized daily task plan
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              onClick={generateDailyPlan}
              disabled={generating}
              sx={{ textTransform: 'none' }}
            >
              {generating ? <CircularProgress size={20} /> : 'Generate Daily Plan'}
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => fetchTodaysPlan(true)}
              disabled={loading}
              sx={{ textTransform: 'none' }}
            >
              {loading ? <CircularProgress size={20} /> : 'Refresh'}
            </Button>
            <Button 
              variant="outlined" 
              color="warning"
              onClick={() => {
                localStorage.clear();
                logout();
                window.location.reload();
              }}
              sx={{ textTransform: 'none' }}
            >
              Reset App
            </Button>
          </Box>
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

      {/* Progress Overview */}
      <Card elevation={0} sx={{ mb: 3, border: 1, borderColor: 'grey.200', borderRadius: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Daily Progress
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {dailyPlan.completedTasks}/{dailyPlan.selectedTasks?.length || 0} tasks • {dailyPlan.completedPoints}/{dailyPlan.totalPossiblePoints} points
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={completionPercentage} 
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {completionPercentage.toFixed(1)}% Complete
            </Typography>
            <Chip 
              label={dailyPlan.trackStatus === 'on_track' ? 'On Track' : 
                     dailyPlan.trackStatus === 'ahead' ? 'Ahead' : 'Behind'}
              size="small"
              color={dailyPlan.trackStatus === 'on_track' ? 'success' : 
                     dailyPlan.trackStatus === 'ahead' ? 'info' : 'warning'}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Show manual generation when no tasks exist */}
      {(!dailyPlan.selectedTasks || dailyPlan.selectedTasks.length === 0) && (
        <Card elevation={0} sx={{ mb: 3, border: 1, borderColor: 'warning.main', borderRadius: 3 }}>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h6" gutterBottom>
                No tasks found for today
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Generate your personalized daily task plan to get started
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button 
                  variant="contained" 
                  onClick={generateDailyPlan}
                  disabled={generating}
                  sx={{ textTransform: 'none' }}
                >
                  {generating ? <CircularProgress size={20} /> : 'Generate Daily Tasks'}
                </Button>
                                 <Button 
                   variant="outlined" 
                   onClick={() => fetchTodaysPlan(true)}
                   disabled={loading}
                   sx={{ textTransform: 'none' }}
                 >
                   {loading ? <CircularProgress size={20} /> : 'Refresh'}
                 </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={3}>
        {dailyPlan.selectedTasks?.map((task) => (
          <Grid item xs={12} md={6} key={task.id}>
            <Card 
              elevation={0}
              sx={{ 
                border: 1,
                borderColor: task.completed ? 'success.main' : 'grey.200',
                borderRadius: 3,
                bgcolor: task.completed ? 'success.50' : 'background.paper',
                opacity: task.completed ? 0.8 : 1
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: 'text.primary',
                      textDecoration: task.completed ? 'line-through' : 'none'
                    }}
                  >
                    {task.title}
                  </Typography>
                  <Chip
                    label={`${task.points} pts`}
                    size="small"
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      fontWeight: 600
                    }}
                  />
                </Box>
                
                {task.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {task.description}
                  </Typography>
                )}
                
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip
                    label={getCategoryLabel(task.category)}
                    size="small"
                    sx={{
                      bgcolor: getCategoryColor(task.category),
                      color: 'white'
                    }}
                  />
                  <Chip
                    label={task.difficulty}
                    size="small"
                    variant="outlined"
                  />
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Button
                    variant={task.completed ? "outlined" : "contained"}
                    fullWidth
                    disabled={task.completed || completingTask === task.id}
                    onClick={() => handleCompleteTask(task)}
                    sx={{ textTransform: 'none' }}
                  >
                    {completingTask === task.id ? (
                      <CircularProgress size={20} />
                    ) : task.completed ? (
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