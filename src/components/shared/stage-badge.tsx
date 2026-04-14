import { Badge } from "@/components/ui/badge";

export type PipelineStage =
  | "IDENTIFIED"
  | "CONTACTED"
  | "ENGAGED"
  | "QUALIFIED"
  | "DEMO_SCHEDULED"
  | "PROPOSAL"
  | "CLOSED_WON"
  | "CLOSED_LOST";

interface StageBadgeProps {
  stage: PipelineStage;
}

const stageConfig: Record<
  PipelineStage,
  { label: string; variant: "default" | "secondary" | "outline" | "success" | "warning" | "destructive" }
> = {
  IDENTIFIED: { label: "Identified", variant: "default" },
  CONTACTED: { label: "Contacted", variant: "outline" },
  ENGAGED: { label: "Engaged", variant: "secondary" },
  QUALIFIED: { label: "Qualified", variant: "warning" },
  DEMO_SCHEDULED: { label: "Demo Scheduled", variant: "secondary" },
  PROPOSAL: { label: "Proposal", variant: "secondary" },
  CLOSED_WON: { label: "Closed Won", variant: "success" },
  CLOSED_LOST: { label: "Closed Lost", variant: "destructive" },
};

export function StageBadge({ stage }: StageBadgeProps) {
  const config = stageConfig[stage];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
