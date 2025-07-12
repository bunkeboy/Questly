import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

interface FubConfig {
  apiUrl: string;
  apiKey: string;
}

interface FubContact {
  id: string;
  name: string;
  emails: Array<{ value: string; type: string; }>;
  phones: Array<{ value: string; type: string; }>;
  status: string;
  source: string;
  assignedTo: string;
  tags: string[];
  created: string;
  updated: string;
  stage?: string;
  customFields?: Record<string, any>;
}

interface FubDeal {
  id: string;
  name: string;
  value: number;
  stage: string;
  probability: number;
  expectedCloseDate: string;
  contactId: string;
  assignedTo: string;
  created: string;
  updated: string;
  customFields?: Record<string, any>;
}

interface FubActivity {
  id: string;
  type: string;
  subject: string;
  description: string;
  contactId: string;
  dealId?: string;
  assignedTo: string;
  completed: boolean;
  dueDate: string;
  created: string;
  updated: string;
}

export class FubService {
  private client: AxiosInstance;
  private config: FubConfig;

  constructor(apiKey: string) {
    this.config = {
      apiUrl: process.env.FUB_API_URL || 'https://api.followupboss.com/v1',
      apiKey
    };

    this.client = axios.create({
      baseURL: this.config.apiUrl,
      headers: {
        'Authorization': `Basic ${Buffer.from(`${this.config.apiKey}:`).toString('base64')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 10000
    });

    // Add request/response interceptors for logging and error handling
    this.client.interceptors.request.use(
      (config) => {
        console.log(`FUB API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('FUB API Request Error:', error);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        console.log(`FUB API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('FUB API Response Error:', error.response?.status, error.response?.data);
        return Promise.reject(error);
      }
    );
  }

  // Test the API connection
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.client.get('/people', { params: { limit: 1 } });
      return response.status === 200;
    } catch (error) {
      console.error('FUB connection test failed:', error);
      return false;
    }
  }

  // Get all contacts with pagination
  async getContacts(page: number = 1, limit: number = 50): Promise<{ contacts: FubContact[], total: number, hasMore: boolean }> {
    try {
      const offset = (page - 1) * limit;
      const response = await this.client.get('/people', {
        params: {
          limit,
          offset,
          sort: '-updated'
        }
      });

      const contacts = response.data.people || [];
      const total = response.data.totalCount || 0;
      const hasMore = offset + contacts.length < total;

      return {
        contacts: contacts.map(this.transformContact),
        total,
        hasMore
      };
    } catch (error) {
      console.error('Failed to fetch FUB contacts:', error);
      throw new Error('Failed to fetch contacts from Follow Up Boss');
    }
  }

  // Get specific contact by ID
  async getContactById(contactId: string): Promise<FubContact | null> {
    try {
      const response = await this.client.get(`/people/${contactId}`);
      return this.transformContact(response.data);
    } catch (error) {
      if ((error as any).response?.status === 404) {
        return null;
      }
      console.error('Failed to fetch FUB contact:', error);
      throw new Error('Failed to fetch contact from Follow Up Boss');
    }
  }

  // Get deals with pagination
  async getDeals(page: number = 1, limit: number = 50): Promise<{ deals: FubDeal[], total: number, hasMore: boolean }> {
    try {
      const offset = (page - 1) * limit;
      const response = await this.client.get('/deals', {
        params: {
          limit,
          offset,
          sort: '-updated'
        }
      });

      const deals = response.data.deals || [];
      const total = response.data.totalCount || 0;
      const hasMore = offset + deals.length < total;

      return {
        deals: deals.map(this.transformDeal),
        total,
        hasMore
      };
    } catch (error) {
      console.error('Failed to fetch FUB deals:', error);
      throw new Error('Failed to fetch deals from Follow Up Boss');
    }
  }

  // Get activities with pagination
  async getActivities(page: number = 1, limit: number = 50): Promise<{ activities: FubActivity[], total: number, hasMore: boolean }> {
    try {
      const offset = (page - 1) * limit;
      const response = await this.client.get('/events', {
        params: {
          limit,
          offset,
          sort: '-created'
        }
      });

      const activities = response.data.events || [];
      const total = response.data.totalCount || 0;
      const hasMore = offset + activities.length < total;

      return {
        activities: activities.map(this.transformActivity),
        total,
        hasMore
      };
    } catch (error) {
      console.error('Failed to fetch FUB activities:', error);
      throw new Error('Failed to fetch activities from Follow Up Boss');
    }
  }

  // Create a new contact
  async createContact(contactData: Partial<FubContact>): Promise<FubContact> {
    try {
      const fubData = this.transformToFubFormat(contactData);
      const response = await this.client.post('/people', fubData);
      return this.transformContact(response.data);
    } catch (error) {
      console.error('Failed to create FUB contact:', error);
      throw new Error('Failed to create contact in Follow Up Boss');
    }
  }

  // Update an existing contact
  async updateContact(contactId: string, contactData: Partial<FubContact>): Promise<FubContact> {
    try {
      const fubData = this.transformToFubFormat(contactData);
      const response = await this.client.put(`/people/${contactId}`, fubData);
      return this.transformContact(response.data);
    } catch (error) {
      console.error('Failed to update FUB contact:', error);
      throw new Error('Failed to update contact in Follow Up Boss');
    }
  }

  // Create a new activity/event
  async createActivity(activityData: Partial<FubActivity>): Promise<FubActivity> {
    try {
      const fubData = {
        type: activityData.type,
        subject: activityData.subject,
        description: activityData.description,
        personId: activityData.contactId,
        dealId: activityData.dealId,
        dueDate: activityData.dueDate
      };
      
      const response = await this.client.post('/events', fubData);
      return this.transformActivity(response.data);
    } catch (error) {
      console.error('Failed to create FUB activity:', error);
      throw new Error('Failed to create activity in Follow Up Boss');
    }
  }

  // Get contact statistics
  async getContactStats(): Promise<{ total: number, bySource: Record<string, number>, byStage: Record<string, number> }> {
    try {
      // This would require multiple API calls to get statistics
      // For now, return basic total count
      const response = await this.client.get('/people', { params: { limit: 1 } });
      const total = response.data.totalCount || 0;

      return {
        total,
        bySource: {},
        byStage: {}
      };
    } catch (error) {
      console.error('Failed to fetch FUB contact stats:', error);
      throw new Error('Failed to fetch contact statistics from Follow Up Boss');
    }
  }

  // Transform FUB contact format to our format
  private transformContact(fubContact: any): FubContact {
    return {
      id: fubContact.id,
      name: fubContact.name || `${fubContact.firstName || ''} ${fubContact.lastName || ''}`.trim(),
      emails: fubContact.emails || [],
      phones: fubContact.phones || [],
      status: fubContact.status || 'new',
      source: fubContact.source || 'unknown',
      assignedTo: fubContact.assignedTo?.name || fubContact.assignedTo?.email || 'unassigned',
      tags: fubContact.tags || [],
      created: fubContact.created,
      updated: fubContact.updated,
      stage: fubContact.stage,
      customFields: fubContact.customFields || {}
    };
  }

  // Transform FUB deal format to our format
  private transformDeal(fubDeal: any): FubDeal {
    return {
      id: fubDeal.id,
      name: fubDeal.name || 'Untitled Deal',
      value: fubDeal.value || 0,
      stage: fubDeal.stage || 'new',
      probability: fubDeal.probability || 0,
      expectedCloseDate: fubDeal.expectedCloseDate,
      contactId: fubDeal.personId,
      assignedTo: fubDeal.assignedTo?.name || fubDeal.assignedTo?.email || 'unassigned',
      created: fubDeal.created,
      updated: fubDeal.updated,
      customFields: fubDeal.customFields || {}
    };
  }

  // Transform FUB activity format to our format
  private transformActivity(fubActivity: any): FubActivity {
    return {
      id: fubActivity.id,
      type: fubActivity.type || 'note',
      subject: fubActivity.subject || 'No subject',
      description: fubActivity.description || fubActivity.body || '',
      contactId: fubActivity.personId,
      dealId: fubActivity.dealId,
      assignedTo: fubActivity.assignedTo?.name || fubActivity.assignedTo?.email || 'unassigned',
      completed: fubActivity.completed || false,
      dueDate: fubActivity.dueDate,
      created: fubActivity.created,
      updated: fubActivity.updated
    };
  }

  // Transform our format to FUB format for creating/updating
  private transformToFubFormat(data: Partial<FubContact>): any {
    return {
      firstName: data.name?.split(' ')[0] || '',
      lastName: data.name?.split(' ').slice(1).join(' ') || '',
      emails: data.emails,
      phones: data.phones,
      source: data.source,
      tags: data.tags,
      customFields: data.customFields
    };
  }
}

export default FubService; 