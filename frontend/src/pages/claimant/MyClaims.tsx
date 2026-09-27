import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  PlusCircle, FileText, Send, Clock, CheckCircle2, XCircle, 
  Search, Shield 
} from 'lucide-react';
import { getClaims } from '../../api/claims';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ClaimCard } from '../../components/claims/ClaimCard';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';

export default function MyClaims() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: claims, isLoading } = useQuery({
    queryKey: ['myClaims'],
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
  };

  // Filter claims
  const filteredClaims = claimsList.filter(claim => {
    if (statusFilter !== 'all' && claim.status !== statusFilter) {
      return false;
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const numMatch = (claim.claim_number || '').toLowerCase().includes(term);
      const titleMatch = (claim.title || '').toLowerCase().includes(term);
      const policyMatch = ((claim as any).policy_number || claim.policy?.policy_number || '').toLowerCase().includes(term);
      return numMatch || titleMatch || policyMatch;
    }
    return true;
  });

  return (
    <div className="space-y-8 pb-12">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-50 border border-navy-200/80 text-xs font-bold text-navy-800 mb-2">
            <Shield className="h-3.5 w-3.5 text-navy-700" />
            <span>Policyholder Portal</span>
          </div>
          <h1 className="text-3xl font-black text-navy-900 tracking-tight flex items-center gap-2">
            My Insurance Claims
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time status tracking, auto-populated vehicle records, and settlement currency conversions.
          </p>
        </div>

        <Link to="/claims/new">
          <Button className="flex items-center space-x-2 shadow-lg shadow-navy-900/20 px-5 py-2.5">
            <PlusCircle className="h-4 w-4" />
            <span>File New Claim</span>
          </Button>
        </Link>
      </div>

      {/* Interactive Glossy KPI Cards Strip with Aave Refraction */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        
        {/* Total Tile */}
        <div 
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer interactive-tile ${
            statusFilter === 'all' 
              ? 'bg-navy-950 text-white border-navy-950 shadow-xl ring-2 ring-navy-800' 
              : 'aave-glass-card hover:border-navy-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-black uppercase tracking-wider ${statusFilter === 'all' ? 'text-slate-200' : 'text-navy-950'}`}>
              Total Claims
            </span>
            <FileText className={`h-4 w-4 ${statusFilter === 'all' ? 'text-amber-400' : 'text-blue-700'}`} />
          </div>
          <p className={`text-3xl font-black mt-2 tracking-tight ${statusFilter === 'all' ? 'text-white' : 'text-navy-950'}`}>
            {stats.total}
          </p>
          <p className={`text-[11px] mt-1 font-semibold ${statusFilter === 'all' ? 'text-slate-300' : 'text-slate-600'}`}>
            All recorded claims
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
            Awaiting adjuster triage
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
            Officer actively reviewing
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
            Ready for settlement
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
            Closed or declined
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative max-w-sm flex-1">
          <Input
            placeholder="Search by title, claim # or policy code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-white/95 text-xs"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        </div>

        {/* Quick status pill buttons (Aave Glass Segmented Control) */}
        <div className="flex items-center gap-1 p-1 rounded-2xl aave-track overflow-x-auto pb-1 sm:pb-1">
          {[
            { id: 'all', label: 'All' },
            { id: 'submitted', label: 'Submitted' },
            { id: 'under_review', label: 'Under Review' },
            { id: 'approved', label: 'Approved' },
            { id: 'rejected', label: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 shrink-0 cursor-pointer ${
                statusFilter === tab.id
                  ? 'aave-lens-active shadow-md scale-[1.02]'
                  : 'aave-lens text-slate-600 hover:text-navy-900 hover:scale-[1.01]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Claims Display */}
      {filteredClaims.length === 0 ? (
        <EmptyState 
          icon={<FileText className="h-12 w-12 text-slate-400" />}
          title={searchTerm || statusFilter !== 'all' ? "No matching claims found" : "No claims filed yet"}
          description={searchTerm || statusFilter !== 'all' ? "Try adjusting your search criteria or resetting filters." : "File your first automobile or health claim using our smart intake wizard."}
          action={
            <Link to="/claims/new">
              <Button className="shadow-md">
                File a Claim Now
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClaims.map(claim => (
            <ClaimCard key={claim.id} claim={claim} />
          ))}
        </div>
      )}
    </div>
  );
}
