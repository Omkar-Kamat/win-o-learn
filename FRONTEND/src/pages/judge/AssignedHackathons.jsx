import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '../../api/axiosClient';
import HackathonCard from '../../components/hackathon/HackathonCard';

export default function AssignedHackathons() {
  const { data: hackathonsData, isLoading } = useQuery({
    queryKey: ['assigned-hackathons'],
    queryFn: async () => {
      const res = await axiosClient.get('/judges/me/assigned-hackathons');
      return res.data.data;
    }
  });

  const hackathons = hackathonsData?.map(assignment => assignment.hackathon) || [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-h1 font-bold text-body">Assigned Hackathons</h1>
        <p className="text-muted mt-2">Hackathons you are judging.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading && <p className="text-muted col-span-full">Loading hackathons...</p>}
        {!isLoading && hackathons.map(h => (
          <div key={h._id} className="relative group">
            <HackathonCard hackathon={h} />
            <div className="absolute inset-0 bg-bg/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[16px] backdrop-blur-sm">
              <Link to={`/dashboard/judge/hackathons/${h._id}/submissions`} className="bg-primary text-on-primary px-6 py-3 rounded-[10px] font-medium hover:bg-primary-hover transition-colors">
                View Submissions
              </Link>
            </div>
          </div>
        ))}
        {!isLoading && hackathons.length === 0 && (
          <p className="text-muted col-span-full">You haven't been assigned to judge any hackathons yet.</p>
        )}
      </div>
    </div>
  );
}
