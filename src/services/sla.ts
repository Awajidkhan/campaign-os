import { ReplyCategory, UserRole } from '@prisma/client';
import { addMinutes, isPast } from 'date-fns';

/**
 * SLA configuration per reply category
 * Format: { minutes: number, owner: string (team member), role: UserRole }
 */
const SLA_CONFIG: Record<ReplyCategory, { minutes: number; owner: string; role: UserRole }> = {
  [ReplyCategory.HOT_MEETING_REQUEST]: {
    minutes: 120, // 2 hours
    owner: 'mohsin',
    role: UserRole.MOHSIN,
  },
  [ReplyCategory.HOT_INTEREST]: {
    minutes: 240, // 4 hours
    owner: 'mohsin',
    role: UserRole.MOHSIN,
  },
  [ReplyCategory.REFERRAL]: {
    minutes: 240, // 4 hours
    owner: 'mohsin',
    role: UserRole.MOHSIN,
  },
  [ReplyCategory.WARM_TIMING]: {
    minutes: 1440, // 24 hours
    owner: 'sena', // or jawad
    role: UserRole.OPERATOR,
  },
  [ReplyCategory.WARM_QUESTION]: {
    minutes: 720, // 12 hours
    owner: 'sena', // or jawad
    role: UserRole.OPERATOR,
  },
  [ReplyCategory.NEGATIVE_NOT_INTERESTED]: {
    minutes: 1440, // 24 hours
    owner: 'sena',
    role: UserRole.OPERATOR,
  },
  [ReplyCategory.NEGATIVE_HOSTILE]: {
    minutes: 0, // immediate suppression
    owner: 'auto',
    role: UserRole.OPERATOR,
  },
  [ReplyCategory.OUT_OF_OFFICE]: {
    minutes: 0, // automated, no human SLA
    owner: 'auto',
    role: UserRole.OPERATOR,
  },
  [ReplyCategory.BOUNCE]: {
    minutes: 0, // automated, no human SLA
    owner: 'auto',
    role: UserRole.OPERATOR,
  },
  [ReplyCategory.UNCLASSIFIED]: {
    minutes: 1440, // 24 hours default
    owner: 'sena',
    role: UserRole.OPERATOR,
  },
};

/**
 * Compute SLA deadline based on category and received time
 * Returns: Date object representing the deadline
 */
export function computeSLADeadline(category: ReplyCategory, receivedAt: Date | string): Date {
  const received = typeof receivedAt === 'string' ? new Date(receivedAt) : receivedAt;
  const slaConfig = SLA_CONFIG[category];
  return addMinutes(received, slaConfig.minutes);
}

/**
 * Get SLA owner (team member name) for a category
 * Returns: "mohsin" | "sena" | "jawad" | "auto"
 */
export function getSLAOwner(category: ReplyCategory): string {
  return SLA_CONFIG[category].owner;
}

/**
 * Check if SLA deadline has been exceeded
 */
export function isOverdue(dueAt: Date | string): boolean {
  const due = typeof dueAt === 'string' ? new Date(dueAt) : dueAt;
  return isPast(due);
}

/**
 * Get urgency level based on time remaining until SLA deadline
 * Returns: "overdue" | "critical" | "warning" | "ok"
 */
export function getUrgencyLevel(dueAt: Date | string): 'overdue' | 'critical' | 'warning' | 'ok' {
  const due = typeof dueAt === 'string' ? new Date(dueAt) : dueAt;
  const now = new Date();
  const minutesRemaining = (due.getTime() - now.getTime()) / (1000 * 60);

  if (minutesRemaining < 0) {
    return 'overdue';
  }

  if (minutesRemaining < 30) {
    return 'critical';
  }

  if (minutesRemaining < 120) {
    return 'warning';
  }

  return 'ok';
}

/**
 * Get SLA minutes for a given category
 */
export function getSLAMinutes(category: ReplyCategory): number {
  return SLA_CONFIG[category].minutes;
}

/**
 * Get all SLA configuration
 */
export function getAllSLAConfig(): Record<
  ReplyCategory,
  { minutes: number; owner: string; role: UserRole }
> {
  return SLA_CONFIG;
}
