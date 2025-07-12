import OpenAI from 'openai';
import { IUser, LeadSource } from '../models/User';
import { IChallenge, ChallengeCategory } from '../models/Challenge';

class AIService {
  private openai?: OpenAI;
  private isConfigured: boolean = false;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (apiKey && apiKey !== 'your-openai-api-key-here') {
      this.openai = new OpenAI({
        apiKey: apiKey,
      });
      this.isConfigured = true;
    } else {
      console.warn('OpenAI API key not configured. AI features will use fallback responses.');
      this.isConfigured = false;
    }
  }

  async generatePersonalizedInsights(user: IUser, pipeline: any, recentChallenges: any[]): Promise<any[]> {
    if (!this.isConfigured) {
      return this.getFallbackInsights(user, pipeline, recentChallenges);
    }

    try {
      const userContext = this.buildUserContext(user, pipeline, recentChallenges);
      
      const completion = await this.openai!.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an AI coach for real estate agents. Provide 2-4 specific, actionable insights based on the user's data. Each insight should have a type (motivation, performance, activity, or positive), title, message, and priority (high, medium, low). Return only valid JSON array."
          },
          {
            role: "user",
            content: `Analyze this real estate agent's performance and provide insights: ${userContext}`
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      const response = completion.choices[0].message.content;
      return JSON.parse(response || '[]');
    } catch (error) {
      console.error('OpenAI insights generation error:', error);
      return this.getFallbackInsights(user, pipeline, recentChallenges);
    }
  }

  async generatePersonalizedChallenges(user: IUser, pipeline: any, count: number = 3): Promise<any[]> {
    if (!this.isConfigured) {
      return this.getFallbackChallenges(user, count);
    }

    try {
      const userContext = this.buildUserContext(user, pipeline, []);
      
      const completion = await this.openai!.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a real estate coach creating daily challenges. Generate ${count} specific, actionable challenges for today. Each challenge should have: title, description, category (prospecting, nurturing, managing_clients, or administrative), points (20-60), difficulty (easy, medium, hard), and relatedLeadSources array. Return only valid JSON array.`
          },
          {
            role: "user",
            content: `Create personalized daily challenges for this real estate agent: ${userContext}`
          }
        ],
        max_tokens: 1500,
        temperature: 0.8,
      });

      const response = completion.choices[0].message.content;
      return JSON.parse(response || '[]');
    } catch (error) {
      console.error('OpenAI challenge generation error:', error);
      return this.getFallbackChallenges(user, count);
    }
  }

  async generatePersonalizedTips(user: IUser, pipeline: any, recentChallenges: any[]): Promise<any[]> {
    if (!this.isConfigured) {
      return this.getFallbackTips(user, pipeline, recentChallenges);
    }

    try {
      const userContext = this.buildUserContext(user, pipeline, recentChallenges);
      
      const completion = await this.openai!.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a real estate coach providing actionable tips. Generate 3-5 specific tips based on the user's data. Each tip should have: category, title, description, and actionable (boolean). Return only valid JSON array."
          },
          {
            role: "user",
            content: `Provide personalized tips for this real estate agent: ${userContext}`
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      const response = completion.choices[0].message.content;
      return JSON.parse(response || '[]');
    } catch (error) {
      console.error('OpenAI tips generation error:', error);
      return this.getFallbackTips(user, pipeline, recentChallenges);
    }
  }

  async generateGoalPrediction(user: IUser, pipeline: any): Promise<any> {
    if (!this.isConfigured) {
      return this.getFallbackPrediction(user, pipeline);
    }

    try {
      const goals = user.calculateGoals();
      const userContext = this.buildUserContext(user, pipeline, []);
      
      const completion = await this.openai!.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a real estate analytics expert. Analyze the agent's performance and provide realistic goal predictions. Return JSON with: currentProgress (percentage), projectedAnnualClosings (number), goalAttainmentLikelihood (percentage), recommendedActions (array of strings), projectionAccuracy (string), and lastUpdated (current date)."
          },
          {
            role: "user",
            content: `Analyze this real estate agent's goal progress and predict success: ${userContext}. Annual goal: ${goals.closingsNeeded} closings, ${goals.annualGoal} commission.`
          }
        ],
        max_tokens: 1000,
        temperature: 0.5,
      });

      const response = completion.choices[0].message.content;
      return JSON.parse(response || '{}');
    } catch (error) {
      console.error('OpenAI prediction error:', error);
      return this.getFallbackPrediction(user, pipeline);
    }
  }

  private buildUserContext(user: IUser, pipeline: any, recentChallenges: any[]): string {
    const goals = user.calculateGoals();
    
    return JSON.stringify({
      userProfile: {
        leadSources: user.leadSources,
        commissionGoal: user.commissionGoal,
        gameState: user.gameState,
        theme: user.theme
      },
      goals: goals,
      pipeline: pipeline ? {
        healthScore: pipeline.healthScore,
        data: pipeline.data,
        lastUpdated: pipeline.lastUpdated
      } : null,
      recentActivity: {
        challengesCompleted: recentChallenges.length,
        recentChallenges: recentChallenges.slice(0, 5).map(c => ({
          category: c.category,
          points: c.points,
          completedAt: c.completedAt
        }))
      }
    });
  }

  // Fallback methods for when OpenAI is not configured
  private getFallbackInsights(user: IUser, pipeline: any, recentChallenges: any[]): any[] {
    const insights = [];
    
    if (user.gameState.streak < 3) {
      insights.push({
        type: 'motivation',
        title: 'Build Your Momentum',
        message: 'Your current streak is low. Focus on completing at least one challenge daily to build momentum.',
        priority: 'high'
      });
    }

    if (pipeline && pipeline.healthScore.prospecting < 70) {
      insights.push({
        type: 'performance',
        title: 'Boost Your Prospecting',
        message: 'Your prospecting health score is below average. Consider increasing your lead generation activities.',
        priority: 'medium'
      });
    }

    if (recentChallenges.length < 10) {
      insights.push({
        type: 'activity',
        title: 'Stay Consistent',
        message: 'You\'ve completed fewer challenges this month. Consistency is key to reaching your goals.',
        priority: 'medium'
      });
    }

    insights.push({
      type: 'positive',
      title: 'Great Progress!',
      message: `You've earned ${user.gameState.points} points so far. Keep up the excellent work!`,
      priority: 'low'
    });

    return insights;
  }

  private getFallbackChallenges(user: IUser, count: number): any[] {
    const templates = [
      {
        title: 'Call 5 new leads',
        description: 'Make outbound calls to 5 new prospects from your lead list',
        category: 'prospecting',
        points: 50,
        difficulty: 'medium',
        relatedLeadSources: ['web_leads', 'doorknocking', 'sphere_influence']
      },
      {
        title: 'Follow up with 3 warm prospects',
        description: 'Reach out to 3 prospects who have shown interest',
        category: 'nurturing',
        points: 40,
        difficulty: 'medium',
        relatedLeadSources: ['web_leads', 'referrals', 'sphere_influence']
      },
      {
        title: 'Update CRM with 10 contact details',
        description: 'Add or update 10 contact records in your CRM system',
        category: 'administrative',
        points: 20,
        difficulty: 'easy',
        relatedLeadSources: []
      }
    ];

    return templates.slice(0, count);
  }

  private getFallbackTips(user: IUser, pipeline: any, recentChallenges: any[]): any[] {
    const tips = [
      {
        category: 'prospecting',
        title: 'Time Block Your Prospecting',
        description: 'Set aside 2-3 hours each morning for focused prospecting activities. This ensures consistency.',
        actionable: true
      },
      {
        category: 'nurturing',
        title: 'Follow Up Within 24 Hours',
        description: 'Quick response times significantly increase conversion rates. Set up automated reminders.',
        actionable: true
      },
      {
        category: 'productivity',
        title: 'Use the 80/20 Rule',
        description: 'Focus 80% of your time on the 20% of activities that generate the most results.',
        actionable: false
      }
    ];

    return tips;
  }

  private getFallbackPrediction(user: IUser, pipeline: any): any {
    const goals = user.calculateGoals();
    const currentClosings = pipeline?.data?.closed || 0;
    const progressPercentage = goals.closingsNeeded > 0 ? (currentClosings / goals.closingsNeeded) * 100 : 0;
    
    const monthsRemaining = 12 - (new Date().getMonth() + 1);
    const projectedClosings = currentClosings + (currentClosings / (12 - monthsRemaining)) * monthsRemaining;
    const likelihoodOfSuccess = Math.min(95, Math.max(5, progressPercentage + (projectedClosings / goals.closingsNeeded) * 30));

    return {
      currentProgress: Math.round(progressPercentage),
      projectedAnnualClosings: Math.round(projectedClosings),
      goalAttainmentLikelihood: Math.round(likelihoodOfSuccess),
      recommendedActions: [
        progressPercentage < 25 ? 'Increase prospecting activities by 50%' : 'Maintain current prospecting pace',
        progressPercentage < 50 ? 'Focus on nurturing existing leads' : 'Consider raising your annual goal',
        'Schedule more property showings to accelerate closings'
      ],
      projectionAccuracy: 'moderate',
      lastUpdated: new Date()
    };
  }
}

export default new AIService(); 