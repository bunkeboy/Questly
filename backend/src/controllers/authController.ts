import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import Pipeline from '../models/Pipeline';
import { generateToken } from '../middleware/auth';
import FubService from '../services/fubService';

interface AuthenticatedRequest extends Request {
  user?: IUser;
}

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists'
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      name
    });

    // Create initial pipeline data for the user
    await Pipeline.create({
      userId: user._id
    });

    // Generate token
    const token = generateToken(user._id.toString());

    res.status(201).json({
      success: true,
      token,
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        commissionGoal: user.commissionGoal,
        averageSalesPrice: user.averageSalesPrice,
        commissionRate: user.commissionRate,
        conversionRate: user.conversionRate,
        leadSources: user.leadSources,
        theme: user.theme,
        fubConnected: user.fubConnected,
        gameState: user.gameState,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id.toString());

    res.status(200).json({
      success: true,
      token,
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        commissionGoal: user.commissionGoal,
        averageSalesPrice: user.averageSalesPrice,
        commissionRate: user.commissionRate,
        conversionRate: user.conversionRate,
        leadSources: user.leadSources,
        theme: user.theme,
        fubConnected: user.fubConnected,
        gameState: user.gameState,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
export const logout = async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    
    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        commissionGoal: user.commissionGoal,
        averageSalesPrice: user.averageSalesPrice,
        commissionRate: user.commissionRate,
        conversionRate: user.conversionRate,
        leadSources: user.leadSources,
        theme: user.theme,
        fubConnected: user.fubConnected,
        gameState: user.gameState,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const {
      name,
      commissionGoal,
      averageSalesPrice,
      commissionRate,
      conversionRate,
      leadSources,
      theme,
      fubApiKey
    } = req.body;

    // Update user fields
    if (name) user.name = name;
    if (commissionGoal !== undefined) user.commissionGoal = commissionGoal;
    if (averageSalesPrice !== undefined) user.averageSalesPrice = averageSalesPrice;
    if (commissionRate !== undefined) user.commissionRate = commissionRate;
    if (conversionRate !== undefined) user.conversionRate = conversionRate;
    if (leadSources) user.leadSources = leadSources;
    if (theme) user.theme = theme;
    if (fubApiKey !== undefined) {
      user.fubApiKey = fubApiKey;
      user.fubConnected = !!fubApiKey;
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        commissionGoal: user.commissionGoal,
        averageSalesPrice: user.averageSalesPrice,
        commissionRate: user.commissionRate,
        conversionRate: user.conversionRate,
        leadSources: user.leadSources,
        theme: user.theme,
        fubConnected: user.fubConnected,
        gameState: user.gameState,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Connect Follow Up Boss
// @route   POST /api/auth/connect-fub
// @access  Private
export const connectFub = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { fubApiKey } = req.body;

    if (!fubApiKey) {
      return res.status(400).json({
        success: false,
        error: 'Follow Up Boss API key is required'
      });
    }

    // Test the API key
    const fubService = new FubService(fubApiKey);
    const isConnected = await fubService.testConnection();

    if (!isConnected) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Follow Up Boss API key or connection failed'
      });
    }

    // Save the API key
    user.fubApiKey = fubApiKey;
    user.fubConnected = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Follow Up Boss connected successfully',
      data: {
        fubConnected: true
      }
    });
  } catch (error) {
    console.error('FUB connection error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to connect Follow Up Boss'
    });
  }
};

// @desc    Disconnect Follow Up Boss
// @route   POST /api/auth/disconnect-fub
// @access  Private
export const disconnectFub = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;

    user.fubApiKey = undefined;
    user.fubConnected = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Follow Up Boss disconnected successfully',
      data: {
        fubConnected: false
      }
    });
  } catch (error) {
    console.error('FUB disconnection error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to disconnect Follow Up Boss'
    });
  }
}; 