export enum AdmissionStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected'
}

export type Category = 'General' | 'OBC-NCL' | 'SC' | 'ST' | 'EWS';
export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
}

export interface StudentAdmission {
  _id: string;
  id: string;
  applicationNumber: string;
  fullName: string;
  email: string;
  phone: string;
  stream: string;
  branches: string[];
  finalBranch?: string;
  twelfthBoard: string;
  twelfthPercentage: number;
  tenthPercentage: number;
  category: Category;
  entranceExam?: string;
  entranceScore?: number;
  createdAt: string;
  status: AdmissionStatus;
  adminNotes?: string;
  aiScore?: number;
  aiReason?: string;
  aiCompliance?: string;
}

export interface EligibilityAnalysis {
  isValid: boolean;
  errors: string[];
  eligibilityScore: number;
  suggestedStatus: AdmissionStatus;
  suggestedBranch?: string;
  reason: string;
  adminNoteDraft: string;
  reservationCompliance: string;
}

export interface DashboardSummary {
  totalCount: number;
  statusDistribution: { name: string; value: number }[];
  categoryDistribution: { name: string; value: number }[];
  keyObservations: string[];
  dataQualityIssues: string[];
}
