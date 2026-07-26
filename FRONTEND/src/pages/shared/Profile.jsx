import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  bio: z.string().max(300, 'Bio must be less than 300 characters').optional(),
});

export default function Profile() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      bio: user?.bio || '',
    }
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1000)); // Simulating API call
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-h1 font-bold text-body">Profile</h1>
        <p className="text-muted mt-2">Manage your personal information and preferences.</p>
      </div>

      <Card>
        <h2 className="text-h3 font-semibold text-body mb-6">Personal Info</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            {...register('name')}
            error={errors.name?.message}
          />
          <Input
            label="Email"
            value={user?.email || ''}
            disabled
          />
          <div className="flex flex-col gap-1 w-full">
            <label className="text-sm font-medium text-body">Bio</label>
            <textarea
              className={`h-24 py-3 px-4 rounded-[10px] bg-card border ${errors.bio ? 'border-error' : 'border-base'} text-body focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none`}
              {...register('bio')}
              placeholder="Tell us about yourself..."
            ></textarea>
            {errors.bio && <span className="text-tiny text-error">{errors.bio.message}</span>}
          </div>
          
          <div className="pt-4 flex justify-end">
            <Button type="submit" loading={isLoading}>Save Changes</Button>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="text-h3 font-semibold text-body mb-6">Preferences</h2>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-body">Theme</h3>
            <p className="text-sm text-muted">Toggle between light and dark mode.</p>
          </div>
          <Button variant="secondary" onClick={toggleTheme}>
            {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
