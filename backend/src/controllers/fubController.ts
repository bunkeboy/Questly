import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import FubService from '../services/fubService';
import Pipeline from '../models/Pipeline';

interface AuthenticatedRequest extends Request {
  user?: IUser;
}

// @desc    Sync data from Follow Up Boss
// @route   POST /api/fub/sync
// @access  Private
export const syncFubData = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    
    if (!user.fubConnected || !user.fubApiKey) {
      return res.status(400).json({
        success: false,
        error: 'Follow Up Boss not connected. Please connect your FUB account first.'
      });
    }

    const fubService = new FubService(user.fubApiKey);
    
    // Test connection first
    const isConnected = await fubService.testConnection();
    if (!isConnected) {
      return res.status(400).json({
        success: false,
        error: 'Failed to connect to Follow Up Boss. Please check your API key.'
      });
    }

    // Sync contacts, deals, and activities
    const contactsResult = await fubService.getContacts(1, 100);
    const dealsResult = await fubService.getDeals(1, 100);
    const activitiesResult = await fubService.getActivities(1, 100);

    // Update pipeline data based on FUB data
    let pipeline = await Pipeline.findOne({ userId: user._id });
    if (!pipeline) {
      pipeline = await Pipeline.create({ userId: user._id });
    }

    // Calculate pipeline health from FUB data
    const leads = contactsResult.contacts.filter(c => c.status === 'lead').length;
    const prospects = contactsResult.contacts.filter(c => c.status === 'prospect').length;
    const opportunities = dealsResult.deals.filter(d => ['negotiating', 'under_contract'].includes(d.stage)).length;
    const closings = dealsResult.deals.filter(d => d.stage === 'closed').length;
    const totalValue = dealsResult.deals
      .filter(d => d.stage === 'closed')
      .reduce((sum, deal) => sum + deal.value, 0);

    // Update pipeline data
    pipeline.data = {
      leads: leads + prospects,
      opportunities,
      underContract: dealsResult.deals.filter(d => d.stage === 'under_contract').length,
      closed: closings,
      totalValue,
      averageValue: closings > 0 ? totalValue / closings : 0,
      conversionRate: leads > 0 ? closings / leads : 0
    };

    pipeline.lastUpdated = new Date();
    await pipeline.save();

    const syncResult = {
      contactsSynced: contactsResult.contacts.length,
      dealsSynced: dealsResult.deals.length,
      activitiesSynced: activitiesResult.activities.length,
      pipelineUpdated: true,
      lastSyncDate: new Date()
    };

    res.status(200).json({
      success: true,
      message: 'Data synced successfully from Follow Up Boss',
      data: syncResult
    });
  } catch (error) {
    console.error('FUB sync error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to sync with Follow Up Boss'
    });
  }
};

// @desc    Get FUB contacts
// @route   GET /api/fub/contacts
// @access  Private
export const getFubContacts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    
    if (!user.fubConnected || !user.fubApiKey) {
      return res.status(400).json({
        success: false,
        error: 'Follow Up Boss not connected'
      });
    }

    const fubService = new FubService(user.fubApiKey);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const result = await fubService.getContacts(page, limit);

    res.status(200).json({
      success: true,
      count: result.contacts.length,
      total: result.total,
      page,
      hasMore: result.hasMore,
      data: result.contacts
    });
  } catch (error) {
    console.error('Get FUB contacts error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch contacts'
    });
  }
};

// @desc    Get FUB deals
// @route   GET /api/fub/deals
// @access  Private
export const getFubDeals = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    
    if (!user.fubConnected || !user.fubApiKey) {
      return res.status(400).json({
        success: false,
        error: 'Follow Up Boss not connected'
      });
    }

    // TODO: Implement actual FUB API integration
    // For now, return mock data
    const mockDeals = [
      {
        id: 'fub_deal_1',
        name: '123 Main St Purchase',
        value: 850000,
        stage: 'under_contract',
        probability: 85,
        expectedCloseDate: new Date('2024-02-15'),
        contactId: 'fub_contact_1',
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-16')
      },
      {
        id: 'fub_deal_2',
        name: '456 Oak Ave Listing',
        value: 1200000,
        stage: 'negotiating',
        probability: 60,
        expectedCloseDate: new Date('2024-03-01'),
        contactId: 'fub_contact_2',
        createdAt: new Date('2024-01-12'),
        updatedAt: new Date('2024-01-14')
      }
    ];

    res.status(200).json({
      success: true,
      count: mockDeals.length,
      data: mockDeals
    });
  } catch (error) {
    console.error('Get FUB deals error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get FUB activities
// @route   GET /api/fub/activities
// @access  Private
export const getFubActivities = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    
    if (!user.fubConnected || !user.fubApiKey) {
      return res.status(400).json({
        success: false,
        error: 'Follow Up Boss not connected'
      });
    }

    // TODO: Implement actual FUB API integration
    // For now, return mock data
    const mockActivities = [
      {
        id: 'fub_activity_1',
        type: 'call',
        description: 'Follow-up call with John about property showing',
        contactId: 'fub_contact_1',
        dealId: 'fub_deal_1',
        createdAt: new Date('2024-01-16'),
        completedAt: new Date('2024-01-16')
      },
      {
        id: 'fub_activity_2',
        type: 'email',
        description: 'Sent market update to Sarah',
        contactId: 'fub_contact_2',
        createdAt: new Date('2024-01-15'),
        completedAt: new Date('2024-01-15')
      }
    ];

    res.status(200).json({
      success: true,
      count: mockActivities.length,
      data: mockActivities
    });
  } catch (error) {
    console.error('Get FUB activities error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
}; 