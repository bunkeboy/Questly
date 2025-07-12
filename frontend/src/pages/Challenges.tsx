import React from 'react';
import { Container, Typography, Grid, Paper } from '@mui/material';
import { useTheme } from '../context/ThemeContext';

const Challenges: React.FC = () => {
  const { themeConfig } = useTheme();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Daily {themeConfig.terminology.task}s
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Today's {themeConfig.terminology.task}s
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your personalized daily challenges will appear here
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Challenges; 