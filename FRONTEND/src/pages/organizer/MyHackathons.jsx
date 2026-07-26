import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '../../api/axiosClient';
import Button from '../../components/ui/Button';
import HackathonCard from '../../components/hackathon/HackathonCard';

export default function MyHackathons() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['hackathons', 'my'],
    queryFn: async () => {
      const res = await axiosClient.get('/hackathons/my');
      return res.data.data;
    }
  });

  const hackathons = data?.hackathons || [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-h1 font-bold text-body">My Hackathons</h1>
          <p className="text-muted mt-2">Manage events you are organizing.</p>
        </div>
        <Link to="/dashboard/organizer/hackathons/new">
          <Button>Create Hackathon</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading && <p className="text-muted">Loading hackathons...</p>}
        {error && <p className="text-error">Failed to load hackathons.</p>}
        {hackathons.map(h => (
          <HackathonCard key={h._id} hackathon={h} />
        ))}
        {!isLoading && hackathons.length === 0 && (
          <p className="text-muted col-span-full">You haven't created any hackathons yet.</p>
        )}
      </div>
    </div>
  );
}
