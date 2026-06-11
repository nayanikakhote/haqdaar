import type { Profile, Benefit, Lang } from "./haqdaar-types";
export function parseWorkerInput(text: string, currentField?: string): Promise<Partial<Profile>>;
export function explainClaim(benefit: Benefit, profile: Profile, lang: Lang): Promise<string[]>;
