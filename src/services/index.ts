/**
 * Central export point for all campaign OS services
 * Simplifies imports: import { classifyReply, handleTriageAction } from '@/services'
 */

// Classification
export { classifyReply, CLASSIFICATION_KEYWORDS, type ClassificationResult } from './classification';

// SLA
export {
  computeSLADeadline,
  getSLAOwner,
  isOverdue,
  getUrgencyLevel,
  getSLAMinutes,
  getAllSLAConfig,
} from './sla';

// Pipeline
export {
  getNextStage,
  getStageOwner,
  processStageTransition,
  getStageName,
  getStageColor,
  type PipelineTrigger,
} from './pipeline';

// Integrations
export type { IOutboundProvider } from './integrations/instantly';
export {
  MockInstantlyAdapter,
  InstantlyAdapter,
  type MailboxStats,
  type SyncReplyData,
  type SyncEnrollmentData,
} from './integrations/instantly';

export type { IVerificationProvider } from './integrations/verification';
export {
  MockVerificationAdapter,
  ZeroBounceAdapter,
  NeverBounceAdapter,
  type VerificationResult,
} from './integrations/verification';

// Triage
export { handleTriageAction, type TriageAction } from './triage';
