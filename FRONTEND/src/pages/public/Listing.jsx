import HackathonCard from '../../components/hackathon/HackathonCard';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '../../api/axiosClient';

export default function Listing() {
  const { data: hackathons, isLoading, error } = useQuery({
    queryKey: ['hackathons'],
    queryFn: async () => {
      const res = await axiosClient.get('/hackathons');
      // The backend returns an object with hackathons array and pagination
      return res.data.data.hackathons;
    }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-h1 font-bold text-body">Browse Hackathons</h1>
        <p className="text-muted mt-2">Find your next challenge.</p>
      </div>
      
      <div className="flex gap-4">
        <div className="w-1/3">
          <Input placeholder="Search hackathons..." />
        </div>
        <div className="w-1/4">
          <Select>
            <option value="">All Modes</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading && <p className="text-muted">Loading hackathons...</p>}
        {error && <p className="text-error">Failed to load hackathons.</p>}
        {hackathons?.map(h => <HackathonCard key={h._id} hackathon={h} />)}
      </div>
    </div>
  );
}
