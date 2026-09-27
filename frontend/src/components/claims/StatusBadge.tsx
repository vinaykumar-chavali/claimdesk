import { Clock, Eye, CheckCircle, XCircle, Lock } from "lucide-react";
import { Badge } from "../ui/Badge";
import { formatStatus } from "../../utils/formatters";
import { ClaimStatus } from "../../types";

export function StatusBadge({ status }: { status: ClaimStatus }) {
  switch (status) {
    case 'submitted':
      return (
        <Badge className="bg-blue-100 text-blue-800 border-transparent hover:bg-blue-100">
          <Clock className="mr-1 h-3 w-3" /> {formatStatus(status)}
        </Badge>
      );
    case 'under_review':
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-transparent hover:bg-yellow-100">
          <Eye className="mr-1 h-3 w-3" /> {formatStatus(status)}
        </Badge>
      );
    case 'approved':
      return (
        <Badge variant="success">
          <CheckCircle className="mr-1 h-3 w-3" /> {formatStatus(status)}
        </Badge>
      );
    case 'rejected':
      return (
        <Badge variant="danger">
          <XCircle className="mr-1 h-3 w-3" /> {formatStatus(status)}
        </Badge>
      );
    case 'closed':
      return (
        <Badge variant="secondary">
          <Lock className="mr-1 h-3 w-3" /> {formatStatus(status)}
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
}
