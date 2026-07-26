import toast from 'react-hot-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosClient } from '../../api/axiosClient';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-bold text-foreground">Global Hackathons</h1>
        <p className="text-muted-foreground mt-2">Oversight of all hackathons on the platform.</p>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 font-semibold text-foreground">Title</th>
              <th className="px-6 py-4 font-semibold text-foreground">Organizer</th>
              <th className="px-6 py-4 font-semibold text-foreground">Status</th>
              <th className="px-6 py-4 font-semibold text-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-muted-foreground">Loading hackathons...</td>
              </tr>
            )}
            {!isLoading && hackathons.map(h => (
              <tr key={h._id} className="border-b border-border last:border-0 hover:bg-muted/50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-foreground">{h.title}</td>
                <td className="px-6 py-4 text-muted-foreground">{h.organizer?.name || h.organizer || 'Unknown'}</td>
                <td className="px-6 py-4"><Badge variant="info" className="capitalize">{h.status || 'active'}</Badge></td>
                <td className="px-6 py-4 text-right">
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(h._id)}>Delete</Button>
                </td>
              </tr>
            ))}
            {!isLoading && hackathons.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-muted-foreground">No hackathons found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
