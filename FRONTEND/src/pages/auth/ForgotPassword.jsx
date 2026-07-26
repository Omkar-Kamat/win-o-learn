import { useState } from 'react';
import { Link } from 'react-router-dom';
import { axiosClient } from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await axiosClient.post('/auth/forgot-password', { email });
      setSubmitted(true);
      toast.success('Password reset link sent to your email');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold tracking-tight font-semibold text-foreground mb-2 text-center">Forgot Password</h2>
      <p className="text-center text-muted-foreground mb-6">Enter your email to receive a password reset link.</p>
      
      {submitted ? (
        <div className="text-center space-y-4">
          <div className="p-4 bg-primary/10 text-primary-foreground rounded-md text-sm">
            Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder.
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            type="email" 
            placeholder="name@example.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
          <Button type="submit" className="w-full" disabled={loading}>
            Send Reset Link
          </Button>
        </form>
      )}

      <div className="mt-6 text-center">
        <Link to="/login" className="font-medium text-primary hover:underline">
          Back to log in
        </Link>
      </div>
    </Card>
  );
}
