import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { axiosClient } from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '../../context/AuthContext';
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
 DialogTrigger,
 DialogFooter,
} from"../../components/ui/dialog";

import { useHackathon, useRegisterHackathon } from '../../hooks/useHackathons';

export default function Details() {
 const { id } = useParams();
 const navigate = useNavigate();
 const { user, role } = useAuth();
 const [isDialogOpen, setIsDialogOpen] = useState(false);
 const [selectedTeam, setSelectedTeam] = useState('');

 const { data: hackathon, isLoading, error } = useHackathon(id);

 const { data: participantData } = useQuery({
 queryKey: ['dashboard', 'participant'],
 queryFn: async () => {
 const res = await axiosClient.get('/dashboard/participant');
 return res.data.data;
 },
 enabled: role === 'participant' && isDialogOpen
 });

 const registerMutation = useRegisterHackathon(id, {
 onSuccess: () => {
 toast.success('Successfully registered for the hackathon!');
 setIsDialogOpen(false);
 },
 onError: (err) => {
 toast.error(err.response?.data?.message || 'Failed to register');
 }
 });

 const handleRegister = (e) => {
 e.preventDefault();
 if (!selectedTeam) return;
 registerMutation.mutate(selectedTeam);
 };

 if (isLoading) return <div className="max-w-4xl mx-auto text-muted-foreground mt-10">Loading hackathon details...</div>;
 if (error || !hackathon) return <div className="max-w-4xl mx-auto text-destructive mt-10">Failed to load hackathon details.</div>;

 const teams = participantData?.teams || [];

 return (
 <div className="space-y-8 max-w-4xl mx-auto">
 <div className="h-64 bg-muted/50 ] w-full border border-border relative overflow-hidden">
 {hackathon.banner && (
 <img src={hackathon.banner} alt={hackathon.title} className="w-full h-full object-cover" />
 )}
 </div>
 
 <div className="space-y-4">
 <div className="flex justify-between items-start">
 <div>
 <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-bold text-foreground">{hackathon.title}</h1>
 <p className="text-muted-foreground capitalize">{hackathon.mode} • {hackathon.theme} Theme</p>
 </div>
 {hackathon.registrationOpen && (
 <>
 {!user ? (
 <Button onClick={() => navigate('/login')}>Login to Register</Button>
 ) : role === 'participant' ? (
 <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
 <DialogTrigger render={<Button size="lg" className="w-full sm:w-auto">Register Now</Button>} />
 <DialogContent className="sm:max-w-[425px]">
 <DialogHeader>
 <DialogTitle>Register for {hackathon.title}</DialogTitle>
 </DialogHeader>
 <form onSubmit={handleRegister} className="space-y-4 pt-4">
 <div className="space-y-2">
 <label className="text-sm font-medium">Select your team</label>
 {teams.length === 0 ? (
 <div className="text-sm text-muted-foreground mb-2">
 You don't have any teams yet. <Link to="/teams" className="text-primary hover:underline">Create a team first.</Link>
 </div>
 ) : (
 <select
 className="flex h-10 w-full items-center justify-between border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
 value={selectedTeam}
 onChange={(e) => setSelectedTeam(e.target.value)}
 >
 <option value="">Select a team</option>
 {teams.map(t => (
 <option key={t._id} value={t._id}>{t.name}</option>
 ))}
 </select>
 )}
 </div>
 <DialogFooter>
 <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
 <Button type="submit" disabled={!selectedTeam || registerMutation.isPending}>Apply</Button>
 </DialogFooter>
 </form>
 </DialogContent>
 </Dialog>
 ) : null}
 </>
 )}
 </div>
 
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm border-y border-border py-4">
 <div><span className="text-muted-foreground block">Prize Pool</span><span className="font-semibold text-foreground">${hackathon.prizePool?.toLocaleString()}</span></div>
 <div><span className="text-muted-foreground block">Max Team Size</span><span className="font-semibold text-foreground">{hackathon.maxTeamSize}</span></div>
 <div><span className="text-muted-foreground block">Registration Deadline</span><span className="font-semibold text-foreground">{new Date(hackathon.registrationDeadline).toLocaleDateString()}</span></div>
 <div><span className="text-muted-foreground block">Submission Deadline</span><span className="font-semibold text-foreground">{new Date(hackathon.submissionDeadline).toLocaleDateString()}</span></div>
 </div>
 {hackathon.venue && <p className="text-sm text-muted-foreground">Venue: {hackathon.venue}</p>}
 {hackathon.rules?.length > 0 && (
 <div>
 <h3 className="font-semibold text-foreground mb-2">Rules</h3>
 <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
 {hackathon.rules.map((r, i) => <li key={i}>{r}</li>)}
 </ul>
 </div>
 )}
 
 <div className="prose text-foreground max-w-none">
 <p className="whitespace-pre-wrap">{hackathon.description}</p>
 </div>
 
 <div className="pt-6">
 <Link to={`/hackathons/${id}/leaderboard`}>
 <Button variant="secondary">View Leaderboard</Button>
 </Link>
 </div>
 </div>
 </div>
 );
}
