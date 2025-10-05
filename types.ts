export interface ScoreBreakdown {
  skills: number;
  education: number;
  experience: number;
  extra: number;
}

export enum ApplicantStatus {
  Ranked = 'Ranked',
  Review = 'For Review',
}

export interface Applicant {
  id: string;
  rank: number;
  name: string;
  email: string;
  phone: string;
  score: number;
  status: ApplicantStatus;
  skills: string[];
  education: string;
  experienceSummary: string;
  scoreBreakdown: ScoreBreakdown;
  resumeSummary: string;
}

export interface BiasReportData {
  gender: { name: string; value: number }[];
  region: { name: string; value: number }[];
  education: { name: string; value: number }[];
}

export interface RankingResult {
  rankedApplicants: Applicant[];
  validationErrors: string[];
  biasReport: BiasReportData;
  stats: {
    total: number;
    ranked: number;
    forReview: number;
  };
  targetRole?: string;
}