import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Chip,
  Grid,
  Card,
  CardContent,
  Alert,
  Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { LeadSource, ThemeType } from '../types';

const steps = ['Goal Setup', 'Lead Sources', 'Theme Selection'];

const leadSourceOptions = [
  { id: 'web_leads', name: 'Web Leads', description: 'Online inquiries and website leads' },
  { id: 'doorknocking', name: 'Door Knocking', description: 'Direct neighborhood outreach' },
  { id: 'open_houses', name: 'Open Houses', description: 'Hosting property showings' },
  { id: 'sphere_influence', name: 'Sphere of Influence', description: 'Past clients and personal network' },
  { id: 'referrals', name: 'Referrals', description: 'Client and professional referrals' },
  { id: 'social_media', name: 'Social Media', description: 'Facebook, Instagram, LinkedIn marketing' },
  { id: 'paid_ads', name: 'Paid Advertising', description: 'Google Ads, Facebook Ads, etc.' },
  { id: 'networking', name: 'Networking Events', description: 'Industry events and meetups' }
];

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { updateProfile, user, isAuthenticated, isLoading } = useUser();
  const { availableThemes, setTheme } = useTheme();
  
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    commissionGoal: 500000,
    averageSalesPrice: 1200000,
    commissionRate: 2.5,
    conversionRate: 7,
    leadSources: [] as LeadSource[],
    selectedTheme: 'professional' as ThemeType
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNext = () => {
    if (validateCurrentStep()) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (activeStep === 0) {
      if (!formData.commissionGoal || formData.commissionGoal <= 0) {
        newErrors.commissionGoal = 'Commission goal is required';
      }
      if (!formData.averageSalesPrice || formData.averageSalesPrice <= 0) {
        newErrors.averageSalesPrice = 'Average sales price is required';
      }
      if (!formData.commissionRate || formData.commissionRate <= 0) {
        newErrors.commissionRate = 'Commission rate is required';
      }
      if (!formData.conversionRate || formData.conversionRate <= 0) {
        newErrors.conversionRate = 'Conversion rate is required';
      }
    } else if (activeStep === 1) {
      if (formData.leadSources.length === 0) {
        newErrors.leadSources = 'Please select at least one lead source';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleComplete = async () => {
    if (!validateCurrentStep()) return;

    // Check if user is authenticated before proceeding
    if (!isAuthenticated || !user) {
      alert('Please wait for the app to finish loading before completing setup.');
      return;
    }

    try {
      await updateProfile({
        commissionGoal: formData.commissionGoal,
        averageSalesPrice: formData.averageSalesPrice,
        commissionRate: formData.commissionRate / 100,
        conversionRate: formData.conversionRate / 100,
        leadSources: formData.leadSources,
        theme: formData.selectedTheme
      });

      setTheme(formData.selectedTheme);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      alert('Failed to complete onboarding: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const toggleLeadSource = (leadSource: LeadSource) => {
    setFormData(prev => ({
      ...prev,
      leadSources: prev.leadSources.includes(leadSource)
        ? prev.leadSources.filter(ls => ls !== leadSource)
        : [...prev.leadSources, leadSource]
    }));
  };

  const getGoalPreview = () => {
    try {
      const calculation = {
        annualGoal: formData.commissionGoal,
        averageSalesPrice: formData.averageSalesPrice,
        commissionRate: formData.commissionRate / 100,
        conversionRate: formData.conversionRate / 100,
        closingsNeeded: Math.ceil(formData.commissionGoal / (formData.averageSalesPrice * (formData.commissionRate / 100))),
        leadsNeeded: Math.ceil(Math.ceil(formData.commissionGoal / (formData.averageSalesPrice * (formData.commissionRate / 100))) / (formData.conversionRate / 100)),
        monthlyClosings: 0,
        monthlyLeads: 0,
        weeklyClosings: 0,
        weeklyLeads: 0,
        dailyLeads: 0
      };

      return calculation;
    } catch {
      return null;
    }
  };

  const renderGoalSetup = () => (
    <Box>
      <Typography variant="h5" gutterBottom>
        Set Your Commission Goals
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Let's calculate what you need to achieve your annual commission goal.
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Annual Commission Goal"
            type="number"
            value={formData.commissionGoal}
            onChange={(e) => setFormData(prev => ({ ...prev, commissionGoal: Number(e.target.value) }))}
            error={!!errors.commissionGoal}
            helperText={errors.commissionGoal}
            InputProps={{ startAdornment: '$' }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Average Sales Price"
            type="number"
            value={formData.averageSalesPrice}
            onChange={(e) => setFormData(prev => ({ ...prev, averageSalesPrice: Number(e.target.value) }))}
            error={!!errors.averageSalesPrice}
            helperText={errors.averageSalesPrice}
            InputProps={{ startAdornment: '$' }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Commission Rate"
            type="number"
            value={formData.commissionRate}
            onChange={(e) => setFormData(prev => ({ ...prev, commissionRate: Number(e.target.value) }))}
            error={!!errors.commissionRate}
            helperText={errors.commissionRate}
            InputProps={{ endAdornment: '%' }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Lead to Close Conversion Rate"
            type="number"
            value={formData.conversionRate}
            onChange={(e) => setFormData(prev => ({ ...prev, conversionRate: Number(e.target.value) }))}
            error={!!errors.conversionRate}
            helperText={errors.conversionRate}
            InputProps={{ endAdornment: '%' }}
          />
        </Grid>
      </Grid>

      {getGoalPreview() && (
        <Paper sx={{ p: 2, mt: 3, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
          <Typography variant="h6" gutterBottom>
            Your Goal Breakdown
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2">
                Closings Needed: <strong>{getGoalPreview()?.closingsNeeded}</strong>
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">
                Leads Needed: <strong>{getGoalPreview()?.leadsNeeded}</strong>
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );

  const renderLeadSources = () => (
    <Box>
      <Typography variant="h5" gutterBottom>
        Select Your Lead Sources
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Choose your top 3 lead sources to personalize your daily challenges.
      </Typography>
      
      {errors.leadSources && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errors.leadSources}
        </Alert>
      )}

      <Grid container spacing={2}>
        {leadSourceOptions.map((option) => (
          <Grid item xs={12} sm={6} md={4} key={option.id}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                border: formData.leadSources.includes(option.id as LeadSource) ? 2 : 1,
                borderColor: formData.leadSources.includes(option.id as LeadSource) ? 'primary.main' : 'divider'
              }}
              onClick={() => toggleLeadSource(option.id as LeadSource)}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {option.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {option.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Selected ({formData.leadSources.length}/3):
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
          {formData.leadSources.map((source) => (
            <Chip
              key={source}
              label={leadSourceOptions.find(opt => opt.id === source)?.name}
              onDelete={() => toggleLeadSource(source)}
              color="primary"
            />
          ))}
        </Box>
      </Box>
    </Box>
  );

  const renderThemeSelection = () => (
    <Box>
      <Typography variant="h5" gutterBottom>
        Choose Your Theme
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Select a theme that matches your style and keeps you motivated.
      </Typography>
      
      <Grid container spacing={3}>
        {availableThemes.map((theme) => (
          <Grid item xs={12} md={4} key={theme.name}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                border: formData.selectedTheme === theme.name ? 2 : 1,
                borderColor: formData.selectedTheme === theme.name ? 'primary.main' : 'divider'
              }}
              onClick={() => setFormData(prev => ({ ...prev, selectedTheme: theme.name as ThemeType }))}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {theme.displayName}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <span>{theme.icons.task}</span>
                  <span>{theme.icons.reward}</span>
                  <span>{theme.icons.streak}</span>
                  <span>{theme.icons.level}</span>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {theme.terminology.task}s • {theme.terminology.reward}s • {theme.terminology.streak}s
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return renderGoalSetup();
      case 1:
        return renderLeadSources();
      case 2:
        return renderThemeSelection();
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Welcome to Questly
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary">
          Let's set up your gamified real estate pipeline
        </Typography>
      </Box>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper sx={{ p: 4, mb: 4 }}>
        {renderStepContent()}
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          variant="outlined"
        >
          Back
        </Button>
        {activeStep === steps.length - 1 ? (
          <Button
            onClick={handleComplete}
            variant="contained"
            size="large"
            disabled={isLoading || !isAuthenticated}
          >
            {isLoading ? 'Loading...' : 'Complete Setup'}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            variant="contained"
            size="large"
          >
            Next
          </Button>
        )}
      </Box>
    </Container>
  );
};

export default Onboarding; 