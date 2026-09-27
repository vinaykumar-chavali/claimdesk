import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search, Car, Bike, HeartPulse } from 'lucide-react';
import { getClaims } from '../../api/claims';
import { Card, CardContent } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { StatusBadge } from '../../components/claims/StatusBadge';
import { PriorityBadge } from '../../components/claims/PriorityBadge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function ClaimList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: claims, isLoading } = useQuery({
    queryKey: ['claims_list'],
    queryFn: () => getClaims()
  });

  if (isLoading) {
    return <div className="flex justify-center p-10"><Spinner size="lg" /></div>;
  }

  let filteredClaims = claims || [];

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filteredClaims = filteredClaims.filter(c => {
      const claimNum = (c.claim_number || '').toLowerCase();
      const policyNum = ((c as any).policy_number || c.policy?.policy_number || '').toLowerCase();
      const title = (c.title || '').toLowerCase();
      return claimNum.includes(term) || policyNum.includes(term) || title.includes(term);
    });
  }

  if (statusFilter) {
    filteredClaims = filteredClaims.filter(c => c.status === statusFilter);
  }

  // Sort: Priority first, then newest
  filteredClaims.sort((a, b) => {
    if (a.priority_label === 'priority' && b.priority_label !== 'priority') return -1;
    if (b.priority_label === 'priority' && a.priority_label !== 'priority') return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-navy-950 tracking-tight">Claims Repository</h1>
          <p className="text-xs text-slate-700 font-semibold mt-0.5">Comprehensive audit and adjudications ledger across all insurance lines.</p>
        </div>
      </div>

      <Card className="aave-glass-card rounded-2xl shadow-lg">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="flex-1 relative max-w-md">
            <Input 
              placeholder="Search claim number or policy..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white/95 text-xs h-9 font-semibold text-navy-950"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          </div>

          {/* Aave Glass Segmented Status Filter Track */}
          <div className="flex items-center gap-1 p-1 rounded-2xl aave-track overflow-x-auto">
            {[
              { value: '', label: 'All' },
              { value: 'submitted', label: 'Submitted' },
              { value: 'under_review', label: 'Review' },
              { value: 'approved', label: 'Approved' },
              { value: 'rejected', label: 'Rejected' },
              { value: 'closed', label: 'Closed' }
            ].map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 shrink-0 cursor-pointer ${
                  statusFilter === tab.value
                    ? 'aave-lens-active shadow-md scale-[1.02]'
                    : 'aave-lens text-slate-700 hover:text-navy-950'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="aave-glass-card rounded-2xl overflow-hidden shadow-lg">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Claim ID</TableHead>
                <TableHead>Policy</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClaims.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No claims found matching filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredClaims.map((claim) => {
                  const isAuto = (claim as any).policy_type === 'automobile' || claim.policy?.type === 'automobile';
                  const isBike = (claim as any).vehicle_category === 'bike' || claim.policy?.vehicle_category === 'bike';
                  const Icon = !isAuto ? HeartPulse : (isBike ? Bike : Car);
                  const iconColor = !isAuto ? 'text-emerald-600' : (isBike ? 'text-cyan-700' : 'text-blue-700');
                  const policyNum = (claim as any).policy_number || claim.policy?.policy_number || 'N/A';
                  return (
                    <TableRow key={claim.id} className={claim.priority_label === 'priority' ? 'bg-red-50/30' : ''}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-navy-900 flex items-center gap-1.5 text-xs font-mono">
                            <Icon className={`h-4 w-4 ${iconColor}`} />
                            {claim.claim_number}
                            {isAuto && (
                              <span className={`px-1.5 py-0.2 rounded text-[10px] font-sans font-semibold ${isBike ? 'bg-cyan-100 text-cyan-900' : 'bg-blue-100 text-blue-900'}`}>
                                {isBike ? 'Bike' : 'Car'}
                              </span>
                            )}
                          </span>
                          <span className="text-xs text-gray-500 mt-1 truncate max-w-[180px]">{claim.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">{policyNum}</span>
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(claim.claim_amount, claim.currency)}</TableCell>
                      <TableCell className="text-sm text-gray-500">{formatDate(claim.incident_date)}</TableCell>
                      <TableCell><StatusBadge status={claim.status} /></TableCell>
                      <TableCell><PriorityBadge label={claim.priority_label} /></TableCell>
                      <TableCell className="text-right">
                        <Link to={`/officer/claims/${claim.id}`}>
                          <Button size="sm" variant="secondary">Review</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
