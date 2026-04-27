import Link from "next/link";
import Image from "next/image";

export const metadata = { title: "Terms of Service | AXIS" };

const LAST_UPDATED = "April 28, 2026";

const sections = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    body: `By accessing or using the AXIS platform (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Service. These Terms apply to all visitors, users, and others who access the Service.

AXIS is operated by AXIS Japan and is intended primarily for students and young professionals located in Japan. Use of the Service is void where prohibited by applicable law.`,
  },
  {
    id: "accounts",
    title: "2. User Accounts",
    body: `To access certain features of the Service, you must create an account. You are responsible for:

• Providing accurate, current, and complete information during registration
• Maintaining the security of your password and account
• All activities that occur under your account
• Notifying us immediately of any unauthorized use at support@axisjapan.com

You must be at least 13 years old to create an account. If you are under 18, you represent that your parent or legal guardian has reviewed and agreed to these Terms. We reserve the right to terminate accounts that violate these Terms or contain inaccurate information.`,
  },
  {
    id: "acceptable-use",
    title: "3. Acceptable Use",
    body: `You agree not to use the Service to:

• Post false, misleading, or fraudulent information about yourself or any organization
• Impersonate any person or entity, or falsely claim affiliation with any organization
• Harass, bully, or intimidate other users
• Spam other users with unsolicited messages or promotional content
• Scrape or automatically collect data from the Service without our express written consent
• Attempt to gain unauthorized access to any part of the Service or its related systems
• Upload viruses, malware, or any other malicious code
• Violate any applicable local, national, or international law or regulation

Violations may result in immediate suspension or termination of your account without notice.`,
  },
  {
    id: "organization-listings",
    title: "4. Organization Listings",
    body: `Users who list organizations on AXIS represent and warrant that:

• They are authorized representatives of the organization they list
• All information provided about the organization is accurate and up to date
• The organization is a legitimate student or youth organization
• The organization does not engage in any illegal, harmful, or discriminatory activities

AXIS reserves the right to remove any organization listing at our sole discretion, including but not limited to listings that are fraudulent, inactive, or that violate our Community Guidelines. The "AXIS Verified" badge is granted solely at AXIS's discretion based on our verification criteria and may be revoked at any time.`,
  },
  {
    id: "intellectual-property",
    title: "5. Intellectual Property",
    body: `The Service and its original content (excluding content provided by users), features, and functionality are owned by AXIS Japan and are protected by applicable intellectual property laws.

By posting content on the Service, you grant AXIS a non-exclusive, worldwide, royalty-free license to use, display, reproduce, and distribute your content solely for the purpose of operating and improving the Service. You retain ownership of all content you submit.

You represent that you own or have the necessary rights to the content you post, and that your content does not infringe the intellectual property rights of any third party.`,
  },
  {
    id: "liability",
    title: "6. Limitation of Liability",
    body: `To the maximum extent permitted by applicable law, AXIS Japan and its affiliates, officers, and employees shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, goodwill, or other intangible losses, resulting from:

• Your access to or use of (or inability to access or use) the Service
• Any conduct or content of any third party on the Service
• Any content obtained from the Service
• Unauthorized access, use, or alteration of your transmissions or content

The Service is provided "as is" and "as available" without warranties of any kind, either express or implied. AXIS does not warrant that the Service will be uninterrupted, error-free, or free of viruses or other harmful components.`,
  },
  {
    id: "termination",
    title: "7. Termination",
    body: `We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including if you breach these Terms.

Upon termination, your right to use the Service will immediately cease. All provisions of these Terms which by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.

You may delete your account at any time through your account settings. Upon deletion, your personal data will be handled in accordance with our Privacy Policy.`,
  },
  {
    id: "changes",
    title: "8. Changes to Terms",
    body: `We reserve the right to modify these Terms at any time. We will provide notice of significant changes by updating the "Last Updated" date at the top of this page and, where appropriate, notifying you via email or a notice on the Service.

Your continued use of the Service after any changes constitutes your acceptance of the new Terms. If you do not agree to the modified Terms, you must stop using the Service.

These Terms shall be governed by the laws of Japan, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts of Tokyo, Japan.`,
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Header */}
      <header className="border-b border-white/[0.06] px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/">
            <Image src="/AXISLOGO.png" alt="AXIS" width={72} height={36} className="h-5 w-auto opacity-80 hover:opacity-100 transition-opacity" />
          </Link>
          <Link href="/legal/guidelines" className="text-xs text-white/40 hover:text-white/70 transition-colors">
            Community Guidelines →
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-16">
        {/* Title block */}
        <div className="mb-12">
          <p className="text-xs text-white/30 uppercase tracking-[0.2em] mb-3">Legal</p>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-3">Terms of Service</h1>
          <p className="text-sm text-white/40">Last updated: {LAST_UPDATED}</p>
        </div>

        {/* Intro */}
        <div className="p-5 rounded-xl border border-white/[0.06] bg-white/[0.02] mb-10">
          <p className="text-sm text-white/60 leading-relaxed">
            Please read these Terms of Service carefully before using AXIS. These Terms govern your access to and use of the AXIS platform, including our website, APIs, and related services. By using AXIS, you agree to be bound by these Terms.
          </p>
        </div>

        {/* Table of contents */}
        <nav className="mb-12">
          <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Contents</p>
          <div className="grid sm:grid-cols-2 gap-1.5">
            {sections.map(s => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="text-sm text-white/50 hover:text-white/80 transition-colors py-1"
              >
                {s.title}
              </a>
            ))}
          </div>
        </nav>

        {/* Sections */}
        <div className="space-y-12">
          {sections.map(s => (
            <section key={s.id} id={s.id} className="scroll-mt-8">
              <h2 className="text-lg font-semibold text-white mb-4 pb-3 border-b border-white/[0.06]">
                {s.title}
              </h2>
              <div className="text-sm text-white/55 leading-relaxed whitespace-pre-line">
                {s.body}
              </div>
            </section>
          ))}
        </div>

        {/* Footer links */}
        <div className="mt-16 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            Questions? Contact us at{" "}
            <a href="mailto:support@axisjapan.com" className="text-white/50 hover:text-white/80 transition-colors">
              support@axisjapan.com
            </a>
          </p>
          <div className="flex items-center gap-4 text-xs text-white/30">
            <Link href="/legal/guidelines" className="hover:text-white/60 transition-colors">Community Guidelines</Link>
            <Link href="/" className="hover:text-white/60 transition-colors">← Back to AXIS</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
