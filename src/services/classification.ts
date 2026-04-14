import { ReplyCategory } from '@prisma/client';

/**
 * Reply classification result structure
 */
export interface ClassificationResult {
  category: ReplyCategory;
  confidence: number; // 0-1
  urgency: string;
  sentiment: string;
}

/**
 * Keyword maps for rule-based classification
 * Exported for potential AI classification swap-in later
 */
export const CLASSIFICATION_KEYWORDS = {
  HOT_MEETING_REQUEST: {
    keywords: [
      'when can we meet',
      'call this week',
      'schedule a call',
      'available for a call',
      'want to discuss',
      'time to talk',
      'let\'s connect',
      'interested in learning',
      'can we hop on',
      'quick call',
      'let\'s chat',
      'want to learn more',
    ],
    patterns: [/when\s+(can|could|would)\s+we\s+(meet|talk|call|discuss)/i],
  },
  HOT_INTEREST: {
    keywords: [
      'very interested',
      'sounds great',
      'impressed',
      'love this',
      'perfect fit',
      'exactly what we need',
      'this is great',
      'very relevant',
      'great timing',
      'definitely interested',
      'excellent',
      'fantastic',
    ],
    patterns: [/\b(very\s+interested|sounds\s+great|perfect\s+fit)\b/i],
  },
  WARM_TIMING: {
    keywords: [
      'maybe next quarter',
      'timing is off',
      'interested but',
      'not right now',
      'different timing',
      'could be interesting',
      'potentially interested',
      'in a few months',
      'future opportunity',
      'revisit later',
    ],
    patterns: [/\b(timing|next\s+quarter|later|future)\b/i],
  },
  WARM_QUESTION: {
    keywords: [
      'how does it work',
      'tell me more',
      'what\'s the cost',
      'pricing',
      'more information',
      'how does this help',
      'can you explain',
      'what is',
      'how is this different',
      'some questions',
      'curious about',
    ],
    patterns: [/\b(how|what|tell me|more info|pricing|cost)\b/i],
  },
  REFERRAL: {
    keywords: [
      'you should talk to',
      'would be interested',
      'colleague who might',
      'someone you should know',
      'refer you to',
      'know someone',
      'pass this along',
      'forward to',
      'introduce you to',
      'connected with',
    ],
    patterns: [/\b(refer|introduce|colleague|know someone|should\s+talk\s+to)\b/i],
  },
  NEGATIVE_NOT_INTERESTED: {
    keywords: [
      'not interested',
      'not a fit',
      'not for us',
      'no thanks',
      'not right now',
      'not in the market',
      'not applicable',
      'doesn\'t apply',
      'can\'t use',
    ],
    patterns: [/\b(not\s+interested|no\s+thanks|not\s+for\s+us)\b/i],
  },
  NEGATIVE_HOSTILE: {
    keywords: [
      'stop emailing',
      'unsubscribe',
      'remove me',
      'stop contacting',
      'cease all',
      'do not contact',
      'don\'t email me',
      'harassment',
      'spam',
      'scam',
      'waste of time',
      'pathetic',
      'disgusting',
    ],
    patterns: [/\b(stop\s+emailing|remove me|unsubscribe|harassment|scam)\b/i],
  },
  OUT_OF_OFFICE: {
    keywords: [
      'out of office',
      'out of town',
      'vacation',
      'sabbatical',
      'on leave',
      'back on',
      'returning on',
      'auto-reply',
      'away',
      'will respond',
    ],
    patterns: [/\b(out\s+of\s+office|vacation|away|auto-reply)\b/i],
  },
  BOUNCE: {
    keywords: [
      'undeliverable',
      'mailbox full',
      'user unknown',
      'address rejected',
      'delivery failed',
      'bounce',
      'invalid email',
    ],
    patterns: [/\b(undeliverable|mailbox\s+full|user\s+unknown|invalid\s+email|bounce)\b/i],
  },
};

/**
 * Rule-based classification of reply based on subject and body
 * Returns category, confidence, urgency, and sentiment
 */
export function classifyReply(subject: string = '', body: string = ''): ClassificationResult {
  const text = `${subject} ${body}`.toLowerCase();

  // Score each category
  const scores: Record<ReplyCategory, number> = {
    [ReplyCategory.HOT_MEETING_REQUEST]: 0,
    [ReplyCategory.HOT_INTEREST]: 0,
    [ReplyCategory.WARM_TIMING]: 0,
    [ReplyCategory.WARM_QUESTION]: 0,
    [ReplyCategory.REFERRAL]: 0,
    [ReplyCategory.NEGATIVE_NOT_INTERESTED]: 0,
    [ReplyCategory.NEGATIVE_HOSTILE]: 0,
    [ReplyCategory.OUT_OF_OFFICE]: 0,
    [ReplyCategory.BOUNCE]: 0,
    [ReplyCategory.UNCLASSIFIED]: 0,
  };

  // Check each category
  Object.entries(CLASSIFICATION_KEYWORDS).forEach(([categoryStr, data]) => {
    const category = categoryStr as keyof typeof CLASSIFICATION_KEYWORDS;
    const categoryKey = category.toUpperCase() as ReplyCategory;

    // Keyword matches
    const keywordMatches = data.keywords.filter((keyword) => text.includes(keyword.toLowerCase())).length;
    scores[categoryKey] += keywordMatches * 2;

    // Pattern matches
    const patternMatches = data.patterns.filter((pattern) => pattern.test(text)).length;
    scores[categoryKey] += patternMatches * 3;
  });

  // Determine winning category
  let maxScore = 0;
  let winningCategory: ReplyCategory = ReplyCategory.UNCLASSIFIED;

  (Object.entries(scores) as [ReplyCategory, number][]).forEach(([category, score]) => {
    if (score > maxScore) {
      maxScore = score;
      winningCategory = category;
    }
  });

  // Calculate confidence (0-1 scale, normalized to max 10 points)
  const confidence = Math.min(maxScore / 10, 1);

  // Determine urgency based on category
  const urgencyMap: Record<ReplyCategory, string> = {
    [ReplyCategory.HOT_MEETING_REQUEST]: 'critical',
    [ReplyCategory.HOT_INTEREST]: 'high',
    [ReplyCategory.WARM_TIMING]: 'medium',
    [ReplyCategory.WARM_QUESTION]: 'medium',
    [ReplyCategory.REFERRAL]: 'high',
    [ReplyCategory.NEGATIVE_NOT_INTERESTED]: 'low',
    [ReplyCategory.NEGATIVE_HOSTILE]: 'critical',
    [ReplyCategory.OUT_OF_OFFICE]: 'low',
    [ReplyCategory.BOUNCE]: 'low',
    [ReplyCategory.UNCLASSIFIED]: 'low',
  };

  // Determine sentiment
  const sentiment = determineSentiment(text, winningCategory);

  return {
    category: winningCategory,
    confidence,
    urgency: urgencyMap[winningCategory],
    sentiment,
  };
}

/**
 * Determine sentiment of the reply
 */
function determineSentiment(text: string, category: ReplyCategory): string {
  // Hostile is always negative
  if (category === ReplyCategory.NEGATIVE_HOSTILE) {
    return 'negative';
  }

  // Not interested is negative
  if (category === ReplyCategory.NEGATIVE_NOT_INTERESTED) {
    return 'negative';
  }

  // Meeting request and hot interest are positive
  if (category === ReplyCategory.HOT_MEETING_REQUEST || category === ReplyCategory.HOT_INTEREST) {
    return 'positive';
  }

  // Warm categories are neutral to positive
  if (category === ReplyCategory.WARM_TIMING || category === ReplyCategory.WARM_QUESTION) {
    return 'neutral';
  }

  // Referral is positive
  if (category === ReplyCategory.REFERRAL) {
    return 'positive';
  }

  // Out of office and bounce are neutral
  if (category === ReplyCategory.OUT_OF_OFFICE || category === ReplyCategory.BOUNCE) {
    return 'neutral';
  }

  return 'neutral';
}
