import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '../../api/axiosClient';
import Button from '../../components/ui/Button';
import TeamCard from '../../components/team/TeamCard';

export default function TeamsList() {
  const { data: dashboard, isLoading, error } = useQuery({
    queryKey: ['dashboard', 'participant'],
    queryFn: async () => {
      const res = await axiosClient.get('/dashboard/participant');
      return res.data.data;
    }
  });

  const teams = dashboard?.teams || [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-h1 font-bold text-body">My Teams</h1>
          <p className="text-muted mt-2">Manage your hackathon teams.</p>
        </div>
        <Button>Create Team</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading && <p className="text-muted">Loading teams...</p>}
        {error && <p className="text-error">Failed to load teams.</p>}
        {teams.map(team => (
          <TeamCard key={team._id} team={team} />
        ))}
        {!isLoading && teams.length === 0 && (
          <p className="text-muted col-span-full">You haven't created or joined any teams yet.</p>
        )}
      </div>
    </div>
  );
}
