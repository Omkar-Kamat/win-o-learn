import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosClient } from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import TeamCard from '../../components/team/TeamCard';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../../components/ui/dialog";

import { useCreateTeam } from '../../hooks/useTeams';
import { useAuth } from '../../context/AuthContext';

export default function TeamsList() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [teamName, setTeamName] = useState('');

  const { data: dashboard, isLoading, error } = useQuery({
    queryKey: ['dashboard', 'participant'],
    queryFn: async () => {
      const res = await axiosClient.get('/dashboard/participant');
      return res.data.data;
    }
  });

  const createTeamMutation = useCreateTeam({
    onSuccess: () => {
      toast.success('Team created successfully!');
      setTeamName('');
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'participant'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create team');
    }
  });

  const acceptInviteMutation = useMutation({
    mutationFn: async (teamId) => {
      const res = await axiosClient.post(`/teams/${teamId}/invite/accept`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Invite accepted!');
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'participant'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to accept invite');
    }
  });

  const rejectInviteMutation = useMutation({
    mutationFn: async (teamId) => {
      const res = await axiosClient.post(`/teams/${teamId}/invite/reject`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Invite rejected');
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'participant'] });
    }
  });

  const handleCreateTeam = (e) => {
    e.preventDefault();
    if (!teamName.trim()) return;
    createTeamMutation.mutate({ name: teamName.trim() });
  };

  const teams = dashboard?.teams || [];
  const invitations = dashboard?.invitations || dashboard?.pendingInvites || [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-bold text-foreground">My Teams</h1>
          <p className="text-muted-foreground mt-2">Manage your hackathon teams.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button>Create Team</Button>} />
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create a New Team</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateTeam} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Team Name</label>
                <Input
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter team name"
                  required
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createTeamMutation.isPending}>Create</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!isLoading && invitations.length > 0 && (
        <div className="bg-primary/10/30 border border-primary/20 rounded-xl p-6">
          <h2 className="text-2xl font-semibold tracking-tight font-semibold text-foreground mb-4">Pending Invitations</h2>
          <div className="space-y-3">
            {invitations.map(inv => (
              <div key={inv._id || inv.team?._id} className="flex justify-between items-center bg-card p-4 rounded-lg border border-border">
                <div>
                  <h3 className="font-medium text-foreground">{inv.team?.name || 'Unknown Team'}</h3>
                  <p className="text-sm text-muted-foreground">You have been invited to join this team.</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    className="text-destructive hover:text-destructive hover:bg-error/10" 
                    onClick={() => rejectInviteMutation.mutate(inv.team?._id || inv.team)}
                    disabled={rejectInviteMutation.isPending && rejectInviteMutation.variables === (inv.team?._id || inv.team)}
                  >
                    Decline
                  </Button>
                  <Button 
                    onClick={() => acceptInviteMutation.mutate(inv.team?._id || inv.team)}
                    disabled={acceptInviteMutation.isPending && acceptInviteMutation.variables === (inv.team?._id || inv.team)}
                  >
                    Accept Invite
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading && <p className="text-muted-foreground">Loading teams...</p>}
        {error && <p className="text-destructive">Failed to load teams.</p>}
        {teams.map(team => (
          <TeamCard key={team._id} team={team} />
        ))}
        {!isLoading && teams.length === 0 && (
          <p className="text-muted-foreground col-span-full">You haven't created or joined any teams yet.</p>
        )}
      </div>
    </div>
  );
}
