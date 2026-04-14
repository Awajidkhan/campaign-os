# AKRU Campaign Operating System

Internal campaign operations platform for orchestrating outbound email campaigns, managing replies, triaging inbound signals, and controlling content approvals across fund admin channels.

**Not a generic CRM.** This is a domain-specific operations stack for AKRU's go-to-market motion: driving qualified pipeline into institutional investors through coordinated, rule-based email campaigns and rapid reply triage.

---

## Architecture

**Stack:**
- **Frontend:** Next.js 14 (App Router), TypeScript, React 19, Tailwind CSS 4, shadcn/ui
- **Backend:** Next.js API routes, Node.js 20
- **Database:** PostgreSQL 16, Prisma 7
- **Authentication:** NextAuth.js
- **UI:** Radix UI primitives, Lucide icons, class-variance-authority
- **Charts:** Recharts

**Key Design Principles:**
- Rule-based classification and routing (no manual ML inference)
- Deterministic SLA routing tied to reply urgency
- Content approval gates before email send
- Single source of truth: Prisma + PostgreSQL
- Lightweight integrations (Instantly.ai, ZeroBounce adapters)

---

## Quick Start (Docker)

### 1. Clone and Setup

```bash
git clone https://github.com/akru/campaign-os.git
cd campaign-os
cp .env.example .env
```

### 2. Start Services

```bash
docker-compose up -d
```

This starts:
- PostgreSQL 16 on `localhost:5432`
- Next.js app on `localhost:3000`

### 3. Initialize Database

```bash
# Run migrations
docker exec akru_campaign_os_app npx prisma migrate deploy

# Seed sample data
docker exec akru_campaign_os_app npx prisma db seed
```

### 4. Access the App

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Stop Services

```bash
docker-compose down
```

---

## Quick Start (Local Development)

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup PostgreSQL

Ensure PostgreSQL 16 is running locally:

```bash
# macOS with Homebrew
brew install postgresql@16
brew services start postgresql@16

# Or use Docker for just the database
docker run -d \
  --name postgres_dev \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=akru_campaign_os \
  -p 5432:5432 \
  postgres:16-alpine
```

### 3. Configure Environment

```bash
cp .env.example .env.local
```

Update `.env.local` if your database URL differs:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/akru_campaign_os
NEXTAUTH_SECRET=your-dev-secret-here
NEXTAUTH_URL=http://localhost:3000
```

### 4. Initialize Database

```bash
# Run migrations
npx prisma migrate dev

# Seed sample data
npx prisma db seed
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## App Sections (12 Modules)

The sidebar navigation exposes these main sections:

1. **Dashboard** — Campaign metrics, KPIs, live SLA status
2. **Campaigns** — Create, configure, and monitor outbound email campaigns
3. **Contacts** — Bulk contact import, hygiene, segmentation, list management
4. **Outreach** — Send sequences, manage send queue, retry handling
5. **Replies** — Inbound reply inbox, auto-classification, sentiment analysis
6. **Pipeline** — Contact stage progression (Prospects → Qualified → Opportunity)
7. **Triage** — Quick actions on replies (escalate, assign, suppress, convert)
8. **Tasks** — SLA-driven task assignments and follow-up scheduling
9. **Approvals** — Content review gates before email campaigns go live
10. **Integrations** — Configure Instantly.ai, ZeroBounce, Calendar, Buffer
11. **Team** — User and role management, SLA ownership rules
12. **Settings** — System configuration, API keys, compliance logging

---

## Folder Structure

```
campaign-os/
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx         # Dashboard layout with sidebar + topbar
│   │   │   └── dashboard/
│   │   │       └── page.tsx       # Sample dashboard
│   │   ├── layout.tsx              # Root layout + theme provider
│   │   ├── globals.css             # Tailwind reset + CSS variables
│   │   └── page.tsx                # Homepage / redirect
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── sidebar.tsx         # Main navigation (11 sections)
│   │   │   └── topbar.tsx          # Search bar, notifications, user menu
│   │   │
│   │   ├── ui/
│   │   │   ├── badge.tsx           # Variant badge base component
│   │   │   ├── button.tsx          # Variant button base component
│   │   │   ├── card.tsx            # Card containers (Card, CardHeader, etc.)
│   │   │   └── data-table.tsx      # Sortable, paginated generic table
│   │   │
│   │   └── shared/
│   │       ├── stage-badge.tsx     # Pipeline stage colors
│   │       ├── priority-badge.tsx  # Task priority visual indicator
│   │       ├── tier-badge.tsx      # Contact tier (Prospect, Qualified, etc.)
│   │       └── sla-timer.tsx       # Live SLA countdown with urgency color
│   │
│   ├── lib/
│   │   ├── prisma.ts               # Prisma client singleton
│   │   └── utils.ts                # Format, validation, date helpers
│   │
│   └── services/
│       ├── index.ts                # Central barrel export
│       ├── classification.ts       # Reply classification engine (9 categories)
│       ├── sla.ts                  # SLA deadline & owner routing
│       ├── pipeline.ts             # Stage transition state machine
│       ├── triage.ts               # One-click triage actions
│       └── integrations/
│           ├── instantly.ts        # Instantly.ai email provider adapter
│           ├── zerobounce.ts       # ZeroBounce verification adapter
│           ├── calendar.ts         # Calendar sync mock
│           └── buffer.ts           # Social media queue mock
│
├── prisma/
│   ├── schema.prisma               # Data model (15 tables, 12 enums)
│   └── seed.ts                     # Sample data seeder
│
├── public/                          # Static assets
├── .env.example                     # Environment template
├── .env.local                       # Local dev overrides (git-ignored)
├── docker-compose.yml               # Multi-service orchestration
├── Dockerfile                       # Multi-stage build
├── .dockerignore                    # Docker build excludes
├── package.json                     # Dependencies & scripts
├── tsconfig.json                    # TypeScript config with @ alias
├── next.config.ts                   # Next.js standalone output
└── README.md                        # This file
```

---

## Operating Model

### Pipeline Stages

Every contact progresses through a deterministic state machine:

```
PROSPECT → CONTACTED → INTERESTED → QUALIFIED → OPPORTUNITY → CLOSED_WON/WON_CLOSED
```

Each stage has:
- **Defined entry/exit criteria** (based on reply classification)
- **Owner assignment rule** (automatic routing based on contact tier)
- **SLA deadline** (2h for hot replies, 24h for warm, 72h for cold)
- **Activity logging** (immutable audit trail)

### Owner Rules

- **Hot replies** (meeting request, demo request) → Mohsin (CEO/founder)
- **Qualified conversions** → Mohsin (for SDR hand-off)
- **Team assignments** → Sena, Jawad (account managers per tier)
- **Escalations** → Auto-task creation with due date based on urgency

### SLA Rules

```typescript
const SLA_MAP = {
  HOT_MEETING_REQUEST: { deadline: 2, owner: 'mohsin', urgency: 'critical' },
  HOT_DEMO_REQUEST: { deadline: 2, owner: 'mohsin', urgency: 'critical' },
  QUALIFIED_INBOUND: { deadline: 4, owner: 'mohsin', urgency: 'critical' },
  POSITIVE_REPLY: { deadline: 24, owner: 'team', urgency: 'high' },
  QUESTION: { deadline: 24, owner: 'team', urgency: 'medium' },
  OBJECTION: { deadline: 24, owner: 'team', urgency: 'high' },
  COLD_LEAD: { deadline: 72, owner: 'nurture', urgency: 'low' },
  UNSUBSCRIBE: { deadline: 0, owner: 'none', urgency: 'none' },
  SPAM: { deadline: 0, owner: 'none', urgency: 'none' },
};
```

Urgency levels translate to UI colors and escalation triggers:
- **critical**: Red, 30-min warning bell
- **high**: Orange, 2-hour warning bell
- **medium**: Yellow, no auto-escalation
- **low**: Gray, nurture queue

### Content Approval Flow

Before any campaign can send:

1. **Draft** — Campaign created, content staged
2. **Awaiting Approval** — Approval task assigned to Mohsin
3. **Approved** — Content locked, ready for send
4. **Rejected** — Feedback, re-edit, resubmit
5. **Sent** — Immutable record, delivery tracked

Approvers see:
- Email subject + preview
- Recipient count per segment
- Estimated send time
- Compliance flags (GDPR, CAN-SPAM)

---

## Integration Adapters

### Instantly.ai (Outbound Email)

Adapter: `src/services/integrations/instantly.ts`

```typescript
import { sendViaInstantly } from '@/services';

// Queue email for send via Instantly.ai
const result = await sendViaInstantly({
  recipientEmail: 'investor@example.com',
  campaignId: 'camp_123',
  sequenceStep: 1,
  emailBody: 'Hi...',
  subject: 'Re: AKRU tokenization',
});
// { messageId: 'inst_msg_456', status: 'queued', timestamp: ... }
```

**Requirements:**
- Set `INSTANTLY_API_KEY` in .env
- Warm-up / reputation monitoring via Instantly dashboard

### ZeroBounce (Email Verification)

Adapter: `src/services/integrations/zerobounce.ts`

```typescript
import { validateEmailZeroBounce } from '@/services';

const validation = await validateEmailZeroBounce('test@example.com');
// { email: 'test@example.com', status: 'valid', suggestion: null, ... }
```

**Requirements:**
- Set `ZEROBOUNCE_API_KEY` in .env
- Used during contact import to flag invalid/risky emails

### Calendar Sync (Mock)

Adapter: `src/services/integrations/calendar.ts` (stubbed)

- Planned: Google Calendar / Outlook sync for meeting scheduling
- Returns mock availability blocks for UI development

### Social Queue (Buffer, Mock)

Adapter: `src/services/integrations/buffer.ts` (stubbed)

- Planned: LinkedIn, Twitter, company blog post syndication
- Co-marketing signal when a campaign reply becomes a case study

---

## MVP Assumptions (Stubbed Features)

These features are scaffolded but not fully wired:

1. **Real-time Notifications** — Placeholder topbar bell, no socket.io yet
2. **Calendar Integration** — Mock only, no actual Outlook/Google Calendar sync
3. **Advanced Segmentation** — UI built, rule engine stubbed
4. **Compliance Reporting** — Schema ready, export endpoints pending
5. **Analytics Dashboard** — Charts stubbed with mock data, real metrics pending
6. **Social Media Queue** — Buffer adapter mock only
7. **A/B Testing** — Schema ready, runtime engine pending

All scaffolding is in place for production—just not all codepaths are live.

---

## Database Schema Highlights

**Core Tables:**
- `Contact` — Individual prospect / investor (with tier, assigned owner)
- `Campaign` — Email sequence definition
- `CampaignSend` — Individual email delivery record
- `Reply` — Inbound response with classification
- `PipelineRecord` — Current contact stage + owner
- `PipelineStageHistory` — Immutable stage transition audit log
- `Task` — SLA-driven action items
- `Approval` — Content review gate
- `ActivityLog` — Immutable audit trail

**Enums:**
- `ContactTier` — PROSPECT, QUALIFIED, OPPORTUNITY, CUSTOMER
- `ReplyCategory` — 9 classification buckets
- `PipelineStage` — 6-stage progression
- `TaskStatus` — OPEN, IN_PROGRESS, COMPLETED, OVERDUE
- `ApprovalStatus` — DRAFT, AWAITING_REVIEW, APPROVED, REJECTED

---

## Development Workflow

### Add a New Feature

1. **Schema** — Update `prisma/schema.prisma`, run `npx prisma migrate dev --name feature_name`
2. **Service** — Add business logic in `src/services/feature.ts`
3. **Component** — Build UI in `src/components/` (use shadcn base components)
4. **Page/Route** — Wire in `src/app/(dashboard)/feature/page.tsx`
5. **Test** — No test harness yet; manual testing in dev server

### Debug SLA Routing

Check the `src/services/sla.ts` file:
- `computeSLADeadline()` — Returns Date object for when SLA expires
- `getSLAOwner()` — Returns user ID who should be assigned
- `getUrgencyLevel()` — Returns color/urgency for display

All SLA logic is deterministic and rule-based.

### Integrate New Email Provider

1. Copy `src/services/integrations/instantly.ts` as template
2. Implement `send()` and `getStatus()` functions
3. Export in `src/services/index.ts`
4. Add API key env var to `.env.example` and `docker-compose.yml`
5. Update integrations page UI

---

## Deployment

### To Docker (Production)

```bash
# Build and push to registry (e.g., Docker Hub, GCR, ECR)
docker build -t akru/campaign-os:latest .
docker push akru/campaign-os:latest

# Or deploy directly with docker-compose
docker-compose -f docker-compose.yml up -d
```

### To Vercel

```bash
vercel deploy --prod
```

Make sure `next.config.ts` has `output: 'standalone'` for edge cases.

### Environment Variables (Production Checklist)

- [ ] `DATABASE_URL` → Managed PostgreSQL (AWS RDS, Railway, Supabase)
- [ ] `NEXTAUTH_SECRET` → Strong random string (openssl rand -base64 32)
- [ ] `NEXTAUTH_URL` → Production domain (e.g., https://campaign-os.akru.io)
- [ ] `INSTANTLY_API_KEY` → Retrieved from Instantly.ai dashboard
- [ ] `ZEROBOUNCE_API_KEY` → Retrieved from ZeroBounce dashboard
- [ ] `NODE_ENV` → Set to `production`

---

## Troubleshooting

### Database connection error

**Problem:** `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution:**
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT 1"

# Or start it via Docker
docker run -d -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16-alpine
```

### Prisma client mismatch

**Problem:** `@prisma/client version mismatch`

**Solution:**
```bash
npm install
npx prisma generate
```

### Port already in use

**Problem:** `Error: listen EADDRINUSE :::3000`

**Solution:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

---

## Contributing

1. Create feature branch (`git checkout -b feature/your-feature`)
2. Make changes and test locally
3. Commit with descriptive messages
4. Push and create pull request
5. Core team reviews and merges

---

## License

AKRU Campaign OS is internal software for AKRU Inc. Proprietary and confidential.

---

## Support

Contact engineering team or file an issue in the internal repo.

Last updated: April 2026
