import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '../../api/axiosClient';
import Card from '../../components/ui/Card';

export default function ManageTeams() {
  const { data: teamsData, isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const res = await axiosClient.get('/teams');
      return res.data.data;
    }
  });

  const teams = teamsData?.teams || [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-h1 font-bold text-body">Global Teams</h1>
        <p className="text-muted mt-2">Read-only oversight of all teams.</p>
      </div>

      <Card padding="none" className="overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface border-b border-base">
            <tr>
              <th className="px-6 py-4 font-semibold text-body">Team Name</th>
              <th className="px-6 py-4 font-semibold text-body">Members</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan="2" className="px-6 py-8 text-center text-muted">Loading teams...</td>
              </tr>
            )}
            {!isLoading && teams.map(t => (
              <tr key={t._id} className="border-b border-base hover:bg-surface/50 transition-colors">
                <td className="px-6 py-4 font-medium text-body">{t.name}</td>
                <td className="px-6 py-4 text-muted">{t.members?.length || 0} members</td>
              </tr>
            ))}
            {!isLoading && teams.length === 0 && (
              <tr>
                <td colSpan="2" className="px-6 py-8 text-center text-muted">No teams found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
