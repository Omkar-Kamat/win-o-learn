import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosClient } from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function MyInvites() {
  const queryClient = useQueryClient();

  const { data: invites = [], isLoading } = useQuery({
    queryKey: ['my-invites'],
    queryFn: async () => {
      const res = await axiosClient.get('/users/me/invites');
      return res.data.data;
    }
  });

  const acceptMutation = useMutation({
    mutationFn: async (teamId) => {
      const res = await axiosClient.post(`/teams/${teamId}/invite/accept`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Invitation accepted!');
      queryClient.invalidateQueries({ queryKey: ['my-invites'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'participant'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to accept invite');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (teamId) => {
      const res = await axiosClient.post(`/teams/${teamId}/invite/reject`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Invitation rejected!');
      queryClient.invalidateQueries({ queryKey: ['my-invites'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to reject invite');
    }
  });

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-bold text-foreground">My Invites</h1>
        <p className="text-muted-foreground mt-2">Manage your pending team invitations.</p>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 font-semibold text-foreground">Team Name</th>
              <th className="px-6 py-4 font-semibold text-foreground">Leader</th>
              <th className="px-6 py-4 font-semibold text-foreground">Date Invited</th>
              <th className="px-6 py-4 font-semibold text-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-muted-foreground">Loading invites...</td>
              </tr>
            )}
            {!isLoading && invites.map(invite => (
              <tr key={invite._id} className="border-b border-border last:border-0 hover:bg-muted/50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-foreground">{invite.name}</td>
                <td className="px-6 py-4 text-muted-foreground">{invite.leader?.name || 'Unknown'}</td>
                <td className="px-6 py-4 text-muted-foreground">{invite.invitedAt ? new Date(invite.invitedAt).toLocaleDateString() : 'N/A'}</td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="border-success text-success hover:bg-success/10 hover:text-success"
                    onClick={() => acceptMutation.mutate(invite._id)}
                    disabled={acceptMutation.isPending || rejectMutation.isPending}
                  >
                    Accept
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => rejectMutation.mutate(invite._id)}
                    disabled={acceptMutation.isPending || rejectMutation.isPending}
                  >
                    Reject
                  </Button>
                </td>
              </tr>
            ))}
            {!isLoading && invites.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-muted-foreground">You have no pending invitations.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
