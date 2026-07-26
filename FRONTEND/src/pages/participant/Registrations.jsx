import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '../../api/axiosClient';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function Registrations() {
  const { data: dashboard, isLoading, error } = useQuery({
    queryKey: ['dashboard', 'participant'],
    queryFn: async () => {
      const res = await axiosClient.get('/dashboard/participant');
      return res.data.data;
    }
  });

  const registrations = dashboard?.registrations || [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-h1 font-bold text-body">My Registrations</h1>
        <p className="text-muted mt-2">Track the status of your hackathon applications.</p>
      </div>

      <Card padding="none" className="overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface border-b border-base">
            <tr>
              <th className="px-6 py-4 font-semibold text-body">Hackathon</th>
              <th className="px-6 py-4 font-semibold text-body">Team</th>
              <th className="px-6 py-4 font-semibold text-body">Date Applied</th>
              <th className="px-6 py-4 font-semibold text-body">Status</th>
              <th className="px-6 py-4 font-semibold text-body text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-muted">Loading registrations...</td>
              </tr>
            )}
            {!isLoading && registrations.map(reg => (
              <tr key={reg._id} className="border-b border-base last:border-0 hover:bg-surface/50 transition-colors">
                <td className="px-6 py-4 font-medium text-body">{reg.hackathon?.title || 'Unknown Hackathon'}</td>
                <td className="px-6 py-4 text-muted">{reg.team?.name || 'Unknown Team'}</td>
                <td className="px-6 py-4 text-muted">{new Date(reg.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full font-medium text-tiny badge-${reg.status === 'approved' ? 'success' : reg.status === 'pending' ? 'warning' : 'error'}`}>
                    {reg.status.charAt(0).toUpperCase() + reg.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Button variant="ghost" size="sm" className="text-error hover:text-error hover:bg-transparent p-0 h-auto">Cancel</Button>
                </td>
              </tr>
            ))}
            {!isLoading && registrations.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-muted">You haven't registered for any hackathons yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
