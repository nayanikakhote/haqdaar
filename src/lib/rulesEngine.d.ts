import type { Profile, Benefit, MatchResult, Verdict, Loc, Lang, StateData } from "./haqdaar-types";
export function getStateData(state: string): StateData | null;
export function checkBaseEligibility(profile: Profile): Verdict;
export function matchBenefits(profile: Profile): MatchResult;
export function t(obj: Loc | undefined | null, lang: Lang): string;
