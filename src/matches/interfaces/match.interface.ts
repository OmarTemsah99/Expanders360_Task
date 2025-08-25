export interface MatchCriteria {
  /** Minimum score threshold to consider a match valid */
  minimumScore: number;
  /** Weight for service overlap (default: 2 points per overlapping service) */
  serviceWeight: number;
  /** Weight for vendor rating (default: rating * 1) */
  ratingWeight: number;
  /** Bonus for fast SLA (< 24 hours) */
  fastSlaBonus: number;
  /** Bonus for medium SLA (24-72 hours) */
  mediumSlaBonus: number;
}

export interface MatchResult {
  vendor: {
    id: number;
    name: string;
    rating: number;
    response_sla_hours: number;
    countries_supported: string[];
    services_offered: string[];
  };
  score: number;
  matchDetails: {
    servicesOverlap: string[];
    countryMatch: boolean;
    ratingBonus: number;
    slaBonus: number;
    reasonForScore: string;
  };
}

export interface RebuildMatchesResult {
  projectId: string;
  totalVendorsConsidered: number;
  eligibleVendors: number;
  matchesCreated: number;
  matchesUpdated: number;
  matches: MatchResult[];
}
