import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be at most 50 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  role: z.enum([ROLES.PARTICIPANT, ROLES.ORGANIZER, ROLES.JUDGE], {
    errorMap: () => ({ message: 'Please select a valid role' })
  }),
});

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: ROLES.PARTICIPANT }
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await signup(data);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold tracking-tight font-semibold text-foreground mb-6 text-center">Create an account</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1"><Label>Full Name</Label><Input  
          placeholder="John Doe"
          {...register('name')}
          error={errors.name?.message}
         /></div>
        <div className="space-y-1"><Label>Email Address</Label><Input  
          type="email"
          placeholder="you@example.com"
          {...register('email')}
          error={errors.email?.message}
         /></div>
        <div className="space-y-1"><Label>Password</Label><Input  
          type="password"
          placeholder="••••••••"
          {...register('password')}
          error={errors.password?.message}
         /></div>
        <div className="space-y-1">
          <Label>I want to join as</Label>
          <select 
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" 
            {...register('role')}
          >
            <option value={ROLES.PARTICIPANT}>Participant</option>
            <option value={ROLES.ORGANIZER}>Organizer</option>
            <option value={ROLES.JUDGE}>Judge</option>
          </select>
          {errors.role?.message && <p className="text-xs text-destructive">{errors.role.message}</p>}
        </div>
        <Button type="submit" className="w-full mt-2" disabled={isLoading}>
          Sign up
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </Card>
  );
}
