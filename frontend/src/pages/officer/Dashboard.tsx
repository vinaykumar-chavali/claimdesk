import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, ChevronRight, Car, Bike, HeartPulse, Search, 
  SlidersHorizontal, FileText, Send, Clock, CheckCircle2, XCircle, ShieldCheck
} from 'lucide-react';
import { getClaims } from '../../api/claims';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { StatusBadge } from '../../components/claims/StatusBadge';
import { PriorityBadge } from '../../components/claims/PriorityBadge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Spinner } from '../../components/ui/Spinner';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../auth/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState<'priority' | 'newest' | 'amount'>('priority');
  
  const { data: claims, isLoading } = useQuery({
    queryKey: ['claims_dashboard'],
    queryFn: () => getClaims()
  });

  if (isLoading) {
    return <div className="flex justify-center p-16"><Spinner size="lg" /></div>;
  }

  const claimsList = Array.isArray(claims) ? claims : [];

  const stats = {
    total: claimsList.length,
    submitted: claimsList.filter(c => c.status === 'submitted').length,
    underReview: claimsList.filter(c => c.status === 'under_review').length,
    approved: claimsList.filter(c => c.status === 'approved').length,
    rejected: claimsList.filter(c => c.status === 'rejected').length,
    priority: claimsList.filter(c => c.priority_label === 'priority').length,
    standard: claimsList.filter(c => c.priority_label === 'non_priority').length,
  };

  // Filter claims
  let filtered = claimsList.filter(c => {
    if (statusFilter && c.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const numMatch = (c.claim_number || '').toLowerCase().includes(term);
      const titleMatch = (c.title || '').toLowerCase().includes(term);
      const policyMatch = ((c as any).policy_number || c.policy?.policy_number || '').toLowerCase().includes(term);
      return numMatch || titleMatch || policyMatch;
    }
    return true;
  });

  // Sort claims
  filtered = filtered.sort((a, b) => {
    if (sortBy === 'priority') {
      if (a.priority_label === 'priority' && b.priority_label !== 'priority') return -1;
      if (b.priority_label === 'priority' && a.priority_label !== 'priority') return 1;
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    }
    if (sortBy === 'newest') {
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    }
    if (sortBy === 'amount') {
      return Number(b.claim_amount || 0) - Number(a.claim_amount || 0);
    }
    return 0;
  });

  const recentClaims = filtered.slice(0, 10);

  return (
    <div className="space-y-8 pb-12">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-50 border border-navy-200/80 text-xs font-bold text-navy-800 mb-2">
            <ShieldCheck className="h-3.5 w-3.5 text-navy-700" />
            <span>Operational Adjuster Hub</span>
          </div>
          <h1 className="text-3xl font-black text-navy-900 tracking-tight">
            {user?.role === 'supervisor' ? 'Supervisor Overview & Controls' : 'Officer Workstation'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor claims lifecycle, manage workload, and drive decisions across all active cases.
          </p>
        </div>
        <Link to="/officer/claims">
          <Button variant="outline" className="flex items-center gap-1.5 shadow-sm bg-white/90">
            <span>All Claims Repository</span> <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* KPI Stats Overview Tiles with Aave Glass Refraction */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        
        {/* Total Tile */}
        <div 
          onClick={() => setStatusFilter('')}
          className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer interactive-tile ${
            statusFilter === '' 
              ? 'bg-navy-950 text-white border-navy-950 shadow-xl ring-2 ring-navy-800' 
              : 'aave-glass-card hover:border-navy-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-black uppercase tracking-wider ${statusFilter === '' ? 'text-slate-200' : 'text-navy-950'}`}>
              Total {user?.role === 'officer' ? 'Assigned' : 'Claims'}
            </span>
            <FileText className={`h-4 w-4 ${statusFilter === '' ? 'text-amber-400' : 'text-blue-700'}`} />
          </div>
          <p className={`text-3xl font-black mt-2 tracking-tight ${statusFilter === '' ? 'text-white' : 'text-navy-950'}`}>
            {stats.total}
          </p>
          <p className={`text-[11px] mt-1 font-semibold ${statusFilter === '' ? 'text-slate-300' : 'text-slate-600'}`}>
            In current ledger
          </p>
        </div>

        {/* Submitted Tile */}
        <div 
          onClick={() => setStatusFilter('submitted')}
          className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer interactive-tile ${
            statusFilter === 'submitted' 
              ? 'bg-blue-700 text-white border-blue-700 shadow-xl ring-2 ring-blue-600' 
              : 'aave-glass-card hover:border-blue-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-black uppercase tracking-wider ${statusFilter === 'submitted' ? 'text-blue-100' : 'text-blue-900'}`}>
              Submitted
            </span>
            <Send className={`h-4 w-4 ${statusFilter === 'submitted' ? 'text-white' : 'text-blue-700'}`} />
          </div>
          <p className={`text-3xl font-black mt-2 tracking-tight ${statusFilter === 'submitted' ? 'text-white' : 'text-blue-950'}`}>
            {stats.submitted}
          </p>
          <p className={`text-[11px] mt-1 font-semibold ${statusFilter === 'submitted' ? 'text-blue-100' : 'text-blue-700'}`}>
            Pending review intake
          </p>
        </div>

        {/* Under Review Tile */}
        <div 
          onClick={() => setStatusFilter('under_review')}
          className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer interactive-tile ${
            statusFilter === 'under_review' 
              ? 'bg-amber-600 text-white border-amber-600 shadow-xl ring-2 ring-amber-500' 
              : 'aave-glass-card hover:border-amber-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-black uppercase tracking-wider ${statusFilter === 'under_review' ? 'text-amber-100' : 'text-amber-950'}`}>
              Under Review
            </span>
            <Clock className={`h-4 w-4 ${statusFilter === 'under_review' ? 'text-white' : 'text-amber-700'}`} />
          </div>
          <p className={`text-3xl font-black mt-2 tracking-tight ${statusFilter === 'under_review' ? 'text-white' : 'text-amber-950'}`}>
            {stats.underReview}
          </p>
          <p className={`text-[11px] mt-1 font-semibold ${statusFilter === 'under_review' ? 'text-amber-100' : 'text-amber-800'}`}>
            Actively being analyzed
          </p>
        </div>

        {/* Approved Tile */}
        <div 
          onClick={() => setStatusFilter('approved')}
          className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer interactive-tile ${
            statusFilter === 'approved' 
              ? 'bg-emerald-700 text-white border-emerald-700 shadow-xl ring-2 ring-emerald-600' 
              : 'aave-glass-card hover:border-emerald-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-black uppercase tracking-wider ${statusFilter === 'approved' ? 'text-emerald-100' : 'text-emerald-950'}`}>
              Approved
            </span>
            <CheckCircle2 className={`h-4 w-4 ${statusFilter === 'approved' ? 'text-white' : 'text-emerald-700'}`} />
          </div>
          <p className={`text-3xl font-black mt-2 tracking-tight ${statusFilter === 'approved' ? 'text-white' : 'text-emerald-950'}`}>
            {stats.approved}
          </p>
          <p className={`text-[11px] mt-1 font-semibold ${statusFilter === 'approved' ? 'text-emerald-100' : 'text-emerald-800'}`}>
            Settlement cleared
          </p>
        </div>

        {/* Rejected Tile */}
        <div 
          onClick={() => setStatusFilter('rejected')}
          className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer interactive-tile ${
            statusFilter === 'rejected' 
              ? 'bg-rose-700 text-white border-rose-700 shadow-xl ring-2 ring-rose-600' 
              : 'aave-glass-card hover:border-rose-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-black uppercase tracking-wider ${statusFilter === 'rejected' ? 'text-rose-100' : 'text-rose-950'}`}>
              Rejected
            </span>
            <XCircle className={`h-4 w-4 ${statusFilter === 'rejected' ? 'text-white' : 'text-rose-700'}`} />
          </div>
          <p className={`text-3xl font-black mt-2 tracking-tight ${statusFilter === 'rejected' ? 'text-white' : 'text-rose-950'}`}>
            {stats.rejected}
          </p>
          <p className={`text-[11px] mt-1 font-semibold ${statusFilter === 'rejected' ? 'text-rose-100' : 'text-rose-800'}`}>
            Declined claims
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols) - Actionable Claims */}
        <Card className="lg:col-span-2 aave-glass-card shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="pb-4 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-base font-black text-navy-950">
              Active Actionable Claims
            </CardTitle>
            
            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-44">
                <Input 
                  placeholder="Search claims..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 text-xs h-8 bg-white/90"
                />
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
              </div>
              <div className="w-32">
                <Select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs h-8 py-1 bg-white/90"
                  options={[
                    { value: '', label: 'All Statuses' },
                    { value: 'submitted', label: 'Submitted' },
                    { value: 'under_review', label: 'Under Review' },
                    { value: 'approved', label: 'Approved' },
                    { value: 'rejected', label: 'Rejected' },
                    { value: 'closed', label: 'Closed' }
                  ]}
                />
              </div>
              <div className="w-28">
                <Select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-xs h-8 py-1 bg-white/90"
                  options={[
                    { value: 'priority', label: 'Priority' },
                    { value: 'newest', label: 'Newest' },
                    { value: 'amount', label: 'Amount' }
                  ]}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recentClaims.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/60">
                    <TableHead>Claim ID & Details</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentClaims.map((claim) => {
                    const isAuto = (claim as any).policy_type === 'automobile' || claim.policy?.type === 'automobile';
                    const isBike = (claim as any).vehicle_category === 'bike' || claim.policy?.vehicle_category === 'bike';
                    const Icon = !isAuto ? HeartPulse : (isBike ? Bike : Car);
                    const iconColor = !isAuto ? 'text-emerald-600' : (isBike ? 'text-cyan-700' : 'text-blue-700');
                    return (
                      <TableRow key={claim.id} className={claim.priority_label === 'priority' ? 'bg-red-50/25 hover:bg-red-50/45' : 'hover:bg-slate-50/60'}>
                        <TableCell>
                          <div className="flex items-start space-x-2.5">
                            <div className={`p-1.5 rounded-lg border bg-white shadow-xs ${iconColor}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-navy-900 font-mono text-xs">{claim.claim_number}</span>
                                {isAuto && (
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${isBike ? 'bg-cyan-100 text-cyan-900' : 'bg-blue-100 text-blue-900'}`}>
                                    {isBike ? '🏍️ Bike' : '🚗 Car'}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 font-medium truncate max-w-[200px] mt-0.5">{claim.title}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-xs text-navy-900">
                          {formatCurrency(claim.claim_amount, claim.currency)}
                        </TableCell>
                        <TableCell><StatusBadge status={claim.status} /></TableCell>
                        <TableCell><PriorityBadge label={claim.priority_label} /></TableCell>
                        <TableCell className="text-right">
                          <Link to={`/officer/claims/${claim.id}`}>
                            <Button size="sm" variant="secondary" className="text-xs py-1 h-7 font-bold shadow-xs">
                              Review
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-slate-500 text-center py-8">No claims found matching active filters.</p>
            )}
          </CardContent>
        </Card>

        {/* Right Column (1 Col) - Priority & Triaging Summary */}
        <div className="space-y-6">
          <Card className="aave-glass-card shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-200/80">
              <CardTitle className="text-base font-black text-navy-950">Triaging & Priority</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3.5">
              <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-red-50/90 to-rose-50/50 rounded-2xl border border-red-200 shadow-xs">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-xl text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-red-950 uppercase tracking-wide">Priority Expedited</p>
                    <p className="text-[11px] text-red-800 font-semibold">Immediate SLA attention required</p>
                  </div>
                </div>
                <span className="text-2xl font-black text-red-700">{stats.priority}</span>
              </div>
              
              <div className="flex items-center justify-between p-3.5 bg-white/80 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-slate-200/80 rounded-xl text-navy-900">
                    <SlidersHorizontal className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-navy-950 uppercase tracking-wide">Standard Queue</p>
                    <p className="text-[11px] text-slate-600 font-semibold">Regular processing SLA</p>
                  </div>
                </div>
                <span className="text-2xl font-black text-navy-950">{stats.standard}</span>
              </div>
            </CardContent>
          </Card>

          {/* System Status Glass Box */}
          <Card className="shadow-lg rounded-2xl bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
            <CardContent className="p-5 space-y-2 relative z-10">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" /> Platform Health
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                All systems operational. Claims processing, document handling, and audit logging are fully active.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs text-emerald-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Secure · Compliant · Available 24/7</span>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
