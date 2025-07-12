import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Container,
  Avatar,
  Stack,
  Chip
} from '@mui/material';

interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  streak: number;
  avatar: string;
}

const Leaderboard: React.FC = () => {
  const leaderboardData: LeaderboardEntry[] = [
    {
      rank: 1,
      name: 'Sarah Johnson',
      points: 2450,
      streak: 12,
      avatar: '👩‍💼'
    },
    {
      rank: 2,
      name: 'Mike Chen',
      points: 2280,
      streak: 8,
      avatar: '👨‍💼'
    },
    {
      rank: 3,
      name: 'You (Demo User)',
      points: 0,
      streak: 1,
      avatar: '👤'
    },
    {
      rank: 4,
      name: 'Jessica Martinez',
      points: 1850,
      streak: 5,
      avatar: '👩‍💼'
    },
    {
      rank: 5,
      name: 'David Wilson',
      points: 1640,
      streak: 3,
      avatar: '👨‍💼'
    }
  ];

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return '#ffd700'; // Gold
      case 2: return '#c0c0c0'; // Silver  
      case 3: return '#cd7f32'; // Bronze
      default: return '#6b7280'; // Gray
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Typography variant="body1" sx={{ fontSize: '24px' }}>
          🏆
        </Typography>
        <Typography 
          variant="h4" 
          component="h2"
          sx={{ 
            fontWeight: 700,
            color: 'text.primary'
          }}
        >
          Team Leaderboard
        </Typography>
      </Box>

      <Stack spacing={2}>
        {leaderboardData.map((entry) => (
          <Card 
            key={entry.rank}
            elevation={0}
            sx={{ 
              border: 1,
              borderColor: entry.name.includes('You') ? 'primary.main' : 'grey.200',
              borderRadius: 3,
              bgcolor: entry.name.includes('You') ? 'primary.50' : 'background.paper'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: getRankColor(entry.rank),
                      minWidth: '40px'
                    }}
                  >
                    {getRankIcon(entry.rank)}
                  </Typography>
                  
                  <Avatar sx={{ width: 48, height: 48, fontSize: '24px' }}>
                    {entry.avatar}
                  </Avatar>
                  
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: 'text.primary'
                      }}
                    >
                      {entry.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {entry.streak} day streak
                    </Typography>
                  </Box>
                </Box>

                <Chip
                  label={`${entry.points} points`}
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    fontWeight: 600,
                    fontSize: '1rem',
                    px: 2
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Container>
  );
};

export default Leaderboard; 