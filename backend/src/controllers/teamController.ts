import { Request, Response } from 'express';
import Team, { ITeam } from '../models/Team';
import User, { IUser } from '../models/User';
import Pipeline from '../models/Pipeline';

interface AuthenticatedRequest extends Request {
  user?: IUser;
}

// @desc    Get team overview
// @route   GET /api/team/overview
// @access  Private (Team Leader/Admin)
export const getTeamOverview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    
    // Find teams where user is leader or admin can see all
    const query = user.role === 'admin' ? {} : { leaderId: user._id };
    const teams = await Team.find(query).populate('members', 'name email gameState');

    res.status(200).json({
      success: true,
      count: teams.length,
      data: teams
    });
  } catch (error) {
    console.error('Get team overview error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get team members
// @route   GET /api/team/:id/members
// @access  Private (Team Leader/Admin)
export const getTeamMembers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const team = await Team.findById(req.params.id).populate('members', '-password');
    
    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Team not found'
      });
    }

    // Check authorization
    const user = req.user!;
    if (user.role !== 'admin' && team.leaderId.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this team'
      });
    }

    res.status(200).json({
      success: true,
      data: team.members
    });
  } catch (error) {
    console.error('Get team members error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get team statistics
// @route   GET /api/team/:id/stats
// @access  Private (Team Leader/Admin)
export const getTeamStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const team = await Team.findById(req.params.id).populate('members');
    
    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Team not found'
      });
    }

    // Check authorization
    const user = req.user!;
    if (user.role !== 'admin' && team.leaderId.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this team'
      });
    }

    // Calculate team statistics
    const memberIds = team.members.map((member: any) => member._id);
    const members = await User.find({ _id: { $in: memberIds } });
    const pipelines = await Pipeline.find({ userId: { $in: memberIds } });

    const stats = {
      totalMembers: members.length,
      totalPoints: members.reduce((sum, member) => sum + member.gameState.points, 0),
      averageHealthScore: pipelines.length > 0 
        ? pipelines.reduce((sum, pipeline) => sum + pipeline.healthScore.overall, 0) / pipelines.length 
        : 0,
      completedChallenges: members.reduce((sum, member) => sum + member.gameState.completedChallenges, 0),
      topPerformers: members
        .sort((a, b) => b.gameState.points - a.gameState.points)
        .slice(0, 5)
        .map(member => ({
          id: member._id,
          name: member.name,
          points: member.gameState.points,
          streak: member.gameState.streak
        }))
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get team stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get team leaderboard
// @route   GET /api/team/:id/leaderboard
// @access  Private (Team Leader/Admin)
export const getTeamLeaderboard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const team = await Team.findById(req.params.id).populate('members');
    
    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Team not found'
      });
    }

    // Check authorization
    const user = req.user!;
    if (user.role !== 'admin' && team.leaderId.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this team'
      });
    }

    // Get members sorted by points
    const memberIds = team.members.map((member: any) => member._id);
    const members = await User.find({ _id: { $in: memberIds } })
      .select('name email gameState')
      .sort({ 'gameState.points': -1 });

    const leaderboard = members.map((member, index) => ({
      rank: index + 1,
      id: member._id,
      name: member.name,
      email: member.email,
      points: member.gameState.points,
      streak: member.gameState.streak,
      level: member.gameState.level,
      completedChallenges: member.gameState.completedChallenges
    }));

    res.status(200).json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error('Get team leaderboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
}; 