"use client";

import Link from "next/link";
import { DataTable, type Column } from "@/components/ui/data-table";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { SLATimer } from "@/components/shared/sla-timer";
import { Badge } from "@/components/ui/badge";

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

interface Props {
  data: TaskRow[];
}

export default function TasksTable({ data }: Props) {
  const statusVariants: Record<
    string,
    "default" | "success" | "warning" | "destructive" | "secondary"
  > = {
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
      cell: (value) => (
        <span className="font-medium text-slate-900 dark:text-white">
          {String(value)}
        </span>
      ),
    },
    {
      id: "priority",
      header: "Priority",
      accessorKey: "priority",
      cell: (value) => <PriorityBadge priority={value as any} />,
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      cell: (value) => {
        const status = typeof value === "string" ? value : String(value);
        return (
          <Badge variant={statusVariants[status] || "default"}>
            {status}
          </Badge>
        );
      },
    },
    {
      id: "assignedTo",
      header: "Assigned To",
      accessorKey: "assignedTo",
      cell: (value) =>
        value ? (
          <span className="text-sm">{String(value)}</span>
        ) : (
          <span className="text-sm text-slate-400">—</span>
        ),
    },
    {
      id: "dueAt",
      header: "Due",
      accessorKey: "dueAt",
      cell: (value) => {
        const date = new Date(value as Date);
        return (
          <div>
            <p className="text-sm">{date.toLocaleDateString()}</p>
            <SLATimer deadline={date} compact />
          </div>
        );
      },
    },
    {
      id: "contactName",
      header: "Contact",
      accessorKey: "contactName",
      cell: (value, row) =>
        value && row.contactId ? (
          <Link
            href={`/contacts/${row.contactId}`}
            className="text-blue-600 hover:underline text-sm"
          >
            {String(value)}
          </Link>
        ) : (
          <span className="text-sm text-slate-400">—</span>
        ),
    },
  ];

  return <DataTable columns={columns} data={data} pageSize={20} />;
}