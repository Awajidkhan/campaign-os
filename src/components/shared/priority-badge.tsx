import { Badge } from "@/components/ui/badge";

export type TaskPriority = "URGENT" | "HIGH" | "NORMAL" | "LOW";

interface PriorityBadgeProps {
  priority: TaskPriority;
}

const priorityConfig: Record<
  TaskPriority,
  { label: string; variant: "default" | "secondary" | "outline" | "success" | "warning" | "destructive" }
> = {
  URGENT: { label: "Urgent", variant: "destructive" },
  HIGH: { label: "High", variant: "warning" },
  NORMAL: { label: "Normal", variant: "secondary" },
  LOW: { label: "Low", variant: "success" },
};

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = priorityConfig[priority];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
