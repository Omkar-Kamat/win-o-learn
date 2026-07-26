import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosClient } from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StatusBadge from '../../components/submission/StatusBadge';

export default function Registrations() {
  const queryClient = useQueryClient();
  const { data: dashboard, isLoading, error } = useQuery({
    queryKey: ['dashboard', 'participant'],
    queryFn: async () => {
      const res = await axiosClient.get('/dashboard/participant');
      return res.data.data;
    }
  });

  const cancelMutation = useMutation({
    mutationFn: async ({ hackathonId, teamId }) => {
      const res = await axiosClient.delete(`/hackathons/${hackathonId}/register/${teamId}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Registration cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'participant'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to cancel registration');
    }
  });

  const registrations = dashboard?.registrations || [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-bold text-foreground">My Registrations</h1>
        <p className="text-muted-foreground mt-2">Track the status of your hackathon applications.</p>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 font-semibold text-foreground">Hackathon</th>
              <th className="px-6 py-4 font-semibold text-foreground">Team</th>
              <th className="px-6 py-4 font-semibold text-foreground">Date Applied</th>
              <th className="px-6 py-4 font-semibold text-foreground">Status</th>
              <th className="px-6 py-4 font-semibold text-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">Loading registrations...</td>
              </tr>
            )}
            {!isLoading && registrations.map(reg => (
              <tr key={reg._id} className="border-b border-border last:border-0 hover:bg-muted/50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-foreground">{reg.hackathon?.title || 'Unknown Hackathon'}</td>
                <td className="px-6 py-4 text-muted-foreground">{reg.team?.name || 'Unknown Team'}</td>
                <td className="px-6 py-4 text-muted-foreground">{new Date(reg.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={reg.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  {reg.status === 'pending' && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive hover:text-destructive hover:bg-transparent p-0 h-auto"
                      onClick={() => {
                        if(window.confirm('Are you sure you want to cancel this registration?')) {
                          cancelMutation.mutate({ hackathonId: reg.hackathon?._id || reg.hackathon, teamId: reg.team?._id || reg.team });
                        }
                      }}
                      disabled={cancelMutation.isPending && cancelMutation.variables?.hackathonId === (reg.hackathon?._id || reg.hackathon)}
                    >
                      Cancel
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {!isLoading && registrations.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">You haven't registered for any hackathons yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
