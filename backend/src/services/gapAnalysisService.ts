import { ActivityGaps, ActivityDeltas } from './scoringService';

// Conversion table from blueprint: 10-point gap → activity delta
const GAP_TO_DELTA_TABLE = {
  prospecting: {
    newLeads: 12,      // +12 leads/day per 10pt gap
    calls: 8,          // +8 calls/day per 10pt gap
    socialEngagements: 6  // +6 social engagements/day per 10pt gap
  },
  nurturing: {
    followUpCalls: 8,  // +8 calls/day per 10pt gap
    emails: 12,        // +12 emails/day per 10pt gap
    appointments: 3    // +3 appointments/day per 10pt gap
  },
  clientCare: {
    weeklyTouches: 3,  // +3 touches/active client per 10pt gap
    showings: 4,       // +4 showings/day per 10pt gap
    offers: 2          // +2 offers/day per 10pt gap
  },
  administrative: {
    crmUpdates: 10,    // +10 CRM updates/day per 10pt gap
    contractReviews: 3, // +3 contract reviews/day per 10pt gap
    marketAnalyses: 2  // +2 market analyses/day per 10pt gap
  }
};

export interface ActionPlan {
  date: string;
  userId: string;
  focusAreas: string[];
  gaps: ActivityGaps;
  deltas: ActivityDeltas;
  totalActivitiesNeeded: number;
  priorityLevel: 'low' | 'medium' | 'high' | 'critical';
}

class GapAnalysisService {
  
  /**
   * Translate gaps into activity deltas using conversion table
   */
  translateGapsToDeltas(gaps: ActivityGaps): ActivityDeltas {
    const deltas: ActivityDeltas = {
      prospecting: {
        newLeads: this.calculateDelta(gaps.prospecting, GAP_TO_DELTA_TABLE.prospecting.newLeads),
        calls: this.calculateDelta(gaps.prospecting, GAP_TO_DELTA_TABLE.prospecting.calls),
        socialEngagements: this.calculateDelta(gaps.prospecting, GAP_TO_DELTA_TABLE.prospecting.socialEngagements)
      },
      nurturing: {
        followUpCalls: this.calculateDelta(gaps.nurturing, GAP_TO_DELTA_TABLE.nurturing.followUpCalls),
        emails: this.calculateDelta(gaps.nurturing, GAP_TO_DELTA_TABLE.nurturing.emails),
        appointments: this.calculateDelta(gaps.nurturing, GAP_TO_DELTA_TABLE.nurturing.appointments)
      },
      clientCare: {
        weeklyTouches: this.calculateDelta(gaps.clientCare, GAP_TO_DELTA_TABLE.clientCare.weeklyTouches),
        showings: this.calculateDelta(gaps.clientCare, GAP_TO_DELTA_TABLE.clientCare.showings),
        offers: this.calculateDelta(gaps.clientCare, GAP_TO_DELTA_TABLE.clientCare.offers)
      },
      administrative: {
        crmUpdates: this.calculateDelta(gaps.administrative, GAP_TO_DELTA_TABLE.administrative.crmUpdates),
        contractReviews: this.calculateDelta(gaps.administrative, GAP_TO_DELTA_TABLE.administrative.contractReviews),
        marketAnalyses: this.calculateDelta(gaps.administrative, GAP_TO_DELTA_TABLE.administrative.marketAnalyses)
      }
    };
    
    return deltas;
  }
  
  /**
   * Calculate delta for a specific gap
   * Formula: (gap / 10) * base_delta_per_10_points
   */
  private calculateDelta(gap: number, baseDelta: number): number {
    return Math.round((gap / 10) * baseDelta);
  }
  
  /**
   * Rank gaps and identify top 2 focus areas
   */
  identifyFocusAreas(gaps: ActivityGaps): string[] {
    const gapEntries = Object.entries(gaps)
      .sort((a, b) => b[1] - a[1])  // Sort by gap size descending
      .slice(0, 2);                 // Take top 2
    
    return gapEntries.map(([category]) => category);
  }
  
  /**
   * Create comprehensive action plan
   */
  createActionPlan(userId: string, gaps: ActivityGaps, date: Date = new Date()): ActionPlan {
    const deltas = this.translateGapsToDeltas(gaps);
    const focusAreas = this.identifyFocusAreas(gaps);
    const totalActivitiesNeeded = this.calculateTotalActivities(deltas);
    const priorityLevel = this.determinePriorityLevel(gaps);
    
    return {
      date: date.toISOString().split('T')[0],
      userId,
      focusAreas,
      gaps,
      deltas,
      totalActivitiesNeeded,
      priorityLevel
    };
  }
  
  /**
   * Calculate total activities needed across all categories
   */
  private calculateTotalActivities(deltas: ActivityDeltas): number {
    let total = 0;
    
    // Prospecting
    total += deltas.prospecting.newLeads;
    total += deltas.prospecting.calls;
    total += deltas.prospecting.socialEngagements;
    
    // Nurturing
    total += deltas.nurturing.followUpCalls;
    total += deltas.nurturing.emails;
    total += deltas.nurturing.appointments;
    
    // Client Care
    total += deltas.clientCare.weeklyTouches;
    total += deltas.clientCare.showings;
    total += deltas.clientCare.offers;
    
    // Administrative
    total += deltas.administrative.crmUpdates;
    total += deltas.administrative.contractReviews;
    total += deltas.administrative.marketAnalyses;
    
    return total;
  }
  
  /**
   * Determine priority level based on gap sizes
   */
  private determinePriorityLevel(gaps: ActivityGaps): 'low' | 'medium' | 'high' | 'critical' {
    const maxGap = Math.max(gaps.prospecting, gaps.nurturing, gaps.clientCare, gaps.administrative);
    const avgGap = (gaps.prospecting + gaps.nurturing + gaps.clientCare + gaps.administrative) / 4;
    
    if (maxGap >= 50 || avgGap >= 30) {
      return 'critical';
    } else if (maxGap >= 30 || avgGap >= 20) {
      return 'high';
    } else if (maxGap >= 15 || avgGap >= 10) {
      return 'medium';
    } else {
      return 'low';
    }
  }
  
  /**
   * Apply scale factors based on user performance patterns
   */
  applyScaleFactors(deltas: ActivityDeltas, scaleFactor: number = 1.0): ActivityDeltas {
    const scaledDeltas: ActivityDeltas = {
      prospecting: {
        newLeads: Math.round(deltas.prospecting.newLeads * scaleFactor),
        calls: Math.round(deltas.prospecting.calls * scaleFactor),
        socialEngagements: Math.round(deltas.prospecting.socialEngagements * scaleFactor)
      },
      nurturing: {
        followUpCalls: Math.round(deltas.nurturing.followUpCalls * scaleFactor),
        emails: Math.round(deltas.nurturing.emails * scaleFactor),
        appointments: Math.round(deltas.nurturing.appointments * scaleFactor)
      },
      clientCare: {
        weeklyTouches: Math.round(deltas.clientCare.weeklyTouches * scaleFactor),
        showings: Math.round(deltas.clientCare.showings * scaleFactor),
        offers: Math.round(deltas.clientCare.offers * scaleFactor)
      },
      administrative: {
        crmUpdates: Math.round(deltas.administrative.crmUpdates * scaleFactor),
        contractReviews: Math.round(deltas.administrative.contractReviews * scaleFactor),
        marketAnalyses: Math.round(deltas.administrative.marketAnalyses * scaleFactor)
      }
    };
    
    return scaledDeltas;
  }
  
  /**
   * Get recommended actions for each category
   */
  getRecommendedActions(deltas: ActivityDeltas, focusAreas: string[]): Record<string, string[]> {
    const actions: Record<string, string[]> = {};
    
    if (focusAreas.includes('prospecting') && deltas.prospecting.newLeads > 0) {
      actions.prospecting = [
        `Add ${deltas.prospecting.newLeads} new leads to your pipeline`,
        `Make ${deltas.prospecting.calls} prospecting calls`,
        `Engage with ${deltas.prospecting.socialEngagements} prospects on social media`
      ];
    }
    
    if (focusAreas.includes('nurturing') && deltas.nurturing.followUpCalls > 0) {
      actions.nurturing = [
        `Make ${deltas.nurturing.followUpCalls} follow-up calls to warm prospects`,
        `Send ${deltas.nurturing.emails} personalized follow-up emails`,
        `Schedule ${deltas.nurturing.appointments} appointments with qualified prospects`
      ];
    }
    
    if (focusAreas.includes('clientCare') && deltas.clientCare.weeklyTouches > 0) {
      actions.clientCare = [
        `Increase client touches by ${deltas.clientCare.weeklyTouches} per active client`,
        `Schedule ${deltas.clientCare.showings} additional property showings`,
        `Prepare ${deltas.clientCare.offers} offers for ready buyers`
      ];
    }
    
    if (focusAreas.includes('administrative') && deltas.administrative.crmUpdates > 0) {
      actions.administrative = [
        `Update ${deltas.administrative.crmUpdates} CRM records`,
        `Review ${deltas.administrative.contractReviews} contracts or agreements`,
        `Complete ${deltas.administrative.marketAnalyses} market analyses`
      ];
    }
    
    return actions;
  }
  
  /**
   * Save action plan to storage
   */
  async saveActionPlan(actionPlan: ActionPlan): Promise<void> {
    // For now, just log the action plan
    // In production, you'd save to database or file system
    console.log(`Action plan saved for user ${actionPlan.userId} on ${actionPlan.date}`);
    console.log(`Priority: ${actionPlan.priorityLevel}`);
    console.log(`Focus areas: ${actionPlan.focusAreas.join(', ')}`);
    console.log(`Total activities needed: ${actionPlan.totalActivitiesNeeded}`);
  }
  
  /**
   * Load historical action plans for analysis
   */
  async loadActionPlanHistory(userId: string, days: number = 30): Promise<ActionPlan[]> {
    // TODO: Implement loading from storage
    return [];
  }
  
  /**
   * Analyze action plan effectiveness
   */
  analyzeEffectiveness(previousPlan: ActionPlan, currentGaps: ActivityGaps): {
    improvement: number;
    effectiveAreas: string[];
    strugglingAreas: string[];
  } {
    const previousGaps = previousPlan.gaps;
    
    const improvements = {
      prospecting: previousGaps.prospecting - currentGaps.prospecting,
      nurturing: previousGaps.nurturing - currentGaps.nurturing,
      clientCare: previousGaps.clientCare - currentGaps.clientCare,
      administrative: previousGaps.administrative - currentGaps.administrative
    };
    
    const effectiveAreas = Object.entries(improvements)
      .filter(([_, improvement]) => improvement > 5)
      .map(([area]) => area);
    
    const strugglingAreas = Object.entries(improvements)
      .filter(([_, improvement]) => improvement < -5)
      .map(([area]) => area);
    
    const overallImprovement = Object.values(improvements).reduce((sum, imp) => sum + imp, 0) / 4;
    
    return {
      improvement: Math.round(overallImprovement),
      effectiveAreas,
      strugglingAreas
    };
  }
}

export default new GapAnalysisService(); 