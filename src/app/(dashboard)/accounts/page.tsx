import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

interface AccountRow {
  id: string;
  name: string;
  domain: string | null;
  industry: string | null;
  aumRange: string | null;
  status: string;
  contactCount: number;
}

export default async function AccountsPage() {
  const accounts = await prisma.account.findMany({
    select: {
      id: true,
      name: true,
      domain: true,
      industry: true,
      aumRange: true,
      status: true,
      _count: {
        select: { contacts: true },
      },
    },
    orderBy: { name: "asc" },
    take: 100,
  });

  const rows: AccountRow[] = accounts.map((account) => ({
    id: account.id,
    name: account.name,
    domain: account.domain,
    industry: account.industry,
    aumRange: account.aumRange,
    status: account.status,
    contactCount: account._count.contacts,
  }));

  const statusVariants: Record<string, "default" | "success" | "warning" | "secondary" | "destructive"> = {
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
          {value}
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
          <span className="text-sm text-slate-600 dark:text-slate-400">{value}</span>
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
          <span className="text-sm">{value}</span>
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
          <span className="text-sm font-medium">{value}</span>
        ) : (
          <span className="text-sm text-slate-400">—</span>
        ),
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      sortable: true,
      cell: (value) => (
        <Badge variant={statusVariants[value as string] || "default"}>
          {value}
        </Badge>
      ),
    },
    {
      id: "contactCount",
      header: "Contacts",
      accessorKey: "contactCount",
      sortable: true,
      cell: (value) => (
        <span className="text-sm font-medium text-slate-900 dark:text-white">
          {value}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Accounts
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          {rows.length} accounts
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account List</CardTitle>
          <CardDescription>
            Manage companies and organizations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={rows}
            pageSize={25}
          />
        </CardContent>
      </Card>
    </div>
  );
}
