export const dynamic = "force-dynamic";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { getPrisma } from "@/lib/prisma";
import CampaignsTable from "@/components/campaigns/CampaignsTable";

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
      _count: {
        select: {
          enrollments: true,
        },
      },
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
          <CampaignsTable data={rows} />
        </CardContent>
      </Card>
    </div>
  );
}