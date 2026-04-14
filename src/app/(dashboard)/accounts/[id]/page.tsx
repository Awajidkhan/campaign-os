import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StageBadge } from "@/components/shared/stage-badge";
import { TierBadge } from "@/components/shared/tier-badge";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

interface AccountDetailPageProps {
  params: {
    id: string;
  };
}

interface ContactRow {
  id: string;
  fullName: string;
  email: string;
  title: string | null;
  tier: "A" | "B" | "C";
  fitScore: number;
  stage: string;
}

export default async function AccountDetailPage({
  params,
}: AccountDetailPageProps) {
  const account = await prisma.account.findUnique({
    where: { id: params.id },
    include: {
      contacts: {
        select: {
          id: true,
          fullName: true,
          email: true,
          title: true,
          tier: true,
          fitScore: true,
          pipelineRecord: {
            select: { stage: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      tasks: {
        include: { assignedTo: true },
        orderBy: { dueAt: "asc" },
        take: 10,
      },
    },
  });

  if (!account) {
    notFound();
  }

  // Prepare contacts for table
  const contactRows: ContactRow[] = account.contacts.map((contact) => ({
    id: contact.id,
    fullName: contact.fullName,
    email: contact.email,
    title: contact.title,
    tier: contact.tier,
    fitScore: contact.fitScore,
    stage: contact.pipelineRecord?.stage || "IDENTIFIED",
  }));

  // Calculate stage distribution
  const stageDistribution = account.contacts.reduce(
    (acc, contact) => {
      const stage = contact.pipelineRecord?.stage || "IDENTIFIED";
      acc[stage] = (acc[stage] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const columns: Column<ContactRow>[] = [
    {
      id: "fullName",
      header: "Name",
      accessorKey: "fullName",
      sortable: true,
      cell: (value, row) => (
        <Link
          href={`/contacts/${row.id}`}
          className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          {value}
        </Link>
      ),
    },
    {
      id: "email",
      header: "Email",
      accessorKey: "email",
      cell: (value) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">{value}</span>
      ),
    },
    {
      id: "title",
      header: "Title",
      accessorKey: "title",
      cell: (value) =>
        value ? (
          <span className="text-sm">{value}</span>
        ) : (
          <span className="text-sm text-slate-400">—</span>
        ),
    },
    {
      id: "tier",
      header: "Tier",
      accessorKey: "tier",
      cell: (value) => <TierBadge tier={value as "A" | "B" | "C"} />,
    },
    {
      id: "fitScore",
      header: "Score",
      accessorKey: "fitScore",
      sortable: true,
      cell: (value) => (
        <span className="text-sm font-medium">{value}</span>
      ),
    },
    {
      id: "stage",
      header: "Stage",
      accessorKey: "stage",
      cell: (value) => <StageBadge stage={value as any} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {account.name}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          {contactRows.length} contacts
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Account Info */}
        <div className="lg:col-span-1 space-y-4">
          {/* Account Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-slate-600 dark:text-slate-400 mb-1">Status</p>
                <Badge variant={account.status === "active" ? "success" : "default"}>
                  {account.status}
                </Badge>
              </div>
              {account.domain && (
                <div>
                  <p className="text-slate-600 dark:text-slate-400">Domain</p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {account.domain}
                  </p>
                </div>
              )}
              {account.website && (
                <div>
                  <p className="text-slate-600 dark:text-slate-400">Website</p>
                  <a
                    href={account.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {account.website}
                  </a>
                </div>
              )}
              {account.industry && (
                <div>
                  <p className="text-slate-600 dark:text-slate-400">Industry</p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {account.industry}
                  </p>
                </div>
              )}
              {account.aumRange && (
                <div>
                  <p className="text-slate-600 dark:text-slate-400">AUM Range</p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {account.aumRange}
                  </p>
                </div>
              )}
              {account.notes && (
                <div>
                  <p className="text-slate-600 dark:text-slate-400">Notes</p>
                  <p className="text-slate-900 dark:text-white whitespace-pre-wrap">
                    {account.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pipeline Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pipeline Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {Object.entries(stageDistribution).length === 0 ? (
                <p className="text-slate-600 dark:text-slate-400">No contacts</p>
              ) : (
                Object.entries(stageDistribution).map(([stage, count]) => (
                  <div key={stage}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-slate-700 dark:text-slate-300">
                        {stage}
                      </span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {count}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Related Tasks */}
          {account.tasks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tasks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {account.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-2 border border-slate-200 dark:border-slate-700 rounded"
                  >
                    <p className="font-medium text-slate-900 dark:text-white">
                      {task.title}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Due: {new Date(task.dueAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Contacts List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Associated Contacts</CardTitle>
              <CardDescription>
                All contacts linked to this account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={contactRows}
                pageSize={15}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
