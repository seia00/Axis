import { PrismaClient, OrgTier, ResourceCategory } from "@prisma/client";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
const prisma = new PrismaClient();

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

  // Impact stats
  await prisma.impactStat.upsert({ where: { key: "total_orgs" }, update: { value: 50 }, create: { key: "total_orgs", value: 50 } });
  await prisma.impactStat.upsert({ where: { key: "total_students" }, update: { value: 1247 }, create: { key: "total_students", value: 1247 } });
  await prisma.impactStat.upsert({ where: { key: "total_events" }, update: { value: 213 }, create: { key: "total_events", value: 213 } });
  await prisma.impactStat.upsert({ where: { key: "total_downloads" }, update: { value: 892 }, create: { key: "total_downloads", value: 892 } });

  console.log("Seeding complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
