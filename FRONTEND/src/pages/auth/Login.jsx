import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

const loginSchema = z.object({
 email: z.string().email('Invalid email address'),
 password: z.string().min(1, 'Password is required'),
});

export default function Login() {
 const { login } = useAuth();
 const navigate = useNavigate();
 const [isLoading, setIsLoading] = useState(false);

 const { register, handleSubmit, formState: { errors } } = useForm({
 resolver: zodResolver(loginSchema)
 });

 const onSubmit = async (data) => {
 setIsLoading(true);
 try {
 await login(data.email, data.password);
 toast.success('Successfully logged in!');
 navigate('/dashboard');
 } catch (error) {
 toast.error(error.response?.data?.message || error.message || 'Login failed');
 } finally {
 setIsLoading(false);
 }
 };

 return (
 <Card className="p-6">
 <h2 className="text-2xl font-semibold tracking-tight font-semibold text-foreground mb-6 text-center">Welcome back</h2>
 <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
 <div className="flex justify-end">
 <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
 Forgot password?
 </Link>
 </div>
 <Button type="submit" className="w-full" disabled={isLoading}>
 Log in
 </Button>
 </form>
 <p className="mt-6 text-center text-sm text-muted-foreground">
 Don't have an account?{' '}
 <Link to="/signup" className="font-medium text-primary hover:underline">
 Sign up
 </Link>
 </p>
 </Card>
 );
}
