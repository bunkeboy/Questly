import React from 'react';
import { 
  Box, 
  Typography, 
  Container
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

const PipelineOverview: React.FC = () => {
  const pipelineData = [
    {
      name: 'Leads',
      value: 243,
      color: '#3b82f6'
    },
    {
      name: 'Opportunities', 
      value: 87,
      color: '#3b82f6'
    },
    {
      name: 'Under Contract',
      value: 12,
      color: '#3b82f6'
    },
    {
      name: 'Closed',
      value: 8,
      color: '#3b82f6'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant="h4" 
          component="h2"
          sx={{ 
            fontWeight: 700,
            color: 'text.primary',
            mb: 1
          }}
        >
          Pipeline Overview
        </Typography>
      </Box>

      <Box sx={{ 
        height: 400, 
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'grey.200',
        borderRadius: 3,
        p: 3
      }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={pipelineData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60
            }}
          >
            <XAxis 
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ 
                fontSize: 14, 
                fontWeight: 500,
                fill: '#6b7280'
              }}
            />
            <YAxis hide />
            <Bar 
              dataKey="value" 
              radius={[8, 8, 0, 0]}
              label={{ 
                position: 'top',
                fontSize: 16,
                fontWeight: 600,
                fill: '#1f2937'
              }}
            >
              {pipelineData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Container>
  );
};

export default PipelineOverview; 