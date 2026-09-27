import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Sparkles, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  
  const { register, handleSubmit, resetField, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    }
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setError('');
      const loggedUser = await login(data);
      if (loggedUser && (loggedUser.role === 'officer' || loggedUser.role === 'supervisor')) {
        navigate('/officer');
      } else {
        navigate('/claims');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password. Please verify your credentials.');
      // Keep the entered email, only clear the password field
      resetField('password');
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 sm:py-14">
      
      {/* Aave Specular Refraction Glass Login Panel */}
      <Card className="aave-glass-card shadow-2xl rounded-3xl overflow-hidden">
        
        {/* Header with Glowing Shield Icon */}
        <CardHeader className="text-center pb-4 pt-8">
          <div className="mx-auto p-3.5 rounded-2xl bg-gradient-to-tr from-navy-900 via-navy-800 to-blue-700 text-white shadow-xl shadow-navy-900/20 mb-3 inline-block">
            <Shield className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl font-black text-navy-950 tracking-tight flex items-center justify-center gap-1.5">
            AV Insurance Portal <Sparkles className="h-4 w-4 text-amber-500 fill-amber-500" />
          </CardTitle>
          <p className="text-xs text-slate-700 font-medium mt-1">
            Sign in to access your claims tracker, policies, or adjuster workstation
          </p>
        </CardHeader>

        <CardContent className="px-6 sm:px-8 pb-8 space-y-6">
          {error && <Alert variant="error" className="shadow-sm">{error}</Alert>}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-navy-950 mb-1.5 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-navy-800" /> Work / Registered Email
              </label>
              <Input 
                {...register('email')} 
                type="email"
                autoComplete="email"
                error={errors.email?.message} 
                placeholder="name@example.com"
                className="ios-input rounded-xl text-sm font-semibold text-navy-950" 
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-navy-950 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-navy-800" /> Password
                </label>
                <span className="text-[11px] text-slate-600 font-bold uppercase tracking-wider">Encrypted</span>
              </div>
              <Input 
                type="password" 
                autoComplete="current-password"
                {...register('password')} 
                error={errors.password?.message} 
                placeholder="••••••••"
                className="ios-input rounded-xl text-sm font-semibold text-navy-950"
              />
            </div>

            <Button type="submit" className="w-full shadow-lg shadow-navy-900/20 py-2.5 mt-3 rounded-xl font-bold" disabled={isSubmitting}>
              {isSubmitting ? 'Authenticating...' : (
                <span className="flex items-center justify-center gap-2">
                  <span>Sign In to ClaimDesk</span> <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-500">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-navy-900 font-bold hover:underline">
              Create an account
            </Link>
          </div>

          {/* Security & Compliance Badges */}
          <div className="pt-4 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> 256-bit TLS Session
            </span>
            <span>ISO 27001 Certified</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
