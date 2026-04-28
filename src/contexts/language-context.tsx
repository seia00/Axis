"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

export type Lang = "en" | "ja";

interface LanguageContextValue {
  lang: Lang;
  toggle: () => void;
  t: (key: string) => string;
}

// ─── Translations ──────────────────────────────────────────────────────────────
export const translations: Record<Lang, Record<string, string>> = {
  en: {
    // ── Hero ──────────────────────────────────────────────────────────────────
    "hero.badge":          "Live across Japan — 50+ organizations and counting",
    "hero.headline":       "Where ambition meets opportunity.",
    "hero.subtext":        "Japan's platform for student founders — discover opportunities, build your team, and launch your venture.",
    "hero.subtext.free":   "Free, forever.",
    "hero.cta.primary":    "Get Started Free",
    "hero.cta.secondary":  "Explore Platform",
    "hero.scroll":         "Scroll",

    // ── CTA section ───────────────────────────────────────────────────────────
    "cta.headline":   "Ready to start building?",
    "cta.sub":        "Join Japan's community of student founders — free, forever.",
    "cta.join":       "Join AXIS Free",
    "cta.browse":     "Browse Directory",

    // ── Product cards section header ──────────────────────────────────────────
    "products.heading":       "Eight tools.",
    "products.heading.accent":"One platform.",
    "products.subtext":       "Everything a student founder needs — from discovery to launch.",
    "products.explore":       "Explore",

    // ── Product names ─────────────────────────────────────────────────────────
    "product.directory.name":     "Directory",
    "product.network.name":       "Network",
    "product.opportunities.name": "Opportunities",
    "product.launchpad.name":     "Launch Pad",
    "product.ventures.name":      "AXIS Ventures",
    "product.match.name":         "AXIS Match",
    "product.portfolio.name":     "Portfolio",
    "product.calendar.name":      "Calendar",
    "product.resources.name":     "Resources",

    // ── Product taglines ──────────────────────────────────────────────────────
    "product.directory.tagline":      "Find your people",
    "product.network.tagline":        "Build your circle",
    "product.opportunities.tagline":  "Discover what's out there",
    "product.launchpad.tagline":      "Build something real",
    "product.ventures.tagline":       "Scale your vision",
    "product.match.tagline":          "Your AI navigator",
    "product.portfolio.tagline":      "Your story, visualized",

    // ── Product descriptions ──────────────────────────────────────────────────
    "product.directory.desc":
      "Browse 50+ verified student organizations across Japan. Filter by focus area, location, and tier.",
    "product.network.desc":
      "Connect with student founders, join organizations, and build the relationships that become co-founder partnerships.",
    "product.opportunities.desc":
      "Competitions, fellowships, scholarships, and programs — curated and verified for student founders.",
    "product.launchpad.desc":
      "Post your project, define roles, and recruit talented co-founders to build something that matters.",
    "product.ventures.desc":
      "AXIS Ventures — our youth incubator for the most ambitious student founders. Mentorship, resources, community.",
    "product.match.desc":
      "Our AI surfaces personalized opportunity matches, co-founder suggestions, and program recommendations.",
    "product.portfolio.desc":
      "Build your founder story — activity timeline, impact metrics, radar chart, and Common App export.",

    // ── Product features — Directory ──────────────────────────────────────────
    "product.directory.f1": "50+ verified organizations across Japan",
    "product.directory.f2": "Filter by focus area, location, and tier",
    "product.directory.f3": "View org profiles, members, and events",
    "product.directory.f4": "Direct outreach to org leaders",

    // ── Product features — Opportunities ──────────────────────────────────────
    "product.opportunities.f1": "Competitions, fellowships, and scholarships",
    "product.opportunities.f2": "AI-powered deadline reminders via Calendar",
    "product.opportunities.f3": "Save and track application status",
    "product.opportunities.f4": "Verified — from Diamond Challenge to MIT Launch",

    // ── Product features — Launch Pad ─────────────────────────────────────────
    "product.launchpad.f1": "Post your project and recruit teammates",
    "product.launchpad.f2": "Define specific roles with skill requirements",
    "product.launchpad.f3": "Review applications and build your team",
    "product.launchpad.f4": "Track stage: idea → prototype → scaling",

    // ── Product features — AXIS Match ─────────────────────────────────────────
    "product.match.f1": "AI-powered opportunity ranking by fit",
    "product.match.f2": "Co-founder compatibility scores",
    "product.match.f3": "Program recommendations from your goals",
    "product.match.f4": "New matches as your profile grows",

    // ── Product features — Portfolio ──────────────────────────────────────────
    "product.portfolio.f1": "Activity timeline like a founder's LinkedIn",
    "product.portfolio.f2": "Impact metrics: hours, reach, awards",
    "product.portfolio.f3": "Radar chart and visualization dashboard",
    "product.portfolio.f4": "Common App export for top 10 activities",

    // ── Product features — AXIS Ventures ─────────────────────────────────────
    "product.ventures.f1": "Youth incubator for student founders",
    "product.ventures.f2": "Milestone tracking with mentor support",
    "product.ventures.f3": "Ventures-exclusive resources and templates",
    "product.ventures.f4": "Public showcase of accepted cohort projects",

    // ── Axis diagram ──────────────────────────────────────────────────────────
    "diagram.xaxis":        "IMPACT",
    "diagram.yaxis":        "GROWTH",
    "diagram.scroll":       "scroll to explore",
    "diagram.click":        "click any node to enter",
    "diagram.enter":        "Enter",

    // ── Stats ─────────────────────────────────────────────────────────────────
    "stats.headline":  "Built for Japan's next generation of founders.",
    "stats.sub":       "Every metric is a student story.",
    "stats.orgs":      "Student Orgs",
    "stats.opps":      "Opportunities",
    "stats.founders":  "Founders",
    "stats.free":      "Free Forever",

    // ── Navigation labels ─────────────────────────────────────────────────────
    "nav.directory":     "Directory",
    "nav.network":       "Network",
    "nav.opportunities": "Opportunities",
    "nav.launchpad":     "Launch Pad",
    "nav.ventures":      "Ventures",
    "nav.match":         "Match",
    "nav.calendar":      "Calendar",
    "nav.resources":     "Resources",
    "nav.portfolio":     "Portfolio",
    "nav.admin":         "Admin",
    "nav.settings":      "Settings",
    "nav.more":          "More",
    "nav.signin":        "Sign in",
    "nav.signout":       "Sign out",
    "nav.join":          "Join AXIS",

    // ── Lang toggle ───────────────────────────────────────────────────────────
    "lang.toggle": "日本語",
  },

  ja: {
    // ── Hero ──────────────────────────────────────────────────────────────────
    "hero.badge":          "日本全土で展開中 — 50以上の団体と成長中",
    "hero.headline":       "野心と機会が出会う場所。",
    "hero.subtext":        "日本の学生起業家のためのプラットフォーム — 機会を見つけ、チームを作り、ベンチャーを立ち上げよう。",
    "hero.subtext.free":   "ずっと無料。",
    "hero.cta.primary":    "無料で始める",
    "hero.cta.secondary":  "プラットフォームを見る",
    "hero.scroll":         "スクロール",

    // ── CTA section ───────────────────────────────────────────────────────────
    "cta.headline":   "さあ、作り始めよう。",
    "cta.sub":        "日本の学生起業家コミュニティへ — ずっと無料。",
    "cta.join":       "AXISに参加する（無料）",
    "cta.browse":     "団体一覧を見る",

    // ── Product cards section header ──────────────────────────────────────────
    "products.heading":        "8つのツール。",
    "products.heading.accent": "ひとつのプラットフォーム。",
    "products.subtext":        "学生起業家に必要なすべてが揃っています — 発見から立ち上げまで。",
    "products.explore":        "開く",

    // ── Product names ─────────────────────────────────────────────────────────
    "product.directory.name":     "ディレクトリ",
    "product.network.name":       "ネットワーク",
    "product.opportunities.name": "機会",
    "product.launchpad.name":     "ローンチパッド",
    "product.ventures.name":      "AXISベンチャーズ",
    "product.match.name":         "AXISマッチ",
    "product.portfolio.name":     "ポートフォリオ",
    "product.calendar.name":      "カレンダー",
    "product.resources.name":     "リソース",

    // ── Product taglines ──────────────────────────────────────────────────────
    "product.directory.tagline":      "仲間を見つけよう",
    "product.network.tagline":        "ネットワークを広げよう",
    "product.opportunities.tagline":  "可能性を発見しよう",
    "product.launchpad.tagline":      "本物を作ろう",
    "product.ventures.tagline":       "ビジョンをスケールしよう",
    "product.match.tagline":          "AIナビゲーター",
    "product.portfolio.tagline":      "あなたのストーリーを可視化",

    // ── Product descriptions ──────────────────────────────────────────────────
    "product.directory.desc":
      "日本全国50以上の認定学生団体を検索。分野・地域・ランクでフィルタリング可能。",
    "product.network.desc":
      "学生起業家とつながり、団体に参加し、共同創業者となる関係を築こう。",
    "product.opportunities.desc":
      "コンテスト・フェローシップ・奨学金・プログラム — 学生起業家向けに厳選・検証済み。",
    "product.launchpad.desc":
      "プロジェクトを投稿し、役割を定め、優秀な共同創業者をリクルートしよう。",
    "product.ventures.desc":
      "AXIS Ventures — 志の高い学生起業家のためのユースインキュベーター。メンタリング・リソース・コミュニティ。",
    "product.match.desc":
      "AIがパーソナライズされた機会マッチ・共同創業者候補・プログラム推薦を提案。",
    "product.portfolio.desc":
      "起業家としての物語を構築 — 活動タイムライン・インパクト指標・レーダーチャート・エクスポート。",

    // ── Product features — Directory ──────────────────────────────────────────
    "product.directory.f1": "日本全国50以上の認定団体",
    "product.directory.f2": "分野・地域・ランクでフィルタリング",
    "product.directory.f3": "団体プロフィール・メンバー・イベントを閲覧",
    "product.directory.f4": "団体リーダーへの直接連絡",

    // ── Product features — Opportunities ──────────────────────────────────────
    "product.opportunities.f1": "コンテスト・フェローシップ・奨学金",
    "product.opportunities.f2": "AIによるカレンダー期限リマインダー",
    "product.opportunities.f3": "応募状況の保存と管理",
    "product.opportunities.f4": "厳選済み — ダイヤモンドチャレンジからMITローンチまで",

    // ── Product features — Launch Pad ─────────────────────────────────────────
    "product.launchpad.f1": "プロジェクト投稿とチームメンバー募集",
    "product.launchpad.f2": "スキル要件付きのロール設定",
    "product.launchpad.f3": "応募者を審査してチームを構築",
    "product.launchpad.f4": "進捗管理：アイデア → プロトタイプ → スケール",

    // ── Product features — AXIS Match ─────────────────────────────────────────
    "product.match.f1": "適合度によるAI機会ランキング",
    "product.match.f2": "共同創業者の適合スコア",
    "product.match.f3": "目標からのプログラム推薦",
    "product.match.f4": "プロフィール成長に応じた新しいマッチ",

    // ── Product features — Portfolio ──────────────────────────────────────────
    "product.portfolio.f1": "起業家のLinkedInのような活動タイムライン",
    "product.portfolio.f2": "インパクト指標：時間・リーチ・受賞",
    "product.portfolio.f3": "レーダーチャートと可視化ダッシュボード",
    "product.portfolio.f4": "上位10活動のCommon Appエクスポート",

    // ── Product features — AXIS Ventures ─────────────────────────────────────
    "product.ventures.f1": "学生起業家のためのユースインキュベーター",
    "product.ventures.f2": "メンターサポート付きマイルストーン管理",
    "product.ventures.f3": "ベンチャーズ限定リソース・テンプレート",
    "product.ventures.f4": "採用コホートプロジェクトの公開展示",

    // ── Axis diagram ──────────────────────────────────────────────────────────
    "diagram.xaxis":        "インパクト",
    "diagram.yaxis":        "成長",
    "diagram.scroll":       "スクロールして探索",
    "diagram.click":        "ノードをクリックして進む",
    "diagram.enter":        "開く",

    // ── Stats ─────────────────────────────────────────────────────────────────
    "stats.headline":  "日本の次世代起業家のために作られた。",
    "stats.sub":       "すべての数字は、学生の物語。",
    "stats.orgs":      "学生団体",
    "stats.opps":      "機会",
    "stats.founders":  "起業家",
    "stats.free":      "ずっと無料",

    // ── Navigation labels ─────────────────────────────────────────────────────
    "nav.directory":     "ディレクトリ",
    "nav.network":       "ネットワーク",
    "nav.opportunities": "機会",
    "nav.launchpad":     "ローンチ",
    "nav.ventures":      "ベンチャー",
    "nav.match":         "マッチ",
    "nav.calendar":      "カレンダー",
    "nav.resources":     "リソース",
    "nav.portfolio":     "ポートフォリオ",
    "nav.admin":         "管理",
    "nav.settings":      "設定",
    "nav.more":          "その他",
    "nav.signin":        "ログイン",
    "nav.signout":       "ログアウト",
    "nav.join":          "AXISに参加",

    // ── Lang toggle ───────────────────────────────────────────────────────────
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
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("axis-lang");
      if (stored === "ja" || stored === "en") {
        setLang(stored);
      }
    } catch {
      /* localStorage unavailable — stick with default */
    }
    setHydrated(true);
  }, []);

  // Persist whenever lang changes (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem("axis-lang", lang);
    } catch {
      /* ignore */
    }
  }, [lang, hydrated]);

  const toggle = useCallback(() => {
    setLang(prev => (prev === "en" ? "ja" : "en"));
  }, []);

  const t = useCallback(
    (key: string) => translations[lang][key] ?? translations["en"][key] ?? key,
    [lang],
  );

  const value = useMemo(() => ({ lang, toggle, t }), [lang, toggle, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
