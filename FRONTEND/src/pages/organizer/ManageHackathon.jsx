import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosClient } from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ManageHackathon() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('registrations');
  const [assigningJudge, setAssigningJudge] = useState(false);
  const [judgeEmail, setJudgeEmail] = useState('');

  const { data: hackathon, isLoading: isLoadingHackathon } = useQuery({
    queryKey: ['hackathon', id],
    queryFn: async () => {
      const res = await axiosClient.get(`/hackathons/${id}`);
      return res.data.data;
    }
  });

  const { data: registrationsData, isLoading: isLoadingRegistrations } = useQuery({
    queryKey: ['hackathon', id, 'registrations'],
    queryFn: async () => {
      const res = await axiosClient.get(`/hackathons/${id}/registrations`);
      return res.data.data;
    },
    enabled: activeTab === 'registrations'
  });

  const registrations = registrationsData?.registrations || [];

  const { data: judges = [], isLoading: isLoadingJudges } = useQuery({
    queryKey: ['hackathon', id, 'judges'],
    queryFn: async () => {
      const res = await axiosClient.get(`/hackathons/${id}/judges`);
      return res.data.data;
    },
    enabled: activeTab === 'judges'
  });

  const { data: submissions = [], isLoading: isLoadingSubmissions } = useQuery({
    queryKey: ['hackathon', id, 'submissions'],
    queryFn: async () => {
      const res = await axiosClient.get(`/hackathons/${id}/submissions`);
      return res.data.data;
    },
    enabled: activeTab === 'submissions'
  });

  // Action mutations
  const handleApprove = async (regId) => {
    try {
      await axiosClient.patch(`/registrations/${regId}/approve`);
      toast.success('Registration approved');
      queryClient.invalidateQueries({ queryKey: ['hackathon', id, 'registrations'] });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async (regId) => {
    try {
      await axiosClient.patch(`/registrations/${regId}/reject`);
      toast.success('Registration rejected');
      queryClient.invalidateQueries({ queryKey: ['hackathon', id, 'registrations'] });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject');
    }
  };

  const handleAssignJudge = async (e) => {
    e.preventDefault();
    if (!judgeEmail) return;
    try {
      setAssigningJudge(true);
      await axiosClient.post(`/hackathons/${id}/judges`, { email: judgeEmail });
      toast.success('Judge assigned successfully');
      setJudgeEmail('');
      queryClient.invalidateQueries({ queryKey: ['hackathon', id, 'judges'] });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign judge');
    } finally {
      setAssigningJudge(false);
    }
  };

  const toggleRegistration = async () => {
    try {
      const endpoint = hackathon?.registrationOpen ? 'close-registration' : 'open-registration';
      await axiosClient.patch(`/hackathons/${id}/${endpoint}`);
      toast.success(`Registration ${endpoint.split('-')[0]}ed successfully`);
      queryClient.invalidateQueries({ queryKey: ['hackathon', id] });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to toggle registration');
    }
  };

  const publishResults = async () => {
    try {
      await axiosClient.patch(`/hackathons/${id}/publish-results`);
      toast.success('Results published');
      queryClient.invalidateQueries({ queryKey: ['hackathon', id] });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to publish results');
    }
  };

  const tabs = [
    { id: 'registrations', label: 'Registrations' },
    { id: 'judges', label: 'Judges' },
    { id: 'submissions', label: 'Submissions' },
    { id: 'controls', label: 'Controls' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-bold text-foreground">Manage Hackathon</h1>
        <p className="text-muted-foreground mt-2">ID: {id}</p>
      </div>

      <div className="flex space-x-2 border-b border-border">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="pt-4">
        {activeTab === 'registrations' && (
          <Card className="overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-semibold text-foreground">Team</th>
                  <th className="px-6 py-4 font-semibold text-foreground">Date</th>
                  <th className="px-6 py-4 font-semibold text-foreground">Status</th>
                  <th className="px-6 py-4 font-semibold text-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingRegistrations && (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-muted-foreground">Loading registrations...</td>
                  </tr>
                )}
                {!isLoadingRegistrations && registrations.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-muted-foreground">No registrations found.</td>
                  </tr>
                )}
                {!isLoadingRegistrations && registrations.map(reg => (
                  <tr key={reg._id} className="border-b border-border hover:bg-muted/50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{reg.team?.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{new Date(reg.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <Badge variant={reg.status === 'approved' ? 'success' : reg.status === 'pending' ? 'warning' : 'error'}>
                        {reg.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      {reg.status === 'pending' && (
                        <>
                          <Button variant="secondary" size="sm" className="text-success hover:text-success hover:border-success" onClick={() => handleApprove(reg._id)}>Approve</Button>
                          <Button variant="secondary" size="sm" className="text-destructive hover:text-destructive hover:border-error" onClick={() => handleReject(reg._id)}>Reject</Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {activeTab === 'judges' && (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-foreground">Assigned Judges</h3>
              <form onSubmit={handleAssignJudge} className="flex gap-2">
                <input
                  type="email"
                  placeholder="Judge's email address"
                  className="px-3 py-1 rounded-[10px] border border-border bg-muted/50 text-sm"
                  value={judgeEmail}
                  onChange={e => setJudgeEmail(e.target.value)}
                  required
                />
                <Button size="sm" type="submit" disabled={assigningJudge}>Assign Judge</Button>
              </form>
            </div>
            {isLoadingJudges && <p className="text-sm text-muted-foreground">Loading judges...</p>}
            {!isLoadingJudges && judges.length === 0 && <p className="text-sm text-muted-foreground">No judges assigned yet.</p>}
            {!isLoadingJudges && judges.length > 0 && (
              <ul className="space-y-3">
                {judges.map(judgeAssignment => (
                  <li key={judgeAssignment._id} className="flex justify-between items-center p-3 bg-muted/50 rounded-[10px] border border-border">
                    <div>
                      <p className="font-medium text-foreground">{judgeAssignment.judge?.name}</p>
                      <p className="text-xs text-muted-foreground">{judgeAssignment.judge?.email}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}

        {activeTab === 'submissions' && (
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-6">Submissions</h3>
            {isLoadingSubmissions && <p className="text-sm text-muted-foreground">Loading submissions...</p>}
            {!isLoadingSubmissions && submissions.length === 0 && <p className="text-sm text-muted-foreground">No submissions found.</p>}
            {!isLoadingSubmissions && submissions.length > 0 && (
              <ul className="space-y-3">
                {submissions.map(sub => (
                  <li key={sub._id} className="flex justify-between items-center p-3 bg-muted/50 rounded-[10px] border border-border">
                    <div>
                      <p className="font-medium text-foreground">{sub.projectName}</p>
                      <p className="text-xs text-muted-foreground">{sub.registration?.team?.name}</p>
                    </div>
                    <div className="w-40">
                      <select
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        value={sub.status || 'pending'}
                        onChange={async (e) => {
                          const newStatus = e.target.value;
                          try {
                            await axiosClient.patch(`/submissions/${sub._id}/status`, { status: newStatus });
                            toast.success('Status updated');
                            queryClient.invalidateQueries({ queryKey: ['hackathon', id, 'submissions'] });
                          } catch (error) {
                            toast.error(error.response?.data?.message || 'Failed to update status');
                          }
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="under_review">Under Review</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}

        {activeTab === 'controls' && (
          <div className="space-y-4">
            <Card className="flex justify-between items-center p-6">
              <div>
                <h3 className="font-semibold text-foreground">Registration Status</h3>
                <p className="text-sm text-muted-foreground">Currently {hackathon?.registrationOpen ? 'Open' : 'Closed'}.</p>
              </div>
              <Button variant="destructive" onClick={toggleRegistration}>
                {hackathon?.registrationOpen ? 'Close Registration' : 'Open Registration'}
              </Button>
            </Card>
            <Card className="flex justify-between items-center p-6">
              <div>
                <h3 className="font-semibold text-foreground">Publish Results</h3>
                <p className="text-sm text-muted-foreground">Make the leaderboard public. Cannot be undone.</p>
              </div>
              <Button onClick={publishResults} disabled={hackathon?.resultsPublished}>
                {hackathon?.resultsPublished ? 'Published' : 'Publish Results'}
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
