"use client";

import Link from "next/link";
import { DataTable, type Column } from "@/components/ui/data-table";
import { TierBadge } from "@/components/shared/tier-badge";
import { StageBadge } from "@/components/shared/stage-badge";
import { Badge } from "@/components/ui/badge";

interface ContactRow {
  id: string;
  fullName: string;
  email: string;
  title: string | null;
  accountName: string | null;
  tier: "A" | "B" | "C";
  fitScore: number;
  stage: string;
  emailVerificationStatus: string;
  ownerName: string | null;
}

interface ContactsTableProps {
  data: ContactRow[];
}

export default function ContactsTable({ data }: ContactsTableProps) {
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
          {String(value)}
        </Link>
      ),
    },
    {
      id: "email",
      header: "Email",
      accessorKey: "email",
      sortable: true,
      cell: (value) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {String(value)}
        </span>
      ),
    },
    {
      id: "title",
      header: "Title",
      accessorKey: "title",
      cell: (value) =>
        value ? (
          <span className="text-sm">{String(value)}</span>
        ) : (
          <span className="text-sm text-slate-400">—</span>
        ),
    },
    {
      id: "accountName",
      header: "Company",
      accessorKey: "accountName",
      cell: (value) =>
        value ? (
          <span className="text-sm">{String(value)}</span>
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
        <span className="text-sm font-medium text-slate-900 dark:text-white">
          {String(value)}
        </span>
      ),
    },
    {
      id: "stage",
      header: "Stage",
      accessorKey: "stage",
      cell: (value) => <StageBadge stage={value as any} />,
    },
    {
      id: "emailVerificationStatus",
      header: "Verification",
      accessorKey: "emailVerificationStatus",
      cell: (value) => {
        const statusVariants: Record<
          string,
          "success" | "warning" | "destructive" | "default"
        > = {
          VALID: "success",
          INVALID: "destructive",
          RISKY: "warning",
          UNVERIFIED: "default",
        };

        const status =
          typeof value === "string" ? value : String(value);

        return (
          <Badge variant={statusVariants[status] || "default"}>
            {status}
          </Badge>
        );
      },
    },
    {
      id: "ownerName",
      header: "Owner",
      accessorKey: "ownerName",
      cell: (value) =>
        value ? (
          <span className="text-sm">{String(value)}</span>
        ) : (
          <span className="text-sm text-slate-400">—</span>
        ),
    },
  ];

  return <DataTable columns={columns} data={data} />;
}