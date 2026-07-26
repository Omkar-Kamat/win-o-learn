import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { axiosClient } from '../../api/axiosClient';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  bio: z.string().max(300, 'Bio must be less than 300 characters').optional(),
  skills: z.string().optional(),
  socials: z.object({
    github: z.string().optional(),
    linkedin: z.string().optional(),
    portfolio: z.string().optional(),
  }).optional()
});

export default function Profile() {
  const { user, fetchUser, changePassword } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '' });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      bio: user?.bio || '',
      skills: user?.skills?.join(', ') || '',
      socials: {
        github: user?.socials?.github || '',
        linkedin: user?.socials?.linkedin || '',
        portfolio: user?.socials?.portfolio || '',
      }
    }
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const formattedData = {
        ...data,
        skills: data.skills ? data.skills.split(',').map(s => s.trim()) : [],
      };
      await axiosClient.put('/users/me', formattedData);
      toast.success('Profile updated successfully!');
      fetchUser();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      await axiosClient.put('/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Avatar updated successfully!');
      fetchUser();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update avatar');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordData.oldPassword || !passwordData.newPassword) return;
    setIsPasswordLoading(true);
    try {
      await changePassword(passwordData.oldPassword, passwordData.newPassword);
      toast.success('Password changed successfully!');
      setPasswordData({ oldPassword: '', newPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground mt-2">Manage your personal information and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <Card className="p-6">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 rounded-full bg-muted/50 border border-border overflow-hidden flex-shrink-0">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-semibold tracking-tight font-bold text-muted-foreground bg-primary/10/50">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Profile Picture</h3>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarChange} 
                  className="text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/10/80"
                />
              </div>
            </div>

            <h2 className="text-2xl font-semibold tracking-tight font-semibold text-foreground mb-6">Personal Info</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Full Name</label>
                  <Input {...register('name')} error={errors.name?.message} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
                  <Input value={user?.email || ''} disabled />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Skills (comma separated)</label>
                <Input {...register('skills')} placeholder="React, Node.js, Python" />
              </div>

              <div className="flex flex-col gap-1 w-full">
                <label className="text-sm font-medium text-foreground">Bio</label>
                <textarea
                  className={`h-24 py-3 px-4 rounded-[10px] bg-card border ${errors.bio ? 'border-error' : 'border-border'} text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none`}
                  {...register('bio')}
                  placeholder="Tell us about yourself..."
                ></textarea>
                {errors.bio && <span className="text-xs text-destructive">{errors.bio.message}</span>}
              </div>

              <h3 className="font-medium text-foreground pt-4">Social Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">GitHub</label>
                  <Input {...register('socials.github')} placeholder="https://github.com/username" />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">LinkedIn</label>
                  <Input {...register('socials.linkedin')} placeholder="https://linkedin.com/in/username" />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">Portfolio</label>
                  <Input {...register('socials.portfolio')} placeholder="https://yourwebsite.com" />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={isLoading}>Save Changes</Button>
              </div>
            </form>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold tracking-tight font-semibold text-foreground mb-6">Change Password</h2>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Current Password</label>
                <Input 
                  type="password" 
                  value={passwordData.oldPassword} 
                  onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})} 
                  required 
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">New Password</label>
                <Input 
                  type="password" 
                  value={passwordData.newPassword} 
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} 
                  required 
                />
              </div>
              <Button type="submit" disabled={isPasswordLoading} className="w-full">Update Password</Button>
            </form>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold tracking-tight font-semibold text-foreground mb-6">Preferences</h2>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground">Theme</h3>
                <p className="text-sm text-muted-foreground">Toggle visual theme</p>
              </div>
              <Button variant="secondary" onClick={toggleTheme} size="sm">
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
