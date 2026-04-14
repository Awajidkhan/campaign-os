export const dynamic = "force-dynamic";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { TierBadge } from "@/components/shared/tier-badge";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

interface CampaignDetailPageProps {
  params: {
    id: string;
  };
}

interface EnrollmentRow {
  id: string;
  contactName: string;
  contactId: string;
  email: string;
  tier: "A" | "B" | "C";
  status: string;
  step: number;
  enrolledAt: Date;
}

export default async function CampaignDetailPage({
  params,
}: CampaignDetailPageProps) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: params.id },
    include: {
      sequences: {
        include: {
          enrollments: {
            select: { id: true },
          },
        },
      },
      enrollments: {
        select: {
          id: true,
          contact: {
            select: {
              id: true,
              fullName: true,
              email: true,
              tier: true,
            },
          },
          status: true,
          currentStep: true,
          enrolledAt: true,
        },
        orderBy: { enrolledAt: "desc" },
        take: 100,
      },
    },
  });

  if (!campaign) {
    notFound();
  }

  // Prepare enrollment rows
  const enrollmentRows: EnrollmentRow[] = campaign.enrollments.map(
    (enrollment) => ({
      id: enrollment.id,
      contactName: enrollment.contact.fullName,
      contactId: enrollment.contact.id,
      email: enrollment.contact.email,
      tier: enrollment.contact.tier,
      status: enrollment.status,
      step: enrollment.currentStep,
      enrolledAt: enrollment.enrolledAt,
    })
  );

  // Calculate status distribution
  const statusDistribution = campaign.enrollments.reduce(
    (acc, enrollment) => {
      acc[enrollment.status] = (acc[enrollment.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const columns: Column<EnrollmentRow>[] = [
    {
      id: "contactName",
      header: "Contact",
      accessorKey: "contactName",
      sortable: true,
      cell: (value: any, row) => (
        <Link
          href={`/contacts/${row.contactId}`}
          className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          {value as React.ReactNode}
        </Link>
      ),
    },
    {
      id: "email",
      header: "Email",
      accessorKey: "email",
      cell: (value: any) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {value as React.ReactNode}
        </span>
      ),
    },
    {
      id: "tier",
      header: "Tier",
      accessorKey: "tier",
      cell: (value: any) => <TierBadge tier={value as "A" | "B" | "C"} />,
    },
    {
      id: "status",
      header: "Enrollment Status",
      accessorKey: "status",
      sortable: true,
      cell: (value: any) => {
        const statusVariants: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
          PENDING: "default",
          ACTIVE: "success",
          COMPLETED: "secondary",
          BOUNCED: "destructive",
          UNSUBSCRIBED: "warning",
          REPLIED: "success",
        };
        return (
          <Badge variant={typeof value === "string" ? statusVariants[value] || "default" : "default"}>
            {value as React.ReactNode}
          </Badge>
        );
      },
    },
    {
      id: "step",
      header: "Step",
      accessorKey: "step",
      cell: (value: any) => (
        <span className="text-sm font-medium">{value as React.ReactNode}</span>
      ),
    },
    {
      id: "enrolledAt",
      header: "Enrolled",
      accessorKey: "enrolledAt",
      sortable: true,
      cell: (value: any) => (
        <span className="text-sm">
          {new Date(value as Date).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {campaign.name}
        </h1>
        {campaign.description && (
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {campaign.description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Campaign Info */}
        <div className="lg:col-span-1 space-y-4">
          {/* Campaign Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Campaign Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-slate-600 dark:text-slate-400 mb-1">Status</p>
                <Badge variant="default">{campaign.status}</Badge>
              </div>
              {campaign.targetAudience && (
                <div>
                  <p className="text-slate-600 dark:text-slate-400">Target Audience</p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {campaign.targetAudience}
                  </p>
                </div>
              )}
              {campaign.sequenceStrategy && (
                <div>
                  <p className="text-slate-600 dark:text-slate-400">Strategy</p>
                  <p className="text-slate-900 dark:text-white">
                    {campaign.sequenceStrategy}
                  </p>
                </div>
              )}
              {campaign.startDate && (
                <div>
                  <p className="text-slate-600 dark:text-slate-400">Start Date</p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {new Date(campaign.startDate as Date).toLocaleDateString()}
                  </p>
                </div>
              )}
              {campaign.endDate && (
                <div>
                  <p className="text-slate-600 dark:text-slate-400">End Date</p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {new Date(campaign.endDate as Date).toLocaleDateString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enrollment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Enrollment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-700 dark:text-slate-300">
                  Total Enrolled
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {campaign.enrollments.length}
                </span>
              </div>
              {Object.entries(statusDistribution).map(([status, count]) => (
                <div
                  key={status}
                  className="flex justify-between items-center py-2 border-t border-slate-200 dark:border-slate-700"
                >
                  <span className="text-slate-700 dark:text-slate-300">
                    {status}
                  </span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {count}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Sequences */}
          {campaign.sequences.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sequences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {campaign.sequences.map((sequence: any) => (
                  <div
                    key={sequence.id}
                    className="p-3 border border-slate-200 dark:border-slate-700 rounded"
                  >
                    <p className="font-medium text-slate-900 dark:text-white">
                      {sequence.name}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {sequence.steps} steps • {sequence.enrollments.length} enrollments
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Enrollments List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Enrolled Contacts</CardTitle>
              <CardDescription>
                All contacts enrolled in this campaign
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={enrollmentRows}
                pageSize={15}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
