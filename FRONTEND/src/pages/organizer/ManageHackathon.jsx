import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosClient } from '../../api/axiosClient';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

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

  const { data: registrations = [], isLoading: isLoadingRegistrations } = useQuery({
    queryKey: ['hackathon', id, 'registrations'],
    queryFn: async () => {
      const res = await axiosClient.get(`/hackathons/${id}/registrations`);
      return res.data.data;
    },
    enabled: activeTab === 'registrations'
  });

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
      await axiosClient.post(`/hackathons/${id}/judges`, { judgeId: judgeEmail });
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
      const action = hackathon?.status === 'published' ? 'close-registration' : 'open-registration';
      // Wait, is it published or open? The API has /open-registration and /close-registration
      const endpoint = hackathon?.status === 'draft' || hackathon?.status === 'closed' ? 'open-registration' : 'close-registration';
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
        <h1 className="text-h1 font-bold text-body">Manage Hackathon</h1>
        <p className="text-muted mt-2">ID: {id}</p>
      </div>

      <div className="flex space-x-2 border-b border-base">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-body hover:border-base'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="pt-4">
        {activeTab === 'registrations' && (
          <Card padding="none" className="overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface border-b border-base">
                <tr>
                  <th className="px-6 py-4 font-semibold text-body">Team</th>
                  <th className="px-6 py-4 font-semibold text-body">Date</th>
                  <th className="px-6 py-4 font-semibold text-body">Status</th>
                  <th className="px-6 py-4 font-semibold text-body text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingRegistrations && (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-muted">Loading registrations...</td>
                  </tr>
                )}
                {!isLoadingRegistrations && registrations.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-muted">No registrations found.</td>
                  </tr>
                )}
                {!isLoadingRegistrations && registrations.map(reg => (
                  <tr key={reg._id} className="border-b border-base hover:bg-surface/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-body">{reg.team?.name}</td>
                    <td className="px-6 py-4 text-muted">{new Date(reg.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full font-medium text-[10px] uppercase tracking-wider badge-${reg.status === 'approved' ? 'success' : reg.status === 'pending' ? 'warning' : 'error'}`}>
                        {reg.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      {reg.status === 'pending' && (
                        <>
                          <Button variant="secondary" size="sm" className="text-success hover:text-success hover:border-success" onClick={() => handleApprove(reg._id)}>Approve</Button>
                          <Button variant="secondary" size="sm" className="text-error hover:text-error hover:border-error" onClick={() => handleReject(reg._id)}>Reject</Button>
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
          <Card>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-body">Assigned Judges</h3>
              <form onSubmit={handleAssignJudge} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Judge ID" 
                  className="px-3 py-1 rounded-[10px] border border-base bg-surface text-sm"
                  value={judgeEmail}
                  onChange={e => setJudgeEmail(e.target.value)}
                  required
                />
                <Button size="sm" type="submit" loading={assigningJudge}>Assign Judge</Button>
              </form>
            </div>
            {isLoadingJudges && <p className="text-sm text-muted">Loading judges...</p>}
            {!isLoadingJudges && judges.length === 0 && <p className="text-sm text-muted">No judges assigned yet.</p>}
            {!isLoadingJudges && judges.length > 0 && (
              <ul className="space-y-3">
                {judges.map(judgeAssignment => (
                  <li key={judgeAssignment._id} className="flex justify-between items-center p-3 bg-surface rounded-[10px] border border-base">
                    <div>
                      <p className="font-medium text-body">{judgeAssignment.judge?.name}</p>
                      <p className="text-xs text-muted">{judgeAssignment.judge?.email}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}
        
        {activeTab === 'submissions' && (
          <Card>
            <h3 className="font-semibold text-body mb-6">Submissions</h3>
            {isLoadingSubmissions && <p className="text-sm text-muted">Loading submissions...</p>}
            {!isLoadingSubmissions && submissions.length === 0 && <p className="text-sm text-muted">No submissions found.</p>}
            {!isLoadingSubmissions && submissions.length > 0 && (
              <ul className="space-y-3">
                {submissions.map(sub => (
                  <li key={sub._id} className="flex justify-between items-center p-3 bg-surface rounded-[10px] border border-base">
                    <div>
                      <p className="font-medium text-body">{sub.projectName}</p>
                      <p className="text-xs text-muted">{sub.registration?.team?.name}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}
        
        {activeTab === 'controls' && (
          <div className="space-y-4">
            <Card className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-body">Registration Status</h3>
                <p className="text-sm text-muted">Currently {hackathon?.registrationStatus || (hackathon?.registrationOpen ? 'Open' : 'Closed')}.</p>
              </div>
              <Button variant="danger" onClick={toggleRegistration}>
                {hackathon?.registrationStatus === 'closed' || !hackathon?.registrationOpen ? 'Open Registration' : 'Close Registration'}
              </Button>
            </Card>
            <Card className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-body">Publish Results</h3>
                <p className="text-sm text-muted">Make the leaderboard public. Cannot be undone.</p>
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
