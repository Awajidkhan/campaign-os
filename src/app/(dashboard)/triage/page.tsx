export const dynamic = "force-dynamic";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SLATimer } from "@/components/shared/sla-timer";
import { TierBadge } from "@/components/shared/tier-badge";
import { getPrisma } from "@/lib/prisma";
import Link from "next/link";
import {
  ArrowUpRight, CheckCircle2, Ban, Pause, Plus, Zap,
  UserCheck, AlertTriangle, Clock, Inbox, Filter,
} from "lucide-react";

// SLA minutes per category (matches service/sla.ts)
const SLA_MINUTES: Record<string, number> = {
  HOT_MEETING_REQUEST: 120,
  HOT_INTEREST: 240,
  REFERRAL: 240,
  WARM_QUESTION: 720,
  WARM_TIMING: 1440,
  NEGATIVE_NOT_INTERESTED: 1440,
  NEGATIVE_HOSTILE: 0,
  OUT_OF_OFFICE: 0,
  BOUNCE: 0,
  UNCLASSIFIED: 1440,
};

// Category display config
const categoryConfig: Record<string, {
  label: string;
  short: string;
  border: string;
  bg: string;
  badgeVariant: "destructive" | "warning" | "default" | "secondary" | "success";
  owner: string;
  priority: number; // lower = more urgent
}> = {
  HOT_MEETING_REQUEST: { label: "Hot Meeting Request", short: "Meeting", border: "border-red-300 dark:border-red-700", bg: "bg-red-50 dark:bg-red-900/10", badgeVariant: "destructive", owner: "Mohsin", priority: 1 },
  HOT_INTEREST: { label: "Hot Interest", short: "Interest", border: "border-red-200 dark:border-red-800", bg: "bg-red-50/50 dark:bg-red-900/5", badgeVariant: "destructive", owner: "Mohsin", priority: 2 },
  REFERRAL: { label: "Referral", short: "Referral", border: "border-blue-300 dark:border-blue-700", bg: "bg-blue-50 dark:bg-blue-900/10", badgeVariant: "default", owner: "Mohsin", priority: 3 },
  WARM_QUESTION: { label: "Warm — Question", short: "Question", border: "border-amber-300 dark:border-amber-700", bg: "bg-amber-50 dark:bg-amber-900/10", badgeVariant: "warning", owner: "Sena/Jawad", priority: 4 },
  WARM_TIMING: { label: "Warm — Timing", short: "Timing", border: "border-amber-200 dark:border-amber-800", bg: "bg-amber-50/50 dark:bg-amber-900/5", badgeVariant: "warning", owner: "Sena/Jawad", priority: 5 },
  NEGATIVE_NOT_INTERESTED: { label: "Not Interested", short: "Not Interested", border: "border-slate-300 dark:border-slate-600", bg: "bg-slate-50 dark:bg-slate-800/50", badgeVariant: "secondary", owner: "Auto", priority: 6 },
  NEGATIVE_HOSTILE: { label: "Hostile", short: "Hostile", border: "border-red-400 dark:border-red-600", bg: "bg-red-100 dark:bg-red-900/20", badgeVariant: "destructive", owner: "Auto", priority: 7 },
  OUT_OF_OFFICE: { label: "Out of Office", short: "OOO", border: "border-blue-200 dark:border-blue-800", bg: "bg-blue-50/50 dark:bg-blue-900/5", badgeVariant: "secondary", owner: "Auto", priority: 8 },
  BOUNCE: { label: "Bounce", short: "Bounce", border: "border-slate-300 dark:border-slate-600", bg: "bg-slate-50 dark:bg-slate-800/50", badgeVariant: "secondary", owner: "Auto", priority: 9 },
  UNCLASSIFIED: { label: "Unclassified", short: "Unclassified", border: "border-slate-300 dark:border-slate-600", bg: "bg-slate-50 dark:bg-slate-800/50", badgeVariant: "secondary", owner: "Sena", priority: 10 },
};

function computeSLADeadline(category: string, receivedAt: Date): Date {
  const minutes = SLA_MINUTES[category] ?? 1440;
  return new Date(new Date(receivedAt).getTime() + minutes * 60 * 1000);
}

export default async function TriagePage() {
  const prisma = getPrisma();
  const [untriaged, recentTriaged, templates, categoryCounts] = await Promise.all([
    prisma.replyEvent.findMany({
      where: { isTriaged: false },
      include: {
        contact: {
          select: {
            id: true, fullName: true, email: true, tier: true, fitScore: true,
            owner: { select: { firstName: true } },
            account: { select: { name: true, aumRange: true } },
            pipelineRecord: { select: { stage: true } },
          },
        },
        message: { select: { id: true, direction: true, subject: true } },
      },
      orderBy: { receivedAt: "asc" }, // oldest first (most urgent SLA)
    }),
    prisma.replyEvent.findMany({
      where: { isTriaged: true },
      include: {
        contact: { select: { id: true, fullName: true, email: true, tier: true, account: { select: { name: true } } } },
        triagedBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { triagedAt: "desc" },
      take: 15,
    }),
    prisma.responseTemplate.findMany({ where: { isActive: true } }),
    prisma.replyEvent.groupBy({
      by: ["category"],
      where: { isTriaged: false },
      _count: true,
    }),
  ]);

  // Sort untriaged by priority (hot first, then SLA urgency)
  const sortedUntriaged = [...untriaged].sort((a, b) => {
    const aPriority = categoryConfig[a.category]?.priority ?? 10;
    const bPriority = categoryConfig[b.category]?.priority ?? 10;
    if (aPriority !== bPriority) return aPriority - bPriority;
    // Same category priority → sort by SLA deadline (most urgent first)
    const aDeadline = computeSLADeadline(a.category, a.receivedAt);
    const bDeadline = computeSLADeadline(b.category, b.receivedAt);
    return aDeadline.getTime() - bDeadline.getTime();
  });

  // Build template lookup
  const templateByCategory = new Map<string, typeof templates[0]>();
  templates.forEach((t) => {
    if (!templateByCategory.has(t.category)) {
      templateByCategory.set(t.category, t);
    }
  });

  // Summary counts
  const hotCount = categoryCounts.filter((c) => ["HOT_MEETING_REQUEST", "HOT_INTEREST", "REFERRAL"].includes(c.category)).reduce((s, c) => s + c._count, 0);
  const warmCount = categoryCounts.filter((c) => ["WARM_QUESTION", "WARM_TIMING"].includes(c.category)).reduce((s, c) => s + c._count, 0);
  const otherCount = categoryCounts.filter((c) => !["HOT_MEETING_REQUEST", "HOT_INTEREST", "REFERRAL", "WARM_QUESTION", "WARM_TIMING"].includes(c.category)).reduce((s, c) => s + c._count, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Inbox className="w-6 h-6" />
            Reply Triage
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {sortedUntriaged.length === 0
              ? "All caught up — no replies awaiting triage"
              : `${sortedUntriaged.length} ${sortedUntriaged.length === 1 ? "reply" : "replies"} awaiting triage`}
          </p>
        </div>

        {/* Category summary pills */}
        {sortedUntriaged.length > 0 && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {hotCount > 0 && (
              <div className="flex items-center gap-1 px-2.5 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-xs font-semibold">
                <AlertTriangle className="w-3 h-3" /> {hotCount} hot
              </div>
            )}
            {warmCount > 0 && (
              <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-xs font-semibold">
                <Clock className="w-3 h-3" /> {warmCount} warm
              </div>
            )}
            {otherCount > 0 && (
              <div className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-xs font-semibold">
                {otherCount} other
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── All Clear ── */}
      {sortedUntriaged.length === 0 && (
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700">
          <CardContent className="pt-6 pb-5 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            <div>
              <p className="font-medium text-green-900 dark:text-green-100">
                All replies have been triaged
              </p>
              <p className="text-sm text-green-800 dark:text-green-200 mt-0.5">
                {recentTriaged.length > 0 ? `${recentTriaged.length} triaged recently` : "No new replies"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Untriaged Queue ── */}
      <div className="space-y-4">
        {sortedUntriaged.map((reply) => {
          const config = categoryConfig[reply.category] ?? categoryConfig.UNCLASSIFIED;
          const slaDeadline = computeSLADeadline(reply.category, reply.receivedAt);
          const template = templateByCategory.get(reply.category);
          const isHot = ["HOT_MEETING_REQUEST", "HOT_INTEREST", "REFERRAL"].includes(reply.category);

          return (
            <Card key={reply.id} className={`border-2 ${config.border} ${config.bg}`}>
              <CardContent className="pt-5 pb-4">
                {/* Row 1: Contact info + classification + SLA */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Link href={`/contacts/${reply.contact.id}`} className="text-base font-semibold text-slate-900 dark:text-white hover:underline">
                        {reply.contact.fullName}
                      </Link>
                      <TierBadge tier={reply.contact.tier} />
                      {reply.contact.account && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {reply.contact.account.name}
                          {reply.contact.account.aumRange ? ` (${reply.contact.account.aumRange})` : ""}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {reply.senderEmail}
                      {reply.contact.pipelineRecord && (
                        <span> · Stage: {reply.contact.pipelineRecord.stage.replace(/_/g, " ")}</span>
                      )}
                      {reply.contact.owner && (
                        <span> · Owner: {reply.contact.owner.firstName}</span>
                      )}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <Badge variant={config.badgeVariant}>
                      {config.label}
                    </Badge>
                    <SLATimer deadline={slaDeadline} compact />
                  </div>
                </div>

                {/* Row 2: Reply content */}
                <div className="bg-white dark:bg-slate-900 rounded-lg p-3 mb-3 border border-slate-200 dark:border-slate-700">
                  {reply.subject && (
                    <p className="font-medium text-sm text-slate-900 dark:text-white mb-1">
                      {reply.subject}
                    </p>
                  )}
                  <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                    {reply.bodyFull || reply.bodyPreview || "(no body)"}
                  </p>
                </div>

                {/* Row 3: Metadata */}
                <div className="flex items-center gap-4 mb-3 text-xs text-slate-500 dark:text-slate-400">
                  <span>
                    Received {formatRelativeTime(reply.receivedAt)}
                  </span>
                  {reply.confidence > 0 && (
                    <span>
                      Confidence: {Math.round(reply.confidence * 100)}%
                    </span>
                  )}
                  {reply.sentiment && (
                    <span className={`capitalize ${reply.sentiment === "positive" ? "text-green-600" : reply.sentiment === "negative" ? "text-red-600" : ""}`}>
                      {reply.sentiment}
                    </span>
                  )}
                  <span>SLA: {SLA_MINUTES[reply.category] ?? 1440}min → {config.owner}</span>
                </div>

                {/* Row 4: Suggested template */}
                {template && (
                  <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-3">
                    <p className="text-xs font-semibold text-blue-800 dark:text-blue-200 mb-1.5 flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Suggested Response
                    </p>
                    {template.subject && (
                      <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">
                        Subject: {template.subject}
                      </p>
                    )}
                    <p className="text-xs text-blue-800 dark:text-blue-200 whitespace-pre-wrap leading-relaxed">
                      {template.body}
                    </p>
                  </div>
                )}

                {/* Row 5: One-click actions */}
                <div className="flex flex-wrap gap-2">
                  {isHot && (
                    <Button size="sm" variant="default" className="bg-red-600 hover:bg-red-700 text-white">
                      <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
                      Escalate to Mohsin
                    </Button>
                  )}
                  <Button size="sm" variant="secondary">
                    <UserCheck className="w-3.5 h-3.5 mr-1" />
                    Assign to Sena
                  </Button>
                  <Button size="sm" variant="secondary">
                    <UserCheck className="w-3.5 h-3.5 mr-1" />
                    Assign to Jawad
                  </Button>
                  <Button size="sm" variant="outline">
                    <Pause className="w-3.5 h-3.5 mr-1" />
                    Pause Sequence
                  </Button>
                  <Button size="sm" variant="outline">
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Create Task
                  </Button>
                  {reply.category.startsWith("NEGATIVE") && (
                    <Button size="sm" variant="destructive">
                      <Ban className="w-3.5 h-3.5 mr-1" />
                      {reply.category === "NEGATIVE_HOSTILE" ? "Suppress" : "Unsubscribe"}
                    </Button>
                  )}
                  {(reply.category === "HOT_INTEREST" || reply.category === "WARM_QUESTION") && (
                    <Button size="sm" variant="outline" className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/20">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Convert to Qualified
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Recently Triaged ── */}
      {recentTriaged.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recently Triaged</CardTitle>
            <CardDescription>Last {recentTriaged.length} resolved replies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentTriaged.map((reply) => {
                const config = categoryConfig[reply.category] ?? categoryConfig.UNCLASSIFIED;
                return (
                  <div
                    key={reply.id}
                    className="flex items-center justify-between gap-3 p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Link href={`/contacts/${reply.contact.id}`} className="text-sm font-medium text-slate-900 dark:text-white hover:underline truncate">
                            {reply.contact.fullName}
                          </Link>
                          <Badge variant="secondary" className="text-xs">
                            {config.short}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {reply.contact.account?.name ?? reply.senderEmail} · {reply.triageAction?.replace(/_/g, " ")} · by {reply.triagedBy?.firstName}
                          {reply.triagedAt ? ` · ${formatRelativeTime(reply.triagedAt)}` : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay === 1) return "yesterday";
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
