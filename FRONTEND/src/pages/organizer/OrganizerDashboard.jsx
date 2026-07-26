import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '../../api/axiosClient';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import StatCard from '../../components/dashboard/StatCard';
import { CalendarIcon, UserGroupIcon, DocumentTextIcon, TrophyIcon } from '@heroicons/react/24/outline';

export default function OrganizerDashboard() {
 const { data: dashboard, isLoading: isLoadingDashboard } = useQuery({
 queryKey: ['dashboard', 'organizer'],
 queryFn: async () => {
 const res = await axiosClient.get('/dashboard/organizer');
 return res.data.data;
 }
 });

 const { data: hackathonsData, isLoading: isLoadingHackathons } = useQuery({
 queryKey: ['hackathons', 'my'],
 queryFn: async () => {
 const res = await axiosClient.get('/hackathons/my');
 return res.data.data;
 }
 });

 if (isLoadingDashboard || isLoadingHackathons) {
 return <div className="text-muted-foreground text-center mt-10">Loading dashboard...</div>;
 }

 const hackathons = hackathonsData?.hackathons || [];

 return (
 <div className="space-y-8 max-w-6xl mx-auto">
 <div>
 <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-bold text-foreground">Organizer Dashboard</h1>
 <p className="text-muted-foreground mt-2">Manage your hackathons and evaluate participants.</p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
 <StatCard label="My Hackathons" value={dashboard?.myHackathons || 0} icon={CalendarIcon} />
 <StatCard label="Total Registrations" value={dashboard?.totalRegistrations || 0} icon={UserGroupIcon} />
 <StatCard label="Total Submissions" value={dashboard?.totalSubmissions || 0} icon={DocumentTextIcon} />
 <StatCard label="Winners Announced" value={dashboard?.winnersAnnounced || 0} icon={TrophyIcon} />
 </div>

 <Card className="p-6">
 <div className="flex justify-between items-center mb-6">
 <h2 className="text-2xl font-semibold tracking-tight font-semibold text-foreground">Ongoing Hackathons</h2>
 <Link to="/dashboard/organizer/hackathons" className="text-sm font-medium text-primary hover:underline">Manage All</Link>
 </div>
 <div className="space-y-4">
 {hackathons.slice(0, 3).map(hackathon => (
 <div key={hackathon._id} className="flex justify-between items-center p-4 bg-muted/50 ] border border-border">
 <div>
 <p className="font-semibold text-foreground">{hackathon.title}</p>
 <p className="text-sm text-muted-foreground capitalize">{hackathon.status}</p>
 </div>
 <Link to={`/dashboard/organizer/hackathons/${hackathon._id}/manage`} className="text-sm font-medium text-primary hover:underline">Manage</Link>
 </div>
 ))}
 {hackathons.length === 0 && (
 <p className="text-muted-foreground">You haven't created any hackathons yet.</p>
 )}
 </div>
 </Card>
 </div>
 );
}
