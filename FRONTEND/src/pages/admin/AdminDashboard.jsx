import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '../../api/axiosClient';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import StatCard from '../../components/dashboard/StatCard';
import { UsersIcon, CalendarIcon, UserGroupIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

export default function AdminDashboard() {
 const { data: dashboard, isLoading, error } = useQuery({
 queryKey: ['dashboard', 'admin'],
 queryFn: async () => {
 const res = await axiosClient.get('/dashboard/admin');
 return res.data.data;
 }
 });

 if (isLoading) return <div className="text-muted-foreground text-center mt-10">Loading dashboard...</div>;
 if (error) return <div className="text-destructive text-center mt-10">Failed to load dashboard.</div>;

 return (
 <div className="space-y-8 max-w-6xl mx-auto">
 <div>
 <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-bold text-foreground">Admin Dashboard</h1>
 <p className="text-muted-foreground mt-2">Platform overview and management.</p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
 <StatCard label="Total Users" value={dashboard?.totalUsers || 0} icon={UsersIcon} />
 <StatCard label="Total Hackathons" value={dashboard?.totalHackathons || 0} icon={CalendarIcon} />
 <StatCard label="Total Teams" value={dashboard?.totalTeams || 0} icon={UserGroupIcon} />
 <StatCard label="Total Submissions" value={dashboard?.totalSubmissions || 0} icon={DocumentTextIcon} />
 </div>
 </div>
 );
}
