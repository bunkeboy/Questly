import { RawMetrics } from './metricsService';

export interface SubScores {
  prospecting: number;
  nurturing: number;
  clientCare: number;
  administrative: number;
  overall: number;
}

export interface ScoreWeights {
  prospecting: number;
  nurturing: number;
  clientCare: number;
  administrative: number;
}

export interface ActivityGaps {
  prospecting: number;
  nurturing: number;
  clientCare: number;
  administrative: number;
}

export interface ActivityDeltas {
  prospecting: {
    newLeads: number;
    calls: number;
    socialEngagements: number;
  };
  nurturing: {
    followUpCalls: number;
    emails: number;
    appointments: number;
  };
  clientCare: {
    weeklyTouches: number;
    showings: number;
    offers: number;
  };
  administrative: {
    crmUpdates: number;
    contractReviews: number;
    marketAnalyses: number;
  };
}

class ScoringService {
  
  /**
   * Calculate prospecting score (0-100)
   * Formula: MIN(100, 40 * prospecting_activity_ratio + 30 * new_lead_volume_ratio + 30 * prospecting_velocity_ratio)
   */
  calcProspectingScore(metrics: RawMetrics): number {
    const { activityVolume, targets, stageVelocity } = metrics;
    
    // Calculate activity ratio (actual vs target)
    const actualActivity = activityVolume.prospecting.callsLogged + 
                          activityVolume.prospecting.newLeadsAdded + 
                          activityVolume.prospecting.socialEngagements;
    const targetActivity = targets.dailyActivityTarget * 0.4; // 40% of total activity for prospecting
    const activityRatio = targetActivity > 0 ? Math.min(actualActivity / targetActivity, 2) : 0;
    
    // Calculate new lead volume ratio
    const actualLeads = activityVolume.prospecting.newLeadsAdded;
    const targetLeads = targets.dailyLeadTarget;
    const leadVolumeRatio = targetLeads > 0 ? Math.min(actualLeads / targetLeads, 2) : 0;
    
    // Calculate velocity ratio (faster = better, so invert)
    const idealVelocity = 10; // 10 days ideal prospecting to nurturing
    const actualVelocity = stageVelocity.prospectingToNurturing;
    const velocityRatio = actualVelocity > 0 ? Math.min(idealVelocity / actualVelocity, 2) : 0;
    
    const score = Math.min(100, 
      40 * activityRatio + 
      30 * leadVolumeRatio + 
      30 * velocityRatio
    );
    
    return Math.round(score);
  }
  
  /**
   * Calculate nurturing score (0-100)
   * Formula: MIN(100, 50 * nurture_activity_ratio + 30 * mid_funnel_velocity_ratio + 20 * dormant_leads_penalty)
   */
  calcNurturingScore(metrics: RawMetrics): number {
    const { activityVolume, targets, stageVelocity, dormantLeads } = metrics;
    
    // Calculate nurture activity ratio
    const actualActivity = activityVolume.nurturing.followUpCalls + 
                          activityVolume.nurturing.emailsSent + 
                          activityVolume.nurturing.appointmentsSet;
    const targetActivity = targets.dailyActivityTarget * 0.35; // 35% of total activity for nurturing
    const activityRatio = targetActivity > 0 ? Math.min(actualActivity / targetActivity, 2) : 0;
    
    // Calculate mid-funnel velocity ratio
    const idealVelocity = 21; // 21 days ideal nurturing to client care
    const actualVelocity = stageVelocity.nurturingToClientCare;
    const velocityRatio = actualVelocity > 0 ? Math.min(idealVelocity / actualVelocity, 2) : 0;
    
    // Calculate dormant leads penalty
    const totalLeads = dormantLeads.total;
    const warmLeadsContactedLast30d = totalLeads - dormantLeads.thirtyDays;
    const dormantPenalty = totalLeads > 0 ? 
      1 - (warmLeadsContactedLast30d / totalLeads) : 0;
    
    const score = Math.min(100,
      50 * activityRatio + 
      30 * velocityRatio + 
      20 * (1 - dormantPenalty) // Invert penalty to make it a positive score
    );
    
    return Math.round(score);
  }
  
  /**
   * Calculate client care score (0-100)
   * Formula: MIN(100, 60 * active_client_touch_ratio + 25 * appointment_to_offer_cycle_ratio + 15 * escrow_to_close_cycle_ratio)
   */
  calcClientCareScore(metrics: RawMetrics): number {
    const { activityVolume, targets, stageVelocity, pipelineCounts } = metrics;
    
    // Calculate active client touch ratio
    const actualTouches = activityVolume.clientCare.clientTouches + 
                         activityVolume.clientCare.appointmentsSet;
    const activeClients = pipelineCounts.clientCare;
    const targetTouchesPerClient = 3; // 3 touches per client per day ideal
    const targetTouches = activeClients * targetTouchesPerClient;
    const touchRatio = targetTouches > 0 ? Math.min(actualTouches / targetTouches, 2) : 1;
    
    // Calculate appointment to offer cycle ratio
    const appointments = activityVolume.clientCare.appointmentsSet;
    const offers = activityVolume.clientCare.offersCreated;
    const appointmentOfferRatio = appointments > 0 ? Math.min(offers / appointments, 1) : 0;
    
    // Calculate escrow to close cycle ratio (based on velocity)
    const idealCloseVelocity = 35; // 35 days ideal client care to close
    const actualCloseVelocity = stageVelocity.clientCareToClose;
    const closeVelocityRatio = actualCloseVelocity > 0 ? Math.min(idealCloseVelocity / actualCloseVelocity, 2) : 0;
    
    const score = Math.min(100,
      60 * touchRatio + 
      25 * appointmentOfferRatio + 
      15 * closeVelocityRatio
    );
    
    return Math.round(score);
  }
  
  /**
   * Calculate administrative score (0-100)
   * Formula: MIN(100, 50 * clean_db_ratio + 25 * task_completion_ratio + 25 * compliance_events_ratio)
   */
  calcAdministrativeScore(metrics: RawMetrics): number {
    const { dataHygiene, activityVolume, targets } = metrics;
    
    // Clean DB ratio (directly from data hygiene)
    const cleanDbRatio = dataHygiene.cleanRatio;
    
    // Task completion ratio (based on admin activities vs target)
    const actualAdminWork = activityVolume.administrative.crmUpdates + 
                           activityVolume.administrative.contractsReviewed + 
                           activityVolume.administrative.marketAnalyses;
    const targetAdminWork = targets.dailyActivityTarget * 0.25; // 25% of total activity for admin
    const taskCompletionRatio = targetAdminWork > 0 ? Math.min(actualAdminWork / targetAdminWork, 2) : 0;
    
    // Compliance events ratio (simplified - based on admin activities)
    const complianceItems = activityVolume.administrative.complianceItems;
    const expectedCompliance = 2; // 2 compliance items per day
    const complianceRatio = Math.min(complianceItems / expectedCompliance, 1);
    
    const score = Math.min(100,
      50 * cleanDbRatio + 
      25 * taskCompletionRatio + 
      25 * complianceRatio
    );
    
    return Math.round(score);
  }
  
  /**
   * Calculate overall health using weighted harmonic mean
   * Formula: 4 / (w_p / P + w_n / N + w_c / C + w_a / A)
   */
  calcOverallHealth(subscores: SubScores, weights?: ScoreWeights): number {
    // Default weights from blueprint
    const defaultWeights: ScoreWeights = {
      prospecting: 0.3,
      nurturing: 0.3,
      clientCare: 0.25,
      administrative: 0.15
    };
    
    const w = weights || defaultWeights;
    
    // Ensure no division by zero
    const P = Math.max(subscores.prospecting, 1);
    const N = Math.max(subscores.nurturing, 1);
    const C = Math.max(subscores.clientCare, 1);
    const A = Math.max(subscores.administrative, 1);
    
    const harmonicMean = 4 / (w.prospecting / P + w.nurturing / N + w.clientCare / C + w.administrative / A);
    
    return Math.round(Math.min(harmonicMean, 100));
  }
  
  /**
   * Calculate all sub-scores from raw metrics
   */
  calculateAllScores(metrics: RawMetrics, weights?: ScoreWeights): SubScores {
    const prospecting = this.calcProspectingScore(metrics);
    const nurturing = this.calcNurturingScore(metrics);
    const clientCare = this.calcClientCareScore(metrics);
    const administrative = this.calcAdministrativeScore(metrics);
    
    const subscores: SubScores = {
      prospecting,
      nurturing,
      clientCare,
      administrative,
      overall: 0 // Will be calculated next
    };
    
    subscores.overall = this.calcOverallHealth(subscores, weights);
    
    return subscores;
  }
  
  /**
   * Get dynamic quarterly weights (shift 5 pts per quarter from P/N into Client Care)
   */
  getQuarterlyWeights(date: Date): ScoreWeights {
    const quarter = Math.floor(date.getMonth() / 3) + 1;
    const shiftAmount = (quarter - 1) * 0.05; // 5% shift per quarter
    
    return {
      prospecting: Math.max(0.2, 0.3 - shiftAmount),
      nurturing: Math.max(0.2, 0.3 - shiftAmount),
      clientCare: Math.min(0.4, 0.25 + (shiftAmount * 2)),
      administrative: 0.15 // Remains constant
    };
  }
  
  /**
   * Calculate gaps between target (100) and actual scores
   */
  calculateGaps(subscores: SubScores): ActivityGaps {
    return {
      prospecting: Math.max(0, 100 - subscores.prospecting),
      nurturing: Math.max(0, 100 - subscores.nurturing),
      clientCare: Math.max(0, 100 - subscores.clientCare),
      administrative: Math.max(0, 100 - subscores.administrative)
    };
  }
  
  /**
   * Get top 2 focus areas (highest gaps)
   */
  getFocusAreas(gaps: ActivityGaps): string[] {
    const gapEntries = Object.entries(gaps).sort((a, b) => b[1] - a[1]);
    return gapEntries.slice(0, 2).map(([category]) => category);
  }
}

export default new ScoringService(); 