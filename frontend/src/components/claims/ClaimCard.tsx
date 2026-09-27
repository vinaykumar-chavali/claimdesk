import { Claim } from "../../types";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { StatusBadge } from "./StatusBadge";
import { PriorityBadge } from "./PriorityBadge";
import { Car, Bike, HeartPulse, Calendar, ChevronRight } from "lucide-react";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { Link } from "react-router-dom";

export function ClaimCard({ claim }: { claim: Claim }) {
  const isAuto = (claim as any).policy_type === 'automobile' || claim.policy?.type === 'automobile';
  const isBike = (claim as any).vehicle_category === 'bike' || (claim as any).policy_vehicle_category === 'bike' || claim.policy?.vehicle_category === 'bike';
  const Icon = !isAuto ? HeartPulse : (isBike ? Bike : Car);
  const policyNum = (claim as any).policy_number || claim.policy?.policy_number || 'N/A';
  
  // Theme accents
  const theme = !isAuto 
    ? {
        badge: '🏥 Medical / Health',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        topBar: 'from-emerald-500 to-teal-600',
        borderHover: 'hover:border-emerald-300'
      }
    : isBike
    ? {
        badge: '🏍️ Two-Wheeler (Bike)',
        badgeClass: 'bg-cyan-100 text-cyan-900 border-cyan-200',
        iconBg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
        topBar: 'from-cyan-600 to-blue-600',
        borderHover: 'hover:border-cyan-300'
      }
    : {
        badge: '🚗 Four-Wheeler (Car)',
        badgeClass: 'bg-navy-100 text-navy-800 border-navy-200',
        iconBg: 'bg-navy-50 text-navy-800 border-navy-200',
        topBar: 'from-navy-700 to-blue-600',
        borderHover: 'hover:border-navy-300'
      };

  return (
    <Card className={`overflow-hidden aave-glass-card shadow-lg interactive-tile group transition-all duration-300 ${theme.borderHover}`}>
      {/* Top Gradient Stripe */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${theme.topBar}`}></div>

      <Link to={`/claims/${claim.id}`} className="block">
        <CardHeader className="pb-3 pt-4 flex flex-row items-start justify-between space-y-0 gap-3">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${theme.badgeClass}`}>
                {theme.badge}
              </span>
              <span className="text-xs font-mono font-black text-navy-950">
                #{claim.claim_number}
              </span>
            </div>
            
            <CardTitle className="text-base font-black text-navy-950 truncate group-hover:text-blue-700 flex items-center gap-2 transition-colors">
              <div className={`p-1.5 rounded-xl border shadow-xs ${theme.iconBg}`}>
                <Icon className="h-4 w-4" />
              </div>
              <span className="truncate">{claim.title}</span>
            </CardTitle>
          </div>

          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <StatusBadge status={claim.status} />
            <PriorityBadge label={claim.priority_label} />
          </div>
        </CardHeader>

        <CardContent className="pt-1 pb-4 space-y-3">
          {/* Metadata Snippet */}
          <div className="flex items-center justify-between text-xs text-slate-700 pt-1 border-t border-slate-200/80">
            <div className="flex items-center gap-1 font-bold">
              <Calendar className="h-3.5 w-3.5 text-navy-800" />
              <span>{formatDate(claim.incident_date)}</span>
            </div>
            <div className="font-mono text-navy-950 font-black bg-white/80 border border-slate-200 px-2 py-0.5 rounded-md">
              {policyNum}
            </div>
          </div>

          {/* Automobile / Health detail pill if available */}
          {isAuto && (claim.vehicle_make || (claim as any).policy_vehicle_make) && (
            <div className="text-[11px] text-navy-950 font-bold bg-white/70 p-2 rounded-xl border border-slate-200/80 flex items-center justify-between">
              <span className="truncate">
                {claim.vehicle_year || (claim as any).policy_vehicle_year} {claim.vehicle_make || (claim as any).policy_vehicle_make} {claim.vehicle_model || (claim as any).policy_vehicle_model}
              </span>
              {(claim.vehicle_reg_number || (claim as any).policy_vehicle_reg_number) && (
                <span className="font-mono text-[10px] font-black text-navy-900 ml-2 shrink-0 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                  {claim.vehicle_reg_number || (claim as any).policy_vehicle_reg_number}
                </span>
              )}
            </div>
          )}

          {/* Amount & CTA bottom row */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="text-[10px] uppercase font-black tracking-wider text-slate-600">Claim Amount</p>
              <p className="text-lg font-black text-navy-950 tracking-tight">
                {formatCurrency(claim.claim_amount, claim.currency)}
              </p>
            </div>

            <div className="flex items-center gap-1 text-xs font-black text-navy-900 group-hover:text-blue-700 group-hover:translate-x-0.5 transition-all">
              <span>Inspect Claim</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
