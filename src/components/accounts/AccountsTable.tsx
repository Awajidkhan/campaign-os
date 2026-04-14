"use client";

import Link from "next/link";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";

interface AccountRow {
  id: string;
  name: string;
  domain: string | null;
  industry: string | null;
  aumRange: string | null;
  status: string;
  contactCount: number;
}

interface AccountsTableProps {
  data: AccountRow[];
}

export default function AccountsTable({ data }: AccountsTableProps) {
  const statusVariants: Record<
    string,
    "default" | "success" | "warning" | "secondary" | "destructive"
  > = {
    prospect: "default",
    active: "success",
    churned: "destructive",
    disqualified: "warning",
  };

  const columns: Column<AccountRow>[] = [
    {
      id: "name",
      header: "Account Name",
      accessorKey: "name",
      sortable: true,
      cell: (value, row) => (
        <Link
          href={`/accounts/${row.id}`}
          className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          {String(value)}
        </Link>
      ),
    },
    {
      id: "domain",
      header: "Domain",
      accessorKey: "domain",
      sortable: true,
      cell: (value) =>
        value ? (
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {String(value)}
          </span>
        ) : (
          <span className="text-sm text-slate-400">—</span>
        ),
    },
    {
      id: "industry",
      header: "Industry",
      accessorKey: "industry",
      cell: (value) =>
        value ? (
          <span className="text-sm">{String(value)}</span>
        ) : (
          <span className="text-sm text-slate-400">—</span>
        ),
    },
    {
      id: "aumRange",
      header: "AUM Range",
      accessorKey: "aumRange",
      cell: (value) =>
        value ? (
          <span className="text-sm font-medium">{String(value)}</span>
        ) : (
          <span className="text-sm text-slate-400">—</span>
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
      id: "contactCount",
      header: "Contacts",
      accessorKey: "contactCount",
      sortable: true,
      cell: (value) => (
        <span className="text-sm font-medium text-slate-900 dark:text-white">
          {String(value)}
        </span>
      ),
    },
  ];

  return <DataTable columns={columns} data={data} pageSize={25} />;
}