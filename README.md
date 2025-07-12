# Questly: Gamified Real Estate Pipeline Management

![Questly Logo](https://via.placeholder.com/400x100/2563eb/ffffff?text=Questly)

## Overview

Questly is an AI-powered, gamified web application designed to enhance real estate agents' productivity by providing a holistic view of their sales pipeline. Integrated with Follow Up Boss (FUB), it transforms routine tasks into an engaging experience inspired by Duolingo—playful yet professional.

### Key Features

- **🎯 Goal Calculator**: Automatically breaks down annual commission goals into daily actionable tasks
- **🎮 Gamification**: Streaks, points, badges, and levels to keep you motivated
- **📊 Pipeline Health**: Real-time health scores across all business categories
- **🎨 Multiple Themes**: Professional, Space Explorer, and Medieval Quest themes
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **🤖 AI-Powered**: Personalized insights and challenge generation
- **👥 Team Management**: Oversight features for team leaders

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Material-UI (MUI)** for UI components
- **React Router** for navigation
- **Context API** for state management
- **Framer Motion** for animations
- **Recharts** for data visualization

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **MongoDB** with Mongoose
- **JWT** for authentication
- **OpenAI API** for AI features
- **Follow Up Boss API** integration

## Project Structure

```
questly/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Main application pages
│   │   ├── context/         # React Context providers
│   │   ├── hooks/           # Custom React hooks
│   │   ├── types/           # TypeScript type definitions
│   │   ├── utils/           # Utility functions
│   │   └── styles/          # Global styles and themes
│   ├── public/              # Static assets
│   └── package.json
├── backend/                 # Node.js backend API
│   ├── src/
│   │   ├── controllers/     # API route handlers
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Express middleware
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utility functions
│   │   ├── types/           # TypeScript type definitions
│   │   └── config/          # Configuration files
│   └── package.json
└── README.md
```

## Installation & Setup

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or cloud instance)
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd questly
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/questly
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=30d
   
   # Follow Up Boss API
   FUB_API_URL=https://api.followupboss.com/v1
   FUB_API_KEY=your-fub-api-key
   
   # OpenAI API
   OPENAI_API_KEY=your-openai-api-key
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start both the frontend (http://localhost:3000) and backend (http://localhost:5000) servers.

### Individual Setup

#### Frontend Only
```bash
cd frontend
npm install
npm start
```

#### Backend Only
```bash
cd backend
npm install
npm run dev
```

## Features in Detail

### 1. Onboarding Flow
- **Goal Calculator**: Input annual commission goal and get automatic breakdown
- **Lead Source Selection**: Choose top 3 lead sources for personalized challenges
- **Theme Selection**: Pick from Professional, Space Explorer, or Medieval Quest themes

### 2. Gamification System
- **Points & Levels**: Earn points for completing tasks, level up as you progress
- **Streak System**: Maintain daily activity streaks with bonus multipliers
- **Badges**: Unlock achievements for milestones and special accomplishments
- **Leaderboards**: Optional team competition features

### 3. Pipeline Health Dashboard
- **Visual Funnel**: See your leads → opportunities → contracts → closings
- **Health Scores**: 0-100 scores for Prospecting, Nurturing, Client Management, and Admin
- **AI Insights**: Personalized recommendations based on your pipeline data
- **Goal Progress**: Track progress toward annual goals with real-time updates

### 4. Daily Challenge System
- **Personalized Tasks**: Generated based on your lead sources and goals
- **Category-Based**: Challenges across Prospecting, Nurturing, Managing Clients, and Admin
- **Difficulty Levels**: Easy, Medium, and Hard challenges with corresponding point values
- **Smart Scheduling**: Tasks adapt to your schedule and priorities

### 5. Theme System
- **Professional**: Clean, minimalist design for serious professionals
- **Space Explorer**: Futuristic theme with rocket ships and cosmic elements
- **Medieval Quest**: Adventure-themed with swords, shields, and quests

### 6. Team Management
- **Team Overview**: Aggregate team performance and health scores
- **Individual Monitoring**: Drill down into specific agent performance
- **Coaching Tools**: AI-generated coaching recommendations
- **Team Challenges**: Group competitions and collaborative goals

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Challenges
- `GET /api/challenges/daily` - Get today's challenges
- `POST /api/challenges/:id/complete` - Mark challenge as complete
- `GET /api/challenges/completed` - Get completed challenges history

### Pipeline
- `GET /api/pipeline/` - Get pipeline data
- `GET /api/pipeline/health` - Get health scores
- `GET /api/pipeline/stats` - Get pipeline statistics

### Follow Up Boss Integration
- `POST /api/fub/sync` - Sync data from Follow Up Boss
- `GET /api/fub/contacts` - Get FUB contacts
- `GET /api/fub/deals` - Get FUB deals

### AI Features
- `GET /api/ai/insights` - Get AI-generated insights
- `POST /api/ai/challenges/generate` - Generate daily challenges
- `GET /api/ai/tips` - Get personalized tips

## Environment Variables

### Backend Required Variables
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `FUB_API_KEY` - Follow Up Boss API key
- `OPENAI_API_KEY` - OpenAI API key

### Frontend Environment Variables
- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:5000)

## Development

### Available Scripts

**Root Level:**
- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build both frontend and backend for production
- `npm run install:all` - Install dependencies for all packages

**Frontend:**
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

**Backend:**
- `npm run dev` - Start development server with nodemon
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server

### Code Style

- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting
- **Conventional Commits** for commit messages

### Testing

Run tests with:
```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && npm test
```

## Deployment

### Frontend Deployment (Vercel)
1. Connect your repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `build`
4. Deploy

### Backend Deployment (Railway/Heroku)
1. Create a new project
2. Connect your repository
3. Set environment variables
4. Deploy

### Database (MongoDB Atlas)
1. Create a MongoDB Atlas cluster
2. Get connection string
3. Update `MONGODB_URI` in environment variables

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@questly.com or create an issue in the GitHub repository.

## Roadmap

### Phase 1: MVP (Current)
- ✅ Basic onboarding flow
- ✅ Theme system
- ✅ Goal calculator
- ✅ Basic gamification
- 🔄 Daily challenges
- 🔄 Pipeline health dashboard

### Phase 2: Integration
- 🔄 Follow Up Boss integration
- 🔄 AI-powered insights
- 🔄 Team management features
- 📋 Mobile app (React Native)

### Phase 3: Advanced Features
- 📋 Advanced analytics
- 📋 Custom integrations
- 📋 White-label solutions
- 📋 Enterprise features

## Acknowledgments

- Inspired by Duolingo's gamification approach
- Built with love for the real estate community
- Special thanks to the Orange County real estate team for feedback and testing

---

Made with ❤️ by Ryan Bunke 