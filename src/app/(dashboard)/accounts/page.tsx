export const dynamic = "force-dynamic";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { getPrisma } from "@/lib/prisma";
import AccountsTable from "@/components/accounts/AccountsTable";

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
  const prisma = getPrisma();

  const accounts = await prisma.account.findMany({
    include: {
      _count: {
        select: {
          contacts: true,
        },
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
          <AccountsTable data={rows} />
        </CardContent>
      </Card>
    </div>
  );
}