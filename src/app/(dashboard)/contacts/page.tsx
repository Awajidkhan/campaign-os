export const dynamic = "force-dynamic";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { TierBadge } from "@/components/shared/tier-badge";
import { StageBadge } from "@/components/shared/stage-badge";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

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

export default async function ContactsPage() {
  const contacts = await prisma.contact.findMany({
    select: {
      id: true,
      fullName: true,
      email: true,
      title: true,
      tier: true,
      fitScore: true,
      emailVerificationStatus: true,
      owner: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      account: {
        select: {
          name: true,
        },
      },
      pipelineRecord: {
        select: {
          stage: true,
        },
      },
    },
    take: 50,
    orderBy: { createdAt: "desc" },
  });

  const totalContacts = await prisma.contact.count();

  const rows: ContactRow[] = contacts.map((contact) => ({
    id: contact.id,
    fullName: contact.fullName,
    email: contact.email,
    title: contact.title,
    accountName: contact.account?.name || null,
    tier: contact.tier,
    fitScore: contact.fitScore,
    stage: contact.pipelineRecord?.stage || "IDENTIFIED",
    emailVerificationStatus: contact.emailVerificationStatus,
    ownerName: contact.owner
      ? `${contact.owner.firstName} ${contact.owner.lastName}`
      : null,
  }));

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
      sortable: true,
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
      id: "accountName",
      header: "Company",
      accessorKey: "accountName",
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
        <span className="text-sm font-medium text-slate-900 dark:text-white">
          {value}
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
      cell: (value: any) => {
        const statusVariants: Record<string, "success" | "warning" | "destructive" | "default"> = {
          VALID: "success",
          INVALID: "destructive",
          RISKY: "warning",
          UNVERIFIED: "default",
        };
        return (
          <Badge variant={typeof value === "string" ? statusVariants[value] || "default" : "default"}>
            {value}
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
          <span className="text-sm">{value}</span>
        ) : (
          <span className="text-sm text-slate-400">—</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Contacts
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          {totalContacts} total contacts ({rows.length} shown)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact List</CardTitle>
          <CardDescription>
            Manage and track all contacts in your database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={rows}
            onRowClick={(row) => {
              // Navigation handled by link in cell renderer
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
