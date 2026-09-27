import { 
  Car, Bike, HeartPulse, ArrowRight, Sparkles, CheckCircle2, 
  Shield, Check
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { useAuth } from "../auth/AuthContext";

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="space-y-24 py-6 sm:py-10">
      
      {/* HERO SECTION */}
      <div className="relative text-center max-w-4xl mx-auto space-y-6 pt-4">
        
        {/* Apple-style Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full ios-glass text-xs font-bold text-navy-900 shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
          <span className="tracking-wide uppercase">AV Insurance Group · ClaimDesk Portal</span>
          <span className="text-slate-300">|</span>
          <span className="text-xs font-semibold text-gold-600 flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> Digital Intake Engine
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-black text-navy-900 tracking-tight leading-[1.12]">
          Intelligent Insurance Claims. <br />
          <span className="bg-gradient-to-r from-navy-900 via-blue-700 to-navy-800 bg-clip-text text-transparent">
            Settled with Absolute Clarity.
          </span>
        </h1>

        <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
          From four-wheelers and motorcycles to medical hospitalizations — file claims in under 2 minutes, auto-verify policy records, and track resolution through a real-time state machine.
        </p>
        
        {/* Main CTA Buttons */}
        <div className="flex flex-wrap justify-center gap-4 pt-2">
          {user ? (
            <Link to={user.role === 'claimant' ? '/claims' : '/officer'}>
              <Button size="lg" className="flex items-center gap-2 shadow-xl shadow-navy-900/20 px-8 py-3 rounded-2xl">
                <span>Enter Your Dashboard</span> <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/claims/new">
                <Button size="lg" className="flex items-center gap-2 shadow-xl shadow-navy-900/20 px-8 py-3 rounded-2xl">
                  <span>File a Claim Online</span> <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="ios-glass rounded-2xl px-6 py-3 font-bold text-slate-800">
                  <span>Adjuster Workstation</span>
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Trust Badges Bar */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-semibold">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Instant Policy Verification
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Machine Learning Triaging
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> 256-bit AES Cryptographic Audit Log
          </span>
        </div>
      </div>

      {/* STATS STRIP (Apple Frosted Glass Style) */}
      <div className="max-w-5xl mx-auto">
        <div className="p-8 rounded-3xl ios-glass grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-3xl sm:text-4xl font-black text-navy-900 tracking-tight">99.8%</p>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">Resolution Accuracy</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black text-navy-900 tracking-tight">&lt; 24h</p>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">Priority Triage SLA</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black text-navy-900 tracking-tight">$250M+</p>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">Underwritten Claims</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black text-navy-900 tracking-tight">100%</p>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">Audit Ledger Integrity</p>
          </div>
        </div>
      </div>

      {/* DYNAMIC COVERAGE TILES */}
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
            Supported Insurance Coverages
          </h2>
          <p className="text-sm text-slate-500 max-w-lg mx-auto">
            Comprehensive intake workflows specifically engineered for automobile and medical portfolios.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Automobile (Car) */}
          <div className="p-6 rounded-3xl ios-card interactive-tile flex flex-col justify-between group">
            <div>
              <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-sm">
                <Car className="h-6 w-6" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-navy-900">Private Automobile</h3>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
                  4-Wheeler / Car
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Full coverage for collision, theft, third-party damage, and vandalism. Automatically retrieves VIN, chassis number, and registration credentials.
              </p>
              <ul className="text-xs text-slate-600 space-y-1.5 mb-4 font-medium">
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-blue-600" /> Bumper-to-bumper damage intake
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-blue-600" /> Police FIR & repair estimate upload
                </li>
              </ul>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-700">
              <span>Auto-filled from policy record</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Two-Wheeler / Bike (Cyan & Steel Blue - No Purple) */}
          <div className="p-6 rounded-3xl ios-card interactive-tile flex flex-col justify-between group">
            <div>
              <div className="h-12 w-12 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-sm">
                <Bike className="h-6 w-6" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-navy-900">Motorcycle & Cruiser</h3>
                <span className="text-[10px] font-bold bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded-full border border-cyan-200">
                  2-Wheeler / Bike
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Specialized intake for supersport, commuters, and cruisers. Includes handlebar, fairing, thermal damage, and mechanical inspection reporting.
              </p>
              <ul className="text-xs text-slate-600 space-y-1.5 mb-4 font-medium">
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-cyan-600" /> Dynamic two-wheeler specifications
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-cyan-600" /> Engine & chassis number mapping
                </li>
              </ul>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-cyan-700">
              <span>Auto-filled from policy record</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Health & Hospitalization */}
          <div className="p-6 rounded-3xl ios-card interactive-tile flex flex-col justify-between group">
            <div>
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-sm">
                <HeartPulse className="h-6 w-6" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-navy-900">Medical & Health</h3>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                  Inpatient & Surgery
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Inpatient hospitalizations, surgical procedures, and emergency trauma claims. Direct capture of clinical diagnosis, physician, and discharge dates.
              </p>
              <ul className="text-xs text-slate-600 space-y-1.5 mb-4 font-medium">
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-600" /> Hospital discharge & bill auditing
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-600" /> Multi-currency reimbursement parity
                </li>
              </ul>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
              <span>Coverage utilization meter</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>
      </div>

      {/* ENTERPRISE CTA STRIP */}
      <div className="max-w-6xl mx-auto pt-6">
        <div className="p-8 sm:p-10 rounded-3xl aave-glass border border-white/90 text-navy-950 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
          <div className="space-y-2 text-center md:text-left relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 border border-blue-200 text-xs font-bold text-blue-900">
              <Shield className="h-3.5 w-3.5 text-blue-700" /> Enterprise Policyholder Portal
            </div>
            <h4 className="text-2xl sm:text-3xl font-black text-navy-900 tracking-tight">Ready to File a Claim?</h4>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl font-medium">
              Submit in under 2 minutes with automated vehicle registry auto-population and intelligent priority triage.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0 relative z-10">
            <Link to="/claims/new">
              <Button size="lg" className="bg-navy-900 text-white hover:bg-navy-800 shadow-xl font-bold px-7 py-3 rounded-xl text-sm">
                Start Claim Intake
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* CORPORATE FOOTER */}
      <footer className="pt-16 border-t border-slate-200/80 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-12">
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-xl bg-navy-900 text-white">
                <Shield className="h-4 w-4" />
              </div>
              <span className="text-sm font-black text-navy-900">AV Insurance Group</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Global underwriter providing automobile, motorcycle, and family health insurance with algorithmic claim settlements.
            </p>
            <p className="text-[11px] text-slate-400 font-mono">
              NAIC #94821 · PRA Reg #204918
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-navy-900 uppercase tracking-wider text-[11px]">Insurance Lines</h5>
            <ul className="space-y-1.5">
              <li><span className="hover:text-navy-900 cursor-pointer">Comprehensive Private Car</span></li>
              <li><span className="hover:text-navy-900 cursor-pointer">Two-Wheeler & Supersport</span></li>
              <li><span className="hover:text-navy-900 cursor-pointer">Family Health & Medical</span></li>
              <li><span className="hover:text-navy-900 cursor-pointer">Commercial Fleet Protection</span></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-navy-900 uppercase tracking-wider text-[11px]">ClaimDesk Engine</h5>
            <ul className="space-y-1.5">
              <li><Link to="/claims/new" className="hover:text-navy-900">File a Claim Online</Link></li>
              <li><Link to="/login" className="hover:text-navy-900">Claims Adjuster Workstation</Link></li>
              <li><Link to="/claims" className="hover:text-navy-900">Claim Status Tracker</Link></li>
              <li><Link to="/claims/new" className="hover:text-navy-900">Real-Time FX Parity</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-navy-900 uppercase tracking-wider text-[11px]">Security & Legal</h5>
            <ul className="space-y-1.5">
              <li><span className="hover:text-navy-900 cursor-pointer">ISO 27001 Certified</span></li>
              <li><span className="hover:text-navy-900 cursor-pointer">256-bit AES Document Vault</span></li>
              <li><span className="hover:text-navy-900 cursor-pointer">Privacy Policy & Terms</span></li>
              <li><span className="hover:text-navy-900 cursor-pointer">Audit Ledger Verification</span></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-200/60 py-6 text-center text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-6xl mx-auto">
          <span>&copy; {new Date().getFullYear()} AV Insurance Group. All rights reserved.</span>
          <span className="text-[11px]">ClaimDesk &middot; Enterprise Automated Claims Processing System</span>
        </div>
      </footer>

    </div>
  );
}
