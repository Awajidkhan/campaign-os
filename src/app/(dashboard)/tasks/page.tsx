export const dynamic = "force-dynamic";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { SLATimer } from "@/components/shared/sla-timer";
import { Badge } from "@/components/ui/badge";
import { getPrisma } from "@/lib/prisma";
import Link from "next/link";

interface TaskRow {
  id: string;
  title: string;
  priority: string;
  status: string;
  assignedTo: string | null;
  dueAt: Date;
  contactName: string | null;
  contactId: string | null;
  isOverdue: boolean;
}

export default async function TasksPage() {
  const prisma = getPrisma();
  const now = new Date();

  const tasks = await prisma.task.findMany({
    include: {
      assignedTo: true,
      contact: true,
    },
    orderBy: { dueAt: "asc" },
    take: 100,
  });

  const rows: TaskRow[] = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    priority: task.priority,
    status: task.status,
    assignedTo: task.assignedTo
      ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}`
      : null,
    dueAt: task.dueAt,
    contactName: task.contact?.fullName || null,
    contactId: task.contact?.id || null,
    isOverdue: task.dueAt < now && task.status !== "COMPLETED",
  }));

  // Filter tabs
  const allTasks = rows;
  const overdueTasks = rows.filter((t) => t.isOverdue);
  const urgentTasks = rows.filter((t) => t.priority === "URGENT");

  const statusVariants: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
    OPEN: "default",
    IN_PROGRESS: "warning",
    COMPLETED: "success",
    CANCELLED: "secondary",
    OVERDUE: "destructive",
  };

  const columns: Column<TaskRow>[] = [
    {
      id: "title",
      header: "Task",
      accessorKey: "title",
      sortable: true,
      cell: (value: any) => (
        <span className="font-medium text-slate-900 dark:text-white">
          {value as React.ReactNode}
        </span>
      ),
    },
    {
      id: "priority",
      header: "Priority",
      accessorKey: "priority",
      sortable: true,
      cell: (value: any) => <PriorityBadge priority={value as any} />,
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      sortable: true,
      cell: (value: any) => (
        <Badge variant={typeof value === "string" ? statusVariants[value] || "default" : "default"}>
          {value as React.ReactNode}
        </Badge>
      ),
    },
    {
      id: "assignedTo",
      header: "Assigned To",
      accessorKey: "assignedTo",
      cell: (value: any) =>
        value ? (
          <span className="text-sm">{value as React.ReactNode}</span>
        ) : (
          <span className="text-sm text-slate-400">—</span>
        ),
    },
    {
      id: "dueAt",
      header: "Due",
      accessorKey: "dueAt",
      sortable: true,
      cell: (value: any, row) => {
        const dueDate = value instanceof Date ? value : new Date(value);
        return (
          <div className="space-y-1">
            <p className="text-sm">
              {dueDate.toLocaleDateString()}
            </p>
            <SLATimer deadline={dueDate} compact />
          </div>
        );
      },
    },
    {
      id: "contactName",
      header: "Contact",
      accessorKey: "contactName",
      cell: (value: any, row) =>
        value && row.contactId ? (
          <Link
            href={`/contacts/${row.contactId}`}
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            {value as React.ReactNode}
          </Link>
        ) : (
          <span className="text-sm text-slate-400">—</span>
        ),
    },
  ];

  // Create tabs content
  interface TabConfig {
    label: string;
    count: number;
    data: TaskRow[];
  }

  const tabs: Record<string, TabConfig> = {
    all: { label: "All", count: allTasks.length, data: allTasks },
    overdue: {
      label: "Overdue",
      count: overdueTasks.length,
      data: overdueTasks,
    },
    urgent: { label: "Urgent", count: urgentTasks.length, data: urgentTasks },
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Tasks & SLA Queue
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          {allTasks.length} total tasks
        </p>
      </div>

      {/* Tab-like Cards showing different views */}
      <div className="space-y-6">
        {/* Overdue Alert */}
        {overdueTasks.length > 0 && (
          <Card className="border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20">
            <CardHeader>
              <CardTitle className="text-red-900 dark:text-red-100">
                Overdue Tasks
              </CardTitle>
              <CardDescription className="text-red-800 dark:text-red-200">
                {overdueTasks.length} task{overdueTasks.length !== 1 ? "s" : ""} past their due date
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* All Tasks Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Tasks</CardTitle>
            <CardDescription>
              Sorted by due date (nearest first)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={allTasks}
              pageSize={20}
            />
          </CardContent>
        </Card>

        {/* Urgent Tasks */}
        {urgentTasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Urgent Tasks Only</CardTitle>
              <CardDescription>
                {urgentTasks.length} urgent task{urgentTasks.length !== 1 ? "s" : ""} requiring immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={urgentTasks}
                pageSize={10}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
