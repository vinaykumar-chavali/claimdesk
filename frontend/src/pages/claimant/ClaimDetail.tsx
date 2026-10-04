import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileText, Download, Car, Bike, HeartPulse, ArrowLeft, ShieldCheck, Clock, Activity, FileCheck } from 'lucide-react';
import { getClaimById, getClaimEvents, getClaimAuditLogs } from '../../api/claims';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { StatusBadge } from '../../components/claims/StatusBadge';
import { PriorityBadge } from '../../components/claims/PriorityBadge';
import { EventTimeline } from '../../components/claims/EventTimeline';
import { FxWidget } from '../../components/fx/FxWidget';
import { Spinner } from '../../components/ui/Spinner';
import { formatDate, formatCurrency, getFileUrl } from '../../utils/formatters';

export default function ClaimDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: claim, isLoading } = useQuery({
    queryKey: ['claim', id],
    queryFn: () => getClaimById(id!)
  });

  const { data: events } = useQuery({
    queryKey: ['claimEvents', id],
    queryFn: () => getClaimEvents(id!),
    enabled: !!id
  });

  const { data: auditLogs } = useQuery({
    queryKey: ['claimAudit', id],
    queryFn: () => getClaimAuditLogs(id!),
    enabled: !!id
  });

  if (isLoading) return <div className="flex justify-center p-12"><Spinner size="lg" /></div>;
  if (!claim) return (
    <div className="max-w-2xl mx-auto p-8 text-center bg-white rounded-lg border shadow-sm">
      <p className="text-gray-600 mb-4">Claim record not found.</p>
      <Link to="/claims" className="text-navy-600 font-medium hover:underline inline-flex items-center">
        <ArrowLeft className="h-4 w-4 mr-1" /> Return to My Claims
      </Link>
    </div>
  );

  const isAuto = (claim as any).policy_type === 'automobile' || claim.policy?.type === 'automobile';
  const isBike = (claim as any).vehicle_category === 'bike' || (claim as any).policy_vehicle_category === 'bike' || claim.policy?.vehicle_category === 'bike';
  const Icon = !isAuto ? HeartPulse : (isBike ? Bike : Car);
  const iconColor = !isAuto ? 'text-emerald-600' : (isBike ? 'text-cyan-700' : 'text-blue-700');
  
  const documents = Array.isArray(claim.document_paths)
    ? claim.document_paths
    : (typeof claim.document_paths === 'string' ? JSON.parse(claim.document_paths || '[]') : []);
  
  const policyNum = (claim as any).policy_number || claim.policy?.policy_number || 'N/A';
  const holderName = (claim as any).holder_name || (claim as any).claimant_name || claim.policy?.holder_name || 'N/A';
  const coverageAmt = Number((claim as any).coverage_amount || claim.policy?.coverage_amount || 0);
  const chassisNum = (claim as any).chassis_number || (claim as any).policy_chassis_number || claim.policy?.chassis_number;

  const coveragePercent = coverageAmt > 0 ? Math.min(100, Math.round((Number(claim.claim_amount) / coverageAmt) * 100)) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Navigation & Back Link */}
      <div className="flex items-center justify-between">
        <Link to="/claims" className="text-sm font-medium text-navy-600 hover:text-navy-800 flex items-center gap-1.5 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to My Claims
        </Link>
        <span className="text-xs text-slate-500 font-semibold">Ref: <span className="font-mono font-bold text-navy-800">#{claim.claim_number}</span></span>
      </div>

      {/* Header Banner with Aave Glass Refraction */}
      <div className="aave-glass-card rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start md:items-center space-x-4">
          <div className={`p-3.5 rounded-2xl bg-white/80 border border-slate-200/80 shadow-md ${iconColor}`}>
            <Icon className="h-8 w-8" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-black text-navy-950 tracking-tight">{claim.title}</h1>
              {isAuto && (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${isBike ? 'bg-cyan-100 text-cyan-950 border border-cyan-300' : 'bg-blue-100 text-blue-950 border border-blue-300'}`}>
                  {isBike ? '🏍️ Two-Wheeler / Bike' : '🚗 Four-Wheeler / Car'}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700 font-semibold">
              <span className="font-mono bg-white/90 border border-slate-200 px-2 py-0.5 rounded text-navy-950 font-bold">#{claim.claim_number}</span>
              <span>•</span>
              <span>Submitted {formatDate(claim.created_at)}</span>
              <span>•</span>
              <span>Policy: <strong className="text-navy-950 font-mono font-bold">{policyNum}</strong></span>
            </div>
          </div>
        </div>
        <div className="flex md:flex-col items-center md:items-end justify-between gap-2 border-t md:border-t-0 pt-3 md:pt-0">
          <StatusBadge status={claim.status} />
          <PriorityBadge label={claim.priority_label} />
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Incident / Claim Details Card */}
          <Card className="aave-glass-card shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-200/80">
              <CardTitle className="text-base font-black text-navy-950 flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-blue-700" />
                Claim & Incident Specification
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-5">
              {claim.description && (
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Incident Narrative</h4>
                  <p className="text-sm text-gray-800 mt-1.5 bg-gray-50 p-3.5 rounded-lg border border-gray-100 leading-relaxed">
                    {claim.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Incident Date</h4>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{formatDate(claim.incident_date)}</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Injury Severity</h4>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{claim.injury_severity}</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Incident Type</h4>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{claim.incident_type || claim.treatment_type || 'General'}</p>
                </div>
              </div>

              {/* Type-specific attributes */}
              {isAuto ? (
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Vehicle Details</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-gray-50/80 p-3.5 rounded-lg border border-gray-100">
                    <div>
                      <span className="text-xs text-gray-500">Make & Model</span>
                      <p className="text-sm font-medium text-gray-900 mt-0.5">{claim.vehicle_year} {claim.vehicle_make} {claim.vehicle_model}</p>
                    </div>
                    {claim.vehicle_reg_number && (
                      <div>
                        <span className="text-xs text-gray-500">Registration</span>
                        <p className="text-sm font-mono uppercase font-semibold text-gray-900 mt-0.5">{claim.vehicle_reg_number}</p>
                      </div>
                    )}
                    {chassisNum && (
                      <div>
                        <span className="text-xs text-gray-500">Chassis Number / VIN</span>
                        <p className="text-sm font-mono uppercase font-semibold text-gray-900 mt-0.5">{chassisNum}</p>
                      </div>
                    )}
                    {claim.damage_description && (
                      <div className="col-span-2 sm:col-span-3 pt-2 border-t border-gray-200/60">
                        <span className="text-xs text-gray-500">Reported Damage</span>
                        <p className="text-sm text-gray-800 mt-0.5">{claim.damage_description}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Medical / Treatment Details</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-gray-50/80 p-3.5 rounded-lg border border-gray-100">
                    <div>
                      <span className="text-xs text-gray-500">Hospital</span>
                      <p className="text-sm font-medium text-gray-900 mt-0.5">{claim.hospital_name || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Treating Doctor</span>
                      <p className="text-sm font-medium text-gray-900 mt-0.5">{claim.treating_doctor || 'N/A'}</p>
                    </div>
                    {claim.diagnosis && (
                      <div>
                        <span className="text-xs text-gray-500">Diagnosis</span>
                        <p className="text-sm font-medium text-gray-900 mt-0.5">{claim.diagnosis}</p>
                      </div>
                    )}
                    {claim.admission_date && (
                      <div>
                        <span className="text-xs text-gray-500">Admission</span>
                        <p className="text-sm font-medium text-gray-900 mt-0.5">{formatDate(claim.admission_date)}</p>
                      </div>
                    )}
                    {claim.discharge_date && (
                      <div>
                        <span className="text-xs text-gray-500">Discharge</span>
                        <p className="text-sm font-medium text-gray-900 mt-0.5">{formatDate(claim.discharge_date)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Supporting Documents */}
          <Card className="aave-glass-card shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-200/80">
              <CardTitle className="text-base font-black text-navy-950 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-700" />
                Supporting Documents & Attachments ({documents.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {documents.length > 0 ? (
                <ul className="divide-y divide-slate-200/60">
                  {documents.map((doc: any, idx: number) => (
                    <li key={idx} className="py-3 flex items-center justify-between hover:bg-white/60 px-2 rounded-xl transition-colors">
                      <div className="flex items-center space-x-3 truncate">
                        <div className="p-2 bg-blue-100 text-blue-800 rounded-xl">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-bold text-navy-950 truncate">{doc.originalName || 'Document'}</p>
                          <p className="text-xs text-slate-600 font-semibold">{doc.mimeType || 'attachment'} • {doc.sizeBytes ? `${Math.round(doc.sizeBytes / 1024)} KB` : 'Verified'}</p>
                        </div>
                      </div>
                      <a 
                        href={getFileUrl(doc.path)} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="px-3 py-1.5 text-xs bg-navy-900 text-white hover:bg-navy-800 rounded-xl font-bold border border-navy-800 flex items-center gap-1.5 shadow-sm transition-colors"
                      >
                        <Download className="h-3.5 w-3.5" /> Download
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-600 font-medium text-center py-6">No supporting documents uploaded for this claim.</p>
              )}
            </CardContent>
          </Card>

          {/* Claim Journey Card */}
          <Card className="aave-glass-card shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-200/80">
              <CardTitle className="text-base font-black text-navy-950 flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-700" />
                Claim Journey
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {auditLogs && auditLogs.length > 0 ? (
                <div className="space-y-3">
                  {auditLogs.map((log: any) => (
                    <div key={log.id} className="flex items-start space-x-3 text-sm p-3.5 bg-white/70 rounded-xl border border-slate-200/80 shadow-sm">
                      <Clock className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-navy-950 capitalize">{log.action.replace(/_/g, ' ')}</span>
                          <span className="text-xs text-slate-600 font-bold">{formatDate(log.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-600 font-medium text-center py-4">No activity recorded for this claim yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 Col) */}
        <div className="space-y-6">

          {/* Financials & FX Converter */}
          <Card className="aave-glass-card shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-200/80">
              <CardTitle className="text-base font-black text-navy-950">Financial Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <span className="text-xs text-navy-950 uppercase tracking-wider font-black">Estimated Claim Amount</span>
                <p className="text-3xl font-black text-navy-950 mt-1">
                  {formatCurrency(claim.claim_amount, claim.currency)}
                </p>
              </div>

              {/* Coverage Comparison Bar */}
              {coverageAmt > 0 && (
                <div className="bg-white/80 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Policy Limit: {formatCurrency(coverageAmt, claim.currency || 'USD')}</span>
                    <span className="font-black text-navy-950">{coveragePercent}% utilized</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-2.5 rounded-full ${coveragePercent > 80 ? 'bg-amber-600' : 'bg-blue-600'}`} 
                      style={{ width: `${coveragePercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Currency Converter */}
              <div className="pt-2">
                <span className="text-xs text-navy-950 uppercase tracking-wider font-black mb-1.5 block">
                  Foreign Exchange Reference
                </span>
                <FxWidget amount={claim.claim_amount} sourceCurrency={claim.currency} />
              </div>
            </CardContent>
          </Card>

          {/* Policy Information */}
          <Card className="aave-glass-card shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-200/80">
              <CardTitle className="text-base font-black text-navy-950 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                Linked Insurance Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div>
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Policy Number</span>
                <p className="text-sm font-mono font-black text-navy-950">{policyNum}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Policyholder Name</span>
                <p className="text-sm font-black text-slate-800">{holderName}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Total Coverage Limit</span>
                <p className="text-sm font-black text-emerald-700">{formatCurrency(coverageAmt, claim.currency || 'USD')}</p>
              </div>
            </CardContent>
          </Card>

          {/* Status Timeline */}
          <Card className="aave-glass-card shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-200/80">
              <CardTitle className="text-base font-black text-navy-950">Status Progression</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {events ? <EventTimeline events={events} /> : <Spinner size="sm" />}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
