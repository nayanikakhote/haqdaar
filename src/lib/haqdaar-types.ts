export type Lang = "hi" | "mr" | "en";

export type Loc = { en: string; hi: string; mr: string };

export interface Profile {
  state: "maharashtra" | "delhi";
  age: number;
  workType: string;
  daysWorked: number;
  registered: "yes" | "no" | "dontknow";
  gender: "male" | "female";
  married: boolean;
  kidsInSchool: boolean;
}

export interface BenefitEligibility {
  minAge?: number;
  maxAge?: number;
  minDaysWorked?: number;
  requiresRegistration?: boolean;
  requiresKids?: boolean;
  requiresMarried?: boolean;
  gender?: "male" | "female" | "any";
  custom?: string;
}

export interface Benefit {
  id: string;
  category: string;
  isRegistrationStep?: boolean;
  name: Loc;
  description: Loc;
  amount: { value: number; display: Loc };
  eligibility: BenefitEligibility;
  documents: string[];
  howToClaim: string[];
  officeLink?: string;
}

export interface Verdict {
  status: "registered" | "eligible" | "not_yet" | "not_eligible" | "error";
  code?: string;
  reason?: string;
  gap?: number;
  minAge?: number;
  maxAge?: number;
}

export interface StateData {
  state: string;
  boardName: Loc;
  portal: string;
  sourceNote: string;
  registration: { minAge: number; maxAge: number; minDaysWorked: number; feeNote: Loc };
  benefits: Benefit[];
}

export interface MatchResult {
  verdict: Verdict;
  registrationStep: Benefit | null;
  eligibleNow: Benefit[];
  afterRegistration: Benefit[];
}
