import { Badge } from "@/components/ui/badge";

export type ContactTier = "A" | "B" | "C";

interface TierBadgeProps {
  tier: ContactTier;
}

const tierConfig: Record<
  ContactTier,
  { label: string; variant: "default" | "secondary" | "outline" | "success" | "warning" | "destructive" }
> = {
  A: { label: "Tier A", variant: "destructive" },
  B: { label: "Tier B", variant: "warning" },
  C: { label: "Tier C", variant: "default" },
};

export function TierBadge({ tier }: TierBadgeProps) {
  const config = tierConfig[tier];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
