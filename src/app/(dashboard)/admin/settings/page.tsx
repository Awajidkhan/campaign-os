export const dynamic = "force-dynamic";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

interface TemplateRow {
  id: string;
  name: string;
  category: string;
  subject: string | null;
  isActive: boolean;
}

interface SLARow {
  id: string;
  category: string;
  maxMinutes: number;
  assignToRole: string | null;
  autoAction: string | null;
}

interface StageRuleRow {
  id: string;
  trigger: string;
  fromStage: string | null;
  toStage: string;
  isActive: boolean;
}

export default async function SettingsPage() {
  const [users, templates, slaConfigs, stageRules] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "asc" },
    }),
    prisma.responseTemplate.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.sLAConfig.findMany({
      orderBy: { createdAt: "asc" },
    }),
    prisma.stageRule.findMany({
      orderBy: { createdAt: "asc" },
    }),
  ]);

  // Format data for tables
  const userRows: UserRow[] = users.map((user: any) => ({
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  }));

  const templateRows: TemplateRow[] = templates.map((t: any) => ({
    id: t.id,
    name: t.name,
    category: t.category,
    subject: t.subject,
    isActive: t.isActive,
  }));

  const slaRows: SLARow[] = slaConfigs.map((s: any) => ({
    id: s.id,
    category: s.category,
    maxMinutes: s.maxMinutes,
    assignToRole: s.assignToRole,
    autoAction: s.autoAction,
  }));

  const ruleRows: StageRuleRow[] = stageRules.map((r: any) => ({
    id: r.id,
    trigger: r.trigger,
    fromStage: r.fromStage,
    toStage: r.toStage,
    isActive: r.isActive,
  }));

  // Table columns
  const userColumns: Column<UserRow>[] = [
    {
      id: "name",
      header: "Name",
      accessorKey: "name",
      sortable: true,
    },
    {
      id: "email",
      header: "Email",
      accessorKey: "email",
    },
    {
      id: "role",
      header: "Role",
      accessorKey: "role",
      cell: (value) => (
        <Badge variant="secondary">{value}</Badge>
      ),
    },
    {
      id: "isActive",
      header: "Status",
      accessorKey: "isActive",
      cell: (value) => (
        <Badge variant={value ? "success" : "destructive"}>
          {value ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  const templateColumns: Column<TemplateRow>[] = [
    {
      id: "name",
      header: "Template Name",
      accessorKey: "name",
      sortable: true,
    },
    {
      id: "category",
      header: "Category",
      accessorKey: "category",
    },
    {
      id: "subject",
      header: "Subject",
      accessorKey: "subject",
      cell: (value) =>
        value ? (
          <span className="text-sm truncate max-w-xs">{value}</span>
        ) : (
          <span className="text-sm text-slate-400">—</span>
        ),
    },
    {
      id: "isActive",
      header: "Status",
      accessorKey: "isActive",
      cell: (value) => (
        <Badge variant={value ? "success" : "secondary"}>
          {value ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  const slaColumns: Column<SLARow>[] = [
    {
      id: "category",
      header: "Category",
      accessorKey: "category",
      sortable: true,
    },
    {
      id: "maxMinutes",
      header: "SLA (minutes)",
      accessorKey: "maxMinutes",
      sortable: true,
      cell: (value) => (
        <span className="font-medium">{value} min</span>
      ),
    },
    {
      id: "assignToRole",
      header: "Assign To",
      accessorKey: "assignToRole",
      cell: (value) =>
        value ? (
          <Badge variant="secondary">{value}</Badge>
        ) : (
          <span className="text-sm text-slate-400">—</span>
        ),
    },
    {
      id: "autoAction",
      header: "Auto Action",
      accessorKey: "autoAction",
      cell: (value) =>
        value ? (
          <span className="text-sm">{value}</span>
        ) : (
          <span className="text-sm text-slate-400">—</span>
        ),
    },
  ];

  const ruleColumns: Column<StageRuleRow>[] = [
    {
      id: "trigger",
      header: "Trigger",
      accessorKey: "trigger",
      sortable: true,
    },
    {
      id: "fromStage",
      header: "From Stage",
      accessorKey: "fromStage",
      cell: (value) =>
        value ? (
          <span className="text-sm">{value}</span>
        ) : (
          <span className="text-sm text-slate-400">Any</span>
        ),
    },
    {
      id: "toStage",
      header: "To Stage",
      accessorKey: "toStage",
      cell: (value) => (
        <span className="text-sm font-medium">{value}</span>
      ),
    },
    {
      id: "isActive",
      header: "Status",
      accessorKey: "isActive",
      cell: (value) => (
        <Badge variant={value ? "success" : "secondary"}>
          {value ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Settings
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          System configuration and administration
        </p>
      </div>

      {/* Users */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Manage team members and their roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userRows.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No users configured
            </p>
          ) : (
            <DataTable columns={userColumns} data={userRows} pageSize={10} />
          )}
        </CardContent>
      </Card>

      {/* Response Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Response Templates</CardTitle>
          <CardDescription>
            Pre-written response templates for different reply categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          {templateRows.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No response templates configured
            </p>
          ) : (
            <DataTable
              columns={templateColumns}
              data={templateRows}
              pageSize={10}
            />
          )}
        </CardContent>
      </Card>

      {/* SLA Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>SLA Configuration</CardTitle>
          <CardDescription>
            Response time SLAs and auto-assignment rules for each reply
            category
          </CardDescription>
        </CardHeader>
        <CardContent>
          {slaRows.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No SLA configurations
            </p>
          ) : (
            <DataTable columns={slaColumns} data={slaRows} pageSize={15} />
          )}
        </CardContent>
      </Card>

      {/* Stage Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Stage Movement Rules</CardTitle>
          <CardDescription>
            Automatic rules for moving contacts between pipeline stages
          </CardDescription>
        </CardHeader>
        <CardContent>
          {ruleRows.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No stage rules configured
            </p>
          ) : (
            <DataTable columns={ruleColumns} data={ruleRows} pageSize={15} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
