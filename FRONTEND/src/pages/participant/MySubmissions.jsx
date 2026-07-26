import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '../../api/axiosClient';
import SubmissionCard from '../../components/submission/SubmissionCard';

export default function MySubmissions() {
  const navigate = useNavigate();

  const { data: dashboard, isLoading, error } = useQuery({
    queryKey: ['dashboard', 'participant'],
    queryFn: async () => {
      const res = await axiosClient.get('/dashboard/participant');
      return res.data.data;
    }
  });

  const rawSubmissions = dashboard?.submissions || [];
  const submissions = rawSubmissions.map(sub => ({
    ...sub,
    hackathonName: sub.registration?.hackathon?.title || 'Unknown Hackathon',
    submittedAt: new Date(sub.createdAt).toLocaleDateString()
  }));

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-bold text-foreground">My Submissions</h1>
        <p className="text-muted-foreground mt-2">Projects you have submitted for judging.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading && <p className="text-muted-foreground col-span-full">Loading submissions...</p>}
        {error && <p className="text-destructive col-span-full">Failed to load submissions.</p>}
        {!isLoading && submissions.map(sub => (
          <SubmissionCard 
            key={sub._id} 
            submission={sub} 
            onView={(id) => navigate(`/submissions/${id}/edit`)}
          />
        ))}
        {!isLoading && submissions.length === 0 && (
          <div className="col-span-full p-8 text-center bg-muted/50 border border-border rounded-[16px]">
            <p className="text-muted-foreground">You haven't submitted any projects yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
