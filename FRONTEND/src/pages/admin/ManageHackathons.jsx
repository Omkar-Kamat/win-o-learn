import toast from 'react-hot-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosClient } from '../../api/axiosClient';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function ManageHackathons() {
  const queryClient = useQueryClient();

  const { data: hackathonsData, isLoading } = useQuery({
    queryKey: ['hackathons'],
    queryFn: async () => {
      const res = await axiosClient.get('/hackathons');
      return res.data.data;
    }
  });

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hackathon?')) return;
    try {
      await axiosClient.delete(`/hackathons/${id}`);
      toast.success('Hackathon deleted');
      queryClient.invalidateQueries({ queryKey: ['hackathons'] });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete hackathon');
    }
  };

  const hackathons = hackathonsData?.hackathons || [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-h1 font-bold text-body">Global Hackathons</h1>
        <p className="text-muted mt-2">Oversight of all hackathons on the platform.</p>
      </div>

      <Card padding="none" className="overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface border-b border-base">
            <tr>
              <th className="px-6 py-4 font-semibold text-body">Title</th>
              <th className="px-6 py-4 font-semibold text-body">Organizer</th>
              <th className="px-6 py-4 font-semibold text-body">Status</th>
              <th className="px-6 py-4 font-semibold text-body text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-muted">Loading hackathons...</td>
              </tr>
            )}
            {!isLoading && hackathons.map(h => (
              <tr key={h._id} className="border-b border-base last:border-0 hover:bg-surface/50 transition-colors">
                <td className="px-6 py-4 font-medium text-body">{h.title}</td>
                <td className="px-6 py-4 text-muted">{h.organizer?.name || h.organizer || 'Unknown'}</td>
                <td className="px-6 py-4"><span className="badge-info px-2 py-1 rounded-full font-medium text-tiny capitalize">{h.status || 'active'}</span></td>
                <td className="px-6 py-4 text-right">
                  <Button variant="danger" size="sm" onClick={() => handleDelete(h._id)}>Delete</Button>
                </td>
              </tr>
            ))}
            {!isLoading && hackathons.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-muted">No hackathons found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
