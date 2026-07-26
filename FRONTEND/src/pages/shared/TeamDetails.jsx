import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosClient } from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import MemberList from '../../components/team/MemberList';

export default function TeamDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: teamData, isLoading } = useQuery({
    queryKey: ['team', id],
    queryFn: async () => {
      const res = await axiosClient.get(`/teams/${id}`);
      return res.data.data;
    }
  });

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;
    try {
      await axiosClient.delete(`/teams/${id}`);
      toast.success('Team deleted');
      navigate('/teams');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete team');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      await axiosClient.delete(`/teams/${id}/members/${userId}`);
      toast.success('Member removed');
      queryClient.invalidateQueries({ queryKey: ['team', id] });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleMakeLeader = async (userId) => {
    if (!window.confirm('Transfer leadership to this member?')) return;
    try {
      await axiosClient.patch(`/teams/${id}/leader`, { userId });
      toast.success('Leadership transferred');
      queryClient.invalidateQueries({ queryKey: ['team', id] });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to transfer leadership');
    }
  };

  const handleRevokeInvite = async (userId) => {
    try {
      await axiosClient.post(`/teams/${id}/invite/reject`, { userId });
      toast.success('Invite revoked');
      queryClient.invalidateQueries({ queryKey: ['team', id] });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to revoke invite');
    }
  };

  if (isLoading) return <div className="text-muted text-center mt-10">Loading team...</div>;
  if (!teamData) return <div className="text-error text-center mt-10">Team not found</div>;

  const isLeader = teamData.leader?._id === user?._id;
  
  // Format members array to match MemberList expectations
  const allMembers = [
    { ...teamData.leader, role: 'leader' },
    ...teamData.members.filter(m => m._id !== teamData.leader._id).map(m => ({ ...m, role: 'member' }))
  ];

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex items-center gap-4">
        <Link to="/teams" className="text-muted hover:text-body">&larr; Back to Teams</Link>
      </div>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-h1 font-bold text-body flex items-center gap-3">
            {teamData.name}
            {isLeader && <span className="bg-primary-light text-primary-text-on text-tiny px-2 py-1 rounded-full font-medium">Leader</span>}
          </h1>
          {teamData.description && <p className="text-muted mt-2 max-w-2xl">{teamData.description}</p>}
        </div>
        {isLeader && (
          <div className="flex gap-2">
            <Button variant="danger" onClick={handleDelete}>Delete Team</Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-h3 font-semibold text-body">Members</h2>
              {isLeader && <Button size="sm">Invite Member</Button>}
            </div>
            <MemberList 
              members={allMembers} 
              isLeader={isLeader} 
              onRemove={handleRemoveMember} 
              onMakeLeader={handleMakeLeader} 
            />
          </Card>
        </div>

        <div className="space-y-6">
          {isLeader && teamData.pendingInvites?.length > 0 && (
            <Card>
              <h3 className="font-semibold text-body mb-4">Pending Invites</h3>
              <ul className="space-y-3">
                {teamData.pendingInvites.map(inv => (
                  <li key={inv._id} className="flex justify-between items-center text-sm">
                    <span className="text-muted truncate">{inv.user?.email}</span>
                    <button className="text-error hover:underline" onClick={() => handleRevokeInvite(inv.user?._id)}>Revoke</button>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card>
            <h3 className="font-semibold text-body mb-2">Hackathon Status</h3>
            <p className="text-sm text-muted">Not registered for any hackathons yet.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
