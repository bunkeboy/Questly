import React from 'react';
import { Container, Typography, Grid, Paper } from '@mui/material';

const TeamDashboard: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Team Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Team Overview
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Team management and statistics will appear here
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default TeamDashboard; 