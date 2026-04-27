"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type Lang = "en" | "ja";

interface LanguageContextValue {
  lang: Lang;
  toggle: () => void;
  t: (key: string) => string;
}

// ─── Translations ──────────────────────────────────────────────────────────────
export const translations: Record<Lang, Record<string, string>> = {
  en: {
    // Hero
    "hero.badge":        "Live across Japan — 50+ organizations and counting",
    "hero.headline":     "Where ambition meets opportunity.",
    "hero.subtext":      "Japan's platform for student founders — discover opportunities, build your team, and launch your venture.",
    "hero.subtext.free": "Free, forever.",
    "hero.cta.primary":  "Get Started Free",
    "hero.cta.secondary":"Explore Platform",
    "hero.scroll":       "Scroll",

    // CTA section
    "cta.headline":      "Ready to start building?",
    "cta.sub":           "Join Japan's community of student founders — free, forever.",
    "cta.join":          "Join AXIS Free",
    "cta.browse":        "Browse Directory",

    // Product descriptions
    "product.directory.tagline":      "Find your people",
    "product.directory.desc":         "Browse 50+ verified student organizations across Japan. Filter by focus area, location, and tier.",
    "product.network.tagline":        "Build your circle",
    "product.network.desc":           "Connect with student founders, join organizations, and build the relationships that become co-founder partnerships.",
    "product.opportunities.tagline":  "Discover what's out there",
    "product.opportunities.desc":     "Competitions, fellowships, scholarships, and programs — curated and verified for student founders.",
    "product.launchpad.tagline":      "Build something real",
    "product.launchpad.desc":         "Post your project, define roles, and recruit talented co-founders to build something that matters.",
    "product.ventures.tagline":       "Scale your vision",
    "product.ventures.desc":          "AXIS Ventures — our youth incubator for the most ambitious student founders. Mentorship, resources, community.",
    "product.match.tagline":          "Your AI navigator",
    "product.match.desc":             "Our AI surfaces personalized opportunity matches, co-founder suggestions, and program recommendations.",

    // Axis diagram
    "diagram.xaxis": "IMPACT",
    "diagram.yaxis": "GROWTH",
    "diagram.scroll": "scroll to explore",
    "diagram.click":  "click any node to enter",
    "diagram.enter":  "Enter",

    // Stats
    "stats.headline": "Built for Japan's next generation of founders.",
    "stats.sub":      "Every metric is a student story.",
    "stats.orgs":     "Student Orgs",
    "stats.opps":     "Opportunities",
    "stats.founders": "Founders",
    "stats.free":     "Free Forever",

    // Nav
    "nav.signin": "Sign in",
    "nav.join":   "Join AXIS",
    "nav.signout":"Sign out",

    // Lang toggle
    "lang.toggle": "日本語",
  },

  ja: {
    // Hero
    "hero.badge":        "日本全土で展開中 — 50以上の団体と成長中",
    "hero.headline":     "野心と機会が出会う場所。",
    "hero.subtext":      "日本の学生起業家のためのプラットフォーム — 機会を見つけ、チームを作り、ベンチャーを立ち上げよう。",
    "hero.subtext.free": "ずっと無料。",
    "hero.cta.primary":  "無料で始める",
    "hero.cta.secondary":"プラットフォームを見る",
    "hero.scroll":       "スクロール",

    // CTA section
    "cta.headline":      "さあ、作り始めよう。",
    "cta.sub":           "日本の学生起業家コミュニティへ — ずっと無料。",
    "cta.join":          "AXISに参加する（無料）",
    "cta.browse":        "団体一覧を見る",

    // Product descriptions
    "product.directory.tagline":      "仲間を見つけよう",
    "product.directory.desc":         "日本全国50以上の認定学生団体を検索。分野・地域・ランクでフィルタリング可能。",
    "product.network.tagline":        "ネットワークを広げよう",
    "product.network.desc":           "学生起業家とつながり、団体に参加し、共同創業者となる関係を築こう。",
    "product.opportunities.tagline":  "可能性を発見しよう",
    "product.opportunities.desc":     "コンテスト・フェローシップ・奨学金・プログラム — 学生起業家向けに厳選・検証済み。",
    "product.launchpad.tagline":      "本物を作ろう",
    "product.launchpad.desc":         "プロジェクトを投稿し、役割を定め、優秀な共同創業者をリクルートしよう。",
    "product.ventures.tagline":       "ビジョンをスケールしよう",
    "product.ventures.desc":          "AXIS Ventures — 志の高い学生起業家のためのユースインキュベーター。メンタリング・リソース・コミュニティ。",
    "product.match.tagline":          "AIナビゲーター",
    "product.match.desc":             "AIがパーソナライズされた機会マッチ・共同創業者候補・プログラム推薦を提案。",

    // Axis diagram
    "diagram.xaxis": "インパクト",
    "diagram.yaxis": "成長",
    "diagram.scroll": "スクロールして探索",
    "diagram.click":  "ノードをクリックして進む",
    "diagram.enter":  "開く",

    // Stats
    "stats.headline": "日本の次世代起業家のために作られた。",
    "stats.sub":      "すべての数字は、学生の物語。",
    "stats.orgs":     "学生団体",
    "stats.opps":     "機会",
    "stats.founders": "起業家",
    "stats.free":     "ずっと無料",

    // Nav
    "nav.signin": "ログイン",
    "nav.join":   "AXISに参加",
    "nav.signout":"ログアウト",

    // Lang toggle
    "lang.toggle": "English",
  },
};

// ─── Context ───────────────────────────────────────────────────────────────────
const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  toggle: () => {},
  t: (k) => k,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  // Hydrate from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("axis-lang") as Lang | null;
    if (stored === "ja") setLang("ja");
  }, []);

  const toggle = useCallback(() => {
    setLang(prev => {
      const next: Lang = prev === "en" ? "ja" : "en";
      localStorage.setItem("axis-lang", next);
      return next;
    });
  }, []);

  const t = useCallback(
    (key: string) => translations[lang][key] ?? translations["en"][key] ?? key,
    [lang],
  );

  return (
    <LanguageContext.Provider value={{ lang, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
