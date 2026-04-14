import { VerificationStatus } from '@prisma/client';

/**
 * Email verification result
 */
export interface VerificationResult {
  email: string;
  status: VerificationStatus;
  confidence?: number;
  details?: {
    isDisposable?: boolean;
    isCatchAll?: boolean;
    isDomainValid?: boolean;
    smtpValid?: boolean;
  };
}

/**
 * Interface for email verification provider (ZeroBounce, NeverBounce, etc.)
 */
export interface IVerificationProvider {
  /**
   * Verify a single email
   */
  verifyEmail(email: string): Promise<VerificationResult>;

  /**
   * Verify a batch of emails
   */
  verifyBatch(emails: string[]): Promise<VerificationResult[]>;
}

/**
 * Mock implementation of email verification adapter for development
 */
export class MockVerificationAdapter implements IVerificationProvider {
  async verifyEmail(email: string): Promise<VerificationResult> {
    // Mock: simple pattern-based validation
    if (!email.includes('@')) {
      return {
        email,
        status: VerificationStatus.INVALID,
        confidence: 1.0,
      };
    }

    const domain = email.split('@')[1].toLowerCase();

    // Mark some domains as disposable
    if (
      domain.includes('tempmail') ||
      domain.includes('10minutemail') ||
      domain.includes('throwaway')
    ) {
      return {
        email,
        status: VerificationStatus.DISPOSABLE,
        confidence: 0.95,
        details: {
          isDisposable: true,
          isCatchAll: false,
          isDomainValid: true,
          smtpValid: false,
        },
      };
    }

    // Mock some as catch-all
    if (domain === 'catchall.com') {
      return {
        email,
        status: VerificationStatus.CATCH_ALL,
        confidence: 0.9,
        details: {
          isDisposable: false,
          isCatchAll: true,
          isDomainValid: true,
          smtpValid: true,
        },
      };
    }

    // Mock some as risky
    if (domain === 'risky.com') {
      return {
        email,
        status: VerificationStatus.RISKY,
        confidence: 0.85,
        details: {
          isDisposable: false,
          isCatchAll: false,
          isDomainValid: true,
          smtpValid: false,
        },
      };
    }

    // Default: valid
    return {
      email,
      status: VerificationStatus.VALID,
      confidence: 0.95,
      details: {
        isDisposable: false,
        isCatchAll: false,
        isDomainValid: true,
        smtpValid: true,
      },
    };
  }

  async verifyBatch(emails: string[]): Promise<VerificationResult[]> {
    // Mock: verify each email
    return Promise.all(emails.map((email) => this.verifyEmail(email)));
  }
}

/**
 * ZeroBounce adapter implementation (stub for future)
 * Would integrate with ZeroBounce API
 */
export class ZeroBounceAdapter implements IVerificationProvider {
  private apiKey: string;
  private baseUrl = 'https://api.zerobounce.net/v2';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async verifyEmail(email: string): Promise<VerificationResult> {
    // TODO: Implement real ZeroBounce API call
    throw new Error('Not implemented');
  }

  async verifyBatch(emails: string[]): Promise<VerificationResult[]> {
    // TODO: Implement real ZeroBounce API call
    throw new Error('Not implemented');
  }
}

/**
 * NeverBounce adapter implementation (stub for future)
 * Would integrate with NeverBounce API
 */
export class NeverBounceAdapter implements IVerificationProvider {
  private apiKey: string;
  private baseUrl = 'https://api.neverbounce.com/v2';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async verifyEmail(email: string): Promise<VerificationResult> {
    // TODO: Implement real NeverBounce API call
    throw new Error('Not implemented');
  }

  async verifyBatch(emails: string[]): Promise<VerificationResult[]> {
    // TODO: Implement real NeverBounce API call
    throw new Error('Not implemented');
  }
}
