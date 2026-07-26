import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { axiosClient } from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    try {
      await axiosClient.post(`/auth/reset-password/${token}`, { password });
      toast.success('Password has been reset successfully!');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold tracking-tight font-semibold text-foreground mb-2 text-center">Reset Password</h2>
      <p className="text-center text-muted-foreground mb-6">Enter your new password below.</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input 
          type="password" 
          placeholder="New Password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required 
          minLength={6}
        />
        <Button type="submit" className="w-full" disabled={loading}>
          Reset Password
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link to="/login" className="font-medium text-primary hover:underline">
          Back to log in
        </Link>
      </div>
    </Card>
  );
}
