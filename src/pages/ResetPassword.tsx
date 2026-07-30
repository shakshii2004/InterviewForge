import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const ResetPassword = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    try {
      const response = await api.post('/auth/reset-password', data);
      if (response.data.success) {
        toast.success(response.data.message);
        navigate('/login');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md p-8 relative z-10">
        <div className="mb-10 text-center">
          <Link to="/" className="inline-flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 bg-card/10 rounded-xl flex items-center justify-center border border-white/20 backdrop-blur-md">
              <span className="text-white font-bold text-xl">I</span>
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Set new password</h1>
          <p className="text-white/60">Your new password must be different.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-card/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Reset Token</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-white/40" />
                </div>
                <input
                  type="text"
                  {...register('token')}
                  className="block w-full pl-11 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all"
                  placeholder="Paste your reset token"
                />
              </div>
              {errors.token && <p className="mt-2 text-sm text-red-400">{errors.token.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-white/40" />
                </div>
                <input
                  type="password"
                  {...register('newPassword')}
                  className="block w-full pl-11 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
              {errors.newPassword && <p className="mt-2 text-sm text-red-400">{errors.newPassword.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-8 w-full flex items-center justify-center gap-2 bg-card text-primary py-3 px-4 rounded-xl font-medium hover:bg-card/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-white transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Reset password
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
          
          <p className="mt-6 text-center text-sm text-white/60">
            <Link to="/login" className="text-accent font-medium hover:text-white transition-colors">
              Back to login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};
