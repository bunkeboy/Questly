import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  Box,
  Button,
  TextField,
  Alert,
  Stack,
  Chip,
  Divider,
  AppBar,
  Toolbar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import FubConnection from '../components/FubConnection';

const Profile: React.FC = () => {
  const { user, updateProfile, calculateGoals } = useUser();
  const { themeConfig } = useTheme();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    commissionGoal: user?.commissionGoal || 0,
    averageSalesPrice: user?.averageSalesPrice || 1200000,
    commissionRate: (user?.commissionRate || 0.025) * 100,
    conversionRate: (user?.conversionRate || 0.07) * 100,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      await updateProfile({
        name: formData.name,
        commissionGoal: formData.commissionGoal,
        averageSalesPrice: formData.averageSalesPrice,
        commissionRate: formData.commissionRate / 100,
        conversionRate: formData.conversionRate / 100,
      });
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      commissionGoal: user?.commissionGoal || 0,
      averageSalesPrice: user?.averageSalesPrice || 1200000,
      commissionRate: (user?.commissionRate || 0.025) * 100,
      conversionRate: (user?.conversionRate || 0.07) * 100,
    });
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  const goals = user ? calculateGoals() : null;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Custom Header for Profile Page */}
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

          {/* Profile Title */}
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Profile Settings
          </Typography>

          {/* Back to Dashboard Button */}
          <Button
            variant="contained"
            onClick={() => navigate('/dashboard')}
            sx={{
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Back to Dashboard
          </Button>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Profile Settings
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        
        <Grid container spacing={3}>
          {/* Account Information */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" gutterBottom>
                  Account Information
                </Typography>
                {!isEditing ? (
                  <Button variant="outlined" onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                ) : (
                  <Stack direction="row" spacing={1}>
                    <Button variant="outlined" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button variant="contained" onClick={handleSave}>
                      Save
                    </Button>
                  </Stack>
                )}
              </Box>
              
              <Stack spacing={2}>
                {isEditing ? (
                  <TextField
                    fullWidth
                    label="Name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                ) : (
                  <Box>
                    <Typography variant="body2" color="text.secondary">Name</Typography>
                    <Typography variant="body1">{user?.name}</Typography>
                  </Box>
                )}
                
                <Box>
                  <Typography variant="body2" color="text.secondary">Email</Typography>
                  <Typography variant="body1">{user?.email}</Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">Role</Typography>
                  <Chip label={user?.role} size="small" />
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">Theme</Typography>
                  <Chip label={themeConfig.displayName} size="small" />
                </Box>
              </Stack>
            </Paper>
          </Grid>
          
          {/* Goal Settings */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Goal Settings
              </Typography>
              
              <Stack spacing={2}>
                {isEditing ? (
                  <>
                    <TextField
                      fullWidth
                      label="Annual Commission Goal"
                      type="number"
                      value={formData.commissionGoal}
                      onChange={(e) => setFormData(prev => ({ ...prev, commissionGoal: Number(e.target.value) }))}
                      InputProps={{ startAdornment: '$' }}
                    />
                    <TextField
                      fullWidth
                      label="Average Sales Price"
                      type="number"
                      value={formData.averageSalesPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, averageSalesPrice: Number(e.target.value) }))}
                      InputProps={{ startAdornment: '$' }}
                    />
                    <TextField
                      fullWidth
                      label="Commission Rate"
                      type="number"
                      value={formData.commissionRate}
                      onChange={(e) => setFormData(prev => ({ ...prev, commissionRate: Number(e.target.value) }))}
                      InputProps={{ endAdornment: '%' }}
                    />
                    <TextField
                      fullWidth
                      label="Conversion Rate"
                      type="number"
                      value={formData.conversionRate}
                      onChange={(e) => setFormData(prev => ({ ...prev, conversionRate: Number(e.target.value) }))}
                      InputProps={{ endAdornment: '%' }}
                    />
                  </>
                ) : (
                  <>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Annual Commission Goal</Typography>
                      <Typography variant="body1">${user?.commissionGoal?.toLocaleString()}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Average Sales Price</Typography>
                      <Typography variant="body1">${user?.averageSalesPrice?.toLocaleString()}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Commission Rate</Typography>
                      <Typography variant="body1">{((user?.commissionRate || 0) * 100).toFixed(1)}%</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Conversion Rate</Typography>
                      <Typography variant="body1">{((user?.conversionRate || 0) * 100).toFixed(1)}%</Typography>
                    </Box>
                  </>
                )}
              </Stack>
            </Paper>
          </Grid>
          
          {/* Goal Breakdown */}
          {goals && (
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Goal Breakdown
                </Typography>
                
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Closings Needed</Typography>
                    <Typography variant="h6">{goals.closingsNeeded}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Leads Needed</Typography>
                    <Typography variant="h6">{goals.leadsNeeded}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Monthly Closings</Typography>
                    <Typography variant="h6">{goals.monthlyClosings}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Weekly Closings</Typography>
                    <Typography variant="h6">{goals.weeklyClosings}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Daily Leads</Typography>
                    <Typography variant="h6">{goals.dailyLeads}</Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          )}
          
          {/* Lead Sources */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Lead Sources
              </Typography>
              
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {user?.leadSources.map((source) => (
                  <Chip key={source} label={source.replace('_', ' ')} size="small" />
                ))}
                {(!user?.leadSources || user.leadSources.length === 0) && (
                  <Typography variant="body2" color="text.secondary">
                    No lead sources configured
                  </Typography>
                )}
              </Stack>
            </Paper>
          </Grid>
          
          {/* Follow Up Boss Integration */}
          <Grid item xs={12}>
            <FubConnection />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Profile; 