export const dynamic = "force-dynamic";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { getPrisma } from "@/lib/prisma";

interface AuditRow {
  id: string;
  timestamp: Date;
  action: string;
  entityType: string;
  entityId: string;
  user: string | null;
  details: string;
}

export default async function AuditLogPage() {
  const prisma = getPrisma();
  const logs = await prisma.activityLog.findMany({
    include: {
      user: true,
    },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const rows: AuditRow[] = logs.map((log) => ({
    id: log.id,
    timestamp: log.createdAt,
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    user: log.user ? `${log.user.firstName} ${log.user.lastName}` : null,
    details: log.details ? JSON.stringify(log.details) : "",
  }));

  // Get unique actions for filtering context
  const uniqueActions = Array.from(new Set(logs.map((l) => l.action)));
  const uniqueEntityTypes = Array.from(new Set(logs.map((l) => l.entityType)));

  const columns: Column<AuditRow>[] = [
    {
      id: "timestamp",
      header: "Timestamp",
      accessorKey: "timestamp",
      sortable: true,
      cell: (value: any) => {
        const date = typeof value === "string" ? new Date(value) : value;
        return (
          <span className="text-sm">
            {date.toLocaleDateString()} at{" "}
            {date.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
        ) as React.ReactNode;
      },
    },
    {
      id: "user",
      header: "User",
      accessorKey: "user",
      sortable: true,
      cell: (value: any) =>
        value ? (
          <span className="text-sm">{value as React.ReactNode}</span>
        ) : (
          <span className="text-sm text-slate-400">System</span>
        ),
    },
    {
      id: "action",
      header: "Action",
      accessorKey: "action",
      sortable: true,
      cell: (value: any) => (
        <Badge variant="secondary">
          {value as React.ReactNode}
        </Badge>
      ),
    },
    {
      id: "entityType",
      header: "Entity Type",
      accessorKey: "entityType",
      sortable: true,
      cell: (value: any) => (
        <span className="text-sm font-medium">{value as React.ReactNode}</span>
      ),
    },
    {
      id: "entityId",
      header: "Entity ID",
      accessorKey: "entityId",
      cell: (value: any) => (
        <span className="text-xs font-mono text-slate-600 dark:text-slate-400 truncate max-w-xs">
          {value as React.ReactNode}
        </span>
      ),
    },
    {
      id: "details",
      header: "Details",
      accessorKey: "details",
      cell: (value: any) =>
        value ? (
          <span
            className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-xs font-mono"
            title={typeof value === "string" ? value : ""}
          >
            {value as React.ReactNode}
          </span>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Audit Log
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          System activity and change tracking
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col">
              <div className="text-3xl font-bold text-blue-600">
                {rows.length}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                Total Activities
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col">
              <div className="text-3xl font-bold text-green-600">
                {uniqueActions.length}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                Action Types
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col">
              <div className="text-3xl font-bold text-purple-600">
                {uniqueEntityTypes.length}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                Entity Types
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>
            Complete audit trail of all system activities (last 500 entries)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-400 text-center py-8">
              No activity recorded
            </p>
          ) : (
            <DataTable
              columns={columns}
              data={rows}
              pageSize={25}
            />
          )}
        </CardContent>
      </Card>

      {/* Reference Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Action Types Reference */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Action Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {uniqueActions.map((action: string) => (
                <div
                  key={action}
                  className="flex items-center gap-2 text-sm"
                >
                  <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                  <span className="text-slate-700 dark:text-slate-300">
                    {action}
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-400 ml-auto flex-shrink-0">
                    {logs.filter((l) => l.action === action).length}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Entity Types Reference */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Entity Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {uniqueEntityTypes.map((entityType: string) => (
                <div
                  key={entityType}
                  className="flex items-center gap-2 text-sm"
                >
                  <div className="w-2 h-2 bg-green-600 rounded-full flex-shrink-0"></div>
                  <span className="text-slate-700 dark:text-slate-300">
                    {entityType}
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-400 ml-auto flex-shrink-0">
                    {logs.filter((l) => l.entityType === entityType).length}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
