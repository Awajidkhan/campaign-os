"use client";

import Link from "next/link";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";

interface CampaignRow {
  id: string;
  name: string;
  status: string;
  targetAudience: string | null;
  enrolledCount: number;
  startDate: Date | null;
  endDate: Date | null;
}

interface CampaignsTableProps {
  data: CampaignRow[];
}

export default function CampaignsTable({ data }: CampaignsTableProps) {
  const statusVariants: Record<
    string,
    "default" | "success" | "warning" | "secondary"
  > = {
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
      cell: (value, row) => (
        <Link
          href={`/campaigns/${row.id}`}
          className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          {String(value)}
        </Link>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      sortable: true,
      cell: (value) => {
        const status = typeof value === "string" ? value : String(value);
        return (
          <Badge variant={statusVariants[status] || "default"}>
            {status}
          </Badge>
        );
      },
    },
    {
      id: "targetAudience",
      header: "Target Audience",
      accessorKey: "targetAudience",
      cell: (value) =>
        value ? (
          <span className="text-sm">{String(value)}</span>
        ) : (
          <span className="text-sm text-slate-400">—</span>
        ),
    },
    {
      id: "enrolledCount",
      header: "Enrolled",
      accessorKey: "enrolledCount",
      sortable: true,
      cell: (value) => (
        <span className="text-sm font-medium">{String(value)}</span>
      ),
    },
    {
      id: "startDate",
      header: "Start Date",
      accessorKey: "startDate",
      sortable: true,
      cell: (value) =>
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
      cell: (value) =>
        value ? (
          <span className="text-sm">
            {new Date(value as Date).toLocaleDateString()}
          </span>
        ) : (
          <span className="text-sm text-slate-400">—</span>
        ),
    },
  ];

  return <DataTable columns={columns} data={data} pageSize={20} />;
}