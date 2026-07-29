import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Camera, Save, User as UserIcon, Briefcase, Code, Link as LinkIcon } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  targetRole: z.string().optional(),
  experienceLevel: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']).optional(),
  skills: z.string().optional(), // Comma separated string for form
  github: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  linkedin: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  profileImage: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const Profile = () => {
  const { user, login } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/profile');
        if (response.data.success) {
          const profile = response.data.profile;
          reset({
            name: profile.name,
            bio: profile.bio || '',
            targetRole: profile.targetRole || '',
            experienceLevel: profile.experienceLevel || 'Intermediate',
            skills: profile.skills?.join(', ') || '',
            github: profile.github || '',
            linkedin: profile.linkedin || '',
            profileImage: profile.profileImage || '',
          });
        }
      } catch (error) {
        toast.error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [reset]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    try {
      const skillsArray = data.skills 
        ? data.skills.split(',').map(s => s.trim()).filter(Boolean)
        : [];
      
      const payload = {
        ...data,
        skills: skillsArray
      };

      const response = await api.put('/profile', payload);
      if (response.data.success) {
        toast.success('Profile updated successfully!');
        // Update global auth state with new name/image
        login({ ...user!, name: data.name, profileImage: data.profileImage });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="animate-pulse flex space-x-4">Loading profile...</div>;
  }

  return (
    <div className="max-w-4xl animate-in fade-in duration-500 pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">My Profile</h1>
        <p className="text-text-secondary">Manage your public presence and professional details.</p>
      </div>

      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)} className="divide-y divide-border">
          
          {/* Avatar Section */}
          <div className="p-8 flex flex-col sm:flex-row items-center gap-8">
            <div className="relative group cursor-pointer">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-3xl">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="flex-1 w-full sm:w-auto">
              <label className="block text-sm font-bold text-primary mb-2">Profile Image URL</label>
              <input 
                {...register('profileImage')}
                type="text" 
                placeholder="https://example.com/avatar.jpg"
                className="w-full px-4 py-2 bg-gray-50 border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent transition-all"
              />
              {errors.profileImage && <p className="mt-1 text-sm text-error">{errors.profileImage.message}</p>}
            </div>
          </div>

          {/* Basic Info Section */}
          <div className="p-8 space-y-6">
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-accent" /> Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-primary mb-2">Full Name</label>
                <input 
                  {...register('name')}
                  type="text" 
                  className="w-full px-4 py-2 bg-gray-50 border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                />
                {errors.name && <p className="mt-1 text-sm text-error">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-primary mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-2 bg-gray-100 border border-border rounded-lg text-text-secondary cursor-not-allowed"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-primary mb-2">Professional Bio</label>
                <textarea 
                  {...register('bio')}
                  rows={4}
                  placeholder="Tell us about yourself..."
                  className="w-full px-4 py-2 bg-gray-50 border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent transition-all resize-none"
                />
                {errors.bio && <p className="mt-1 text-sm text-error">{errors.bio.message}</p>}
              </div>
            </div>
          </div>

          {/* Career Section */}
          <div className="p-8 space-y-6">
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-accent" /> Career Objectives
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-primary mb-2">Target Role</label>
                <input 
                  {...register('targetRole')}
                  type="text" 
                  placeholder="e.g. Frontend Engineer, Full Stack Developer"
                  className="w-full px-4 py-2 bg-gray-50 border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-primary mb-2">Experience Level</label>
                <select 
                  {...register('experienceLevel')}
                  className="w-full px-4 py-2 bg-gray-50 border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                >
                  <option value="Beginner">Beginner (0-2 years)</option>
                  <option value="Intermediate">Intermediate (3-5 years)</option>
                  <option value="Advanced">Advanced (6-9 years)</option>
                  <option value="Expert">Expert (10+ years)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-primary mb-2">Skills (comma separated)</label>
                <div className="relative">
                  <Code className="w-5 h-5 text-text-secondary absolute left-3 top-2.5" />
                  <input 
                    {...register('skills')}
                    type="text" 
                    placeholder="React, TypeScript, Node.js"
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="p-8 space-y-6">
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-accent" /> Web Presence
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-primary mb-2">GitHub URL</label>
                <input 
                  {...register('github')}
                  type="text" 
                  placeholder="https://github.com/username"
                  className="w-full px-4 py-2 bg-gray-50 border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                />
                {errors.github && <p className="mt-1 text-sm text-error">{errors.github.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-primary mb-2">LinkedIn URL</label>
                <input 
                  {...register('linkedin')}
                  type="text" 
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-4 py-2 bg-gray-50 border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                />
                {errors.linkedin && <p className="mt-1 text-sm text-error">{errors.linkedin.message}</p>}
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50 flex justify-end">
            <Button 
              type="submit" 
              disabled={isSaving}
              className={cn("flex items-center gap-2", isSaving ? "opacity-70 cursor-not-allowed" : "")}
            >
              {isSaving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Profile</>}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
