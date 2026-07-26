import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '../../api/axiosClient';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import StatCard from '../../components/dashboard/StatCard';
import { DocumentCheckIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function JudgeDashboard() {
 const { data: dashboard, isLoading, error } = useQuery({
 queryKey: ['dashboard', 'judge'],
 queryFn: async () => {
 const res = await axiosClient.get('/dashboard/judge');
 return res.data.data;
 }
 });

 if (isLoading) return <div className="text-muted-foreground text-center mt-10">Loading dashboard...</div>;
 if (error) return <div className="text-destructive text-center mt-10">Failed to load dashboard.</div>;

 return (
 <div className="space-y-8 max-w-6xl mx-auto">
 <div>
 <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-bold text-foreground">Judge Dashboard</h1>
 <p className="text-muted-foreground mt-2">Evaluate submissions and provide feedback.</p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <StatCard label="Assigned Projects" value={dashboard?.assignedProjects || 0} icon={DocumentCheckIcon} />
 <StatCard label="Pending Reviews" value={dashboard?.pendingReviews || 0} valueColor="text-warning" icon={ClockIcon} />
 <StatCard label="Completed Reviews" value={dashboard?.completedReviews || 0} valueColor="text-success" icon={CheckCircleIcon} />
 </div>

 <Card className="p-6">
 <div className="flex justify-between items-center mb-6">
 <h2 className="text-2xl font-semibold tracking-tight font-semibold text-foreground">Action Required</h2>
 <Link to="/dashboard/judge/hackathons" className="text-sm font-medium text-primary hover:underline">View Hackathons</Link>
 </div>
 <div className="space-y-4">
 {(() => {
 const reviews = dashboard?.reviews || [];
 const reviewedIds = new Set(reviews.map(r => r.submission?._id || r.submission));
 const pending = (dashboard?.assignedSubmissions || []).filter(sub => !reviewedIds.has(sub._id)).slice(0, 3);
 
 if (pending.length === 0) {
 return <div className="text-center text-muted-foreground py-4">No pending reviews required!</div>;
 }
 
 return pending.map(sub => (
 <div key={sub._id} className="flex justify-between items-center p-4 bg-muted/50 ] border border-border">
 <div>
 <p className="font-semibold text-foreground">{sub.projectName}</p>
 <p className="text-sm text-muted-foreground">{sub.registration?.hackathon?.title}</p>
 </div>
 <Link to={`/dashboard/judge/submissions/${sub._id}/review`} className="text-sm font-medium text-primary hover:underline">Review Now</Link>
 </div>
 ));
 })()}
 </div>
 </Card>
 </div>
 );
}
