import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { StageBadge } from "@/components/shared/stage-badge";
import { TierBadge } from "@/components/shared/tier-badge";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const stageOrder: Record<string, number> = {
  IDENTIFIED: 0,
  CONTACTED: 1,
  ENGAGED: 2,
  QUALIFIED: 3,
  DEMO_SCHEDULED: 4,
  PROPOSAL: 5,
  CLOSED_WON: 6,
  CLOSED_LOST: 7,
};

export default async function PipelineViewPage() {
  const pipelineRecords = await prisma.pipelineRecord.findMany({
    include: {
      contact: {
        include: {
          account: { select: { name: true } },
          owner: { select: { firstName: true, lastName: true } },
          stageHistory: {
            orderBy: { movedAt: "desc" },
            take: 1,
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
    orderBy: { stage: "asc" },
  });

  // Group by stage
  const stageGroups = pipelineRecords.reduce(
    (acc, record) => {
      const stage = record.stage;
      if (!acc[stage]) {
        acc[stage] = [];
      }
      acc[stage].push(record);
      return acc;
    },
    {} as Record<string, typeof pipelineRecords>
  );

  // Sort stages
  const sortedStages = Object.keys(stageGroups).sort(
    (a, b) => (stageOrder[a] || 99) - (stageOrder[b] || 99)
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Pipeline View
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          {pipelineRecords.length} contacts across {sortedStages.length} stages
        </p>
      </div>

      {/* Pipeline Stages */}
      <div className="space-y-6">
        {sortedStages.map((stage) => {
          const records = stageGroups[stage];
          const stageNum = stageOrder[stage] || 99;

          return (
            <div key={stage} className="space-y-2">
              {/* Stage Header */}
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {stage}
                </h2>
                <Badge variant="secondary" className="px-3">
                  {records.length}
                </Badge>
                {stageNum >= 3 && (
                  <Badge variant="success" className="px-2 text-xs">
                    Sales Qualified
                  </Badge>
                )}
              </div>

              {/* Stage Contacts */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {records.map((record) => {
                  const contact = record.contact;
                  const lastMessage = contact.messages?.[0];
                  const lastStageMove = contact.stageHistory?.[0];

                  const daysInStage = lastStageMove
                    ? Math.floor(
                        (new Date().getTime() - lastStageMove.movedAt.getTime()) /
                          (1000 * 60 * 60 * 24)
                      )
                    : 0;

                  return (
                    <Link
                      key={record.id}
                      href={`/contacts/${contact.id}`}
                      className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-400 dark:hover:border-blue-400 hover:shadow-md transition-all"
                    >
                      <div className="space-y-3">
                        {/* Name and Tier */}
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white truncate">
                            {contact.fullName}
                          </p>
                          <TierBadge tier={contact.tier} />
                        </div>

                        {/* Company */}
                        {contact.account && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                            {contact.account.name}
                          </p>
                        )}

                        {/* Email */}
                        <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                          {contact.email}
                        </p>

                        {/* Owner */}
                        {contact.owner && (
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            Owner: {contact.owner.firstName} {contact.owner.lastName}
                          </p>
                        )}

                        {/* Days in Stage */}
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {daysInStage} day{daysInStage !== 1 ? "s" : ""} in stage
                          </p>
                        </div>

                        {/* Last Activity */}
                        {lastMessage && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                            Last activity:{" "}
                            {new Date(
                              lastMessage.sentAt || lastMessage.receivedAt || lastMessage.createdAt
                            ).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}

        {pipelineRecords.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                No contacts in pipeline
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
