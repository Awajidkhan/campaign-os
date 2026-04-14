import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDate as fnsFormatDate, formatRelative as fnsFormatRelative, isPast, addHours } from 'date-fns';
import { Contact, PipelineStage, VerificationStatus } from '@prisma/client';

/**
 * Combine classNames with clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format date to "Apr 14, 2026" format
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return fnsFormatDate(dateObj, 'MMM dd, yyyy');
}

/**
 * Format date relative to now: "2 hours ago", "in 3 days", etc.
 */
export function formatRelative(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return fnsFormatRelative(dateObj, new Date());
}

/**
 * Determine if a contact is sendable (email verified, not suppressed, not do-not-contact)
 */
export function isSendable(contact: {
  emailVerificationStatus: VerificationStatus;
  doNotContact: boolean;
  suppressionReason: string | null;
}): boolean {
  return (
    contact.emailVerificationStatus === VerificationStatus.VALID &&
    !contact.doNotContact &&
    !contact.suppressionReason
  );
}

/**
 * Get numeric stage order for sorting/comparison
 * Stages: IDENTIFIED=0, CONTACTED=1, ENGAGED=2, QUALIFIED=3, DEMO_SCHEDULED=4, PROPOSAL=5, CLOSED_WON=6, CLOSED_LOST=7
 */
export function getStageOrder(stage: PipelineStage): number {
  const stageOrder: Record<PipelineStage, number> = {
    [PipelineStage.IDENTIFIED]: 0,
    [PipelineStage.CONTACTED]: 1,
    [PipelineStage.ENGAGED]: 2,
    [PipelineStage.QUALIFIED]: 3,
    [PipelineStage.DEMO_SCHEDULED]: 4,
    [PipelineStage.PROPOSAL]: 5,
    [PipelineStage.CLOSED_WON]: 6,
    [PipelineStage.CLOSED_LOST]: 7,
  };
  return stageOrder[stage] ?? -1;
}

/**
 * Get SLA status based on due date
 * Returns: "overdue", "urgent", "warning", "ok"
 */
export function getSLAStatus(dueAt: Date | string): 'overdue' | 'urgent' | 'warning' | 'ok' {
  const due = typeof dueAt === 'string' ? new Date(dueAt) : dueAt;
  const now = new Date();

  // Overdue: past deadline
  if (isPast(due)) {
    return 'overdue';
  }

  // Urgent: within 1 hour
  if (now.getTime() + 60 * 60 * 1000 > due.getTime()) {
    return 'urgent';
  }

  // Warning: within 4 hours
  if (now.getTime() + 4 * 60 * 60 * 1000 > due.getTime()) {
    return 'warning';
  }

  return 'ok';
}
