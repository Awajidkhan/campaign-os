export const dynamic = "force-dynamic";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { getPrisma } from "@/lib/prisma";
import TasksTable from "@/components/tasks/TasksTable";

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
    contactName: task.contact?.fullName ?? null,
    contactId: task.contact?.id ?? null,
    isOverdue: task.dueAt < now && task.status !== "COMPLETED",
  }));

  const overdueTasks = rows.filter((t) => t.isOverdue);
  const urgentTasks = rows.filter((t) => t.priority === "URGENT");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Tasks & SLA Queue
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          {rows.length} total tasks
        </p>
      </div>

      {overdueTasks.length > 0 && (
        <Card className="border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20">
          <CardHeader>
            <CardTitle className="text-red-900 dark:text-red-100">
              Overdue Tasks
            </CardTitle>
            <CardDescription>
              {overdueTasks.length} overdue tasks
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Tasks</CardTitle>
          <CardDescription>Sorted by due date</CardDescription>
        </CardHeader>
        <CardContent>
          <TasksTable data={rows} />
        </CardContent>
      </Card>

      {urgentTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Urgent Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <TasksTable data={urgentTasks} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}