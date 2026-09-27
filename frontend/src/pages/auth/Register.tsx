import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Sparkles, Mail, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Alert } from '../../components/ui/Alert';

const registerSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirm_password: z.string(),
  role: z.enum(['claimant'])
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'claimant' }
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      setError('');
      await registerUser(data);
      navigate('/claims'); 
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register account. Please check details.');
    }
  };

  return (
    <div className="max-w-lg mx-auto py-8 sm:py-14">
      <Card className="aave-glass-card shadow-2xl rounded-3xl overflow-hidden">
        <CardHeader className="text-center pb-4 pt-8">
          <div className="mx-auto p-3.5 rounded-2xl bg-gradient-to-tr from-navy-900 via-navy-800 to-blue-700 text-white shadow-xl shadow-navy-900/20 mb-3 inline-block">
            <Shield className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl font-black text-navy-950 tracking-tight flex items-center justify-center gap-1.5">
            Create Policyholder Account <Sparkles className="h-4 w-4 text-amber-500 fill-amber-500" />
          </CardTitle>
          <p className="text-xs text-slate-700 font-medium mt-1">
            Register to track active insurance policies and file digital claims
          </p>
        </CardHeader>

        <CardContent className="px-6 sm:px-8 pb-8 space-y-6">
          {error && <Alert variant="error" className="shadow-sm">{error}</Alert>}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-navy-950 mb-1.5 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-navy-800" /> Full Legal Name
              </label>
              <Input 
                {...register('full_name')} 
                error={errors.full_name?.message} 
                placeholder="e.g. Alice Brown"
                className="ios-input rounded-xl text-sm font-semibold text-navy-950"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-navy-950 mb-1.5 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-navy-800" /> Email Address
              </label>
              <Input 
                {...register('email')} 
                type="email"
                error={errors.email?.message} 
                placeholder="name@example.com"
                className="ios-input rounded-xl text-sm font-semibold text-navy-950" 
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-navy-950 mb-1.5 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-navy-800" /> Password
                </label>
                <Input 
                  type="password" 
                  {...register('password')} 
                  error={errors.password?.message} 
                  placeholder="••••••••"
                  className="ios-input rounded-xl text-sm font-semibold text-navy-950"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-navy-950 mb-1.5 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-navy-800" /> Confirm Password
                </label>
                <Input 
                  type="password" 
                  {...register('confirm_password')} 
                  error={errors.confirm_password?.message} 
                  placeholder="••••••••"
                  className="ios-input rounded-xl text-sm font-semibold text-navy-950"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-navy-950 mb-1.5">
                Account Designation
              </label>
              <Select 
                {...register('role')} 
                error={errors.role?.message} 
                options={[{ value: 'claimant', label: 'Policyholder / Claimant' }]}
                className="ios-input rounded-xl text-sm font-semibold text-navy-950"
              />
            </div>

            <Button type="submit" className="w-full shadow-lg shadow-navy-900/20 py-2.5 mt-3 rounded-xl font-bold" disabled={isSubmitting}>
              {isSubmitting ? 'Registering Account...' : (
                <span className="flex items-center justify-center gap-2">
                  <span>Complete Account Registration</span> <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-500">
            Already registered?{' '}
            <Link to="/login" className="text-navy-900 font-bold hover:underline">
              Sign in to your account
            </Link>
          </div>

          <div className="pt-4 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> 256-bit TLS Session
            </span>
            <span>GDPR & ISO Compliant</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
