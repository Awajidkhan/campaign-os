import { ReplyEvent, TaskStatus, TaskPriority, PipelineStage, ReplyCategory } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { computeSLADeadline, getSLAOwner } from './sla';
import { processStageTransition } from './pipeline';

export type TriageAction =
  | 'escalate_to_mohsin'
  | 'assign_to_sena'
  | 'assign_to_jawad'
  | 'mark_unsubscribed'
  | 'mark_hostile'
  | 'pause_sequence'
  | 'create_task'
  | 'move_to_nurture'
  | 'convert_to_qualified';

/**
 * Handle one-click triage actions on reply events
 * Updates reply event state, creates tasks, manages pipeline, logs activities
 */
export async function handleTriageAction(
  replyEventId: string,
  action: TriageAction,
  userId: string
): Promise<{ success: boolean; message: string; replyEventId?: string }> {
  try {
    // Get the reply event
    const replyEvent = await prisma.replyEvent.findUnique({
      where: { id: replyEventId },
      include: {
        contact: true,
      },
    });

    if (!replyEvent) {
      return { success: false, message: 'Reply event not found' };
    }

    // Execute action
    switch (action) {
      case 'escalate_to_mohsin':
        return await handleEscalateToMohsin(replyEvent, userId);

      case 'assign_to_sena':
        return await handleAssignToTeamMember(replyEvent, userId, 'sena');

      case 'assign_to_jawad':
        return await handleAssignToTeamMember(replyEvent, userId, 'jawad');

      case 'mark_unsubscribed':
        return await handleMarkUnsubscribed(replyEvent, userId);

      case 'mark_hostile':
        return await handleMarkHostile(replyEvent, userId);

      case 'pause_sequence':
        return await handlePauseSequence(replyEvent, userId);

      case 'create_task':
        return await handleCreateTask(replyEvent, userId);

      case 'move_to_nurture':
        return await handleMoveToNurture(replyEvent, userId);

      case 'convert_to_qualified':
        return await handleConvertToQualified(replyEvent, userId);

      default:
        return { success: false, message: `Unknown action: ${action}` };
    }
  } catch (error) {
    console.error('Error handling triage action:', error);
    return { success: false, message: 'Error processing action' };
  }
}

/**
 * Escalate reply to Mohsin
 */
async function handleEscalateToMohsin(replyEvent: ReplyEvent & { contact?: { id: string; firstName: string; lastName: string } | null }, userId: string) {
  // Get Mohsin user
  const mohsin = await prisma.user.findFirst({
    where: { role: 'MOHSIN' },
  });

  if (!mohsin) {
    return { success: false, message: 'Mohsin user not found' };
  }

  // Create task for Mohsin
  const dueAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
  const contactName = replyEvent.contact
    ? `${replyEvent.contact.firstName} ${replyEvent.contact.lastName}`
    : 'Unknown Contact';
  await prisma.task.create({
    data: {
      title: `Urgent: ${contactName} - ${replyEvent.category}`,
      description: replyEvent.bodyPreview,
      dueAt,
      priority: TaskPriority.URGENT,
      assignedToId: mohsin.id,
      createdById: userId,
      contactId: replyEvent.contactId,
      replyEventId: replyEvent.id,
    },
  });

  // Update reply event
  await prisma.replyEvent.update({
    where: { id: replyEvent.id },
    data: {
      isTriaged: true,
      triagedById: userId,
      triagedAt: new Date(),
      triageAction: 'escalated_to_mohsin',
    },
  });

  // Log activity
  await logActivity(userId, 'reply.escalated', replyEvent.id, {
    to: 'mohsin',
    category: replyEvent.category,
  });

  return {
    success: true,
    message: `Escalated to Mohsin (2h SLA)`,
    replyEventId: replyEvent.id,
  };
}

/**
 * Assign to team member (Sena or Jawad)
 */
async function handleAssignToTeamMember(
  replyEvent: ReplyEvent & { contact?: { id: string; firstName: string; lastName: string } | null },
  userId: string,
  memberName: 'sena' | 'jawad'
) {
  // Get user by name (in practice, would map to actual user IDs)
  const member = await prisma.user.findFirst({
    where: { firstName: memberName === 'sena' ? 'Sena' : 'Jawad' },
  });

  if (!member) {
    return { success: false, message: `${memberName} user not found` };
  }

  // Determine priority and SLA based on category
  const slaMinutes: Record<ReplyCategory, number> = {
    [ReplyCategory.HOT_MEETING_REQUEST]: 120,
    [ReplyCategory.HOT_INTEREST]: 240,
    [ReplyCategory.REFERRAL]: 240,
    [ReplyCategory.WARM_TIMING]: 1440,
    [ReplyCategory.WARM_QUESTION]: 720,
    [ReplyCategory.NEGATIVE_NOT_INTERESTED]: 1440,
    [ReplyCategory.NEGATIVE_HOSTILE]: 0,
    [ReplyCategory.OUT_OF_OFFICE]: 0,
    [ReplyCategory.BOUNCE]: 0,
    [ReplyCategory.UNCLASSIFIED]: 1440,
  };

  const slaMins = slaMinutes[replyEvent.category as ReplyCategory] || 1440;

  const priority =
    slaMins <= 240 ? TaskPriority.HIGH : slaMins <= 720 ? TaskPriority.NORMAL : TaskPriority.LOW;

  const dueAt = new Date(Date.now() + slaMins * 60 * 1000);

  // Create task
  const contactName = replyEvent.contact
    ? `${replyEvent.contact.firstName} ${replyEvent.contact.lastName}`
    : 'Unknown Contact';
  await prisma.task.create({
    data: {
      title: `Follow up: ${contactName}`,
      description: replyEvent.bodyPreview,
      dueAt,
      priority,
      assignedToId: member.id,
      createdById: userId,
      contactId: replyEvent.contactId,
      replyEventId: replyEvent.id,
    },
  });

  // Update reply event
  await prisma.replyEvent.update({
    where: { id: replyEvent.id },
    data: {
      isTriaged: true,
      triagedById: userId,
      triagedAt: new Date(),
      triageAction: `assigned_to_${memberName}`,
    },
  });

  // Log activity
  await logActivity(userId, 'reply.assigned', replyEvent.id, {
    to: memberName,
  });

  return {
    success: true,
    message: `Assigned to ${memberName}`,
    replyEventId: replyEvent.id,
  };
}

/**
 * Mark contact as unsubscribed
 */
async function handleMarkUnsubscribed(replyEvent: any, userId: string) {
  // Add to suppression list
  await prisma.suppression.upsert({
    where: { email: replyEvent.senderEmail },
    update: { suppressedAt: new Date() },
    create: {
      email: replyEvent.senderEmail,
      reason: 'unsubscribed',
      source: 'reply_triage',
      contactId: replyEvent.contactId,
    },
  });

  // Update contact
  await prisma.contact.update({
    where: { id: replyEvent.contactId },
    data: {
      doNotContact: true,
      suppressionReason: 'unsubscribed',
    },
  });

  // Update reply event
  await prisma.replyEvent.update({
    where: { id: replyEvent.id },
    data: {
      isTriaged: true,
      triagedById: userId,
      triagedAt: new Date(),
      triageAction: 'marked_unsubscribed',
    },
  });

  // Log activity
  await logActivity(userId, 'contact.suppressed', replyEvent.contactId, {
    reason: 'unsubscribed',
  });

  return {
    success: true,
    message: 'Contact marked as unsubscribed',
    replyEventId: replyEvent.id,
  };
}

/**
 * Mark contact as hostile (immediate suppression)
 */
async function handleMarkHostile(replyEvent: any, userId: string) {
  // Add to suppression list
  await prisma.suppression.upsert({
    where: { email: replyEvent.senderEmail },
    update: { suppressedAt: new Date() },
    create: {
      email: replyEvent.senderEmail,
      reason: 'hostile',
      source: 'reply_triage',
      contactId: replyEvent.contactId,
    },
  });

  // Update contact
  await prisma.contact.update({
    where: { id: replyEvent.contactId },
    data: {
      doNotContact: true,
      suppressionReason: 'hostile',
    },
  });

  // Update reply event
  await prisma.replyEvent.update({
    where: { id: replyEvent.id },
    data: {
      isTriaged: true,
      triagedById: userId,
      triagedAt: new Date(),
      triageAction: 'marked_hostile',
      category: ReplyCategory.NEGATIVE_HOSTILE,
    },
  });

  // Log activity
  await logActivity(userId, 'contact.suppressed', replyEvent.contactId, {
    reason: 'hostile',
  });

  return {
    success: true,
    message: 'Contact marked as hostile and suppressed',
    replyEventId: replyEvent.id,
  };
}

/**
 * Pause contact's sequence in outbound system
 */
async function handlePauseSequence(replyEvent: any, userId: string) {
  // Update all active enrollments for this contact
  await prisma.sequenceEnrollment.updateMany({
    where: {
      contactId: replyEvent.contactId,
      status: 'ACTIVE',
    },
    data: {
      status: 'PAUSED',
      pausedReason: 'triage_pause',
    },
  });

  // Update reply event
  await prisma.replyEvent.update({
    where: { id: replyEvent.id },
    data: {
      isTriaged: true,
      triagedById: userId,
      triagedAt: new Date(),
      triageAction: 'paused_sequence',
    },
  });

  // Log activity
  await logActivity(userId, 'sequence.paused', replyEvent.contactId, {
    reason: 'triage_pause',
  });

  return {
    success: true,
    message: 'Sequence paused',
    replyEventId: replyEvent.id,
  };
}

/**
 * Create a task for the reply
 */
async function handleCreateTask(replyEvent: any, userId: string) {
  const dueAt = computeSLADeadline(replyEvent.category, replyEvent.receivedAt);

  const task = await prisma.task.create({
    data: {
      title: `Follow up: ${replyEvent.contact.firstName} ${replyEvent.contact.lastName}`,
      description: replyEvent.bodyFull || replyEvent.bodyPreview,
      dueAt,
      priority: TaskPriority.NORMAL,
      createdById: userId,
      contactId: replyEvent.contactId,
      replyEventId: replyEvent.id,
    },
  });

  // Update reply event
  await prisma.replyEvent.update({
    where: { id: replyEvent.id },
    data: {
      isTriaged: true,
      triagedById: userId,
      triagedAt: new Date(),
      triageAction: 'created_task',
    },
  });

  // Log activity
  await logActivity(userId, 'task.created', task.id, {
    contactId: replyEvent.contactId,
  });

  return {
    success: true,
    message: 'Task created',
    replyEventId: replyEvent.id,
  };
}

/**
 * Move contact to nurture sequence
 */
async function handleMoveToNurture(replyEvent: any, userId: string) {
  // Find or create a nurture campaign
  const nurtureCampaign = await prisma.campaign.findFirst({
    where: {
      name: { contains: 'nurture' },
    },
  });

  if (!nurtureCampaign) {
    return { success: false, message: 'Nurture campaign not found' };
  }

  // Find the default nurture sequence
  const sequence = await prisma.sequence.findFirst({
    where: { campaignId: nurtureCampaign.id },
  });

  if (!sequence) {
    return { success: false, message: 'Nurture sequence not found' };
  }

  // Pause current enrollments
  await prisma.sequenceEnrollment.updateMany({
    where: {
      contactId: replyEvent.contactId,
      status: 'ACTIVE',
    },
    data: {
      status: 'PAUSED',
      pausedReason: 'moved_to_nurture',
    },
  });

  // Create new nurture enrollment
  await prisma.sequenceEnrollment.create({
    data: {
      contactId: replyEvent.contactId,
      campaignId: nurtureCampaign.id,
      sequenceId: sequence.id,
      status: 'ACTIVE',
    },
  });

  // Update reply event
  await prisma.replyEvent.update({
    where: { id: replyEvent.id },
    data: {
      isTriaged: true,
      triagedById: userId,
      triagedAt: new Date(),
      triageAction: 'moved_to_nurture',
    },
  });

  // Log activity
  await logActivity(userId, 'contact.enrolled', replyEvent.contactId, {
    campaign: nurtureCampaign.name,
  });

  return {
    success: true,
    message: 'Contact moved to nurture sequence',
    replyEventId: replyEvent.id,
  };
}

/**
 * Convert contact to qualified stage
 */
async function handleConvertToQualified(replyEvent: any, userId: string) {
  // Move pipeline stage
  const result = await processStageTransition(replyEvent.contactId, 'fit_confirmed', userId);

  if (!result) {
    return { success: false, message: 'Could not move to qualified stage' };
  }

  // Get Mohsin to assign
  const mohsin = await prisma.user.findFirst({
    where: { role: 'MOHSIN' },
  });

  if (mohsin) {
    // Create task for Mohsin to follow up
    await prisma.task.create({
      data: {
        title: `Qualified lead: ${replyEvent.contact.firstName} ${replyEvent.contact.lastName}`,
        description: `Ready for qualification call. ${replyEvent.bodyPreview}`,
        dueAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
        priority: TaskPriority.HIGH,
        assignedToId: mohsin.id,
        createdById: userId,
        contactId: replyEvent.contactId,
        replyEventId: replyEvent.id,
      },
    });
  }

  // Update reply event
  await prisma.replyEvent.update({
    where: { id: replyEvent.id },
    data: {
      isTriaged: true,
      triagedById: userId,
      triagedAt: new Date(),
      triageAction: 'converted_to_qualified',
    },
  });

  // Log activity
  await logActivity(userId, 'contact.qualified', replyEvent.contactId, {
    stage: 'QUALIFIED',
  });

  return {
    success: true,
    message: 'Contact converted to qualified',
    replyEventId: replyEvent.id,
  };
}

/**
 * Helper: Log activity to ActivityLog
 */
async function logActivity(
  userId: string,
  action: string,
  entityId: string,
  details?: Record<string, any>
): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        action,
        entityType: 'ReplyEvent',
        entityId,
        userId,
        details: details || {},
      },
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}
