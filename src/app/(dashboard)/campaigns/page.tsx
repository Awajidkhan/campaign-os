export const dynamic = "force-dynamic";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { getPrisma } from "@/lib/prisma";
import Link from "next/link";

interface CampaignRow {

  id: string;
  name: string;
  status: string;
  targetAudience: string | null;
  enrolledCount: number;
  startDate: Date | null;
  endDate: Date | null;
}

export default async function CampaignsPage() {
  const prisma = getPrisma();
  const campaigns = await prisma.campaign.findMany({
    include: {
      sequences: true,
      enrollments: true,
      _count: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const rows: CampaignRow[] = campaigns.map((campaign) => ({
    id: campaign.id,
    name: campaign.name,
    status: campaign.status,
    targetAudience: campaign.targetAudience,
    enrolledCount: campaign._count.enrollments,
    startDate: campaign.startDate,
    endDate: campaign.endDate,
  }));

  const statusVariants: Record<string, "default" | "success" | "warning" | "secondary"> = {
    DRAFT: "default",
    ACTIVE: "success",
    PAUSED: "warning",
    COMPLETED: "secondary",
    ARCHIVED: "default",
  };

  const columns: Column<CampaignRow>[] = [
    {
      id: "name",
      header: "Campaign Name",
      accessorKey: "name",
      sortable: true,
      cell: (value: any, row) => (
        <Link
          href={`/campaigns/${row.id}`}
          className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          {value as React.ReactNode}
        </Link>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      sortable: true,
      cell: (value: any) => (
        <Badge variant={typeof value === "string" ? statusVariants[value] || "default" : "default"}>
          {value as React.ReactNode}
        </Badge>
      ),
    },
    {
      id: "targetAudience",
      header: "Target Audience",
      accessorKey: "targetAudience",
      cell: (value: any) =>
        value ? (
          <span className="text-sm">{value as React.ReactNode}</span>
        ) : (
          <span className="text-sm text-slate-400">—</span>
        ),
    },
    {
      id: "enrolledCount",
      header: "Enrolled",
      accessorKey: "enrolledCount",
      sortable: true,
      cell: (value: any) => (
        <span className="text-sm font-medium">{value as React.ReactNode}</span>
      ),
    },
    {
      id: "startDate",
      header: "Start Date",
      accessorKey: "startDate",
      sortable: true,
      cell: (value: any) =>
        value ? (
          <span className="text-sm">
            {new Date(value as Date).toLocaleDateString()}
          </span>
        ) : (
          <span className="text-sm text-slate-400">—</span>
        ),
    },
    {
      id: "endDate",
      header: "End Date",
      accessorKey: "endDate",
      sortable: true,
      cell: (value: any) =>
        value ? (
          <span className="text-sm">
            {new Date(value as Date).toLocaleDateString()}
          </span>
        ) : (
          <span className="text-sm text-slate-400">—</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Campaigns
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          {rows.length} campaigns
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaign List</CardTitle>
          <CardDescription>
            Manage email campaigns and sequences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={rows}
            pageSize={20}
          />
        </CardContent>
      </Card>
    </div>
  );
}
