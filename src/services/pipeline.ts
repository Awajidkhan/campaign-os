import { PipelineStage, UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export type PipelineTrigger =
  | 'first_outbound'
  | 'positive_reply'
  | 'fit_confirmed'
  | 'calendar_accepted'
  | 'proposal_sent'
  | 'contract_signed'
  | 'decline'
  | 'manual';

/**
 * Stage transition rules
 * Defines which stages can transition to which stages and on which triggers
 */
const STAGE_TRANSITIONS: Record<
  PipelineStage,
  Record<PipelineTrigger, PipelineStage | null>
> = {
  [PipelineStage.IDENTIFIED]: {
    first_outbound: PipelineStage.CONTACTED,
    positive_reply: PipelineStage.ENGAGED,
    fit_confirmed: PipelineStage.QUALIFIED,
    calendar_accepted: PipelineStage.DEMO_SCHEDULED,
    proposal_sent: PipelineStage.PROPOSAL,
    contract_signed: PipelineStage.CLOSED_WON,
    decline: PipelineStage.CLOSED_LOST,
    manual: null,
  },
  [PipelineStage.CONTACTED]: {
    first_outbound: null,
    positive_reply: PipelineStage.ENGAGED,
    fit_confirmed: PipelineStage.QUALIFIED,
    calendar_accepted: PipelineStage.DEMO_SCHEDULED,
    proposal_sent: PipelineStage.PROPOSAL,
    contract_signed: PipelineStage.CLOSED_WON,
    decline: PipelineStage.CLOSED_LOST,
    manual: null,
  },
  [PipelineStage.ENGAGED]: {
    first_outbound: null,
    positive_reply: null,
    fit_confirmed: PipelineStage.QUALIFIED,
    calendar_accepted: PipelineStage.DEMO_SCHEDULED,
    proposal_sent: PipelineStage.PROPOSAL,
    contract_signed: PipelineStage.CLOSED_WON,
    decline: PipelineStage.CLOSED_LOST,
    manual: null,
  },
  [PipelineStage.QUALIFIED]: {
    first_outbound: null,
    positive_reply: null,
    fit_confirmed: null,
    calendar_accepted: PipelineStage.DEMO_SCHEDULED,
    proposal_sent: PipelineStage.PROPOSAL,
    contract_signed: PipelineStage.CLOSED_WON,
    decline: PipelineStage.CLOSED_LOST,
    manual: null,
  },
  [PipelineStage.DEMO_SCHEDULED]: {
    first_outbound: null,
    positive_reply: null,
    fit_confirmed: null,
    calendar_accepted: null,
    proposal_sent: PipelineStage.PROPOSAL,
    contract_signed: PipelineStage.CLOSED_WON,
    decline: PipelineStage.CLOSED_LOST,
    manual: null,
  },
  [PipelineStage.PROPOSAL]: {
    first_outbound: null,
    positive_reply: null,
    fit_confirmed: null,
    calendar_accepted: null,
    proposal_sent: null,
    contract_signed: PipelineStage.CLOSED_WON,
    decline: PipelineStage.CLOSED_LOST,
    manual: null,
  },
  [PipelineStage.CLOSED_WON]: {
    first_outbound: null,
    positive_reply: null,
    fit_confirmed: null,
    calendar_accepted: null,
    proposal_sent: null,
    contract_signed: null,
    decline: null,
    manual: null,
  },
  [PipelineStage.CLOSED_LOST]: {
    first_outbound: null,
    positive_reply: null,
    fit_confirmed: null,
    calendar_accepted: null,
    proposal_sent: null,
    contract_signed: null,
    decline: null,
    manual: null,
  },
};

/**
 * Get stage owner based on stage
 * QUALIFIED and above: Mohsin (founder, owns hot deals)
 * IDENTIFIED through ENGAGED: Sena or Jawad (operators, handle research/outreach)
 */
export function getStageOwner(stage: PipelineStage): 'mohsin' | 'sena' | 'jawad' {
  // Mohsin owns qualified and above
  if (
    stage === PipelineStage.QUALIFIED ||
    stage === PipelineStage.DEMO_SCHEDULED ||
    stage === PipelineStage.PROPOSAL ||
    stage === PipelineStage.CLOSED_WON ||
    stage === PipelineStage.CLOSED_LOST
  ) {
    return 'mohsin';
  }

  // Sena/Jawad handle early-stage
  // For now, return 'sena' as default (in practice, distribute via task assignment)
  return 'sena';
}

/**
 * Get the next stage for a given trigger on the current stage
 * Returns: new PipelineStage or null if transition is not allowed
 */
export function getNextStage(
  currentStage: PipelineStage,
  trigger: PipelineTrigger
): PipelineStage | null {
  return STAGE_TRANSITIONS[currentStage]?.[trigger] ?? null;
}

/**
 * Process a stage transition for a contact
 * Updates PipelineRecord and creates PipelineStageHistory entry
 * @param contactId Contact ID
 * @param trigger What triggered the transition
 * @param movedById Optional user ID who triggered it (null = automated)
 * @returns Updated PipelineRecord or null if transition invalid
 */
export async function processStageTransition(
  contactId: string,
  trigger: PipelineTrigger,
  movedById?: string
): Promise<{ stage: PipelineStage; reason: string } | null> {
  try {
    // Get current pipeline record
    const pipelineRecord = await prisma.pipelineRecord.findUnique({
      where: { contactId },
    });

    if (!pipelineRecord) {
      // Create if doesn't exist
      const newRecord = await prisma.pipelineRecord.create({
        data: {
          contactId,
          stage: PipelineStage.IDENTIFIED,
        },
      });
      return { stage: newRecord.stage, reason: 'created' };
    }

    // Determine next stage
    const nextStage = getNextStage(pipelineRecord.stage, trigger);

    // Invalid transition
    if (nextStage === null) {
      return null;
    }

    // Same stage, no-op
    if (nextStage === pipelineRecord.stage) {
      return null;
    }

    // Update pipeline record
    const updated = await prisma.pipelineRecord.update({
      where: { contactId },
      data: {
        stage: nextStage,
        enteredAt: new Date(),
      },
    });

    // Create history entry
    await prisma.pipelineStageHistory.create({
      data: {
        contactId,
        fromStage: pipelineRecord.stage,
        toStage: nextStage,
        reason: trigger,
        movedById: movedById || undefined,
      },
    });

    return { stage: nextStage, reason: trigger };
  } catch (error) {
    console.error('Error processing stage transition:', error);
    return null;
  }
}

/**
 * Get stage label for UI display
 */
export function getStageName(stage: PipelineStage): string {
  const names: Record<PipelineStage, string> = {
    [PipelineStage.IDENTIFIED]: 'Identified',
    [PipelineStage.CONTACTED]: 'Contacted',
    [PipelineStage.ENGAGED]: 'Engaged',
    [PipelineStage.QUALIFIED]: 'Qualified',
    [PipelineStage.DEMO_SCHEDULED]: 'Demo Scheduled',
    [PipelineStage.PROPOSAL]: 'Proposal',
    [PipelineStage.CLOSED_WON]: 'Closed Won',
    [PipelineStage.CLOSED_LOST]: 'Closed Lost',
  };
  return names[stage] || 'Unknown';
}

/**
 * Get stage color for UI display
 */
export function getStageColor(stage: PipelineStage): string {
  const colors: Record<PipelineStage, string> = {
    [PipelineStage.IDENTIFIED]: 'gray',
    [PipelineStage.CONTACTED]: 'blue',
    [PipelineStage.ENGAGED]: 'cyan',
    [PipelineStage.QUALIFIED]: 'green',
    [PipelineStage.DEMO_SCHEDULED]: 'emerald',
    [PipelineStage.PROPOSAL]: 'amber',
    [PipelineStage.CLOSED_WON]: 'lime',
    [PipelineStage.CLOSED_LOST]: 'red',
  };
  return colors[stage] || 'gray';
}
