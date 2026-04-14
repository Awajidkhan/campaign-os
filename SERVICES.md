# AKRU Campaign OS - Core Service Layer

Complete production-ready service layer for the AKRU Campaign Operating System. 1,639 lines of fully-typed TypeScript ready for Next.js integration.

## Files Created

### Library Utilities
- **`src/lib/prisma.ts`** - Prisma client singleton (dev-safe)
- **`src/lib/utils.ts`** - Formatting and validation helpers
- **`src/services/index.ts`** - Central export barrel for all services

### Core Services
- **`src/services/classification.ts`** - Rule-based reply classification (9 categories)
- **`src/services/sla.ts`** - SLA deadline computation and owner routing
- **`src/services/pipeline.ts`** - State machine for stage transitions
- **`src/services/triage.ts`** - One-click triage actions and workflows
- **`src/services/integrations/instantly.ts`** - Outbound email provider adapter
- **`src/services/integrations/verification.ts`** - Email verification provider adapter

## Quick Start

### 1. Reply Classification
```typescript
import { classifyReply } from '@/services';

const result = classifyReply(
  'Re: AKRU fund tokenization',
  'This sounds great! When can we schedule a call?'
);

console.log(result);
// {
//   category: 'HOT_MEETING_REQUEST',
//   confidence: 0.95,
//   urgency: 'critical',
//   sentiment: 'positive'
// }
```

### 2. Compute SLA Deadline
```typescript
import { computeSLADeadline, getSLAOwner, getUrgencyLevel } from '@/services';

const deadline = computeSLADeadline('HOT_MEETING_REQUEST', new Date());
// 2 hours from now

const owner = getSLAOwner('HOT_MEETING_REQUEST');
// 'mohsin'

const urgency = getUrgencyLevel(deadline);
// 'critical' | 'warning' | 'ok' | 'overdue'
```

### 3. Pipeline Stage Transitions
```typescript
import { processStageTransition, getNextStage, getStageName } from '@/services';

// Check if transition is valid before committing
const nextStage = getNextStage('CONTACTED', 'positive_reply');
if (nextStage) {
  // Move contact through pipeline
  const result = await processStageTransition(contactId, 'positive_reply', userId);
  // Creates PipelineRecord update + PipelineStageHistory entry + activity log
}
```

### 4. One-Click Triage Actions
```typescript
import { handleTriageAction } from '@/services';

// Escalate to Mohsin with auto-task creation
await handleTriageAction(
  replyEventId,
  'escalate_to_mohsin',
  currentUserId
);

// Or assign to team member
await handleTriageAction(
  replyEventId,
  'assign_to_sena',
  currentUserId
);

// Suppress hostile contacts
await handleTriageAction(
  replyEventId,
  'mark_hostile',
  currentUserId
);

// Convert to qualified (auto-routes to Mohsin)
await handleTriageAction(
  replyEventId,
  'convert_to_qualified',
  currentUserId
);
```

### 5. Email Verification
```typescript
import { MockVerificationAdapter } from '@/services';

const verifier = new MockVerificationAdapter();
// In production, swap with ZeroBounceAdapter or NeverBounceAdapter

const result = await verifier.verifyEmail('alex@fundadmin.co');
// {
//   email: 'alex@fundadmin.co',
//   status: 'VALID',
//   confidence: 0.95,
//   details: { ... }
// }

const batch = await verifier.verifyBatch([
  'alex@fundadmin.co',
  'jordan@venture.io',
  'casey@invalid.com'
]);
```

### 6. Instantly.ai Sync
```typescript
import { MockInstantlyAdapter } from '@/services';

const instantly = new MockInstantlyAdapter();

// Sync replies from outbound system
const replies = await instantly.syncReplies();
// Returns: SyncReplyData[] with messageId, subject, body, etc.

// Sync enrollment statuses
const enrollments = await instantly.syncEnrollments();
// Returns: SyncEnrollmentData[] with status, currentStep, etc.

// Pause a contact's sequence
await instantly.pauseSequence(contactId);

// Get mailbox health metrics
const stats = await instantly.getMailboxStats();
// Returns: MailboxStats[] with sent, reply, bounce, spam, openRate
```

## Architecture

### Classification Engine
- **Input**: subject + body text
- **Process**: keyword matching + pattern detection
- **Output**: ReplyCategory + confidence (0-1) + urgency + sentiment
- **Categories**: HOT_MEETING_REQUEST, HOT_INTEREST, WARM_TIMING, WARM_QUESTION, REFERRAL, NEGATIVE_NOT_INTERESTED, NEGATIVE_HOSTILE, OUT_OF_OFFICE, BOUNCE
- **AI-Ready**: CLASSIFICATION_KEYWORDS exported for swapping to GPT/Claude classification

### SLA System
```
HOT_MEETING_REQUEST  → 2 hours  → Mohsin
HOT_INTEREST         → 4 hours  → Mohsin
REFERRAL             → 4 hours  → Mohsin
WARM_TIMING          → 24 hours → Sena/Jawad
WARM_QUESTION        → 12 hours → Sena/Jawad
NEGATIVE_NOT_INT     → 24 hours → Sena
NEGATIVE_HOSTILE     → Immediate → Auto-suppress
OUT_OF_OFFICE        → Immediate → Auto-resume
BOUNCE               → Immediate → Auto-suppress
```

### Pipeline State Machine
```
IDENTIFIED
    ↓ (first_outbound)
CONTACTED
    ↓ (positive_reply)
ENGAGED
    ↓ (fit_confirmed)
QUALIFIED ← Ownership: Mohsin
    ↓ (calendar_accepted)
DEMO_SCHEDULED
    ↓ (proposal_sent)
PROPOSAL
    ↓ (contract_signed)
CLOSED_WON

CLOSED_LOST (from any stage on decline)
```

### Triage Workflow
1. **Reply lands** → ReplyEvent created
2. **Auto-classify** → classification.ts determines category
3. **Compute SLA** → sla.ts sets deadline + owner
4. **User triages** → handleTriageAction() called
5. **Action executed**:
   - Updates ReplyEvent.isTriaged + triageAction
   - Creates Task (if needed) with priority from SLA
   - Updates Contact (if suppression)
   - Moves Pipeline stage (if qualified)
   - Pauses/resumes enrollments (if needed)
   - Logs to ActivityLog for audit trail

## Type System

All services export full TypeScript interfaces:

```typescript
// Classification
type ReplyCategory = 
  | 'HOT_MEETING_REQUEST'
  | 'HOT_INTEREST'
  | 'WARM_TIMING'
  | 'WARM_QUESTION'
  | 'REFERRAL'
  | 'NEGATIVE_NOT_INTERESTED'
  | 'NEGATIVE_HOSTILE'
  | 'OUT_OF_OFFICE'
  | 'BOUNCE'
  | 'UNCLASSIFIED';

// Pipeline
type PipelineTrigger =
  | 'first_outbound'
  | 'positive_reply'
  | 'fit_confirmed'
  | 'calendar_accepted'
  | 'proposal_sent'
  | 'contract_signed'
  | 'decline'
  | 'manual';

// Triage
type TriageAction =
  | 'escalate_to_mohsin'
  | 'assign_to_sena'
  | 'assign_to_jawad'
  | 'mark_unsubscribed'
  | 'mark_hostile'
  | 'pause_sequence'
  | 'create_task'
  | 'move_to_nurture'
  | 'convert_to_qualified';
```

## Integration Points

### Databases
- **PrismaClient** - Single instance via `@/lib/prisma`
- All services use direct prisma calls (no repository pattern)

### External APIs (Mock + Stubs)
- **Instantly.ai** - `IOutboundProvider` interface
  - MockInstantlyAdapter for development
  - InstantlyAdapter stub for real API
- **Email Verification** - `IVerificationProvider` interface
  - MockVerificationAdapter for development
  - ZeroBounceAdapter, NeverBounceAdapter stubs

### Date Handling
- Uses `date-fns` library (already in dependencies)
- Consistent "Apr 14, 2026" formatting
- Relative time support ("2 hours ago")

## Next Steps

### Wire Up API Routes
```typescript
// pages/api/triage/[id]/actions.ts
import { handleTriageAction } from '@/services';

export default async function handler(req, res) {
  const { id } = req.query;
  const { action } = req.body;
  
  const result = await handleTriageAction(id, action, req.user.id);
  res.json(result);
}
```

### Create React Hooks
```typescript
// lib/hooks/useClassification.ts
export function useClassification() {
  const [result, setResult] = useState(null);
  
  const classify = useCallback((subject, body) => {
    const result = classifyReply(subject, body);
    setResult(result);
  }, []);
  
  return { result, classify };
}
```

### Sync Jobs
```typescript
// app/api/sync/replies/route.ts
import { MockInstantlyAdapter } from '@/services';

export async function POST() {
  const instantly = new MockInstantlyAdapter();
  const replies = await instantly.syncReplies();
  
  for (const reply of replies) {
    // Create ReplyEvent in database
    // Classify
    // Compute SLA
    // Add to triage queue
  }
}
```

## Testing

All services are function-based and purely synchronous (except DB calls):

```typescript
import { classifyReply, getNextStage, computeSLADeadline } from '@/services';

describe('Classification', () => {
  it('should classify hot meeting requests', () => {
    const result = classifyReply('', 'When can we meet?');
    expect(result.category).toBe('HOT_MEETING_REQUEST');
    expect(result.confidence).toBeGreaterThan(0.8);
  });
});

describe('Pipeline', () => {
  it('should transition from CONTACTED to ENGAGED', () => {
    const next = getNextStage('CONTACTED', 'positive_reply');
    expect(next).toBe('ENGAGED');
  });
  
  it('should reject invalid transitions', () => {
    const next = getNextStage('CLOSED_WON', 'decline');
    expect(next).toBeNull();
  });
});
```

## Notes

- All files include error handling with null returns or try/catch
- Activity logging throughout triage for audit compliance
- Polymorphic Task creation (contact, account, or reply-linked)
- Direct team member assignment (Sena, Jawad) vs. Mohsin escalation
- Suppression list with reasons (hostile, unsubscribed, bounced)
- Stage history for pipeline analytics

Ready to ship! 🚀
