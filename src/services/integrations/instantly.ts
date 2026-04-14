/**
 * Instantly.ai integration adapter
 * Handles syncing replies, enrollments, and mailbox management
 */

export interface MailboxStats {
  email: string;
  sentCount: number;
  replyCount: number;
  bounceCount: number;
  spamCount: number;
  openRate?: number;
}

export interface SyncReplyData {
  messageId: string;
  contactEmail: string;
  subject?: string;
  body: string;
  receivedAt: Date;
}

export interface SyncEnrollmentData {
  contactId: string;
  campaignId: string;
  status: 'active' | 'paused' | 'completed' | 'bounced' | 'unsubscribed';
  currentStep: number;
  nextSendDate?: Date;
}

/**
 * Interface for outbound email provider (Instantly.ai, etc.)
 */
export interface IOutboundProvider {
  /**
   * Sync replies from the outbound system into the database
   */
  syncReplies(): Promise<SyncReplyData[]>;

  /**
   * Sync enrollment statuses from the outbound system
   */
  syncEnrollments(): Promise<SyncEnrollmentData[]>;

  /**
   * Pause a contact's sequence
   */
  pauseSequence(contactId: string): Promise<boolean>;

  /**
   * Get mailbox stats and health metrics
   */
  getMailboxStats(): Promise<MailboxStats[]>;
}

/**
 * Mock implementation of Instantly.ai adapter for development
 */
export class MockInstantlyAdapter implements IOutboundProvider {
  async syncReplies(): Promise<SyncReplyData[]> {
    // Mock data: return sample replies
    return [
      {
        messageId: 'msg_1',
        contactEmail: 'alex@fundadmin.co',
        subject: 'Re: Tokenization for your fund',
        body: 'This is interesting. When can we discuss?',
        receivedAt: new Date(Date.now() - 3600000),
      },
      {
        messageId: 'msg_2',
        contactEmail: 'jordan@reventure.com',
        subject: 'Re: Quick question',
        body: 'Out of office until next week',
        receivedAt: new Date(Date.now() - 7200000),
      },
      {
        messageId: 'msg_3',
        contactEmail: 'casey@venture.io',
        subject: 'Re: AKRU partnership',
        body: 'Not interested at this time',
        receivedAt: new Date(Date.now() - 1800000),
      },
    ];
  }

  async syncEnrollments(): Promise<SyncEnrollmentData[]> {
    // Mock data: return sample enrollment statuses
    return [
      {
        contactId: 'contact_1',
        campaignId: 'campaign_1',
        status: 'active',
        currentStep: 2,
        nextSendDate: new Date(Date.now() + 86400000),
      },
      {
        contactId: 'contact_2',
        campaignId: 'campaign_1',
        status: 'paused',
        currentStep: 1,
      },
      {
        contactId: 'contact_3',
        campaignId: 'campaign_2',
        status: 'completed',
        currentStep: 3,
      },
    ];
  }

  async pauseSequence(contactId: string): Promise<boolean> {
    // Mock: always succeed
    console.log(`[Mock] Paused sequence for contact: ${contactId}`);
    return true;
  }

  async getMailboxStats(): Promise<MailboxStats[]> {
    // Mock data: return sample mailbox health
    return [
      {
        email: 'campaigns@akru-outbound.io',
        sentCount: 1250,
        replyCount: 187,
        bounceCount: 12,
        spamCount: 2,
        openRate: 0.28,
      },
      {
        email: 'outreach@akru-outbound.io',
        sentCount: 890,
        replyCount: 134,
        bounceCount: 8,
        spamCount: 1,
        openRate: 0.31,
      },
    ];
  }
}

/**
 * Real Instantly.ai adapter implementation (stub for future)
 * Would integrate with Instantly.ai API
 */
export class InstantlyAdapter implements IOutboundProvider {
  private apiKey: string;
  private baseUrl = 'https://api.instantly.ai/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async syncReplies(): Promise<SyncReplyData[]> {
    // TODO: Implement real Instantly.ai API call
    throw new Error('Not implemented');
  }

  async syncEnrollments(): Promise<SyncEnrollmentData[]> {
    // TODO: Implement real Instantly.ai API call
    throw new Error('Not implemented');
  }

  async pauseSequence(contactId: string): Promise<boolean> {
    // TODO: Implement real Instantly.ai API call
    throw new Error('Not implemented');
  }

  async getMailboxStats(): Promise<MailboxStats[]> {
    // TODO: Implement real Instantly.ai API call
    throw new Error('Not implemented');
  }
}
