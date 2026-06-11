import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { ui as uiFn } from "../data/translations.js";
import { t as tFn } from "./rulesEngine.js";
import type { Lang, Loc } from "./haqdaar-types";

const STORAGE_KEY = "haqdaar:lang";

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  ui: (key: string) => string;
  t: (obj: Loc | undefined | null) => string;
}

const Ctx = createContext<LangCtx | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("hi");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
      if (stored === "hi" || stored === "mr" || stored === "en") setLangState(stored);
    } catch {}
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch {}
  }, []);

  const value: LangCtx = {
    lang,
    setLang,
    ui: (key) => uiFn(lang, key),
    t: (obj) => tFn(obj, lang),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLang(): LangCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useLang must be inside LangProvider");
  return v;
}
