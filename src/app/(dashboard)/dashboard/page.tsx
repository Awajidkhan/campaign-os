import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SLATimer } from "@/components/shared/sla-timer";
import { StageBadge } from "@/components/shared/stage-badge";
import { TierBadge } from "@/components/shared/tier-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Users, Send, Inbox, AlertTriangle, CheckCircle2, Clock, Mail,
  ArrowUpRight, BarChart3, FileText, Activity,
} from "lucide-react";

// Stage colors for pipeline bar
const stageColors: Record<string, string> = {
  IDENTIFIED: "bg-slate-400",
  CONTACTED: "bg-blue-500",
  ENGAGED: "bg-cyan-500",
  QUALIFIED: "bg-amber-500",
  DEMO_SCHEDULED: "bg-orange-500",
  PROPOSAL: "bg-purple-500",
  CLOSED_WON: "bg-green-600",
  CLOSED_LOST: "bg-red-500",
};

const stageLabels: Record<string, string> = {
  IDENTIFIED: "Identified",
  CONTACTED: "Contacted",
  ENGAGED: "Engaged",
  QUALIFIED: "Qualified",
  DEMO_SCHEDULED: "Demo Scheduled",
  PROPOSAL: "Proposal",
  CLOSED_WON: "Closed Won",
  CLOSED_LOST: "Closed Lost",
};

export default async function DashboardPage() {
  const [
    totalContacts,
    sendableContacts,
    activeEnrollments,
    untriagedReplies,
    overdueTasks,
    openTasks,
    pendingContent,
    recentActivity,
    stageDistribution,
    mailboxStats,
    tierCounts,
    hotTasks,
    untriagedHot,
  ] = await Promise.all([
    prisma.contact.count({ where: { deletedAt: null } }),
    prisma.contact.count({
      where: { emailVerificationStatus: "VALID", doNotContact: false, deletedAt: null },
    }),
    prisma.sequenceEnrollment.count({ where: { status: "ACTIVE" } }),
    prisma.replyEvent.count({ where: { isTriaged: false } }),
    prisma.task.count({
      where: { status: { in: ["OPEN", "IN_PROGRESS"] }, dueAt: { lt: new Date() } },
    }),
    prisma.task.count({
      where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
    }),
    prisma.contentItem.count({ where: { status: "PENDING_APPROVAL" } }),
    prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
      include: { user: true },
    }),
    prisma.pipelineRecord.groupBy({
      by: ["stage"],
      _count: true,
    }),
    prisma.mailbox.findMany({
      where: { isActive: true },
      select: {
        id: true, email: true, senderName: true,
        sentCount: true, replyCount: true, bounceCount: true, spamCount: true,
        openRate: true, warmupStatus: true, isActive: true, dailyMax: true,
        alertBounceRate: true, alertSpamMax: true,
      },
    }),
    prisma.contact.groupBy({
      by: ["tier"],
      where: { deletedAt: null },
      _count: true,
    }),
    // Urgent/overdue tasks for the red alert section
    prisma.task.findMany({
      where: {
        status: { in: ["OPEN", "IN_PROGRESS"] },
        priority: { in: ["URGENT", "HIGH"] },
      },
      include: {
        contact: { select: { id: true, fullName: true, tier: true } },
        assignedTo: { select: { firstName: true, lastName: true } },
      },
      orderBy: { dueAt: "asc" },
      take: 6,
    }),
    // Untriaged hot replies
    prisma.replyEvent.findMany({
      where: {
        isTriaged: false,
        category: { in: ["HOT_MEETING_REQUEST", "HOT_INTEREST", "REFERRAL"] },
      },
      include: {
        contact: { select: { id: true, fullName: true, tier: true, account: { select: { name: true } } } },
      },
      orderBy: { receivedAt: "asc" },
      take: 5,
    }),
  ]);

  const totalInPipeline = stageDistribution.reduce((sum, s) => sum + s._count, 0);
  const stagePercentages = stageDistribution
    .sort((a, b) => {
      const order = ["IDENTIFIED", "CONTACTED", "ENGAGED", "QUALIFIED", "DEMO_SCHEDULED", "PROPOSAL", "CLOSED_WON", "CLOSED_LOST"];
      return order.indexOf(a.stage) - order.indexOf(b.stage);
    })
    .map((s) => ({
      stage: s.stage,
      count: s._count,
      pct: totalInPipeline > 0 ? Math.round((s._count / totalInPipeline) * 100) : 0,
    }));

  const tierA = tierCounts.find((t) => t.tier === "A")?._count ?? 0;
  const tierB = tierCounts.find((t) => t.tier === "B")?._count ?? 0;
  const tierC = tierCounts.find((t) => t.tier === "C")?._count ?? 0;

  // Compute action icon/color for activity
  function activityIcon(action: string) {
    if (action.startsWith("stage.")) return "stage";
    if (action.startsWith("reply.")) return "reply";
    if (action.startsWith("message.")) return "message";
    if (action.startsWith("task.")) return "task";
    if (action.startsWith("contact.")) return "contact";
    if (action.startsWith("mailbox.")) return "mailbox";
    if (action.startsWith("proposal.")) return "proposal";
    if (action.startsWith("sequence.")) return "sequence";
    return "other";
  }

  const iconColors: Record<string, string> = {
    stage: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    reply: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    message: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    task: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    contact: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
    mailbox: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
    proposal: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    sequence: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    other: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            AKRU Campaign Operating System
          </p>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </div>
      </div>

      {/* ── Hot Alert: Untriaged Hot Replies ── */}
      {untriagedHot.length > 0 && (
        <Card className="border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <h3 className="font-semibold text-red-900 dark:text-red-100">
                {untriagedHot.length} hot {untriagedHot.length === 1 ? "reply" : "replies"} awaiting triage
              </h3>
              <Link href="/triage" className="ml-auto text-xs font-medium text-red-700 dark:text-red-300 hover:underline flex items-center gap-1">
                Open Triage <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {untriagedHot.map((reply) => (
                <div
                  key={reply.id}
                  className="flex items-center justify-between gap-4 p-3 bg-white dark:bg-slate-800 rounded-lg"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900 dark:text-white text-sm truncate">
                          {reply.contact.fullName}
                        </span>
                        {reply.contact.tier && <TierBadge tier={reply.contact.tier} />}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate mt-0.5">
                        {reply.contact.account?.name ?? "No account"} — {reply.subject}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant={reply.category === "HOT_MEETING_REQUEST" ? "destructive" : reply.category === "REFERRAL" ? "default" : "warning"}>
                      {reply.category === "HOT_MEETING_REQUEST" ? "Meeting Request" : reply.category === "HOT_INTEREST" ? "Hot Interest" : "Referral"}
                    </Badge>
                    <SLATimer deadline={reply.receivedAt} compact />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Metrics Grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Link href="/contacts">
          <Card className="hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-slate-500">contacts</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalContacts}</div>
              <p className="text-xs text-slate-500 mt-1">{sendableContacts} sendable</p>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-4 h-4 text-slate-600" />
              <span className="text-xs text-slate-500">tiers</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-bold text-red-600">{tierA}A</span>
              <span className="text-sm font-bold text-amber-600">{tierB}B</span>
              <span className="text-sm font-bold text-slate-500">{tierC}C</span>
            </div>
          </CardContent>
        </Card>

        <Link href="/campaigns">
          <Card className="hover:border-green-300 dark:hover:border-green-700 transition-colors cursor-pointer">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between mb-2">
                <Send className="w-4 h-4 text-green-600" />
                <span className="text-xs text-slate-500">enrolled</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{activeEnrollments}</div>
              <p className="text-xs text-slate-500 mt-1">active sequences</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/triage">
          <Card className={`hover:border-purple-300 dark:hover:border-purple-700 transition-colors cursor-pointer ${untriagedReplies > 0 ? "border-purple-300 dark:border-purple-700" : ""}`}>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between mb-2">
                <Inbox className="w-4 h-4 text-purple-600" />
                <span className="text-xs text-slate-500">triage</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">{untriagedReplies}</div>
              <p className="text-xs text-slate-500 mt-1">untriaged replies</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/tasks">
          <Card className={`hover:border-red-300 dark:hover:border-red-700 transition-colors cursor-pointer ${overdueTasks > 0 ? "border-red-300 dark:border-red-700" : ""}`}>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-4 h-4 text-red-600" />
                <span className="text-xs text-slate-500">tasks</span>
              </div>
              <div className="text-2xl font-bold text-red-600">{overdueTasks}</div>
              <p className="text-xs text-slate-500 mt-1">overdue / {openTasks} open</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/content">
          <Card className="hover:border-orange-300 dark:hover:border-orange-700 transition-colors cursor-pointer">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between mb-2">
                <FileText className="w-4 h-4 text-orange-600" />
                <span className="text-xs text-slate-500">content</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">{pendingContent}</div>
              <p className="text-xs text-slate-500 mt-1">pending approval</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* ── Two-Column Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT: Pipeline + Mailbox Health */}
        <div className="lg:col-span-2 space-y-6">

          {/* Pipeline Stage Distribution */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Pipeline</CardTitle>
                <Link href="/pipeline" className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                  View all <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {/* Horizontal stacked bar */}
              <div className="flex w-full h-6 rounded-full overflow-hidden mb-4">
                {stagePercentages.map((s) =>
                  s.pct > 0 ? (
                    <div
                      key={s.stage}
                      className={`${stageColors[s.stage] || "bg-slate-400"} transition-all`}
                      style={{ width: `${Math.max(s.pct, 3)}%` }}
                      title={`${stageLabels[s.stage]}: ${s.count} (${s.pct}%)`}
                    />
                  ) : null
                )}
              </div>

              {/* Legend grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {stagePercentages.map((s) => (
                  <div key={s.stage} className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${stageColors[s.stage] || "bg-slate-400"}`} />
                    <span className="text-xs text-slate-700 dark:text-slate-300">
                      {stageLabels[s.stage]}{" "}
                      <span className="font-semibold">{s.count}</span>
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Urgent / High Priority Tasks */}
          {hotTasks.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Priority Tasks</CardTitle>
                  <Link href="/tasks" className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                    All tasks <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {hotTasks.map((task) => {
                  const isOverdue = new Date(task.dueAt) < new Date();
                  return (
                    <div
                      key={task.id}
                      className={`flex items-start justify-between gap-3 p-3 rounded-lg border ${
                        isOverdue
                          ? "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10"
                          : "border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <PriorityBadge priority={task.priority as any} />
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                            {task.title}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                          {task.contact && (
                            <Link href={`/contacts/${task.contact.id}`} className="hover:underline">
                              {task.contact.fullName}
                            </Link>
                          )}
                          {task.assignedTo && (
                            <span>
                              → {task.assignedTo.firstName} {task.assignedTo.lastName}
                            </span>
                          )}
                        </div>
                      </div>
                      <SLATimer deadline={task.dueAt} compact />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Mailbox Health */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Mailbox Health</CardTitle>
                <Link href="/mailboxes" className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                  Details <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {mailboxStats.map((mb) => {
                  const bounceRate = mb.sentCount > 0 ? mb.bounceCount / mb.sentCount : 0;
                  const hasBounceAlert = bounceRate > mb.alertBounceRate;
                  const hasSpamAlert = mb.spamCount > mb.alertSpamMax;
                  const hasAlert = hasBounceAlert || hasSpamAlert;

                  return (
                    <div
                      key={mb.id}
                      className={`p-3 rounded-lg border ${
                        hasAlert
                          ? "border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-900/10"
                          : "border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {mb.senderName}
                          </p>
                          <p className="text-xs text-slate-500">{mb.email}</p>
                        </div>
                        <Badge
                          variant={
                            mb.warmupStatus === "WARM"
                              ? "success"
                              : mb.warmupStatus === "WARMING"
                              ? "warning"
                              : "secondary"
                          }
                        >
                          {mb.warmupStatus === "WARM" ? "Warm" : mb.warmupStatus === "WARMING" ? "Warming" : mb.warmupStatus}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-1 text-center text-xs">
                        <div>
                          <p className="text-slate-500">Sent</p>
                          <p className="font-semibold text-slate-900 dark:text-white">{mb.sentCount}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Replies</p>
                          <p className="font-semibold text-slate-900 dark:text-white">{mb.replyCount}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Bounce</p>
                          <p className={`font-semibold ${hasBounceAlert ? "text-red-600" : "text-slate-900 dark:text-white"}`}>
                            {(bounceRate * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Spam</p>
                          <p className={`font-semibold ${hasSpamAlert ? "text-red-600" : "text-slate-900 dark:text-white"}`}>
                            {mb.spamCount}
                          </p>
                        </div>
                      </div>
                      {mb.openRate !== null && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-slate-500 mb-1">
                            <span>Open rate</span>
                            <span>{(mb.openRate * 100).toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${mb.openRate >= 0.30 ? "bg-green-500" : mb.openRate >= 0.20 ? "bg-amber-500" : "bg-red-500"}`}
                              style={{ width: `${Math.min(mb.openRate * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Activity Feed */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Activity
                </CardTitle>
                <Link href="/audit" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                  Full log
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <p className="text-sm text-slate-600 dark:text-slate-400">No activity yet</p>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((log) => {
                    const kind = activityIcon(log.action);
                    const details = log.details as Record<string, any> | null;
                    const actionLabel = log.action.replace(".", " → ").replace(/_/g, " ");

                    return (
                      <div key={log.id} className="flex gap-3">
                        <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs ${iconColors[kind]}`}>
                          {kind === "stage" && "→"}
                          {kind === "reply" && "↩"}
                          {kind === "message" && "✉"}
                          {kind === "task" && "✓"}
                          {kind === "contact" && "👤"}
                          {kind === "mailbox" && "📧"}
                          {kind === "proposal" && "📋"}
                          {kind === "sequence" && "⚡"}
                          {kind === "other" && "•"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-900 dark:text-white leading-tight">
                            {actionLabel}
                          </p>
                          {details && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                              {details.from && details.to
                                ? `${details.from} → ${details.to}`
                                : details.category
                                ? details.category.replace(/_/g, " ").toLowerCase()
                                : details.campaign
                                ? details.campaign
                                : details.title
                                ? details.title
                                : details.status
                                ? details.status
                                : null}
                            </p>
                          )}
                          <p className="text-xs text-slate-400 mt-0.5">
                            {log.user ? `${log.user.firstName}` : "System"} ·{" "}
                            {formatRelativeTime(log.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/** Simple relative time formatter (server-side safe) */
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
