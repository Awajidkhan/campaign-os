export const dynamic = "force-dynamic";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TierBadge } from "@/components/shared/tier-badge";
import { StageBadge } from "@/components/shared/stage-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Mail, Phone, MapPin, Link2, Shield, CheckCircle2, XCircle,
  AlertTriangle, ArrowRight, MessageSquare, StickyNote, ListTodo,
  ArrowUpRight, Zap, Clock, User, Building2, Target, BarChart3,
  Send, Inbox, CalendarDays,
} from "lucide-react";

// Verification badge mapping
const verificationVariants: Record<string, { variant: "success" | "destructive" | "warning" | "default" | "secondary"; icon: typeof CheckCircle2 }> = {
  VALID: { variant: "success", icon: CheckCircle2 },
  INVALID: { variant: "destructive", icon: XCircle },
  RISKY: { variant: "warning", icon: AlertTriangle },
  UNVERIFIED: { variant: "secondary", icon: Shield },
  CATCH_ALL: { variant: "warning", icon: AlertTriangle },
  DISPOSABLE: { variant: "destructive", icon: XCircle },
  UNKNOWN: { variant: "secondary", icon: Shield },
};

// Timeline event type config
const timelineConfig: Record<string, { icon: string; color: string; bg: string }> = {
  stage_change: { icon: "→", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30" },
  outbound_message: { icon: "↑", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30" },
  inbound_message: { icon: "↓", color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-900/30" },
  reply_classified: { icon: "⚡", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/30" },
  task: { icon: "✓", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-100 dark:bg-orange-900/30" },
  note: { icon: "✎", color: "text-slate-600 dark:text-slate-400", bg: "bg-slate-100 dark:bg-slate-800" },
  enrollment: { icon: "⚡", color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-100 dark:bg-indigo-900/30" },
};

interface ContactDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ContactDetailPage({ params }: ContactDetailPageProps) {
  const { id } = await params;

  const contact = await prisma.contact.findUnique({
    where: { id },
    include: {
      account: true,
      owner: true,
      pipelineRecord: true,
      stageHistory: { orderBy: { movedAt: "desc" }, take: 30 },
      messages: { orderBy: { createdAt: "desc" }, take: 30, include: { mailbox: { select: { senderName: true } } } },
      tasks: { orderBy: { createdAt: "desc" }, take: 20, include: { assignedTo: true, createdBy: true } },
      contactNotes: { orderBy: { createdAt: "desc" }, take: 20, include: { author: true } },
      enrollments: { include: { campaign: true, sequence: true, mailbox: true }, orderBy: { enrolledAt: "desc" }, take: 10 },
      replyEvents: { orderBy: { receivedAt: "desc" }, take: 20 },
      tags: { include: { tag: true } },
      verifications: { orderBy: { verifiedAt: "desc" }, take: 5 },
    },
  });

  if (!contact) {
    notFound();
  }

  // ── Build unified timeline ──
  interface TimelineEvent {
    id: string;
    type: string;
    timestamp: Date;
    title: string;
    description: string;
    meta?: string;
    actor?: string;
  }

  const timeline: TimelineEvent[] = [];

  // Stage changes
  contact.stageHistory.forEach((entry) => {
    timeline.push({
      id: `stage-${entry.id}`,
      type: "stage_change",
      timestamp: entry.movedAt,
      title: entry.fromStage
        ? `${entry.fromStage.replace(/_/g, " ")} → ${entry.toStage.replace(/_/g, " ")}`
        : `Entered ${entry.toStage.replace(/_/g, " ")}`,
      description: entry.reason || "Stage transition",
    });
  });

  // Messages
  contact.messages.forEach((msg) => {
    const isOutbound = msg.direction === "OUTBOUND";
    timeline.push({
      id: `msg-${msg.id}`,
      type: isOutbound ? "outbound_message" : "inbound_message",
      timestamp: msg.sentAt || msg.receivedAt || msg.createdAt,
      title: isOutbound ? "Email Sent" : "Email Received",
      description: msg.subject || msg.bodyPreview || "(no subject)",
      meta: msg.bodyPreview || undefined,
      actor: isOutbound ? (msg.mailbox?.senderName ?? "AKRU") : contact.fullName,
    });
  });

  // Reply events (classified)
  contact.replyEvents.forEach((reply) => {
    if (reply.category !== "UNCLASSIFIED") {
      timeline.push({
        id: `reply-${reply.id}`,
        type: "reply_classified",
        timestamp: reply.createdAt,
        title: `Classified: ${reply.category.replace(/_/g, " ")}`,
        description: `Confidence: ${Math.round(reply.confidence * 100)}%${reply.sentiment ? ` · Sentiment: ${reply.sentiment}` : ""}`,
        meta: reply.isTriaged ? `Triaged: ${reply.triageAction?.replace(/_/g, " ")}` : "Awaiting triage",
      });
    }
  });

  // Tasks
  contact.tasks.forEach((task) => {
    timeline.push({
      id: `task-${task.id}`,
      type: "task",
      timestamp: task.createdAt,
      title: task.title,
      description: `${task.priority} · ${task.status}${task.assignedTo ? ` · → ${task.assignedTo.firstName}` : ""}`,
      actor: task.createdBy ? `${task.createdBy.firstName}` : undefined,
    });
  });

  // Notes
  contact.contactNotes.forEach((note) => {
    timeline.push({
      id: `note-${note.id}`,
      type: "note",
      timestamp: note.createdAt,
      title: "Note",
      description: note.content,
      actor: note.author.firstName,
    });
  });

  // Enrollments
  contact.enrollments.forEach((enrollment) => {
    timeline.push({
      id: `enroll-${enrollment.id}`,
      type: "enrollment",
      timestamp: enrollment.enrolledAt,
      title: `Enrolled: ${enrollment.campaign.name}`,
      description: `${enrollment.sequence?.name ?? "Direct"} · Step ${enrollment.currentStep} · ${enrollment.status}`,
    });
  });

  // Sort descending by timestamp
  timeline.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const isSendable = contact.emailVerificationStatus === "VALID" && !contact.doNotContact;
  const verConfig = verificationVariants[contact.emailVerificationStatus] ?? verificationVariants.UNKNOWN;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {contact.fullName}
            </h1>
            <TierBadge tier={contact.tier} />
            {contact.pipelineRecord && (
              <StageBadge stage={contact.pipelineRecord.stage as any} />
            )}
          </div>
          {contact.title && (
            <p className="text-sm text-slate-600 dark:text-slate-400">{contact.title}</p>
          )}
          {contact.account && (
            <Link href={`/accounts/${contact.account.id}`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mt-0.5">
              <Building2 className="w-3.5 h-3.5" />
              {contact.account.name}
              {contact.account.aumRange && <span className="text-slate-500"> ({contact.account.aumRange})</span>}
            </Link>
          )}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">Edit</Button>
          <Button size="sm" variant="default">
            <Send className="w-3.5 h-3.5 mr-1" /> Send Email
          </Button>
        </div>
      </div>

      {/* ── Two Column Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN: Info Cards */}
        <div className="lg:col-span-1 space-y-4">

          {/* Contact Information */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <User className="w-4 h-4" /> Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="text-slate-900 dark:text-white break-all">{contact.email}</span>
              </div>
              {contact.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{contact.phone}</span>
                </div>
              )}
              {(contact.city || contact.state || contact.country) && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{[contact.city, contact.state, contact.country].filter(Boolean).join(", ")}</span>
                </div>
              )}
              {contact.linkedinUrl && (
                <div className="flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-slate-400" />
                  <a href={contact.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                    LinkedIn Profile
                  </a>
                </div>
              )}
              {contact.owner && (
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-slate-400" />
                  <span>Owner: <span className="font-medium">{contact.owner.firstName} {contact.owner.lastName}</span></span>
                </div>
              )}
              {contact.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {contact.tags.map((ta) => (
                    <Badge key={ta.id} variant="secondary" className="text-xs">{ta.tag.name}</Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Qualification */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> Qualification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">Fit Score</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{contact.fitScore}/100</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${contact.fitScore >= 80 ? "bg-green-500" : contact.fitScore >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                    style={{ width: `${contact.fitScore}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">Priority Score</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{contact.priorityScore}/100</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${contact.priorityScore >= 80 ? "bg-blue-500" : contact.priorityScore >= 60 ? "bg-amber-500" : "bg-slate-400"}`}
                    style={{ width: `${contact.priorityScore}%` }}
                  />
                </div>
              </div>
              {contact.estimatedAum && (
                <div className="flex justify-between">
                  <span className="text-slate-500 text-xs">Estimated AUM</span>
                  <span className="font-medium text-slate-900 dark:text-white text-xs">{contact.estimatedAum}</span>
                </div>
              )}
              {contact.roleSeniority && (
                <div className="flex justify-between">
                  <span className="text-slate-500 text-xs">Seniority</span>
                  <span className="font-medium text-slate-900 dark:text-white text-xs">{contact.roleSeniority}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Deliverability */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4" /> Deliverability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-xs">Verification</span>
                <Badge variant={verConfig.variant}>{contact.emailVerificationStatus}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-xs">Sendable</span>
                <Badge variant={isSendable ? "success" : "destructive"}>
                  {isSendable ? "Yes" : "No"}
                </Badge>
              </div>
              {contact.doNotContact && (
                <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-700 dark:text-red-300">
                  <span className="font-semibold">Suppressed:</span> {contact.suppressionReason || "Do Not Contact flag set"}
                </div>
              )}
              {contact.verifications.length > 0 && (
                <div className="text-xs text-slate-500 pt-1">
                  Last verified: {contact.verifications[0].verifiedAt.toLocaleDateString()} via {contact.verifications[0].provider}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Enrollments */}
          {contact.enrollments.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Enrollments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {contact.enrollments.map((e) => (
                  <div key={e.id} className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-slate-900 dark:text-white">{e.campaign.name}</span>
                      <Badge variant={e.status === "ACTIVE" ? "success" : e.status === "REPLIED" ? "default" : "secondary"} className="text-xs">
                        {e.status}
                      </Badge>
                    </div>
                    <p className="text-slate-500">
                      {e.sequence?.name ?? "Direct"} · Step {e.currentStep}/{e.sequence?.steps ?? "?"}
                      {e.mailbox && ` · via ${e.mailbox.email}`}
                    </p>
                    <p className="text-slate-400 mt-0.5">
                      Enrolled {e.enrolledAt.toLocaleDateString()}
                      {e.completedAt && ` · Completed ${e.completedAt.toLocaleDateString()}`}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT COLUMN: Timeline */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Timeline
                </CardTitle>
                <span className="text-xs text-slate-500">{timeline.length} events</span>
              </div>
              <CardDescription>All activity for this contact, most recent first</CardDescription>
            </CardHeader>
            <CardContent>
              {timeline.length === 0 ? (
                <p className="text-sm text-slate-600 dark:text-slate-400 py-4 text-center">
                  No activity recorded yet
                </p>
              ) : (
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-3.5 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700" />

                  <div className="space-y-4">
                    {timeline.map((event, i) => {
                      const config = timelineConfig[event.type] ?? timelineConfig.note;

                      // Group header: show date separators
                      const prevEvent = i > 0 ? timeline[i - 1] : null;
                      const showDate = !prevEvent || event.timestamp.toDateString() !== prevEvent.timestamp.toDateString();

                      return (
                        <div key={event.id}>
                          {showDate && (
                            <div className="flex items-center gap-3 mb-3 ml-8">
                              <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                {isToday(event.timestamp)
                                  ? "Today"
                                  : isYesterday(event.timestamp)
                                  ? "Yesterday"
                                  : event.timestamp.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                              </span>
                            </div>
                          )}

                          <div className="flex gap-3 relative">
                            {/* Icon dot */}
                            <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold z-10 ${config.bg} ${config.color}`}>
                              {config.icon}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 pb-1">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                                    {event.title}
                                  </p>
                                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 whitespace-pre-wrap">
                                    {event.description.length > 200
                                      ? `${event.description.substring(0, 200)}...`
                                      : event.description}
                                  </p>
                                  {event.meta && (
                                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 italic">
                                      {event.meta.length > 150 ? `${event.meta.substring(0, 150)}...` : event.meta}
                                    </p>
                                  )}
                                </div>
                                <span className="text-xs text-slate-400 flex-shrink-0 mt-0.5">
                                  {event.timestamp.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                                </span>
                              </div>
                              {event.actor && (
                                <p className="text-xs text-slate-400 mt-1">
                                  by {event.actor}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

function isYesterday(date: Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
}
