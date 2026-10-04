import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Car, Bike, HeartPulse, CheckCircle2, Sparkles, Shield, 
  Calendar, DollarSign, Check, Info, Lock, ArrowRight, AlertTriangle
} from 'lucide-react';
import { usePolicyLookup } from '../../hooks/usePolicyLookup';
import { createClaim } from '../../api/claims';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { DocumentUpload } from '../../components/claims/DocumentUpload';
import { Alert } from '../../components/ui/Alert';
import { Spinner } from '../../components/ui/Spinner';




const STEPS = [
  { id: 'step-1-policy', num: 1, label: '1. Policy', short: 'Policy' },
  { id: 'step-2-scope', num: 2, label: '2. Scope', short: 'Scope' },
  { id: 'step-3-specs', num: 3, label: '3. Specs', short: 'Specs' },
  { id: 'step-4-proof', num: 4, label: '4. Proof', short: 'Proof' },
];

export default function NewClaim() {
  const navigate = useNavigate();
  const [policySearch, setPolicySearch] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [previousPolicy, setPreviousPolicy] = useState<any>(null);

  const { data: policy, isLoading: isSearching } = usePolicyLookup(policySearch);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();

  const watchedTitle = watch('title');
  const watchedDate = watch('incident_date');
  const watchedAmount = watch('claim_amount');
  const watchedIncidentType = watch('incident_type');
  const watchedMake = watch('vehicle_make');
  const watchedModel = watch('vehicle_model');
  const watchedTreatmentType = watch('treatment_type');
  const watchedHospital = watch('hospital_name');

  // Automatically pre-fill vehicle details whenever an automobile policy is found
  useEffect(() => {
    if (policy && policy.type === 'automobile') {
      setValue('vehicle_category', policy.vehicle_category || 'car');
      setValue('vehicle_make', policy.vehicle_make || '');
      setValue('vehicle_model', policy.vehicle_model || '');
      setValue('vehicle_year', policy.vehicle_year || new Date().getFullYear());
      setValue('vehicle_reg_number', policy.vehicle_reg_number || '');
      setValue('chassis_number', policy.chassis_number || '');
    }
  }, [policy, setValue]);

  // Dynamic Scroll-Spy: detect which step is currently in the viewport as user moves down
  useEffect(() => {
    const handleScroll = () => {
      const stepItems = [
        { num: 1, el: document.getElementById('step-1-policy') },
        { num: 2, el: document.getElementById('step-2-scope') },
        { num: 3, el: document.getElementById('step-3-specs') },
        { num: 4, el: document.getElementById('step-4-proof') },
      ];

      const scrollY = window.scrollY;
      const offset = 220;

      for (let i = stepItems.length - 1; i >= 0; i--) {
        const item = stepItems[i];
        if (item.el) {
          const top = item.el.offsetTop;
          if (scrollY + offset >= top) {
            setActiveStep(item.num);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [policy]);

  const scrollToStep = (id: string, stepNum: number) => {
    setActiveStep(stepNum);
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -150; // offset for sticky navbar (65px) + floating pill (55px) + padding (30px)
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const onSubmit = async (data: any) => {
    if (!policy) return;
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const formData = new FormData();
      formData.append('policy_id', policy.id);
      formData.append('policy_type', policy.type);
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== '') {
          formData.append(key, data[key]);
        }
      });
      files.forEach(file => formData.append('documents', file));

      const claim = await createClaim(formData);
      navigate(`/claims/${claim.id}`);
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Failed to submit claim. Please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBike = policy?.type === 'automobile' && policy.vehicle_category === 'bike';
  const VehicleIcon = isBike ? Bike : Car;

  const coverageLimit = policy ? Number(policy.coverage_amount) : 0;
  const isAmountExceeded = !!(watchedAmount && Number(watchedAmount) > coverageLimit);


  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      
      {/* Top Title Banner */}
      <div className="pt-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-xs font-bold text-blue-900 mb-2">
          <Shield className="h-3.5 w-3.5 text-blue-700" />
          <span>Digital Claims Intake Engine</span>
        </div>
        <h1 className="text-3xl font-black text-navy-900 tracking-tight">File an Insurance Claim</h1>
        <p className="text-sm text-slate-600 mt-1 font-medium">
          Start by entering your policy number to unlock the intake form.
        </p>
      </div>

      {/* AAVE PHYSICAL GLASS FLOATING INTAKE CAPSULE */}
      <div className="sticky top-[4.75rem] z-40 my-3 flex justify-center w-full pointer-events-none">
        <div className="pointer-events-auto aave-floating-bar rounded-full p-1.5 px-3.5 flex items-center justify-between gap-3 max-w-full overflow-x-auto shadow-2xl transition-all duration-300 backdrop-blur-2xl">
          
          <div className="hidden sm:flex items-center gap-2 pl-2 pr-3 border-r border-slate-300/80 shrink-0">
            <span className="text-[11px] font-black uppercase tracking-wider text-navy-950">
              Claim Intake
            </span>
            {policy ? (
              <span className="text-[11px] font-bold text-blue-700">· Step {activeStep}/4</span>
            ) : (
              <span className="text-[11px] font-bold text-slate-500">· Enter Policy</span>
            )}
          </div>

          {/* Stepper Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-full aave-track overflow-x-auto">
            {STEPS.map((step, idx) => {
              // Steps 2-4 are fully hidden until policy is verified
              if (step.num > 1 && !policy) return null;

              const isCompleted = 
                step.num === 1 ? !!policy :
                step.num === 2 ? (watchedTitle && watchedDate && watchedAmount) :
                step.num === 3 ? (policy?.type === 'automobile' ? (watchedIncidentType && watchedMake && watchedModel) : (watchedTreatmentType && watchedHospital)) :
                files.length > 0;
              
              const isActive = activeStep === step.num;
              const isAccessible = step.num === 1 || !!policy;

              return (
                <div
                  key={step.id}
                  className={`flex items-center shrink-0 transition-all duration-500 ${step.num > 1 ? 'animate-in fade-in slide-in-from-right-2' : ''}`}
                >
                  {idx > 0 && <span className="text-slate-400 mx-0.5 text-xs select-none">›</span>}
                  <button
                    type="button"
                    disabled={!isAccessible}
                    onClick={() => scrollToStep(step.id, step.num)}
                    title={isAccessible ? `Jump to Step ${step.num}: ${step.short}` : 'Verify a policy first'}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-black tracking-wide transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? 'aave-lens-active scale-[1.03] ring-2 ring-navy-900/30'
                        : isCompleted
                        ? 'aave-lens-success hover:brightness-105'
                        : isAccessible
                        ? 'aave-lens text-navy-950 hover:text-navy-900 hover:scale-[1.01]'
                        : 'opacity-40 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {isCompleted && !isActive ? (
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    ) : isActive ? (
                      <span className="h-2 w-2 rounded-full bg-cyan-300 animate-pulse"></span>
                    ) : null}
                    <span>{step.label}</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Active Policy Badge — only show when verified */}
          {policy && (
            <div className="hidden md:flex items-center gap-2 shrink-0 animate-in fade-in duration-300">
              <span className="text-[11px] font-mono font-black text-navy-950 aave-lens px-3 py-1 rounded-full border border-white/80 shadow-xs">
                {policy.policy_number}
              </span>
            </div>
          )}

        </div>
      </div>


      {/* STEP 1: Policy Number Entry */}
      <div id="step-1-policy" className={`transition-all duration-500 rounded-3xl ${activeStep === 1 ? 'ring-2 ring-blue-500/40 shadow-2xl shadow-blue-900/10' : ''}`}>
        <Card className="aave-glass-card rounded-3xl overflow-hidden shadow-xl border border-white/90 aave-step-pane">
          <CardHeader className="border-b border-slate-200/80 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-black text-navy-950 flex items-center gap-2">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-navy-900 text-white text-xs font-black">1</span>
                <span>Step 1: Enter Your Policy Number</span>
              </CardTitle>
              <span className="text-xs font-bold text-slate-600">Found on your policy certificate or insurance card</span>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6 space-y-5">

            {/* Primary Policy Number Input */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-navy-950 mb-2">
                Policy Number
              </label>
              <div className="relative max-w-md">
                <Input
                  placeholder="e.g. AV-AUTO-00101"
                  value={policySearch}
                  onChange={(e) => {
                    if (policy && policy.policy_number !== e.target.value) {
                      setPreviousPolicy(policy);
                    }
                    setPolicySearch(e.target.value.toUpperCase());
                  }}
                  className="pl-10 font-mono font-bold uppercase ios-input rounded-xl text-sm tracking-widest"
                  autoComplete="off"
                  spellCheck={false}
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1.5">
                Enter the policy number exactly as it appears on your insurance documents.
              </p>
            </div>

            {/* Searching Spinner — only show when query is long enough to be a real policy number */}
            {isSearching && policySearch.length >= 10 && (
              <div className="flex items-center space-x-2 text-sm text-slate-700 font-semibold p-2">
                <Spinner size="sm" /> <span>Verifying policy...</span>
              </div>
            )}

            {/* Unmatched Alert — only show after enough chars for a complete policy number */}
            {policySearch && policySearch.length >= 10 && !isSearching && !policy && (
              <Alert variant="warning">
                No active policy found for &quot;{policySearch}&quot;. Please double-check the number on your policy certificate.
              </Alert>
            )}

            {/* Verified Policy Status Card */}
            {policy && (
              <div className={`p-4 rounded-2xl border transition-all ${
                policy.type === 'automobile' 
                  ? (isBike ? 'bg-gradient-to-br from-cyan-50/90 via-white to-blue-50/60 border-cyan-300' : 'bg-gradient-to-br from-blue-50/90 via-white to-slate-50/60 border-blue-300')
                  : 'bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/60 border-emerald-300'
              }`}>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-2xl bg-white shadow-sm border ${
                    policy.type === 'automobile' ? (isBike ? 'border-cyan-300 text-cyan-700' : 'border-blue-300 text-blue-800') : 'border-emerald-300 text-emerald-700'
                  }`}>
                    {policy.type === 'automobile' ? (
                      isBike ? <Bike className="h-6 w-6" /> : <Car className="h-6 w-6" />
                    ) : (
                      <HeartPulse className="h-6 w-6" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-navy-950 text-base flex items-center gap-1.5">
                          Policy Record Verified <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        </h4>
                        <span className="font-mono text-xs bg-white px-2 py-0.5 rounded border border-slate-300 text-navy-950 font-black">
                          {policy.policy_number}
                        </span>
                      </div>

                      {policy.type === 'automobile' && (
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase border ${
                          isBike 
                            ? 'bg-cyan-100 text-cyan-950 border-cyan-300' 
                            : 'bg-blue-100 text-blue-950 border-blue-300'
                        }`}>
                          {isBike ? '🏍️ Two-Wheeler / Bike' : '🚗 Four-Wheeler / Car'}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 text-xs text-slate-800 font-medium">
                      <p>Policyholder: <strong className="text-navy-950 font-bold">{policy.holder_name}</strong></p>
                      <p>Coverage Limit: <strong className="text-navy-950 font-bold">{policy.coverage_amount?.toLocaleString()} {policy.currency}</strong></p>
                      <p>Status: <strong className="text-emerald-700 font-bold">Active & Eligible</strong></p>
                    </div>

                    {policy.type === 'automobile' && policy.vehicle_make && (
                      <div className="mt-3 p-2.5 rounded-xl bg-white/95 border border-slate-200 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700 flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-gold-500" /> Registered Vehicle:
                          <strong className="text-navy-950 font-mono font-black">
                            {policy.vehicle_year} {policy.vehicle_make} {policy.vehicle_model}
                          </strong>
                        </span>
                        <span className="font-mono bg-slate-100 text-navy-950 px-2 py-0.5 rounded font-bold border border-slate-200">
                          Reg: {policy.vehicle_reg_number}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* BINDING UNDERWRITING RESTRICTIONS & POLICY CONSTRAINTS */}
            {policy && (
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white shadow-xl space-y-3.5 border border-slate-700">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-cyan-400" />
                    <h5 className="font-black text-xs uppercase tracking-wider text-slate-200">
                      Underwriting Policy Restrictions & Coverage Constraints
                    </h5>
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase bg-slate-800 text-cyan-300 px-2 py-0.5 rounded border border-slate-700">
                    Enforced Rules
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Coverage Limit</span>
                    <strong className="text-cyan-300 text-sm font-mono font-black">${policy.coverage_amount?.toLocaleString()} {policy.currency}</strong>
                    <p className="text-[11px] text-slate-400 mt-1">Claim amounts exceeding this cap are blocked from automatic approval.</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Eligible Scope</span>
                    <strong className="text-white text-xs block">
                      {policy.type === 'automobile' 
                        ? (isBike ? 'Two-Wheeler (Motorcycle/Scooter)' : 'Four-Wheeler (Passenger Car)')
                        : 'Hospitalization & Surgery'}
                    </strong>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {policy.type === 'automobile'
                        ? (isBike ? '4-wheeler claims under this policy will be flagged and declined.' : '2-wheeler claims under this policy will be flagged.')
                        : 'Routine cosmetic or outpatient visits are excluded.'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Reporting & Deductible</span>
                    <strong className="text-white text-xs block">30 Days · $500 Deductible</strong>
                    <p className="text-[11px] text-slate-400 mt-1">Incident must be reported within 30 days of occurrence date.</p>
                  </div>
                </div>

                {/* Previous Policy Reflection Banner if changed */}
                {previousPolicy && previousPolicy.id !== policy.id && (
                  <div className="mt-3 p-3 rounded-xl bg-blue-950/90 border border-blue-600/80 text-xs text-blue-200 flex items-start gap-2.5">
                    <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-black text-white uppercase text-[10px] tracking-wide block">Previous Policy Updated</span>
                      <p className="text-[11px] text-blue-200">
                        Switched from <strong className="text-white font-mono">{previousPolicy.policy_number}</strong> (${previousPolicy.coverage_amount?.toLocaleString()}) to <strong className="text-white font-mono">{policy.policy_number}</strong> (${policy.coverage_amount?.toLocaleString()}). Auto-populated vehicle records and underwriting rules updated.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* REST OF THE INTAKE FORM */}
      {policy && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          {/* STEP 2: Incident & Financial Claim Scope */}
          <div id="step-2-scope" className={`transition-all duration-500 rounded-3xl ${activeStep === 2 ? 'ring-2 ring-blue-500/40 shadow-2xl shadow-blue-900/10' : ''}`}>
            <Card className="aave-glass-card rounded-3xl overflow-hidden shadow-xl border border-white/90 aave-step-pane">
              <CardHeader className="border-b border-slate-200/80 pb-4">
                <CardTitle className="text-lg font-black text-navy-950 flex items-center gap-2">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-navy-900 text-white text-xs font-black">2</span>
                  <span>Step 2: Incident Scope & Financial Claim Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-black uppercase tracking-wider text-navy-950 mb-1.5">
                      Claim Title / Summary *
                    </label>
                    <Input 
                      {...register('title', { required: 'Title is required' })} 
                      error={errors.title?.message as string} 
                      placeholder="e.g. Front bumper collision on expressway / Emergency knee surgery hospitalization"
                      className="ios-input rounded-xl text-sm font-semibold text-navy-950"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-xs font-black uppercase tracking-wider text-navy-950 mb-1.5">
                      Incident Description & Circumstances
                    </label>
                    <Textarea 
                      {...register('description')} 
                      rows={3} 
                      placeholder="Provide a chronological description of how and when the incident or medical emergency occurred..." 
                      className="ios-input rounded-xl text-sm font-semibold text-navy-950"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-navy-950 mb-1.5 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-blue-700" /> Incident Date *
                    </label>
                    <Input 
                      type="date" 
                      {...register('incident_date', { required: 'Date is required' })} 
                      max={new Date().toISOString().split('T')[0]} 
                      error={errors.incident_date?.message as string} 
                      className="ios-input rounded-xl text-sm font-semibold text-navy-950"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-navy-950 mb-1.5">
                      Injury / Severity Level *
                    </label>
                    <Select 
                      {...register('injury_severity', { required: 'Severity is required' })} 
                      options={[
                        { value: 'None', label: 'None (Property damage only / Routine)' },
                        { value: 'Minor', label: 'Minor (Outpatient / First aid / Bruises)' },
                        { value: 'Major', label: 'Major (Severe trauma / Inpatient surgery)' }
                      ]}
                      error={errors.injury_severity?.message as string}
                      className="ios-input rounded-xl text-sm font-semibold text-navy-950"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-navy-950 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5"><DollarSign className="h-3.5 w-3.5 text-blue-700" /> Estimated Claim Amount *</span>
                      <span className="text-[11px] font-bold text-slate-600 font-mono">Max: ${policy.coverage_amount?.toLocaleString()} {policy.currency}</span>
                    </label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      min="1" 
                      {...register('claim_amount', { required: 'Amount required', min: 1 })} 
                      error={errors.claim_amount?.message as string} 
                      placeholder="e.g. 4500"
                      className={`ios-input rounded-xl text-sm font-black ${isAmountExceeded ? 'border-rose-500 text-rose-700 bg-rose-50/50' : 'text-navy-950'}`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-navy-950 mb-1.5">
                      Settlement Currency *
                    </label>
                    <Select 
                      {...register('currency', { required: 'Currency required' })} 
                      options={[
                        { value: 'USD', label: 'USD ($) - United States Dollar' },
                        { value: 'EUR', label: 'EUR (€) - Euro' },
                        { value: 'GBP', label: 'GBP (£) - British Pound' },
                        { value: 'INR', label: 'INR (₹) - Indian Rupee' },
                        { value: 'AUD', label: 'AUD ($) - Australian Dollar' }
                      ]}
                      error={errors.currency?.message as string}
                      className="ios-input rounded-xl text-sm font-semibold text-navy-950"
                    />
                  </div>

                  {/* Real-time Over-limit Policy Restriction Alert */}
                  {isAmountExceeded && (
                    <div className="md:col-span-2 p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-950 flex items-start gap-3 shadow-md animate-pulse">
                      <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="font-black text-xs uppercase tracking-wider text-rose-900">
                          Policy Restriction Violation Alert
                        </h5>
                        <p className="text-xs font-semibold text-rose-800 mt-0.5">
                          Entered amount of <strong>${Number(watchedAmount).toLocaleString()}</strong> exceeds the maximum underwritten policy limit of <strong>${policy.coverage_amount?.toLocaleString()} {policy.currency}</strong>. Underwriting rules strictly cap payouts at the policy coverage ceiling.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* STEP 3: DYNAMIC VEHICLE OR HEALTH SPECIFICATIONS */}
          <div id="step-3-specs" className={`transition-all duration-500 rounded-3xl ${activeStep === 3 ? 'ring-2 ring-blue-500/40 shadow-2xl shadow-blue-900/10' : ''}`}>
            <Card className="aave-glass-card rounded-3xl overflow-hidden shadow-xl border border-white/90 aave-step-pane">
              <CardHeader className="border-b border-slate-200/80 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <CardTitle className="text-lg font-black text-navy-950 flex items-center gap-2">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-navy-900 text-white text-xs font-black">3</span>
                    {policy.type === 'automobile' ? (
                      <>
                        <VehicleIcon className={`h-5 w-5 ${isBike ? 'text-cyan-700' : 'text-blue-700'}`} />
                        <span>Step 3: {isBike ? 'Two-Wheeler / Bike' : 'Four-Wheeler / Car'} Specifications</span>
                      </>
                    ) : (
                      <>
                        <HeartPulse className="h-5 w-5 text-emerald-600" />
                        <span>Step 3: Medical & Hospitalization Specifications</span>
                      </>
                    )}
                  </CardTitle>
                  
                  {policy.type === 'automobile' && (
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-300 flex items-center gap-1 self-start sm:self-auto shadow-xs">
                      <Sparkles className="h-3 w-3 text-emerald-600" /> Auto-populated from Policy Records
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {policy.type === 'automobile' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-navy-950 mb-1.5">
                        Incident Classification *
                      </label>
                      <Select 
                        {...register('incident_type', { required: 'Required' })} 
                        options={[
                          { value: 'Collision', label: '💥 Collision / Traffic Accident' },
                          { value: 'Theft', label: '🚨 Theft / Stolen Vehicle or Parts' },
                          { value: 'Fire', label: '🔥 Fire & Thermal Damage' },
                          { value: 'Vandalism', label: '🔨 Vandalism / Malicious Scratches' },
                          { value: 'Flood', label: '🌊 Flood / Submersion / Water Ingress' },
                          { value: 'Hit & Run', label: '⚠️ Hit & Run by Third-Party' }
                        ]}
                        error={errors.incident_type?.message as string}
                        className="ios-input rounded-xl text-sm font-semibold text-navy-950"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-navy-950 mb-1.5 flex items-center justify-between">
                        <span>Vehicle Maker / Brand *</span>
                        <span className="text-[10px] text-emerald-800 font-black uppercase bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">Verified</span>
                      </label>
                      <Input 
                        {...register('vehicle_make', { required: 'Maker is required' })} 
                        error={errors.vehicle_make?.message as string} 
                        placeholder="e.g. Toyota, Yamaha"
                        className="ios-input rounded-xl text-sm bg-white font-bold text-navy-950"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-navy-950 mb-1.5 flex items-center justify-between">
                        <span>Vehicle Model *</span>
                        <span className="text-[10px] text-emerald-800 font-black uppercase bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">Verified</span>
                      </label>
                      <Input 
                        {...register('vehicle_model', { required: 'Model is required' })} 
                        error={errors.vehicle_model?.message as string} 
                        placeholder="e.g. Camry, YZF-R3"
                        className="ios-input rounded-xl text-sm bg-white font-bold text-navy-950"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-navy-950 mb-1.5 flex items-center justify-between">
                        <span>Vehicle Model Year *</span>
                        <span className="text-[10px] text-emerald-800 font-black uppercase bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">Verified</span>
                      </label>
                      <Input 
                        type="number" 
                        min="1900" 
                        max="2100" 
                        {...register('vehicle_year', { required: 'Year is required' })} 
                        error={errors.vehicle_year?.message as string} 
                        className="ios-input rounded-xl text-sm bg-white font-bold text-navy-950"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-navy-950 mb-1.5 flex items-center justify-between">
                        <span>Registration Number</span>
                        <span className="text-[10px] text-emerald-800 font-black uppercase bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">Verified</span>
                      </label>
                      <Input 
                        {...register('vehicle_reg_number')} 
                        placeholder="e.g. KA-01-AB-1234" 
                        className="ios-input rounded-xl text-sm font-mono font-black uppercase bg-white text-navy-950" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-navy-950 mb-1.5 flex items-center justify-between">
                        <span>Chassis Number / VIN</span>
                        <span className="text-[10px] text-emerald-800 font-black uppercase bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">Verified</span>
                      </label>
                      <Input 
                        {...register('chassis_number')} 
                        placeholder="e.g. AVTY984723948201" 
                        className="ios-input rounded-xl text-sm font-mono font-black uppercase bg-white text-navy-950" 
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-black uppercase tracking-wider text-navy-950 mb-1.5">
                        Damage Itemization & Affected Components
                      </label>
                      <Textarea 
                        {...register('damage_description')} 
                        rows={3} 
                        placeholder="Itemize damaged parts (e.g. front bumper cracked, left headlight shattered, radiator leaking, handlebar aligned)..." 
                        className="ios-input rounded-xl text-sm font-semibold text-navy-950"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-navy-950 mb-1.5">
                        Treatment Type *
                      </label>
                      <Select 
                        {...register('treatment_type', { required: 'Required' })} 
                        options={[
                          { value: 'Hospitalization', label: '🏥 Inpatient Hospitalization' },
                          { value: 'Surgery', label: '⚕️ Surgical Procedure' },
                          { value: 'Emergency', label: '🚑 Emergency Room / Trauma' },
                          { value: 'Outpatient', label: '🩺 Outpatient Specialist Care' },
                          { value: 'Pharmacy', label: '💊 Prescription Medication' }
                        ]}
                        error={errors.treatment_type?.message as string}
                        className="ios-input rounded-xl text-sm font-semibold text-navy-950"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-navy-950 mb-1.5">
                        Hospital / Clinic Facility Name *
                      </label>
                      <Input 
                        {...register('hospital_name', { required: 'Required' })} 
                        error={errors.hospital_name?.message as string} 
                        placeholder="e.g. St. Jude Memorial Hospital"
                        className="ios-input rounded-xl text-sm font-bold text-navy-950"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-navy-950 mb-1.5">
                        Primary Clinical Diagnosis
                      </label>
                      <Input 
                        {...register('diagnosis')} 
                        placeholder="e.g. Acute appendicitis / Compound fracture"
                        className="ios-input rounded-xl text-sm font-semibold text-navy-950"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-navy-950 mb-1.5">
                        Attending / Treating Physician
                      </label>
                      <Input 
                        {...register('treating_doctor')} 
                        placeholder="e.g. Dr. Robert Chen, MD"
                        className="ios-input rounded-xl text-sm font-semibold text-navy-950"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-navy-950 mb-1.5">
                        Hospital Admission Date
                      </label>
                      <Input 
                        type="date" 
                        {...register('admission_date')} 
                        className="ios-input rounded-xl text-sm font-semibold text-navy-950"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-navy-950 mb-1.5">
                        Discharge Date
                      </label>
                      <Input 
                        type="date" 
                        {...register('discharge_date')} 
                        className="ios-input rounded-xl text-sm font-semibold text-navy-950"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* STEP 4: Supporting Proof & Document Upload */}
          <div id="step-4-proof" className={`transition-all duration-500 rounded-3xl ${activeStep === 4 ? 'ring-2 ring-blue-500/40 shadow-2xl shadow-blue-900/10' : ''}`}>
            <Card className="aave-glass-card rounded-3xl overflow-hidden shadow-xl border border-white/90 aave-step-pane">
              <CardHeader className="border-b border-slate-200/80 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-black text-navy-950 flex items-center gap-2">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-navy-900 text-white text-xs font-black">4</span>
                    <span>Step 4: Evidentiary Documents & Uploads</span>
                  </CardTitle>
                  <span className="text-xs text-slate-700 font-bold flex items-center gap-1">
                    <Lock className="h-3 w-3 text-slate-600" /> AES-256 Encrypted
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <DocumentUpload 
                  onFilesChange={setFiles}
                  hint={policy.type === 'automobile' 
                    ? 'Accident scene photographs, police FIR copy, authorized repair estimate, driver license scan'
                    : 'Hospital discharge summary, itemized medical bills, pharmacy receipts, attending doctor diagnosis report'
                  }
                />
              </CardContent>
            </Card>
          </div>

          {/* Error Banner */}
          {submitError && (
            <Alert variant="error" className="shadow-sm">
              {submitError}
            </Alert>
          )}

          {/* Bottom Action Strip */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200/80">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Info className="h-4 w-4 text-blue-700" />
              <span>Claims are recorded in an immutable audit ledger and evaluated by XGBoost ML triage.</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/claims')}
                className="aave-lens text-navy-950 font-bold rounded-xl px-5"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="aave-lens-active shadow-xl shadow-navy-900/25 px-8 py-3 rounded-xl font-black text-sm"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Spinner size="sm" className="text-white" /> Filing Claim...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    Submit Insurance Claim <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
