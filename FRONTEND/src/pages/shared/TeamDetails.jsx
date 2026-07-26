import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosClient } from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MemberList from '../../components/team/MemberList';
import StatusBadge from '../../components/submission/StatusBadge';
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
 DialogTrigger,
 DialogFooter,
} from"../../components/ui/dialog";

export default function TeamDetails() {
 const { id } = useParams();
 const navigate = useNavigate();
 const queryClient = useQueryClient();
 const { user } = useAuth();
 const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
 const [inviteEmail, setInviteEmail] = useState('');

 const { data: teamData, isLoading } = useQuery({
 queryKey: ['team', id],
 queryFn: async () => {
 const res = await axiosClient.get(`/teams/${id}`);
 return res.data.data;
 }
 });

 const { data: dashboard } = useQuery({
 queryKey: ['dashboard', 'participant'],
 queryFn: async () => {
 const res = await axiosClient.get('/dashboard/participant');
 return res.data.data;
 }
 });

 const inviteMutation = useMutation({
 mutationFn: async (email) => {
 const res = await axiosClient.post(`/teams/${id}/invite`, { email });
 return res.data;
 },
 onSuccess: () => {
 toast.success('Invitation sent successfully!');
 setInviteEmail('');
 setIsInviteDialogOpen(false);
 queryClient.invalidateQueries({ queryKey: ['team', id] });
 },
 onError: (err) => {
 toast.error(err.response?.data?.message || 'Failed to invite member');
 }
 });

 const handleInvite = (e) => {
 e.preventDefault();
 if (!inviteEmail.trim()) return;
 inviteMutation.mutate(inviteEmail.trim());
 };

 const handleLeaveTeam = async () => {
 if (!window.confirm('Are you sure you want to leave this team?')) return;
 try {
 await axiosClient.post(`/teams/${id}/leave`);
 toast.success('You have left the team');
 queryClient.invalidateQueries({ queryKey: ['dashboard', 'participant'] });
 navigate('/teams');
 } catch (error) {
 toast.error(error.response?.data?.message || 'Failed to leave team');
 }
 };

 const handleDelete = async () => {
 if (!window.confirm('Are you sure you want to delete this team?')) return;
 try {
 await axiosClient.delete(`/teams/${id}`);
 toast.success('Team deleted');
 queryClient.invalidateQueries({ queryKey: ['dashboard', 'participant'] });
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

 if (isLoading) return <div className="text-muted-foreground text-center mt-10">Loading team...</div>;
 if (!teamData) return <div className="text-destructive text-center mt-10">Team not found</div>;

 const isLeader = teamData.leader?._id === user?._id;
 
 // Format members array to match MemberList expectations
 const allMembers = [
 { ...teamData.leader, role: 'leader' },
 ...teamData.members.filter(m => m._id !== teamData.leader._id).map(m => ({ ...m, role: 'member' }))
 ];

 // Find team registrations from dashboard
 const teamRegistrations = dashboard?.registrations?.filter(r => (r.team?._id || r.team) === id) || [];

 return (
 <div className="max-w-4xl space-y-8">
 <div className="flex items-center gap-4">
 <Link to="/teams" className="text-muted-foreground hover:text-foreground">&larr; Back to Teams</Link>
 </div>

 <div className="flex justify-between items-start">
 <div>
 <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-bold text-foreground flex items-center gap-3">
 {teamData.name}
 {isLeader && <span className="bg-primary/10 text-primary-foreground text-xs px-2 py-1 font-medium">Leader</span>}
 </h1>
 {teamData.description && <p className="text-muted-foreground mt-2 max-w-2xl">{teamData.description}</p>}
 </div>
 <div className="flex gap-2">
 {isLeader ? (
 <Button variant="destructive" onClick={handleDelete}>Delete Team</Button>
 ) : (
 <Button variant="destructive" onClick={handleLeaveTeam}>Leave Team</Button>
 )}
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
 <div className="md:col-span-2 space-y-6">
 <Card className="p-6">
 <div className="flex justify-between items-center mb-6">
 <h2 className="text-2xl font-semibold tracking-tight font-semibold text-foreground">Members</h2>
 {isLeader && (
 <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
 <DialogTrigger render={<Button size="sm">Invite Member</Button>} />
 <DialogContent className="sm:max-w-[425px]">
 <DialogHeader>
 <DialogTitle>Invite a Member</DialogTitle>
 </DialogHeader>
 <form onSubmit={handleInvite} className="space-y-4 pt-4">
 <div className="space-y-2">
 <label className="text-sm font-medium">Email Address</label>
 <Input
 type="email"
 value={inviteEmail}
 onChange={(e) => setInviteEmail(e.target.value)}
 placeholder="user@example.com"
 required
 />
 </div>
 <DialogFooter>
 <Button type="button" variant="ghost" onClick={() => setIsInviteDialogOpen(false)}>Cancel</Button>
 <Button type="submit" disabled={inviteMutation.isPending}>Send Invite</Button>
 </DialogFooter>
 </form>
 </DialogContent>
 </Dialog>
 )}
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
 <Card className="p-6">
 <h3 className="font-semibold text-foreground mb-4">Pending Invites</h3>
 <ul className="space-y-3">
 {teamData.pendingInvites.map(inv => (
 <li key={inv._id} className="flex justify-between items-center text-sm">
 <span className="text-muted-foreground truncate">{inv.user?.email || inv.email}</span>
 <button className="text-destructive hover:underline" onClick={() => handleRevokeInvite(inv.user?._id || inv.email)}>Revoke</button>
 </li>
 ))}
 </ul>
 </Card>
 )}

 <Card className="p-6">
 <h3 className="font-semibold text-foreground mb-2">Hackathon Status</h3>
 {teamRegistrations.length > 0 ? (
 <ul className="space-y-2 mt-3">
 {teamRegistrations.map(reg => (
 <li key={reg._id} className="text-sm flex justify-between items-center border-b border-border pb-2 last:border-0 last:pb-0">
 <Link to={`/hackathons/${reg.hackathon?._id || reg.hackathon}`} className="font-medium hover:underline text-primary">
 {reg.hackathon?.title || 'Hackathon'}
 </Link>
 <StatusBadge status={reg.status} />
 </li>
 ))}
 </ul>
 ) : (
 <p className="text-sm text-muted-foreground">Not registered for any hackathons yet.</p>
 )}
 </Card>
 </div>
 </div>
 </div>
 );
}
