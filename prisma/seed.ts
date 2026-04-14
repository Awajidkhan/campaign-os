import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PASSWORD = "akru2026";

// Helper: date N days ago at a given hour
function daysAgo(days: number, hour = 9): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, 0, 0, 0);
  return d;
}

// Helper: date N hours from now
function hoursFromNow(hours: number): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

// Helper: date N hours ago
function hoursAgo(hours: number): Date {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

async function main() {
  console.log("🌱 Seeding AKRU Campaign OS database...\n");

  // ─── 1. USERS ───────────────────────────────────────────────────────
  const hash = await bcrypt.hash(PASSWORD, 10);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@akru.co" },
    update: {},
    create: {
      email: "admin@akru.co",
      firstName: "Admin",
      lastName: "System",
      role: "ADMIN",
      passwordHash: hash,
      isActive: true,
    },
  });

  const mohsinUser = await prisma.user.upsert({
    where: { email: "mohsin@akru.co" },
    update: {},
    create: {
      email: "mohsin@akru.co",
      firstName: "Mohsin",
      lastName: "Masud",
      role: "MOHSIN",
      passwordHash: hash,
      isActive: true,
      lastLoginAt: hoursAgo(1),
    },
  });

  const senaUser = await prisma.user.upsert({
    where: { email: "sena@akru.co" },
    update: {},
    create: {
      email: "sena@akru.co",
      firstName: "Sena",
      lastName: "Aydin",
      role: "OPERATOR",
      passwordHash: hash,
      isActive: true,
      lastLoginAt: hoursAgo(3),
    },
  });

  const jawadUser = await prisma.user.upsert({
    where: { email: "jawad@akru.co" },
    update: {},
    create: {
      email: "jawad@akru.co",
      firstName: "Jawad",
      lastName: "Malik",
      role: "OPERATOR",
      passwordHash: hash,
      isActive: true,
      lastLoginAt: hoursAgo(5),
    },
  });

  console.log("✓ 4 users (Admin, Mohsin, Sena, Jawad)");

  // ─── 2. ACCOUNTS ───────────────────────────────────────────────────
  const ruAccount = await prisma.account.upsert({
    where: { domain: "revitalization-unlimited.com" },
    update: {},
    create: {
      name: "Revitalization Unlimited",
      domain: "revitalization-unlimited.com",
      industry: "Real Estate",
      website: "https://revitalization-unlimited.com",
      aumRange: "$200M–$500M",
      status: "active",
      notes: "Contracted client. $255K annual. RE sponsor, tokenizing LP units.",
    },
  });

  const ninetyNorthAccount = await prisma.account.upsert({
    where: { domain: "90north.com" },
    update: {},
    create: {
      name: "90 North Group",
      domain: "90north.com",
      industry: "Real Estate",
      website: "https://90north.com",
      aumRange: "$2B+",
      status: "prospect",
      notes: "Core-plus RE. Global footprint. Q2 2026 board decision pending.",
    },
  });

  const bdoAccount = await prisma.account.upsert({
    where: { domain: "bdo.com" },
    update: {},
    create: {
      name: "BDO USA",
      domain: "bdo.com",
      industry: "Fund Administration",
      website: "https://bdo.com",
      aumRange: "$1B+",
      status: "active",
      notes: "Dual-track: client + SOC 2 auditor + referral channel partner.",
    },
  });

  const blackstoneAccount = await prisma.account.upsert({
    where: { domain: "blackstone.com" },
    update: {},
    create: {
      name: "Blackstone Real Estate",
      domain: "blackstone.com",
      industry: "Private Equity",
      website: "https://blackstone.com",
      aumRange: "$100B+",
      status: "prospect",
      notes: "Mega PE. Tokenization initiative announced Q1 2026. Dream account.",
    },
  });

  const meridianAccount = await prisma.account.upsert({
    where: { domain: "meridian-capital.com" },
    update: {},
    create: {
      name: "Meridian Capital",
      domain: "meridian-capital.com",
      industry: "Private Equity",
      website: "https://meridian-capital.com",
      aumRange: "$500M–$1B",
      status: "prospect",
      notes: "PE/RE hybrid. Tech evaluation cycle in progress.",
    },
  });

  const igniteFIAccount = await prisma.account.upsert({
    where: { domain: "ignitefi.com" },
    update: {},
    create: {
      name: "IgniteFI",
      domain: "ignitefi.com",
      industry: "Credit Union Technology",
      website: "https://ignitefi.com",
      aumRange: "$500M–$2B",
      status: "prospect",
      notes: "Credit union channel partner. 180+ CU network. Partnership discussions ongoing.",
    },
  });

  const brookfieldAccount = await prisma.account.upsert({
    where: { domain: "brookfield.com" },
    update: {},
    create: {
      name: "Brookfield Asset Management",
      domain: "brookfield.com",
      industry: "Real Estate / Infrastructure",
      website: "https://brookfield.com",
      aumRange: "$90B+",
      status: "prospect",
      notes: "Global RE/infra. Long sales cycle. Worth the patient outreach.",
    },
  });

  console.log("✓ 7 accounts");

  // ─── 3. MAILBOXES ──────────────────────────────────────────────────
  const mohsinMailbox = await prisma.mailbox.upsert({
    where: { email: "mohsin@akruinc.co" },
    update: {},
    create: {
      email: "mohsin@akruinc.co",
      domain: "akruinc.co",
      senderName: "Mohsin Masud",
      dailyMax: 50,
      weeklyMax: 250,
      minGapMinutes: 2,
      warmupStatus: "WARM",
      isActive: true,
      sentCount: 347,
      replyCount: 42,
      bounceCount: 8,
      spamCount: 0,
      openRate: 0.38,
      reputationNotes: "Primary sender. Established reputation. 38% open rate.",
    },
  });

  const senaMailbox = await prisma.mailbox.upsert({
    where: { email: "sena@akruinc.co" },
    update: {},
    create: {
      email: "sena@akruinc.co",
      domain: "akruinc.co",
      senderName: "Sena Aydin",
      dailyMax: 40,
      weeklyMax: 200,
      minGapMinutes: 3,
      warmupStatus: "WARMING",
      isActive: true,
      sentCount: 89,
      replyCount: 11,
      bounceCount: 3,
      spamCount: 0,
      openRate: 0.31,
      reputationNotes: "Day 18 of warm-up. Tier B sequences.",
    },
  });

  const jawadMailbox = await prisma.mailbox.upsert({
    where: { email: "jawad@akruinc.co" },
    update: {},
    create: {
      email: "jawad@akruinc.co",
      domain: "akruinc.co",
      senderName: "Jawad Malik",
      dailyMax: 30,
      weeklyMax: 150,
      minGapMinutes: 3,
      warmupStatus: "WARMING",
      isActive: true,
      sentCount: 64,
      replyCount: 7,
      bounceCount: 2,
      spamCount: 1,
      openRate: 0.28,
      reputationNotes: "Day 14 of warm-up. 1 spam flag — monitoring closely.",
    },
  });

  console.log("✓ 3 mailboxes on akruinc.co");

  // ─── 4. CONTACTS ───────────────────────────────────────────────────
  const contactDefs = [
    // RU — Tier A (active client)
    { firstName: "John", lastName: "Bennett", title: "Chief Investment Officer", email: "jbennett@revitalization-unlimited.com", tier: "A" as const, fitScore: 95, priorityScore: 90, estimatedAum: "$200M–$500M", roleSeniority: "C-suite", emailVerificationStatus: "VALID" as const, accountId: ruAccount.id, ownerId: mohsinUser.id, linkedinUrl: "https://linkedin.com/in/john-bennett-ru", city: "Dallas", state: "TX", country: "US" },
    { firstName: "Sarah", lastName: "Chen", title: "Head of Fund Operations", email: "schen@revitalization-unlimited.com", tier: "A" as const, fitScore: 88, priorityScore: 85, estimatedAum: "$200M–$500M", roleSeniority: "VP", emailVerificationStatus: "VALID" as const, accountId: ruAccount.id, ownerId: senaUser.id, city: "Dallas", state: "TX", country: "US" },
    { firstName: "Marcus", lastName: "Lopez", title: "Portfolio Manager", email: "mlopez@revitalization-unlimited.com", tier: "B" as const, fitScore: 72, priorityScore: 68, estimatedAum: "$200M–$500M", roleSeniority: "Director", emailVerificationStatus: "VALID" as const, accountId: ruAccount.id, ownerId: jawadUser.id },

    // 90 North — Tier A (hot prospect)
    { firstName: "Elizabeth", lastName: "Hartley", title: "Managing Director", email: "ehartley@90north.com", tier: "A" as const, fitScore: 92, priorityScore: 95, estimatedAum: "$2B+", roleSeniority: "C-suite", emailVerificationStatus: "VALID" as const, accountId: ninetyNorthAccount.id, ownerId: mohsinUser.id, linkedinUrl: "https://linkedin.com/in/elizabeth-hartley", city: "London", country: "UK" },
    { firstName: "David", lastName: "Zimmerman", title: "SVP Technology", email: "dzimmerman@90north.com", tier: "A" as const, fitScore: 85, priorityScore: 82, estimatedAum: "$2B+", roleSeniority: "VP", emailVerificationStatus: "VALID" as const, accountId: ninetyNorthAccount.id, ownerId: senaUser.id },
    { firstName: "James", lastName: "Mitchell", title: "Compliance Officer", email: "jmitchell@90north.com", tier: "B" as const, fitScore: 60, priorityScore: 55, estimatedAum: "$2B+", roleSeniority: "VP", emailVerificationStatus: "VALID" as const, accountId: ninetyNorthAccount.id, ownerId: jawadUser.id },

    // BDO — Tier A (dual-track)
    { firstName: "Patricia", lastName: "Morrison", title: "Partner, Fund Services", email: "pmorrison@bdo.com", tier: "A" as const, fitScore: 90, priorityScore: 88, estimatedAum: "$1B+", roleSeniority: "C-suite", emailVerificationStatus: "VALID" as const, accountId: bdoAccount.id, ownerId: mohsinUser.id, city: "Chicago", state: "IL", country: "US" },
    { firstName: "Kevin", lastName: "O'Brien", title: "Director, Fund Administration", email: "kobrien@bdo.com", tier: "B" as const, fitScore: 78, priorityScore: 75, estimatedAum: "$1B+", roleSeniority: "Director", emailVerificationStatus: "VALID" as const, accountId: bdoAccount.id, ownerId: senaUser.id },
    { firstName: "Rachel", lastName: "Thompson", title: "Senior Manager, Operations", email: "rthompson@bdo.com", tier: "B" as const, fitScore: 70, priorityScore: 65, estimatedAum: "$1B+", roleSeniority: "Director", emailVerificationStatus: "VALID" as const, accountId: bdoAccount.id, ownerId: jawadUser.id },
    { firstName: "Lisa", lastName: "Anderson", title: "Director, Technology", email: "landerson@bdousa.com", tier: "A" as const, fitScore: 84, priorityScore: 81, estimatedAum: "$1B+", roleSeniority: "Director", emailVerificationStatus: "VALID" as const, accountId: bdoAccount.id, ownerId: mohsinUser.id },
    { firstName: "Robert", lastName: "Washington", title: "Associate, Fund Services", email: "rwashington@bdo.com", tier: "C" as const, fitScore: 50, priorityScore: 45, estimatedAum: "$1B+", roleSeniority: "Manager", emailVerificationStatus: "CATCH_ALL" as const, accountId: bdoAccount.id, ownerId: null },

    // Blackstone — Tier A (whale target)
    { firstName: "Thomas", lastName: "Blackwell", title: "Managing Director, Real Estate", email: "tblackwell@blackstone.com", tier: "A" as const, fitScore: 88, priorityScore: 92, estimatedAum: "$100B+", roleSeniority: "C-suite", emailVerificationStatus: "VALID" as const, accountId: blackstoneAccount.id, ownerId: mohsinUser.id },
    { firstName: "Amanda", lastName: "Garrison", title: "SVP, Technology Strategy", email: "agarrison@blackstone.com", tier: "A" as const, fitScore: 82, priorityScore: 80, estimatedAum: "$100B+", roleSeniority: "VP", emailVerificationStatus: "VALID" as const, accountId: blackstoneAccount.id, ownerId: senaUser.id },
    { firstName: "Jennifer", lastName: "Cohen", title: "MD, Tokenization Initiative", email: "jcohen@blackstone.com", tier: "A" as const, fitScore: 89, priorityScore: 87, estimatedAum: "$100B+", roleSeniority: "C-suite", emailVerificationStatus: "VALID" as const, accountId: blackstoneAccount.id, ownerId: mohsinUser.id },

    // Meridian — Tier B
    { firstName: "Gregory", lastName: "Sanders", title: "Chief Financial Officer", email: "gsanders@meridian-capital.com", tier: "B" as const, fitScore: 75, priorityScore: 72, estimatedAum: "$500M–$1B", roleSeniority: "C-suite", emailVerificationStatus: "VALID" as const, accountId: meridianAccount.id, ownerId: senaUser.id },
    { firstName: "Julia", lastName: "Winters", title: "VP Operations", email: "jwinters@meridian-capital.com", tier: "B" as const, fitScore: 68, priorityScore: 62, estimatedAum: "$500M–$1B", roleSeniority: "VP", emailVerificationStatus: "UNVERIFIED" as const, accountId: meridianAccount.id, ownerId: jawadUser.id },
    { firstName: "Christopher", lastName: "Garcia", title: "Senior Analyst, Fund Management", email: "cgarcia@meridian-capital.com", tier: "C" as const, fitScore: 45, priorityScore: 40, estimatedAum: "$500M–$1B", roleSeniority: "Manager", emailVerificationStatus: "RISKY" as const, accountId: meridianAccount.id, ownerId: null },
    { firstName: "William", lastName: "Hayes", title: "Portfolio Analyst", email: "whayes@meridian-capital.com", tier: "C" as const, fitScore: 40, priorityScore: 35, estimatedAum: "$500M–$1B", roleSeniority: "Manager", emailVerificationStatus: "INVALID" as const, doNotContact: true, suppressionReason: "Email invalid — hard bounce", accountId: meridianAccount.id, ownerId: null },

    // IgniteFI — Tier B (channel partner)
    { firstName: "Angela", lastName: "Park", title: "VP Partnerships", email: "apark@ignitefi.com", tier: "B" as const, fitScore: 74, priorityScore: 78, estimatedAum: "$500M–$2B", roleSeniority: "VP", emailVerificationStatus: "VALID" as const, accountId: igniteFIAccount.id, ownerId: mohsinUser.id, city: "Austin", state: "TX", country: "US" },

    // Brookfield — Tier A (long-cycle whale)
    { firstName: "Richard", lastName: "Nguyen", title: "SVP, Digital Infrastructure", email: "rnguyen@brookfield.com", tier: "A" as const, fitScore: 86, priorityScore: 70, estimatedAum: "$90B+", roleSeniority: "VP", emailVerificationStatus: "VALID" as const, accountId: brookfieldAccount.id, ownerId: mohsinUser.id, city: "Toronto", country: "CA" },

    // Standalone contacts (no account)
    { firstName: "Daniel", lastName: "Karim", title: "Managing Partner", email: "dkarim@crescentfunds.com", tier: "B" as const, fitScore: 66, priorityScore: 58, estimatedAum: "$300M–$600M", roleSeniority: "C-suite", emailVerificationStatus: "VALID" as const, accountId: null, ownerId: jawadUser.id },
    { firstName: "Fatima", lastName: "Al-Rashid", title: "Head of Investor Relations", email: "falrashid@dawnrealtypartners.com", tier: "B" as const, fitScore: 70, priorityScore: 64, estimatedAum: "$400M–$800M", roleSeniority: "VP", emailVerificationStatus: "VALID" as const, accountId: null, ownerId: senaUser.id, city: "Miami", state: "FL", country: "US" },
  ];

  const createdContacts = await Promise.all(
    contactDefs.map((c) =>
      prisma.contact.upsert({
        where: { email: c.email },
        update: {},
        create: {
          ...c,
          fullName: `${c.firstName} ${c.lastName}`,
        },
      })
    )
  );

  console.log(`✓ ${createdContacts.length} contacts`);

  // ─── 5. CAMPAIGNS & SEQUENCES ──────────────────────────────────────
  const tierACampaign = await prisma.campaign.create({
    data: {
      name: "Tier A Reactivation — RE Sponsors",
      description: "Reactivation sequence for Tier A RE sponsors and PE — Mohsin's voice.",
      targetAudience: "Tier A — PE/RE sponsors, fund admins, $200M+ AUM",
      status: "ACTIVE",
      sequenceStrategy: "3-step institutional outreach",
      startDate: daysAgo(14),
      endDate: new Date("2026-06-30"),
    },
  });

  const tierB1Campaign = await prisma.campaign.create({
    data: {
      name: "Tier B Batch 1 — RIAs & Advisory",
      description: "First batch of Tier B outreach to RIAs, advisory firms, and mid-market fund ops.",
      targetAudience: "Tier B — RIAs, advisory, mid-tier",
      status: "ACTIVE",
      sequenceStrategy: "5-step educational engagement",
      startDate: daysAgo(7),
      endDate: new Date("2026-07-15"),
    },
  });

  const nurtureCampaign = await prisma.campaign.create({
    data: {
      name: "Long-term Nurture",
      description: "Quarterly touchpoint for contacts who said 'not now' but are still ICP-fit.",
      targetAudience: "All tiers — timing-deferred",
      status: "ACTIVE",
      sequenceStrategy: "Quarterly value drop (case study + industry insight)",
      startDate: daysAgo(30),
    },
  });

  const tierASeq = await prisma.sequence.create({
    data: { campaignId: tierACampaign.id, name: "5.1 RE Sponsor 3-Step", steps: 3, description: "Initial outreach → value prop → meeting ask" },
  });

  const tierB1Seq = await prisma.sequence.create({
    data: { campaignId: tierB1Campaign.id, name: "5.2 RIA Engagement 5-Step", steps: 5, description: "Warm-up → intro → value → social proof → close" },
  });

  const nurtureSeq = await prisma.sequence.create({
    data: { campaignId: nurtureCampaign.id, name: "Quarterly Nurture Touch", steps: 4, description: "Case study → insight → check-in → re-engage" },
  });

  console.log("✓ 3 campaigns, 3 sequences");

  // ─── 6. PIPELINE RECORDS (varied stages) ───────────────────────────
  // Map contacts to realistic pipeline stages
  const pipelineMap: Record<number, string> = {
    0: "DEMO_SCHEDULED",   // John Bennett — RU CIO, demo scheduled
    1: "ENGAGED",          // Sarah Chen — asking tech questions
    2: "CONTACTED",        // Marcus Lopez — first outbound sent
    3: "PROPOSAL",         // Elizabeth Hartley — 90 North MD, proposal stage
    4: "QUALIFIED",        // David Zimmerman — 90 North SVP Tech
    5: "CONTACTED",        // James Mitchell — not interested reply
    6: "QUALIFIED",        // Patricia Morrison — BDO Partner, OOO
    7: "ENGAGED",          // Kevin O'Brien — BDO Director
    8: "CONTACTED",        // Rachel Thompson
    9: "CONTACTED",        // Lisa Anderson
    10: "IDENTIFIED",      // Robert Washington — unverified
    11: "CONTACTED",       // Thomas Blackwell — Blackstone
    12: "CONTACTED",       // Amanda Garrison
    13: "ENGAGED",         // Jennifer Cohen — tokenization initiative
    14: "ENGAGED",         // Gregory Sanders — Meridian CFO, asking pricing
    15: "IDENTIFIED",      // Julia Winters — unverified
    16: "IDENTIFIED",      // Christopher Garcia — risky email
    17: "CLOSED_LOST",     // William Hayes — invalid email, suppressed
    18: "CONTACTED",       // Angela Park — IgniteFI
    19: "IDENTIFIED",      // Richard Nguyen — Brookfield
    20: "CONTACTED",       // Daniel Karim — standalone
    21: "CONTACTED",       // Fatima Al-Rashid — standalone
  };

  await Promise.all(
    createdContacts.map((contact, i) =>
      prisma.pipelineRecord.upsert({
        where: { contactId: contact.id },
        update: {},
        create: {
          contactId: contact.id,
          stage: (pipelineMap[i] || "IDENTIFIED") as any,
          enteredAt: daysAgo(Math.max(1, 14 - i)),
        },
      })
    )
  );

  console.log(`✓ ${createdContacts.length} pipeline records (varied stages)`);

  // ─── 7. STAGE HISTORY (realistic progression) ──────────────────────
  // John Bennett: IDENTIFIED → CONTACTED → ENGAGED → QUALIFIED → DEMO_SCHEDULED
  const johnId = createdContacts[0].id;
  await prisma.pipelineStageHistory.createMany({
    data: [
      { contactId: johnId, fromStage: null, toStage: "IDENTIFIED", reason: "Imported from CRM workbook", movedAt: daysAgo(14) },
      { contactId: johnId, fromStage: "IDENTIFIED", toStage: "CONTACTED", reason: "First outbound sent via Tier A campaign", movedAt: daysAgo(12) },
      { contactId: johnId, fromStage: "CONTACTED", toStage: "ENGAGED", reason: "Positive reply — requested demo", movedAt: daysAgo(3) },
      { contactId: johnId, fromStage: "ENGAGED", toStage: "QUALIFIED", reason: "Fit confirmed: $200M+ AUM, CIO-level, active fund", movedAt: daysAgo(2) },
      { contactId: johnId, fromStage: "QUALIFIED", toStage: "DEMO_SCHEDULED", reason: "Calendar accepted — demo Apr 16 at 2pm CT", movedAt: daysAgo(1) },
    ],
  });

  // Elizabeth Hartley: IDENTIFIED → CONTACTED → ENGAGED → QUALIFIED → PROPOSAL
  const elizabethId = createdContacts[3].id;
  await prisma.pipelineStageHistory.createMany({
    data: [
      { contactId: elizabethId, fromStage: null, toStage: "IDENTIFIED", reason: "Imported from CRM workbook", movedAt: daysAgo(21) },
      { contactId: elizabethId, fromStage: "IDENTIFIED", toStage: "CONTACTED", reason: "Outbound via Tier A campaign", movedAt: daysAgo(18) },
      { contactId: elizabethId, fromStage: "CONTACTED", toStage: "ENGAGED", reason: "Replied with interest — asked about Avalanche integration", movedAt: daysAgo(12) },
      { contactId: elizabethId, fromStage: "ENGAGED", toStage: "QUALIFIED", reason: "Fit confirmed: $2B+ AUM, MD-level, board decision Q2", movedAt: daysAgo(8) },
      { contactId: elizabethId, fromStage: "QUALIFIED", toStage: "PROPOSAL", reason: "Proposal sent — AUM-based pricing deck + SOW", movedAt: daysAgo(4) },
    ],
  });

  // Sarah Chen: IDENTIFIED → CONTACTED → ENGAGED
  const sarahId = createdContacts[1].id;
  await prisma.pipelineStageHistory.createMany({
    data: [
      { contactId: sarahId, fromStage: null, toStage: "IDENTIFIED", reason: "Imported from CRM workbook", movedAt: daysAgo(14) },
      { contactId: sarahId, fromStage: "IDENTIFIED", toStage: "CONTACTED", reason: "First outbound sent", movedAt: daysAgo(10) },
      { contactId: sarahId, fromStage: "CONTACTED", toStage: "ENGAGED", reason: "Reply — technical questions about K-1 engine", movedAt: daysAgo(1) },
    ],
  });

  // Gregory Sanders: IDENTIFIED → CONTACTED → ENGAGED
  const gregoryId = createdContacts[14].id;
  await prisma.pipelineStageHistory.createMany({
    data: [
      { contactId: gregoryId, fromStage: null, toStage: "IDENTIFIED", reason: "Imported", movedAt: daysAgo(10) },
      { contactId: gregoryId, fromStage: "IDENTIFIED", toStage: "CONTACTED", reason: "Tier B Batch 1 outbound", movedAt: daysAgo(7) },
      { contactId: gregoryId, fromStage: "CONTACTED", toStage: "ENGAGED", reason: "Pricing question — warm signal", movedAt: hoursAgo(8) },
    ],
  });

  // Jennifer Cohen: IDENTIFIED → CONTACTED → ENGAGED
  const jenniferId = createdContacts[13].id;
  await prisma.pipelineStageHistory.createMany({
    data: [
      { contactId: jenniferId, fromStage: null, toStage: "IDENTIFIED", reason: "Imported", movedAt: daysAgo(14) },
      { contactId: jenniferId, fromStage: "IDENTIFIED", toStage: "CONTACTED", reason: "Tier A outbound", movedAt: daysAgo(11) },
      { contactId: jenniferId, fromStage: "CONTACTED", toStage: "ENGAGED", reason: "Reply — interested in tokenization discussion", movedAt: daysAgo(5) },
    ],
  });

  console.log("✓ Stage history for 5 contacts");

  // ─── 8. ENROLLMENTS ────────────────────────────────────────────────
  await prisma.sequenceEnrollment.create({
    data: { contactId: johnId, campaignId: tierACampaign.id, sequenceId: tierASeq.id, mailboxId: mohsinMailbox.id, status: "COMPLETED", currentStep: 3, completedAt: daysAgo(3), enrolledAt: daysAgo(12) },
  });
  await prisma.sequenceEnrollment.create({
    data: { contactId: elizabethId, campaignId: tierACampaign.id, sequenceId: tierASeq.id, mailboxId: mohsinMailbox.id, status: "COMPLETED", currentStep: 3, completedAt: daysAgo(12), enrolledAt: daysAgo(18) },
  });
  await prisma.sequenceEnrollment.create({
    data: { contactId: sarahId, campaignId: tierACampaign.id, sequenceId: tierASeq.id, mailboxId: senaMailbox.id, status: "REPLIED", currentStep: 2, enrolledAt: daysAgo(10) },
  });
  await prisma.sequenceEnrollment.create({
    data: { contactId: gregoryId, campaignId: tierB1Campaign.id, sequenceId: tierB1Seq.id, mailboxId: senaMailbox.id, status: "ACTIVE", currentStep: 2, enrolledAt: daysAgo(7) },
  });
  await prisma.sequenceEnrollment.create({
    data: { contactId: createdContacts[11].id, campaignId: tierACampaign.id, sequenceId: tierASeq.id, mailboxId: mohsinMailbox.id, status: "ACTIVE", currentStep: 1, enrolledAt: daysAgo(5) },
  });
  await prisma.sequenceEnrollment.create({
    data: { contactId: createdContacts[12].id, campaignId: tierACampaign.id, sequenceId: tierASeq.id, mailboxId: senaMailbox.id, status: "ACTIVE", currentStep: 1, enrolledAt: daysAgo(5) },
  });
  await prisma.sequenceEnrollment.create({
    data: { contactId: jenniferId, campaignId: tierACampaign.id, sequenceId: tierASeq.id, mailboxId: mohsinMailbox.id, status: "REPLIED", currentStep: 2, enrolledAt: daysAgo(11) },
  });
  await prisma.sequenceEnrollment.create({
    data: { contactId: createdContacts[18].id, campaignId: tierB1Campaign.id, sequenceId: tierB1Seq.id, mailboxId: senaMailbox.id, status: "ACTIVE", currentStep: 1, enrolledAt: daysAgo(4) },
  });
  await prisma.sequenceEnrollment.create({
    data: { contactId: createdContacts[5].id, campaignId: nurtureCampaign.id, sequenceId: nurtureSeq.id, mailboxId: jawadMailbox.id, status: "ACTIVE", currentStep: 1, enrolledAt: daysAgo(2), pausedReason: "not_interested_reply" },
  });

  console.log("✓ 9 enrollments (varied statuses)");

  // ─── 9. MESSAGES ───────────────────────────────────────────────────
  // John Bennett thread
  const msg1 = await prisma.message.create({ data: { contactId: johnId, mailboxId: mohsinMailbox.id, direction: "OUTBOUND", subject: "Fund Admin Meets Tokenization — Thought You'd Want to See This", bodyPreview: "Hi John — I noticed Revitalization Unlimited is scaling LP operations...", sentAt: daysAgo(12, 10), createdAt: daysAgo(12, 10) } });
  const msg2 = await prisma.message.create({ data: { contactId: johnId, mailboxId: mohsinMailbox.id, direction: "OUTBOUND", subject: "Re: Fund Admin Meets Tokenization", bodyPreview: "Quick follow-up — we just completed a case study with a $200M+ fund...", sentAt: daysAgo(8, 10), createdAt: daysAgo(8, 10) } });
  const msg3 = await prisma.message.create({ data: { contactId: johnId, direction: "INBOUND", subject: "Re: Fund Admin Meets Tokenization", bodyPreview: "Hi Mohsin, thanks for reaching out. I'm interested in scheduling a demo...", bodyFull: "Hi Mohsin,\n\nThanks for reaching out about the Campaign OS. I'm very interested in learning more about how this integrates with our existing LP portal. Would you be available for a 30-min demo next week?\n\nBest,\nJohn", receivedAt: daysAgo(3, 14), createdAt: daysAgo(3, 14) } });

  // Sarah Chen thread
  const msg4 = await prisma.message.create({ data: { contactId: sarahId, mailboxId: senaMailbox.id, direction: "OUTBOUND", subject: "K-1 Engine — Automated for $200M+ Funds", bodyPreview: "Hi Sarah — your team at RU handles K-1 distribution for how many LPs currently?", sentAt: daysAgo(10, 9), createdAt: daysAgo(10, 9) } });
  const msg5 = await prisma.message.create({ data: { contactId: sarahId, direction: "INBOUND", subject: "Re: K-1 Engine", bodyPreview: "Hi Sena, this looks promising but I have a few technical questions about the K-1 engine integration...", bodyFull: "Hi Sena,\n\nThis looks promising but I have a few technical questions about the K-1 engine. Specifically:\n1. Can it handle multi-entity structures?\n2. What's the integration timeline for existing fund admin systems?\n3. Is there a SOC 2 audit on the platform?\n\nCan we schedule a call with our tech team?\n\nThanks,\nSarah", receivedAt: daysAgo(1, 9), createdAt: daysAgo(1, 9) } });

  // Gregory Sanders thread
  const msg6 = await prisma.message.create({ data: { contactId: gregoryId, mailboxId: senaMailbox.id, direction: "OUTBOUND", subject: "Meridian Capital + AKRU — Worth 15 Minutes?", bodyPreview: "Hi Gregory — given Meridian's position in the PE/RE space, I thought you'd find our approach to fund admin interesting...", sentAt: daysAgo(7, 11), createdAt: daysAgo(7, 11) } });
  const msg7 = await prisma.message.create({ data: { contactId: gregoryId, direction: "INBOUND", subject: "Re: Meridian Capital + AKRU", bodyPreview: "Hey, just wondering if you could send me more details about the pricing...", bodyFull: "Hey,\n\nJust wondering if you could send me more details about the pricing. We're in the middle of our tech evaluation right now and this could fit.\n\nThanks,\nGregory", receivedAt: hoursAgo(8), createdAt: hoursAgo(8) } });

  // Elizabeth Hartley thread
  await prisma.message.create({ data: { contactId: elizabethId, mailboxId: mohsinMailbox.id, direction: "OUTBOUND", subject: "90 North + AKRU — Tokenized Fund Admin at Scale", bodyPreview: "Elizabeth — with 90 North's $2B+ portfolio...", sentAt: daysAgo(18, 10), createdAt: daysAgo(18, 10) } });
  await prisma.message.create({ data: { contactId: elizabethId, direction: "INBOUND", subject: "Re: 90 North + AKRU", bodyPreview: "Mohsin, this is well-timed. We're evaluating tokenization infrastructure as part of our Q2 board agenda...", receivedAt: daysAgo(12, 15), createdAt: daysAgo(12, 15) } });

  // Jennifer Cohen thread
  await prisma.message.create({ data: { contactId: jenniferId, mailboxId: mohsinMailbox.id, direction: "OUTBOUND", subject: "Blackstone Tokenization Initiative — A Conversation", bodyPreview: "Jennifer — I saw the announcement about Blackstone's tokenization initiative...", sentAt: daysAgo(11, 10), createdAt: daysAgo(11, 10) } });
  await prisma.message.create({ data: { contactId: jenniferId, direction: "INBOUND", subject: "Re: Blackstone Tokenization Initiative", bodyPreview: "Mohsin, appreciate you reaching out. We're early in our exploration but would love to understand your platform better...", receivedAt: daysAgo(5, 16), createdAt: daysAgo(5, 16) } });

  // James Mitchell — negative reply
  const msg_neg = await prisma.message.create({ data: { contactId: createdContacts[5].id, direction: "INBOUND", subject: "Re: AKRU Campaign OS", bodyPreview: "Thanks for reaching out, but we're not interested in new tools right now.", bodyFull: "Thanks for reaching out, but we're not interested in new tools right now. Our stack is locked for 2026.", receivedAt: daysAgo(2, 11), createdAt: daysAgo(2, 11) } });

  // Patricia Morrison — OOO
  const msg_ooo = await prisma.message.create({ data: { contactId: createdContacts[6].id, direction: "INBOUND", subject: "Out of Office Auto Reply", bodyPreview: "I am out of office and will return on April 24th.", bodyFull: "Thank you for your message. I am out of office until April 24th with limited access to email. For urgent matters, please contact Kevin O'Brien at kobrien@bdo.com.", receivedAt: daysAgo(4, 8), createdAt: daysAgo(4, 8) } });

  // Angela Park — referral signal
  const msg_ref = await prisma.message.create({ data: { contactId: createdContacts[18].id, direction: "INBOUND", subject: "Re: IgniteFI + AKRU Partnership", bodyPreview: "Hi Sena — you should talk to our Head of Product, Mike Torres. He's driving the CU digital transformation roadmap...", bodyFull: "Hi Sena,\n\nYou should talk to our Head of Product, Mike Torres. He's driving the CU digital transformation roadmap and has been looking at tokenized deposit products. I'll CC him on a separate thread.\n\nAngela", receivedAt: hoursAgo(3), createdAt: hoursAgo(3) } });

  console.log("✓ 14 messages across 7 contact threads");

  // ─── 10. REPLY EVENTS ──────────────────────────────────────────────
  // Untriaged (will show in triage queue)
  await prisma.replyEvent.create({
    data: {
      contactId: johnId, messageId: msg3.id,
      subject: "Re: Fund Admin Meets Tokenization",
      bodyPreview: "Hi Mohsin, thanks for reaching out. I'm interested in scheduling a demo...",
      bodyFull: msg3.bodyFull,
      receivedAt: daysAgo(3, 14), senderEmail: "jbennett@revitalization-unlimited.com",
      category: "HOT_MEETING_REQUEST", confidence: 0.95, sentiment: "positive", urgency: "critical",
      isTriaged: true, triagedById: mohsinUser.id, triagedAt: daysAgo(3, 15), triageAction: "escalated_to_mohsin",
    },
  });

  await prisma.replyEvent.create({
    data: {
      contactId: sarahId, messageId: msg5.id,
      subject: "Re: K-1 Engine",
      bodyPreview: "Hi Sena, this looks promising but I have a few technical questions...",
      bodyFull: msg5.bodyFull,
      receivedAt: daysAgo(1, 9), senderEmail: "schen@revitalization-unlimited.com",
      category: "HOT_INTEREST", confidence: 0.88, sentiment: "positive", urgency: "warning",
      isTriaged: false, // ← untriaged — appears in queue
    },
  });

  await prisma.replyEvent.create({
    data: {
      contactId: gregoryId, messageId: msg7.id,
      subject: "Re: Meridian Capital + AKRU",
      bodyPreview: "Hey, just wondering if you could send me more details about the pricing...",
      bodyFull: msg7.bodyFull,
      receivedAt: hoursAgo(8), senderEmail: "gsanders@meridian-capital.com",
      category: "WARM_QUESTION", confidence: 0.78, sentiment: "neutral", urgency: "ok",
      isTriaged: false, // ← untriaged
    },
  });

  await prisma.replyEvent.create({
    data: {
      contactId: createdContacts[18].id, messageId: msg_ref.id,
      subject: "Re: IgniteFI + AKRU Partnership",
      bodyPreview: "Hi Sena — you should talk to our Head of Product, Mike Torres...",
      bodyFull: msg_ref.bodyFull,
      receivedAt: hoursAgo(3), senderEmail: "apark@ignitefi.com",
      category: "REFERRAL", confidence: 0.85, sentiment: "positive", urgency: "warning",
      isTriaged: false, // ← untriaged
    },
  });

  await prisma.replyEvent.create({
    data: {
      contactId: createdContacts[5].id, messageId: msg_neg.id,
      subject: "Re: AKRU Campaign OS",
      bodyPreview: "Thanks for reaching out, but we're not interested in new tools right now.",
      bodyFull: msg_neg.bodyFull,
      receivedAt: daysAgo(2, 11), senderEmail: "jmitchell@90north.com",
      category: "NEGATIVE_NOT_INTERESTED", confidence: 0.92, sentiment: "negative",
      isTriaged: true, triagedById: jawadUser.id, triagedAt: daysAgo(2, 13), triageAction: "moved_to_nurture",
    },
  });

  await prisma.replyEvent.create({
    data: {
      contactId: createdContacts[6].id, messageId: msg_ooo.id,
      subject: "Out of Office Auto Reply",
      bodyPreview: "I am out of office and will return on April 24th.",
      bodyFull: msg_ooo.bodyFull,
      receivedAt: daysAgo(4, 8), senderEmail: "pmorrison@bdo.com",
      category: "OUT_OF_OFFICE", confidence: 1.0,
      isTriaged: true, triagedById: adminUser.id, triagedAt: daysAgo(4, 9), triageAction: "paused_sequence",
    },
  });

  // Jennifer Cohen — untriaged hot interest
  await prisma.replyEvent.create({
    data: {
      contactId: jenniferId,
      subject: "Re: Blackstone Tokenization Initiative",
      bodyPreview: "Mohsin, appreciate you reaching out. We're early in our exploration but would love to understand your platform better...",
      receivedAt: daysAgo(5, 16), senderEmail: "jcohen@blackstone.com",
      category: "HOT_INTEREST", confidence: 0.82, sentiment: "positive", urgency: "ok",
      isTriaged: true, triagedById: mohsinUser.id, triagedAt: daysAgo(5, 17), triageAction: "escalated_to_mohsin",
    },
  });

  console.log("✓ 7 reply events (3 untriaged, 4 triaged)");

  // ─── 11. TASKS ─────────────────────────────────────────────────────
  await prisma.task.create({
    data: {
      title: "Prep + run demo for John Bennett (RU CIO)",
      description: "30-min demo scheduled Apr 16 2pm CT. Key topics: LP portal integration, K-1 automation, Avalanche settlement. Have pricing deck ready.",
      dueAt: new Date("2026-04-16T19:00:00Z"), // 2pm CT = 7pm UTC
      priority: "URGENT", status: "OPEN",
      assignedToId: mohsinUser.id, createdById: adminUser.id, contactId: johnId,
    },
  });

  await prisma.task.create({
    data: {
      title: "Prepare K-1 engine technical brief for Sarah Chen",
      description: "Sarah asking: (1) multi-entity structures, (2) integration timeline, (3) SOC 2 status. Coordinate with CTO on answers.",
      dueAt: hoursFromNow(6),
      priority: "HIGH", status: "OPEN",
      assignedToId: senaUser.id, createdById: mohsinUser.id, contactId: sarahId,
    },
  });

  await prisma.task.create({
    data: {
      title: "Send pricing sheet to Gregory Sanders (Meridian CFO)",
      description: "Gregory in tech evaluation. Send AUM-based pricing one-pager + ROI calculator.",
      dueAt: hoursFromNow(16),
      priority: "NORMAL", status: "OPEN",
      assignedToId: jawadUser.id, createdById: senaUser.id, contactId: gregoryId,
    },
  });

  await prisma.task.create({
    data: {
      title: "Follow up on 90 North proposal — Elizabeth Hartley",
      description: "Proposal sent 4 days ago. Q2 board decision pending. Check in on timeline and any questions.",
      dueAt: hoursFromNow(24),
      priority: "HIGH", status: "OPEN",
      assignedToId: mohsinUser.id, createdById: adminUser.id, contactId: elizabethId,
    },
  });

  await prisma.task.create({
    data: {
      title: "Intro email to Mike Torres (IgniteFI) — referral from Angela Park",
      description: "Angela referred us to their Head of Product for CU digital transformation / tokenized deposits discussion.",
      dueAt: hoursFromNow(4),
      priority: "HIGH", status: "OPEN",
      assignedToId: mohsinUser.id, createdById: senaUser.id, contactId: createdContacts[18].id,
    },
  });

  await prisma.task.create({
    data: {
      title: "Check back with Patricia Morrison (BDO)",
      description: "Partner OOO until April 24. Schedule follow-up call for week of Apr 28.",
      dueAt: new Date("2026-04-25T14:00:00Z"),
      priority: "NORMAL", status: "OPEN",
      assignedToId: mohsinUser.id, createdById: adminUser.id, contactId: createdContacts[6].id,
    },
  });

  await prisma.task.create({
    data: {
      title: "Verify 12 Tier B contacts via ZeroBounce",
      description: "Batch verification for Tier B Batch 1 campaign contacts before enrollment.",
      dueAt: hoursFromNow(48),
      priority: "LOW", status: "IN_PROGRESS",
      assignedToId: jawadUser.id, createdById: senaUser.id,
    },
  });

  console.log("✓ 7 tasks");

  // ─── 12. NOTES ─────────────────────────────────────────────────────
  await prisma.note.create({ data: { content: "John is the key decision-maker at RU. Has budget authority and is actively looking to modernize LP operations. Mentioned they're frustrated with their current fund admin's K-1 turnaround time.", authorId: mohsinUser.id, contactId: johnId, createdAt: daysAgo(10) } });
  await prisma.note.create({ data: { content: "Sarah is technical — she'll want to see the API docs and integration timeline before giving internal approval. Very detail-oriented.", authorId: senaUser.id, contactId: sarahId, createdAt: daysAgo(8) } });
  await prisma.note.create({ data: { content: "Elizabeth mentioned on the call that 90 North's board is evaluating 3 vendors including us. Our edge: Avalanche settlement speed and AUM-based pricing vs. per-transaction competitors.", authorId: mohsinUser.id, contactId: elizabethId, createdAt: daysAgo(8) } });
  await prisma.note.create({ data: { content: "Jennifer leads Blackstone's internal tokenization initiative. She's been to 3 conferences on the topic this year. Relationship-first approach — don't hard sell.", authorId: mohsinUser.id, contactId: jenniferId, createdAt: daysAgo(5) } });
  await prisma.note.create({ data: { content: "Gregory is in a formal tech evaluation. Has a shortlist of 5 vendors. Price-sensitive but values compliance features. Send the ROI calculator along with pricing.", authorId: senaUser.id, contactId: gregoryId, createdAt: daysAgo(3) } });
  await prisma.note.create({ data: { content: "Angela is warm but she's a channel partner, not a direct buyer. The real target is Mike Torres (Head of Product). Angela will make the intro.", authorId: senaUser.id, contactId: createdContacts[18].id, createdAt: hoursAgo(2) } });

  console.log("✓ 6 notes");

  // ─── 13. ACTIVITY LOGS ─────────────────────────────────────────────
  const activities = [
    { action: "contact.imported", entityType: "Contact", entityId: johnId, userId: adminUser.id, createdAt: daysAgo(14) },
    { action: "sequence.enrolled", entityType: "Contact", entityId: johnId, userId: mohsinUser.id, createdAt: daysAgo(12), details: { campaign: "Tier A Reactivation" } },
    { action: "message.sent", entityType: "Contact", entityId: johnId, userId: mohsinUser.id, createdAt: daysAgo(12, 10), details: { step: 1 } },
    { action: "message.sent", entityType: "Contact", entityId: johnId, userId: mohsinUser.id, createdAt: daysAgo(8, 10), details: { step: 2 } },
    { action: "reply.received", entityType: "Contact", entityId: johnId, userId: null, createdAt: daysAgo(3, 14), details: { category: "HOT_MEETING_REQUEST" } },
    { action: "reply.classified", entityType: "ReplyEvent", entityId: johnId, userId: null, createdAt: daysAgo(3, 14), details: { category: "HOT_MEETING_REQUEST", confidence: 0.95 } },
    { action: "stage.changed", entityType: "Contact", entityId: johnId, userId: mohsinUser.id, createdAt: daysAgo(3, 15), details: { from: "CONTACTED", to: "ENGAGED" } },
    { action: "reply.escalated", entityType: "ReplyEvent", entityId: johnId, userId: mohsinUser.id, createdAt: daysAgo(3, 15), details: { to: "mohsin" } },
    { action: "stage.changed", entityType: "Contact", entityId: johnId, userId: mohsinUser.id, createdAt: daysAgo(2), details: { from: "ENGAGED", to: "QUALIFIED" } },
    { action: "stage.changed", entityType: "Contact", entityId: johnId, userId: mohsinUser.id, createdAt: daysAgo(1), details: { from: "QUALIFIED", to: "DEMO_SCHEDULED" } },
    { action: "task.created", entityType: "Task", entityId: johnId, userId: adminUser.id, createdAt: daysAgo(1), details: { title: "Prep demo for John Bennett" } },

    { action: "reply.received", entityType: "Contact", entityId: sarahId, userId: null, createdAt: daysAgo(1, 9), details: { category: "HOT_INTEREST" } },
    { action: "stage.changed", entityType: "Contact", entityId: sarahId, userId: senaUser.id, createdAt: daysAgo(1, 9), details: { from: "CONTACTED", to: "ENGAGED" } },

    { action: "proposal.sent", entityType: "Contact", entityId: elizabethId, userId: mohsinUser.id, createdAt: daysAgo(4), details: { type: "AUM-based pricing" } },
    { action: "stage.changed", entityType: "Contact", entityId: elizabethId, userId: mohsinUser.id, createdAt: daysAgo(4), details: { from: "QUALIFIED", to: "PROPOSAL" } },

    { action: "reply.received", entityType: "Contact", entityId: gregoryId, userId: null, createdAt: hoursAgo(8), details: { category: "WARM_QUESTION" } },
    { action: "stage.changed", entityType: "Contact", entityId: gregoryId, userId: senaUser.id, createdAt: hoursAgo(8), details: { from: "CONTACTED", to: "ENGAGED" } },

    { action: "reply.received", entityType: "Contact", entityId: createdContacts[18].id, userId: null, createdAt: hoursAgo(3), details: { category: "REFERRAL" } },

    { action: "mailbox.health_check", entityType: "Mailbox", entityId: mohsinMailbox.id, userId: adminUser.id, createdAt: hoursAgo(6), details: { openRate: 0.38, bounceRate: 0.023, status: "healthy" } },
    { action: "mailbox.health_check", entityType: "Mailbox", entityId: jawadMailbox.id, userId: adminUser.id, createdAt: hoursAgo(6), details: { openRate: 0.28, spamCount: 1, status: "warning" } },
  ];

  await Promise.all(
    activities.map((a) =>
      prisma.activityLog.create({
        data: {
          action: a.action,
          entityType: a.entityType,
          entityId: a.entityId,
          userId: a.userId,
          createdAt: a.createdAt,
          details: (a as any).details || {},
        },
      })
    )
  );

  console.log("✓ 20 activity log entries");

  // ─── 14. SLA CONFIGS ───────────────────────────────────────────────
  const slaConfigs = [
    { category: "HOT_MEETING_REQUEST" as const, maxMinutes: 120, assignToRole: "MOHSIN" as const, description: "Hot meeting request → Mohsin immediately" },
    { category: "HOT_INTEREST" as const, maxMinutes: 240, assignToRole: "MOHSIN" as const, description: "Strong interest → Mohsin within 4h" },
    { category: "REFERRAL" as const, maxMinutes: 240, assignToRole: "MOHSIN" as const, description: "Referral → Mohsin for relationship building" },
    { category: "WARM_QUESTION" as const, maxMinutes: 720, assignToRole: "OPERATOR" as const, description: "Product question → operator response" },
    { category: "WARM_TIMING" as const, maxMinutes: 1440, assignToRole: "OPERATOR" as const, description: "Timing constraint → nurture, don't hard sell" },
    { category: "NEGATIVE_NOT_INTERESTED" as const, maxMinutes: 1440, assignToRole: null, description: "Not interested → queue for nurture" },
    { category: "NEGATIVE_HOSTILE" as const, maxMinutes: 0, assignToRole: null, autoAction: "suppress", description: "Hostile → immediate suppression" },
    { category: "OUT_OF_OFFICE" as const, maxMinutes: 0, assignToRole: null, autoAction: "pause_sequence", description: "OOO → pause sequence, schedule follow-up" },
    { category: "BOUNCE" as const, maxMinutes: 0, assignToRole: null, autoAction: "suppress", description: "Bounce → suppress and mark invalid" },
  ];

  await Promise.all(slaConfigs.map((c) => prisma.sLAConfig.upsert({ where: { category: c.category }, update: {}, create: c })));

  console.log("✓ 9 SLA configs");

  // ─── 15. STAGE RULES ───────────────────────────────────────────────
  const stageRules = [
    { trigger: "first_outbound", fromStage: "IDENTIFIED" as const, toStage: "CONTACTED" as const, description: "Auto-move when first email sent" },
    { trigger: "positive_reply", fromStage: "CONTACTED" as const, toStage: "ENGAGED" as const, description: "Positive/neutral reply received" },
    { trigger: "fit_confirmed", fromStage: "ENGAGED" as const, toStage: "QUALIFIED" as const, description: "Fit validated, interest confirmed — Mohsin takes over" },
    { trigger: "calendar_accepted", fromStage: "QUALIFIED" as const, toStage: "DEMO_SCHEDULED" as const, description: "Demo or discovery call scheduled" },
    { trigger: "proposal_sent", fromStage: "DEMO_SCHEDULED" as const, toStage: "PROPOSAL" as const, description: "Pricing/scope proposal delivered" },
    { trigger: "contract_signed", fromStage: "PROPOSAL" as const, toStage: "CLOSED_WON" as const, description: "Agreement signed" },
  ];

  await Promise.all(stageRules.map((r) => prisma.stageRule.create({ data: r })));

  console.log("✓ 6 stage rules");

  // ─── 16. CONTENT ENGINE ────────────────────────────────────────────
  const mohsinProfile = await prisma.contentProfile.create({
    data: { name: "Mohsin Masud — LinkedIn", type: "PERSONAL", platform: "linkedin", handle: "mohsin-masud", isActive: true },
  });

  const akruProfile = await prisma.contentProfile.create({
    data: { name: "AKRU Inc — LinkedIn", type: "COMPANY", platform: "linkedin", handle: "akru-inc", isActive: true },
  });

  const contentItems = [
    { profileId: mohsinProfile.id, creatorId: mohsinUser.id, publishDate: daysAgo(-7, 9), publishTime: "09:00", pillar: "thought leadership", topic: "Why Tokenization Changes Fund Admin Forever", draftText: "Every fund admin I talk to has the same problem: LP onboarding takes 3 weeks, K-1s take 4 months, and secondary transfers don't exist.\n\nTokenization solves all three. Here's how we did it for a $200M+ fund...", status: "DRAFT" as const },
    { profileId: akruProfile.id, creatorId: senaUser.id, publishDate: daysAgo(-3, 10), publishTime: "10:00", pillar: "product", topic: "Campaign OS Launch Announcement", draftText: "Introducing AKRU Campaign OS — the operating system for fund marketing and investor engagement.\n\nBuilt for sponsors. Built for scale. Built for compliance.\n\nJoin the waitlist at akru.co/campaign-os", status: "PENDING_APPROVAL" as const, revisionNotes: "Add social proof metrics before publishing" },
    { profileId: mohsinProfile.id, creatorId: jawadUser.id, publishDate: daysAgo(1, 8), publishTime: "08:00", pillar: "case study", topic: "How RU Increased LP Engagement 40%", draftText: "Revitalization Unlimited came to us with a problem: 340 LPs, manual K-1 distribution, and a 3-week onboarding cycle.\n\n6 months later: K-1 delivery in 48 hours, LP onboarding in 2 days, and 40% more engaged investors.", status: "PUBLISHED" as const },
    { profileId: akruProfile.id, creatorId: mohsinUser.id, publishDate: daysAgo(3, 14), publishTime: "14:00", pillar: "industry", topic: "Cold Email at Scale for Fund Managers", draftText: "Best practices for institutional outreach:\n\n1. Secondary domain (protect your main)\n2. 21-day warm-up before volume\n3. Reply triage within SLA\n4. Compliance-first messaging — no crypto jargon\n\nHere's our full framework.", status: "PUBLISHED" as const },
  ];

  await Promise.all(contentItems.map((c) => prisma.contentItem.create({ data: c })));

  console.log("✓ 2 content profiles, 4 content items");

  // ─── 17. RESPONSE TEMPLATES ────────────────────────────────────────
  const templates = [
    { name: "Hot Meeting — Schedule Demo", category: "HOT_MEETING_REQUEST" as const, subject: "Re: Let's Get That Demo on the Calendar", body: "Thanks for your interest, {firstName}! I'd love to walk you through the platform. How does [Tuesday/Wednesday] next week work? 30 minutes is all we need.\n\n— Mohsin", isActive: true },
    { name: "Hot Interest — Value Follow-up", category: "HOT_INTEREST" as const, subject: "Re: Quick Follow-up on AKRU", body: "Hey {firstName}, glad this resonated. I put together a brief technical overview specifically for {company}'s use case. [Link]\n\nHappy to jump on a call if any questions come up.\n\n— Mohsin", isActive: true },
    { name: "Warm Question — Educational", category: "WARM_QUESTION" as const, subject: "Re: Your Questions About the Platform", body: "Great questions, {firstName}. I'm attaching our technical brief which covers exactly what you asked.\n\nThe short answers: (1) Yes, multi-entity. (2) 4-6 week integration. (3) SOC 2 in progress with BDO.\n\nHappy to schedule a deeper dive with our engineering team.\n\n— {senderName}", isActive: true },
    { name: "Warm Timing — Nurture", category: "WARM_TIMING" as const, subject: "Re: Let's Reconnect Later", body: "Totally get it, {firstName} — timing is everything. I'll check back in Q3 when you're evaluating.\n\nIn the meantime, here's a case study from a fund your size that might be useful: [Link]\n\n— {senderName}", isActive: true },
    { name: "Not Interested — Soft Close", category: "NEGATIVE_NOT_INTERESTED" as const, subject: "Re: No Problem at All", body: "Appreciate the honesty, {firstName}. No pressure from our side.\n\nI'll leave you with a 1-pager on our approach to fund admin automation — might be useful down the road.\n\nAll the best,\n{senderName}", isActive: true },
    { name: "Referral — Thank & Follow", category: "REFERRAL" as const, subject: "Re: Thanks for the Introduction", body: "Really appreciate the referral, {firstName}. I'll reach out to {referralName} this week.\n\nAlways happy to return the favor — let me know if there's anyone in my network you'd like an intro to.\n\n— Mohsin", isActive: true },
  ];

  await Promise.all(templates.map((t) => prisma.responseTemplate.create({ data: t })));

  console.log("✓ 6 response templates");

  // ─── 18. INTEGRATIONS ──────────────────────────────────────────────
  await prisma.integrationConnection.create({
    data: { provider: "instantly", status: "active", config: { apiKey: "***", campaignIds: [] }, lastSyncAt: hoursAgo(1) },
  });
  await prisma.integrationConnection.create({
    data: { provider: "zerobounce", status: "active", config: { apiKey: "***" }, lastSyncAt: daysAgo(1) },
  });

  console.log("✓ 2 integration connections");

  // ─── DONE ──────────────────────────────────────────────────────────
  console.log("\n✅ Seed completed!\n");
  console.log("Summary:");
  console.log("  4 users · 7 accounts · 3 mailboxes");
  console.log("  22 contacts · 22 pipeline records (varied stages)");
  console.log("  3 campaigns · 3 sequences · 9 enrollments");
  console.log("  14 messages · 7 reply events (3 untriaged)");
  console.log("  7 tasks · 6 notes · 20 activity logs");
  console.log("  9 SLA configs · 6 stage rules");
  console.log("  2 content profiles · 4 content items");
  console.log("  6 response templates · 2 integrations");
  console.log("\nPassword for all users: akru2026");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
