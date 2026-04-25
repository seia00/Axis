import { PrismaClient, OrgTier, ResourceCategory } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
// eslint-disable-next-line @typescript-eslint/no-require-imports
require("dotenv").config();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const connectionString = process.env.DATABASE_URL ?? "";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@axis.community" },
    update: {},
    create: {
      email: "admin@axis.community",
      name: "AXIS Admin",
      role: "ADMIN",
    },
  });

  // Sample organizations
  const orgsData = [
    {
      name: "Tokyo Youth Climate Network",
      mission: "We mobilize Tokyo high schoolers to tackle climate change through direct action, education, and advocacy. Founded in 2023, we've organized 15+ events and influenced school sustainability policies across 8 institutions.",
      activitySummary: "Monthly events including climate marches, school sustainability audits, and youth-led policy workshops. We also run a mentorship program connecting students with environmental professionals.",
      location: "Tokyo, Japan",
      isNational: false,
      focusArea: ["Environment", "Social Impact"],
      activityType: ["Events & Conferences", "Advocacy"],
      schoolLevel: ["High School"],
      tier: OrgTier.PARTNER,
      verified: true,
      memberCount: 120,
      instagram: "tokyoyouthclimate",
    },
    {
      name: "Japan High School Debate League",
      mission: "Building critical thinking, public speaking, and civic engagement among Japanese high school students through competitive and educational debate programs.",
      location: "Osaka, Japan",
      isNational: true,
      focusArea: ["Academic", "Social Impact"],
      activityType: ["Competitions", "Workshops"],
      schoolLevel: ["High School"],
      tier: OrgTier.VERIFIED,
      verified: true,
      memberCount: 340,
    },
    {
      name: "Kyoto Student Entrepreneurs",
      mission: "Supporting the next generation of Japanese student entrepreneurs through mentorship, workshops, and a peer community focused on early-stage startup development.",
      location: "Kyoto, Japan",
      isNational: false,
      focusArea: ["Entrepreneurship", "Technology"],
      activityType: ["Workshops", "Networking"],
      schoolLevel: ["High School"],
      tier: OrgTier.MEMBER,
      verified: false,
      memberCount: 45,
    },
    {
      name: "Sapporo STEM Circle",
      mission: "Making STEM accessible and exciting for students in Hokkaido through hands-on experiments, robotics competitions, and peer teaching.",
      location: "Sapporo, Japan",
      isNational: false,
      focusArea: ["STEM", "Technology"],
      activityType: ["Workshops", "Competitions"],
      schoolLevel: ["High School", "Middle School"],
      tier: OrgTier.VERIFIED,
      verified: true,
      memberCount: 78,
    },
    {
      name: "Fukuoka Youth Arts Collective",
      mission: "A community for young artists across Fukuoka to collaborate, exhibit, and develop their creative practice in a supportive, student-led environment.",
      location: "Fukuoka, Japan",
      isNational: false,
      focusArea: ["Arts", "Culture"],
      activityType: ["Events & Conferences", "Media & Publishing"],
      schoolLevel: ["High School"],
      tier: OrgTier.MEMBER,
      verified: false,
      memberCount: 32,
    },
  ];

  for (const orgData of orgsData) {
    const slug = slugify(orgData.name);
    await prisma.organization.upsert({
      where: { slug },
      update: {},
      create: {
        ...orgData,
        slug,
        leaderId: admin.id,
        profileViews: Math.floor(Math.random() * 500),
      },
    });
  }

  // Resources
  const resources = [
    { category: ResourceCategory.LEGAL, title: "Student Organization Bylaws Template", description: "A comprehensive bylaws template covering governance, roles, meetings, and amendments. Reviewed by student legal advisors.", fileUrl: "https://example.com/bylaws-template.docx", fileType: "docx" },
    { category: ResourceCategory.LEGAL, title: "Event Liability Waiver", description: "Standard liability waiver for in-person events. Includes sections for minors.", fileUrl: "https://example.com/waiver.docx", fileType: "docx" },
    { category: ResourceCategory.LEGAL, title: "Memorandum of Understanding (MOU) Template", description: "For formalizing partnerships or collaborative alliances with other organizations.", fileUrl: "https://example.com/mou-template.docx", fileType: "docx" },
    { category: ResourceCategory.FINANCIAL, title: "Annual Budget Spreadsheet Template", description: "Track income, expenses, and forecast for the year. Includes formulas and a dashboard tab.", fileUrl: "https://example.com/budget-template.xlsx", fileType: "xlsx" },
    { category: ResourceCategory.FINANCIAL, title: "Grant Tracking Tool", description: "Keep track of grant applications, deadlines, requirements, and status.", fileUrl: "https://example.com/grant-tracker.xlsx", fileType: "xlsx" },
    { category: ResourceCategory.DESIGN, title: "AXIS Brand Kit", description: "Official AXIS logos, colors, typography, and usage guidelines for member organizations.", fileUrl: "https://example.com/axis-brand-kit.zip", fileType: "zip" },
    { category: ResourceCategory.DESIGN, title: "Presentation Template Pack", description: "10 slide deck templates for events, pitches, and workshops. AXIS-branded and fully editable.", fileUrl: "https://example.com/presentation-templates.zip", fileType: "zip" },
    { category: ResourceCategory.COMMUNICATIONS, title: "Event Promotion Email Scripts", description: "Plug-and-play email templates for announcing, reminding, and following up on events.", fileUrl: "https://example.com/email-scripts.docx", fileType: "docx" },
    { category: ResourceCategory.COMMUNICATIONS, title: "Social Media Content Calendar Template", description: "Monthly planning template for Instagram, Twitter, and Discord.", fileUrl: "https://example.com/social-calendar.xlsx", fileType: "xlsx" },
    { category: ResourceCategory.SUCCESSION, title: "Leadership Handover Playbook", description: "The definitive guide to passing leadership to the next generation. Covers documentation, training, and transition timeline.", fileUrl: "https://example.com/handover-playbook.pdf", fileType: "pdf" },
  ];

  for (const resource of resources) {
    await prisma.resource.create({
      data: { ...resource, uploadedBy: admin.id },
    });
  }

  // Opportunities seed data
  const opportunities = [
    {
      title: "Diamond Challenge",
      type: "competition",
      organization: "University of Delaware",
      description: "The Diamond Challenge is a premier global high school entrepreneurship competition. Students create a business concept and pitch it to experienced entrepreneurs and investors. Top teams win cash prizes and mentorship.",
      eligibility: "Open to high school students worldwide. Teams of 2-4 students. Must submit a business plan and video pitch.",
      location: "Newark, Delaware, USA",
      isRemote: true,
      url: "https://diamondchallenge.org",
      deadline: new Date("2025-02-15"),
      startDate: new Date("2025-03-01"),
      tags: ["entrepreneurship", "startup", "business", "pitch"],
      regions: ["Global"],
      isVerified: true,
      verifiedAt: new Date(),
    },
    {
      title: "Conrad Challenge",
      type: "competition",
      organization: "Conrad Foundation",
      description: "The Conrad Challenge calls on today's aspiring student innovators to apply science, technology, and innovative thinking to solve real-world problems. Students develop a full business plan and compete for significant prize money and internship opportunities.",
      eligibility: "Students ages 13-18 from anywhere in the world. Teams of 2-5. Must focus on one of five challenge categories: Cyber-Technology & Security, Energy & Environment, Health & Nutrition, Transportation & Aerospace.",
      isRemote: true,
      url: "https://conradchallenge.org",
      deadline: new Date("2025-01-31"),
      tags: ["innovation", "STEM", "entrepreneurship", "technology"],
      regions: ["Global"],
      isVerified: true,
      verifiedAt: new Date(),
    },
    {
      title: "Global Youth Entrepreneurship Challenge (GYEC)",
      type: "competition",
      organization: "Youth Entrepreneurship Initiative",
      description: "GYEC brings together the world's most innovative young entrepreneurs to compete, connect, and accelerate their ventures. The summit includes workshops, mentorship sessions, and a final pitch competition with investors.",
      eligibility: "Entrepreneurs aged 15-25. Must have a working prototype or MVP. Teams or individuals welcome.",
      isRemote: false,
      location: "Singapore",
      url: "https://gyec.org",
      deadline: new Date("2025-03-01"),
      startDate: new Date("2025-06-10"),
      tags: ["entrepreneurship", "startup", "youth", "Asia"],
      regions: ["Asia", "Global"],
      isVerified: true,
      verifiedAt: new Date(),
    },
    {
      title: "TigerLaunch Singapore",
      type: "competition",
      organization: "Princeton University Alumni Association of Singapore",
      description: "TigerLaunch is a global startup competition for student entrepreneurs founded at Princeton. The Singapore edition focuses on Asia-Pacific market opportunities and connects student founders with regional VCs and accelerators.",
      eligibility: "Currently enrolled undergraduate or graduate students at any university. Must be a student founder.",
      isRemote: false,
      location: "Singapore",
      url: "https://tigerlaunch.com",
      deadline: new Date("2025-04-01"),
      tags: ["startup", "VC", "pitch competition", "Asia"],
      regions: ["Asia", "Global"],
      isVerified: true,
      verifiedAt: new Date(),
    },
    {
      title: "TOMODACHI MUFG International Student Scholarship",
      type: "scholarship",
      organization: "TOMODACHI Initiative & MUFG",
      description: "The TOMODACHI MUFG International Student Scholarship provides funding and mentorship for Japanese students pursuing entrepreneurship and social impact. Includes business training, networking with MUFG executives, and a study trip to the USA.",
      eligibility: "Japanese high school and university students. Must demonstrate entrepreneurial interest or social impact focus. Strong academic record required.",
      isRemote: false,
      location: "Tokyo, Japan",
      url: "https://tomodachi.org/mufg-scholarship",
      deadline: new Date("2025-05-15"),
      tags: ["scholarship", "Japan", "entrepreneurship", "social impact", "US-Japan"],
      regions: ["Japan"],
      isVerified: true,
      verifiedAt: new Date(),
    },
    {
      title: "Harvard Crimson Business Competition",
      type: "competition",
      organization: "Harvard College",
      description: "The Harvard Crimson Business Competition invites student entrepreneurs from around the world to submit their business plans. Winners receive mentorship from Harvard faculty and alumni, plus cash prizes up to $25,000.",
      eligibility: "Any enrolled high school or undergraduate student. Teams of up to 5 members. Business must be in early stage.",
      isRemote: true,
      url: "https://hcbc.college.harvard.edu",
      deadline: new Date("2025-03-20"),
      tags: ["business plan", "entrepreneurship", "Harvard", "competition"],
      regions: ["Global"],
      isVerified: true,
      verifiedAt: new Date(),
    },
    {
      title: "Stanford Venture Fellowship",
      type: "fellowship",
      organization: "Stanford University d.school",
      description: "The Stanford Venture Fellowship is an intensive 6-week summer program for high school students passionate about design thinking and social entrepreneurship. Fellows work on real-world projects, receive mentorship from Stanford faculty, and build lifelong networks.",
      eligibility: "Rising high school juniors and seniors (ages 16-18). Must demonstrate interest in social entrepreneurship. All nationalities welcome.",
      isRemote: false,
      location: "Stanford, California, USA",
      url: "https://dschool.stanford.edu/programs/k12-lab",
      deadline: new Date("2026-03-15"),
      startDate: new Date("2026-06-20"),
      endDate: new Date("2026-08-10"),
      tags: ["fellowship", "design thinking", "social entrepreneurship", "Stanford", "summer"],
      regions: ["USA", "Global"],
      isVerified: true,
      verifiedAt: new Date(),
    },
    {
      title: "FedEx/JA International Trade Challenge",
      type: "competition",
      organization: "Junior Achievement & FedEx",
      description: "Students develop an international trade business plan, competing regionally and globally for prizes and recognition from JA and FedEx executives.",
      eligibility: "High school students.",
      isRemote: true,
      url: "https://jausa.ja.org/programs/ja-international-trade-challenge",
      deadline: new Date("2026-03-01"),
      tags: ["trade", "business", "international", "logistics"],
      regions: ["Global"],
      isVerified: true,
      verifiedAt: new Date(),
    },
    {
      title: "Blue Ocean Competition",
      type: "competition",
      organization: "Blue Ocean Competition",
      description: "Social enterprise competition challenging students to find blue ocean market spaces — uncontested market areas — for their social ventures.",
      eligibility: "High school and undergraduate students.",
      isRemote: true,
      url: "https://blueoceancompetition.com",
      deadline: new Date("2026-04-30"),
      tags: ["social enterprise", "market strategy", "innovation", "blue ocean"],
      regions: ["Global"],
      isVerified: true,
      verifiedAt: new Date(),
    },
    {
      title: "SAGE Global Competition",
      type: "competition",
      organization: "Students for the Advancement of Global Entrepreneurship",
      description: "SAGE helps young entrepreneurs start and grow their businesses while giving back to their communities. National winners compete globally.",
      eligibility: "High school students.",
      isRemote: false,
      url: "https://sagebusiness.org",
      deadline: new Date("2026-05-15"),
      tags: ["entrepreneurship", "community impact", "global competition"],
      regions: ["Global"],
      isVerified: true,
      verifiedAt: new Date(),
    },
    {
      title: "World Schools Debating Championships",
      type: "competition",
      organization: "WSDC",
      description: "The premier international debating competition for secondary school students. Teams represent their countries in this prestigious annual event.",
      eligibility: "Secondary school students representing national teams.",
      isRemote: false,
      url: "https://wsdc.org",
      deadline: new Date("2026-01-31"),
      tags: ["debate", "public speaking", "international", "competition"],
      regions: ["Global"],
      isVerified: true,
      verifiedAt: new Date(),
    },
    {
      title: "HLAB Summer School",
      type: "program",
      organization: "HLAB",
      description: "A residential summer school in Japan co-led by Harvard and other top university students. Focus on liberal arts, leadership, and global citizenship for high school students.",
      eligibility: "Japanese high school students (ages 15-18). English proficiency required.",
      isRemote: false,
      location: "Karuizawa, Japan",
      url: "https://h-lab.co",
      deadline: new Date("2026-04-01"),
      startDate: new Date("2026-08-01"),
      endDate: new Date("2026-08-14"),
      tags: ["liberal arts", "leadership", "Japan", "summer school", "Harvard"],
      regions: ["Japan"],
      isVerified: true,
      verifiedAt: new Date(),
    },
    {
      title: "Wharton Global Youth Program",
      type: "program",
      organization: "Wharton School, University of Pennsylvania",
      description: "Leadership in the Business World (LBW) is an intensive 4-week program for outstanding high school juniors interested in business and finance.",
      eligibility: "High school juniors (rising seniors). Must apply and be accepted.",
      isRemote: false,
      location: "Philadelphia, PA, USA",
      url: "https://globalyouth.wharton.upenn.edu",
      deadline: new Date("2026-02-15"),
      startDate: new Date("2026-07-05"),
      endDate: new Date("2026-07-30"),
      tags: ["business", "Wharton", "finance", "leadership", "summer"],
      regions: ["Global", "USA"],
      isVerified: true,
      verifiedAt: new Date(),
    },
    {
      title: "MIT Launch Summer Program",
      type: "program",
      organization: "MIT",
      description: "An entrepreneurship program for high school students where participants build real companies with MIT mentors and pitch to investors.",
      eligibility: "High school students ages 15-18. No prior business experience required.",
      isRemote: true,
      url: "https://launch.mit.edu",
      deadline: new Date("2026-03-20"),
      startDate: new Date("2026-06-28"),
      endDate: new Date("2026-07-26"),
      tags: ["MIT", "startup", "entrepreneurship", "technology", "summer"],
      regions: ["Global"],
      isVerified: true,
      verifiedAt: new Date(),
    },
    {
      title: "Lumiere Research Scholar Program",
      type: "program",
      organization: "Lumiere Education",
      description: "One-on-one research programs pairing high school students with PhD researchers from top universities. Students publish original research papers.",
      eligibility: "High school students with strong academic record.",
      isRemote: true,
      url: "https://lumiere-education.com",
      deadline: new Date("2026-06-01"),
      tags: ["research", "academic", "publication", "STEM", "humanities"],
      regions: ["Global"],
      isVerified: false,
    },
  ];

  for (const opp of opportunities) {
    const existing = await prisma.opportunity.findFirst({ where: { title: opp.title } });
    if (!existing) {
      await prisma.opportunity.create({ data: opp });
    }
  }

  // Project Resources seed data
  const projectResources = [
    {
      title: "NPO Registration Guide (Japan)",
      description: "Comprehensive step-by-step guide to registering a non-profit organization in Japan. Covers required documents, Ministry of Justice process, timeline, and associated fees. Includes a checklist and sample articles of incorporation.",
      category: "legal",
      type: "guide",
      externalUrl: "https://www.npo-homepage.go.jp/",
      tags: ["Japan", "NPO", "legal", "registration"],
      region: "Japan",
    },
    {
      title: "Fiscal Sponsorship Guide",
      description: "How to use fiscal sponsorship to receive tax-deductible donations without registering as a nonprofit. Covers finding a sponsor, drafting agreements, and managing funds.",
      category: "legal",
      type: "guide",
      tags: ["fiscal sponsorship", "fundraising", "nonprofit"],
    },
    {
      title: "Pitch Deck Framework (Google Slides)",
      description: "A proven 12-slide pitch deck template used by successful student entrepreneurs. Includes problem, solution, market size, business model, traction, team, and ask slides. Fully editable.",
      category: "pitch",
      type: "template",
      externalUrl: "https://docs.google.com/presentation/u/0/",
      tags: ["pitch deck", "slides", "startup", "investors"],
    },
    {
      title: "Grant Application Template",
      description: "Ready-to-use grant application template with sections for project narrative, organizational background, goals & objectives, evaluation plan, budget justification, and sustainability plan.",
      category: "fundraising",
      type: "template",
      tags: ["grant", "fundraising", "nonprofit", "funding"],
    },
    {
      title: "Co-founder Team Agreement",
      description: "Legal template for co-founder teams covering equity split (with vesting schedule), roles and responsibilities, decision-making process, IP ownership, and exit provisions.",
      category: "legal",
      type: "template",
      tags: ["cofounder", "equity", "team", "legal"],
    },
    {
      title: "Meeting Agenda + Minutes Template",
      description: "Professional meeting agenda and minutes template for student organizations. Covers attendees, agenda items, decisions made, action items, and next steps.",
      category: "operations",
      type: "template",
      tags: ["meetings", "operations", "organization"],
    },
    {
      title: "Social Media Strategy Template",
      description: "90-day social media strategy template for student organizations. Includes content calendar, platform selection guide, engagement metrics tracker, and sample post templates for Instagram, Twitter, and LinkedIn.",
      category: "marketing",
      type: "template",
      tags: ["social media", "marketing", "content", "Instagram"],
    },
    {
      title: "Press Release Template",
      description: "Standard press release format for announcing events, launches, and milestones. Includes headline formula, dateline, lead paragraph structure, boilerplate, and media contact section.",
      category: "marketing",
      type: "template",
      tags: ["PR", "press release", "communications", "media"],
    },
    {
      title: "Organization One-Pager Template",
      description: "One-page organization overview template for partnerships and sponsorships. Covers mission, impact stats, programs, team, and contact info in a clean visual layout.",
      category: "marketing",
      type: "template",
      tags: ["one-pager", "partnerships", "sponsorship", "overview"],
    },
    {
      title: "Annual Budget Spreadsheet Template",
      description: "Google Sheets budget template for student organizations. Includes income sources, expense categories, monthly tracking, variance analysis, and a dashboard summary tab.",
      category: "operations",
      type: "template",
      externalUrl: "https://docs.google.com/spreadsheets/u/0/",
      tags: ["budget", "finance", "spreadsheet", "accounting"],
    },
    {
      title: "Impact Measurement Framework",
      description: "Guide to measuring and communicating the social impact of your organization or project. Covers theory of change, KPIs, data collection methods, and impact reporting.",
      category: "operations",
      type: "guide",
      tags: ["impact", "measurement", "social enterprise", "reporting"],
    },
    {
      title: "Sponsorship Proposal Template",
      description: "Professional sponsorship proposal template for securing corporate sponsors for events and programs. Includes sponsorship tiers, benefits table, and customizable terms.",
      category: "fundraising",
      type: "template",
      tags: ["sponsorship", "fundraising", "corporate", "events"],
    },
    {
      title: "Team Agreement Template",
      description: "A simple team charter and working agreement template for student project teams. Covers roles, commitments, conflict resolution, and decision-making.",
      category: "operations",
      type: "template",
      tags: ["teamwork", "operations", "agreement"],
    },
    {
      title: "Social Enterprise Launch Checklist",
      description: "100-item checklist covering everything you need to launch a social enterprise from idea to launch. Includes legal, branding, operations, and impact measurement.",
      category: "operations",
      type: "checklist",
      tags: ["launch", "social enterprise", "checklist", "startup"],
    },
  ];

  for (const resource of projectResources) {
    const existing = await prisma.projectResource.findFirst({ where: { title: resource.title } });
    if (!existing) {
      await prisma.projectResource.create({ data: resource });
    }
  }

  // Impact stats
  await prisma.impactStat.upsert({ where: { key: "total_orgs" }, update: { value: 50 }, create: { key: "total_orgs", value: 50 } });
  await prisma.impactStat.upsert({ where: { key: "total_students" }, update: { value: 1247 }, create: { key: "total_students", value: 1247 } });
  await prisma.impactStat.upsert({ where: { key: "total_events" }, update: { value: 213 }, create: { key: "total_events", value: 213 } });
  await prisma.impactStat.upsert({ where: { key: "total_downloads" }, update: { value: 892 }, create: { key: "total_downloads", value: 892 } });

  console.log("Seeding complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
