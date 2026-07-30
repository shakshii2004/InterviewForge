import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Key, Bell, Palette, LogOut, Save } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export const Settings = () => {
  const { logout, updateUser } = useAuth();
  const [theme, setTheme] = useState('light'); // default to light since UI is light
  const [notifications, setNotifications] = useState(true);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const response = await api.get('/profile');
        if (response.data.success && response.data.profile.preferences) {
          setTheme(response.data.profile.preferences.theme || 'light');
          setNotifications(response.data.profile.preferences.emailNotifications ?? true);
        }
      } catch (error) {
        // Silently fail if prefs can't load, defaults are fine
      }
    };
    fetchPrefs();
  }, []);

  // Instant preview effect
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const savePreferences = async () => {
    setIsSavingPrefs(true);
    try {
      await api.put('/profile/preferences', { theme, emailNotifications: notifications });
      updateUser({ preferences: { theme, emailNotifications: notifications } });
      toast.success('Preferences saved successfully!');
    } catch (error) {
      toast.error('Failed to save preferences');
    } finally {
      setIsSavingPrefs(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsSavingPassword(true);
    try {
      const response = await api.put('/profile/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      if (response.data.success) {
        toast.success('Password changed successfully!');
        reset();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl animate-in fade-in duration-500 pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">Settings</h1>
        <p className="text-text-secondary">Manage your account security and preferences.</p>
      </div>

      <div className="space-y-6">
        
        {/* Security Section */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border bg-background flex items-center gap-3">
            <Key className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-bold text-primary">Security</h2>
          </div>
          
          <form onSubmit={handleSubmit(onPasswordSubmit)} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-bold text-primary mb-2">Current Password</label>
              <input 
                {...register('currentPassword')}
                type="password" 
                className="w-full max-w-md px-4 py-2 bg-background border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent transition-all"
              />
              {errors.currentPassword && <p className="mt-1 text-sm text-error">{errors.currentPassword.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-bold text-primary mb-2">New Password</label>
              <input 
                {...register('newPassword')}
                type="password" 
                className="w-full max-w-md px-4 py-2 bg-background border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent transition-all"
              />
              {errors.newPassword && <p className="mt-1 text-sm text-error">{errors.newPassword.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-primary mb-2">Confirm New Password</label>
              <input 
                {...register('confirmPassword')}
                type="password" 
                className="w-full max-w-md px-4 py-2 bg-background border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent transition-all"
              />
              {errors.confirmPassword && <p className="mt-1 text-sm text-error">{errors.confirmPassword.message}</p>}
            </div>

            <div className="pt-2">
              <Button type="submit" disabled={isSavingPassword} size="sm">
                {isSavingPassword ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </form>
        </div>

        {/* Preferences Section */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border bg-background flex items-center gap-3">
            <Palette className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-bold text-primary">App Preferences</h2>
          </div>
          
          <div className="p-6 space-y-8">
            {/* Theme */}
            <div>
              <h3 className="text-sm font-bold text-primary mb-3">Color Theme</h3>
              <div className="flex gap-4">
                {['light', 'dark', 'system'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={cn(
                      "px-6 py-2 rounded-lg border text-sm font-medium transition-all capitalize",
                      theme === t 
                        ? "border-accent bg-accent/10 text-accent shadow-sm" 
                        : "border-border text-text-secondary hover:border-border bg-card"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Notifications */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Bell className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-bold text-primary">Email Notifications</h3>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={notifications}
                    onChange={() => setNotifications(!notifications)}
                  />
                  <div className={cn(
                    "block w-12 h-6 rounded-full transition-colors",
                    notifications ? "bg-accent" : "bg-border"
                  )}></div>
                  <div className={cn(
                    "dot absolute left-1 top-1 bg-card w-4 h-4 rounded-full transition-transform",
                    notifications ? "transform translate-x-6" : ""
                  )}></div>
                </div>
                <span className="text-sm text-text-secondary">
                  Receive interview reminders and performance reports
                </span>
              </label>
            </div>

            <div className="pt-2">
              <Button onClick={savePreferences} disabled={isSavingPrefs} size="sm" className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                {isSavingPrefs ? 'Saving...' : 'Save Preferences'}
              </Button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-card rounded-2xl border border-error/20 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-error/10 bg-error/5 flex items-center gap-3">
            <LogOut className="w-5 h-5 text-error" />
            <h2 className="text-lg font-bold text-error">Danger Zone</h2>
          </div>
          
          <div className="p-6">
            <p className="text-sm text-text-secondary mb-4">
              Logging out will end your current session. You will need to enter your credentials to access your dashboard again.
            </p>
            <Button onClick={logout} variant="secondary" className="border-error/20 text-error hover:bg-error/10">
              Log out securely
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};
