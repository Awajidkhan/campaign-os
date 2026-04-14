export const dynamic = "force-dynamic";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { getPrisma } from "@/lib/prisma";
import ContactsTable from "@/components/contacts/ContactsTable";

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
  const prisma = getPrisma();

  const contacts = await prisma.contact.findMany({
    include: {
      owner: true,
      account: true,
      pipelineRecord: true,
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
    accountName: contact.account?.name ?? null,
    tier: contact.tier,
    fitScore: contact.fitScore,
    stage: contact.pipelineRecord?.stage ?? "IDENTIFIED",
    emailVerificationStatus: contact.emailVerificationStatus,
    ownerName: contact.owner
      ? `${contact.owner.firstName} ${contact.owner.lastName}`
      : null,
  }));

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
          <ContactsTable data={rows} />
        </CardContent>
      </Card>
    </div>
  );
}