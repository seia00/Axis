import Link from "next/link";
import Image from "next/image";

export const metadata = { title: "Community Guidelines | AXIS" };

const LAST_UPDATED = "April 28, 2026";

const sections = [
  {
    id: "respect",
    en: "Respect & Inclusion",
    ja: "尊重とインクルージョン",
    icon: "🤝",
    color: "border-indigo-500/20 bg-indigo-950/10",
    body: `AXIS is a community built on mutual respect. Every user — regardless of school, background, nationality, gender, or experience level — deserves to be treated with dignity.

We expect all members to:
• Engage with others in a constructive, encouraging tone
• Respect differences in opinion, culture, and approach
• Lift others up rather than tear them down
• Be patient with newer members who are still learning

Discrimination, hate speech, or targeted harassment of any kind will result in immediate removal from the platform.`,
  },
  {
    id: "accurate-info",
    en: "Accurate Information",
    ja: "正確な情報の提供",
    icon: "✅",
    color: "border-emerald-500/20 bg-emerald-950/10",
    body: `The value of AXIS depends on everyone being honest. When you create or manage an organization profile, you represent that:

• Your organization is real and actively operating
• The membership numbers, events, and achievements you list are accurate
• You are genuinely affiliated with or leading the organization you list
• You will update your profile when information changes

Fake organizations, inflated member counts, or fabricated achievements undermine the entire community. If we discover intentional misrepresentation, the listing will be removed and your account may be permanently banned.`,
  },
  {
    id: "reviews",
    en: "Review Guidelines",
    ja: "レビューのガイドライン",
    icon: "⭐",
    color: "border-amber-500/20 bg-amber-950/10",
    body: `Reviews help students make informed decisions about organizations. To keep them useful:

Write honest reviews based on your genuine experience. Don't write reviews for organizations you haven't actually been a member of.

Be constructive. Even negative reviews should focus on specific, verifiable issues — not personal attacks on individual members or leaders.

Don't write your own organization's reviews or ask your friends to post positive reviews to boost your rating.

Don't write negative reviews about competitor organizations to make yourself look better.

Reviews that violate these guidelines will be removed and repeated violations may result in account suspension.`,
  },
  {
    id: "prohibited",
    en: "Prohibited Content",
    ja: "禁止されているコンテンツ",
    icon: "🚫",
    color: "border-red-500/20 bg-red-950/10",
    body: `The following content is not allowed on AXIS under any circumstances:

Spam & Promotions — Unsolicited messages, irrelevant self-promotion, or flooding any part of the platform with repetitive content.

Harassment & Bullying — Targeting individuals with unwanted messages, threats, humiliating content, or sustained hostile behavior.

Discrimination — Content that demeans people based on race, ethnicity, nationality, religion, gender, sexual orientation, disability, or age.

Illegal Content — Anything that violates Japanese law or the laws of the user's jurisdiction, including privacy violations, copyright infringement, or content that promotes illegal activities.

Misleading Information — Deliberately false claims about organizations, events, opportunities, or other users.

Commercial Solicitation — Using AXIS to recruit students for paid schemes, MLM programs, or non-educational commercial purposes without AXIS's express written approval.`,
  },
  {
    id: "reporting",
    en: "Reporting Violations",
    ja: "違反の報告",
    icon: "🚨",
    color: "border-violet-500/20 bg-violet-950/10",
    body: `If you see something that violates these guidelines, please report it. We rely on the community to help keep AXIS safe and accurate.

How to report:
• For organization listings: use the "Report" button on the organization's profile page
• For reviews: use the flag icon next to any review
• For user behavior: email us at support@axisjapan.com with details

When you file a report, please include as much context as possible. Our moderation team reviews all reports within 48 hours. We will not disclose the identity of the person who filed a report.

False reports filed in bad faith (e.g., to harass another user or remove a competitor's legitimate profile) are themselves a violation of these guidelines.`,
  },
  {
    id: "consequences",
    en: "Consequences",
    ja: "違反した場合の結果",
    icon: "⚖️",
    color: "border-orange-500/20 bg-orange-950/10",
    body: `We take violations seriously and apply consequences proportional to the severity and frequency of the behavior:

Warning — For first-time, minor violations. You'll receive a notice explaining what you did and how to avoid it in the future. No action is taken against your account.

Content Removal — The specific violating content (review, listing, etc.) is removed. Your account remains active.

Temporary Suspension — For repeated violations or more serious offenses. You will be unable to post, edit, or interact on AXIS for a defined period.

Permanent Ban — For severe violations (e.g., hate speech, systematic fraud, harassment campaigns). Your account is permanently deactivated and you may not create new accounts.

We reserve the right to skip earlier steps and move directly to suspension or permanent ban for egregious violations. All moderation decisions are final unless you contact us at support@axisjapan.com with new information not previously considered.`,
  },
];

export default function GuidelinesPage() {
  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Header */}
      <header className="border-b border-white/[0.06] px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/">
            <Image src="/AXISLOGO.png" alt="AXIS" width={72} height={36} className="h-5 w-auto opacity-80 hover:opacity-100 transition-opacity" />
          </Link>
          <Link href="/legal/terms" className="text-xs text-white/40 hover:text-white/70 transition-colors">
            Terms of Service →
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-16">
        {/* Title block */}
        <div className="mb-12">
          <p className="text-xs text-white/30 uppercase tracking-[0.2em] mb-3">Legal</p>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-3">Community Guidelines</h1>
          <p className="text-sm text-white/40">Last updated: {LAST_UPDATED}</p>
        </div>

        {/* Intro */}
        <div className="p-5 rounded-xl border border-white/[0.06] bg-white/[0.02] mb-10">
          <p className="text-sm text-white/60 leading-relaxed">
            AXIS is Japan's platform for student founders. These guidelines exist to keep it a trustworthy, welcoming, and useful place for everyone. They apply to all users — students, organization leaders, and visitors alike. By using AXIS, you agree to follow them.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map(s => (
            <section
              key={s.id}
              id={s.id}
              className={`rounded-xl border p-6 scroll-mt-8 ${s.color}`}
            >
              <div className="flex items-start gap-4 mb-4">
                <span className="text-2xl flex-shrink-0 mt-0.5">{s.icon}</span>
                <div>
                  <h2 className="text-lg font-semibold text-white leading-tight">{s.en}</h2>
                  <p className="text-sm text-white/35 mt-0.5">{s.ja}</p>
                </div>
              </div>
              <div className="text-sm text-white/55 leading-relaxed whitespace-pre-line ml-10">
                {s.body}
              </div>
            </section>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            Questions? Email us at{" "}
            <a href="mailto:support@axisjapan.com" className="text-white/50 hover:text-white/80 transition-colors">
              support@axisjapan.com
            </a>
          </p>
          <div className="flex items-center gap-4 text-xs text-white/30">
            <Link href="/legal/terms" className="hover:text-white/60 transition-colors">Terms of Service</Link>
            <Link href="/" className="hover:text-white/60 transition-colors">← Back to AXIS</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
