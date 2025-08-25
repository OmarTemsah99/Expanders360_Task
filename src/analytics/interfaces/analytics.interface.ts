export interface TopVendorByCountry {
  country: string;
  vendors: VendorAnalytics[];
  documentCount: number;
}

export interface VendorAnalytics {
  id: number;
  name: string;
  avgMatchScore: number;
  matchCount: number;
  rating: number;
  responseSlaHours: number;
}

export interface AnalyticsTopVendorsResponse {
  countries: TopVendorByCountry[];
  generatedAt: Date;
  periodDays: number;
}

export interface VendorPerformanceMetrics {
  id: number;
  name: string;
  rating: number;
  response_sla_hours: number;
  countries_active: number;
  total_matches: number;
  avg_score: number;
  best_score: number;
  worst_score: number;
}

export interface ProjectActivityByCountry {
  country: string;
  projectCount: number;
  avgBudget: number;
  totalBudget: number;
  documentCount: number;
  docsPerProject: number;
}

export interface AnalyticsResponse<T> {
  data: T;
  periodDays: number;
  generatedAt: Date;
}

// Query parameters interface
export interface AnalyticsQueryParams {
  days?: number;
}

// Database query result interfaces (for internal use)
export interface MySQLVendorQueryResult {
  country: string;
  vendor_id: number;
  vendor_name: string;
  rating: string;
  response_sla_hours: string;
  avg_match_score: string;
  match_count: string;
  rank_num: number;
}

export interface ProjectQueryResult {
  project_country: string;
  project_count: string;
  avg_budget: string;
  total_budget: string;
}
