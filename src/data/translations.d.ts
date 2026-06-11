import type { Lang } from "../lib/haqdaar-types";
export const LANGUAGES: { code: Lang; label: string }[];
export const translations: Record<Lang, Record<string, string>>;
export function ui(lang: Lang, key: string): string;
