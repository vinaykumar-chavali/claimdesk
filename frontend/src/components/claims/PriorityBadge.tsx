import { AlertTriangle, Circle } from "lucide-react";
import { Badge } from "../ui/Badge";
import { PriorityLabel } from "../../types";

export function PriorityBadge({ label }: { label?: PriorityLabel | null }) {
  if (label === 'priority') {
    return (
      <Badge variant="danger" className="bg-red-100 text-red-800 hover:bg-red-100 border-transparent">
        <AlertTriangle className="mr-1 h-3 w-3" /> Priority
      </Badge>
    );
  }
  if (label === 'non_priority') {
    return (
      <Badge variant="secondary">
        <Circle className="mr-1 h-3 w-3" /> Standard
      </Badge>
    );
  }
  return (
    <Badge variant="secondary">
      — Unscored
    </Badge>
  );
}
