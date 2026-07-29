import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response = await api.post('/auth/login', data);
      if (response.data.success) {
        login(response.data.user);
        toast.success('Logged in successfully!');
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary relative overflow-hidden font-sans">
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#a78bfa]/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md p-8 relative z-10">
        <div className="mb-10 text-center">
          <Link to="/" className="inline-flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 backdrop-blur-md">
              <span className="text-white font-bold text-xl">I</span>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">InterviewForge</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome back</h1>
          <p className="text-white/60">Enter your details to access your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-white/40" />
                </div>
                <input
                  type="email"
                  {...register('email')}
                  className="block w-full pl-11 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="mt-2 text-sm text-red-400">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-white/40" />
                </div>
                <input
                  type="password"
                  {...register('password')}
                  className="block w-full pl-11 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="mt-2 text-sm text-red-400">{errors.password.message}</p>}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 bg-black/20 border-white/10 rounded text-accent focus:ring-accent/50 focus:ring-offset-primary"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-white/60">
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <Link to="/forgot-password" className="text-accent hover:text-white transition-colors">
                Forgot password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-8 w-full flex items-center justify-center gap-2 bg-white text-primary py-3 px-4 rounded-xl font-medium hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-white transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Sign in
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="mt-6 text-center text-sm text-white/60">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent font-medium hover:text-white transition-colors">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};
