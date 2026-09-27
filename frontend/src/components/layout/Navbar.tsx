import { Shield, Sparkles, LogOut } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";

export function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b border-white/70 aave-glass sticky top-0 z-50 transition-all shadow-[0_4px_24px_-4px_rgba(10,37,64,0.06)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-2.5 group">
          <div className="p-2 rounded-2xl bg-gradient-to-tr from-navy-900 via-navy-800 to-blue-700 text-white shadow-md shadow-navy-900/20 group-hover:scale-105 transition-transform duration-200">
            <Shield className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight text-navy-900 flex items-center gap-1.5">
              ClaimDesk <Sparkles className="h-3.5 w-3.5 text-gold-500 fill-gold-500" />
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 -mt-1">AV Insurance Group</span>
          </div>
        </Link>

        {user ? (
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60">
              {user.role === 'claimant' ? (
                <>
                  <Link 
                    to="/claims" 
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isActive('/claims') 
                        ? 'bg-white text-navy-900 shadow-sm' 
                        : 'text-slate-600 hover:text-navy-900 hover:bg-white/50'
                    }`}
                  >
                    My Claims
                  </Link>
                  <Link 
                    to="/claims/new" 
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isActive('/claims/new') 
                        ? 'bg-white text-navy-900 shadow-sm' 
                        : 'text-slate-600 hover:text-navy-900 hover:bg-white/50'
                    }`}
                  >
                    + File New Claim
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to="/officer" 
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isActive('/officer') 
                        ? 'bg-white text-navy-900 shadow-sm' 
                        : 'text-slate-600 hover:text-navy-900 hover:bg-white/50'
                    }`}
                  >
                    Workstation
                  </Link>
                  <Link 
                    to="/officer/claims" 
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isActive('/officer/claims') 
                        ? 'bg-white text-navy-900 shadow-sm' 
                        : 'text-slate-600 hover:text-navy-900 hover:bg-white/50'
                    }`}
                  >
                    All Claims
                  </Link>
                </>
              )}
            </div>
            
            <div className="flex items-center space-x-3.5">
              <div className="hidden sm:flex items-center space-x-2 pl-2 border-l border-slate-200">
                <span className="text-xs font-bold text-slate-800">{user.full_name}</span>
                <Badge variant={user.role === 'supervisor' ? 'warning' : 'default'} className="text-[10px] px-2 py-0.5 rounded-lg">
                  {user.role.toUpperCase()}
                </Badge>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={logout}
                className="text-xs flex items-center gap-1.5 text-slate-600 hover:text-red-600 hover:border-red-200 rounded-xl"
              >
                <LogOut className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <Link to="/login">
              <Button variant="outline" size="sm" className="rounded-xl">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm" className="rounded-xl shadow-md shadow-navy-900/15">Create Account</Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export function AppShell() {
  return (
    <div className="min-h-screen glass-mesh-bg relative flex flex-col selection:bg-blue-100 selection:text-navy-900">
      {/* Ambient background glow orbs - refractive lighting for Aave glass */}
      <div className="pointer-events-none fixed -top-40 -right-40 w-96 h-96 bg-blue-400/15 rounded-full blur-3xl"></div>
      <div className="pointer-events-none fixed top-1/3 -left-40 w-96 h-96 bg-cyan-400/12 rounded-full blur-3xl"></div>
      <div className="pointer-events-none fixed -bottom-40 right-1/4 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl"></div>
      
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <Outlet />
      </main>
    </div>
  );
}
