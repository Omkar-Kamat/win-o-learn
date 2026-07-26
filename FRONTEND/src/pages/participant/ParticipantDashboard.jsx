import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '../../api/axiosClient';
import Card from '../../components/ui/Card';
import StatCard from '../../components/dashboard/StatCard';
import StatusBadge from '../../components/submission/StatusBadge';
import { UserGroupIcon, DocumentCheckIcon, TrophyIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

export default function ParticipantDashboard() {
  const { data: dashboard, isLoading, error } = useQuery({
    queryKey: ['dashboard', 'participant'],
    queryFn: async () => {
      const res = await axiosClient.get('/dashboard/participant');
      return res.data.data;
    }
  });

  if (isLoading) return <div className="text-muted text-center mt-10">Loading dashboard...</div>;
  if (error) return <div className="text-error text-center mt-10">Failed to load dashboard.</div>;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-h1 font-bold text-body">Participant Dashboard</h1>
        <p className="text-muted mt-2">Welcome back! Here's an overview of your hackathons.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Teams" value={dashboard?.teams?.length || 0} icon={UserGroupIcon} />
        <StatCard label="Active Registrations" value={dashboard?.registeredHackathons || 0} icon={ClipboardDocumentListIcon} />
        <StatCard label="Submissions" value={dashboard?.submissions?.length || 0} icon={DocumentCheckIcon} />
        <StatCard label="Results Published" value={dashboard?.resultsPublished || 0} icon={TrophyIcon} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-h3 font-semibold text-body">Recent Registrations</h2>
            <Link to="/dashboard/participant/registrations" className="text-sm font-medium text-primary hover:underline">View All</Link>
          </div>
          <div className="space-y-4 text-sm">
            {dashboard?.registrations?.slice(0, 3).map(reg => (
              <div key={reg._id} className="flex justify-between items-center p-3 bg-surface rounded-[10px] border border-base">
                <div>
                  <p className="font-medium text-body">{reg.hackathon?.title}</p>
                  <p className="text-muted">Team: {reg.team?.name}</p>
                </div>
                <span className={`px-2 py-1 rounded-full font-medium text-[10px] uppercase tracking-wider badge-${reg.status === 'approved' ? 'success' : reg.status === 'pending' ? 'warning' : 'error'}`}>
                  {reg.status}
                </span>
              </div>
            ))}
            {(!dashboard?.registrations || dashboard.registrations.length === 0) && (
              <p className="text-muted text-center py-4">No recent registrations.</p>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-h3 font-semibold text-body">Active Submissions</h2>
            <Link to="/dashboard/participant/submissions" className="text-sm font-medium text-primary hover:underline">View All</Link>
          </div>
          <div className="space-y-4 text-sm">
            {dashboard?.submissions?.slice(0, 3).map(sub => (
              <div key={sub.id} className="flex justify-between items-center p-3 bg-surface rounded-[10px] border border-base">
                <div>
                  <p className="font-medium text-body">{sub.projectName}</p>
                  <p className="text-muted">{sub.hackathon}</p>
                </div>
                <StatusBadge status="under_review" />
              </div>
            ))}
            {!dashboard?.submissions?.length && (
              <p className="text-muted">No active submissions.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
