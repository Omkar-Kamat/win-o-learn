import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '../../api/axiosClient';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function SubmissionQueue() {
  const { hackathonId } = useParams();
  
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['dashboard', 'judge'],
    queryFn: async () => {
      const res = await axiosClient.get('/dashboard/judge');
      return res.data.data;
    }
  });

  const allSubmissions = dashboard?.assignedSubmissions || [];
  const reviews = dashboard?.reviews || [];
  const reviewedIds = new Set(reviews.map(r => r.submission?._id || r.submission));

  const submissions = allSubmissions
    .filter(sub => String(sub.registration?.hackathon) === String(hackathonId))
    .map(sub => ({
      ...sub,
      teamName: sub.registration?.team?.name || 'Unknown Team',
      reviewed: reviewedIds.has(sub._id)
    }));

  const hackathonTitle = dashboard?.assignedHackathons?.find(h => String(h._id) === String(hackathonId))?.title || hackathonId;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Link to="/dashboard/judge/hackathons" className="text-muted-foreground hover:text-foreground">&larr; Back to Hackathons</Link>
      </div>

      <div>
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-bold text-foreground">Submission Queue</h1>
        <p className="text-muted-foreground mt-2">Evaluate projects for {hackathonTitle}</p>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 font-semibold text-foreground">Project Name</th>
              <th className="px-6 py-4 font-semibold text-foreground">Team</th>
              <th className="px-6 py-4 font-semibold text-foreground">Status</th>
              <th className="px-6 py-4 font-semibold text-foreground text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-muted-foreground">Loading submissions...</td>
              </tr>
            )}
            {!isLoading && submissions.map(sub => (
              <tr key={sub._id} className="border-b border-border last:border-0 hover:bg-muted/50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-foreground">{sub.projectName}</td>
                <td className="px-6 py-4 text-muted-foreground">{sub.teamName}</td>
                <td className="px-6 py-4">
                  <Badge variant={sub.reviewed ? 'success' : 'warning'}>
                    {sub.reviewed ? 'Reviewed' : 'Pending'}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link to={`/dashboard/judge/submissions/${sub._id}/review`}>
                    <Button variant="secondary" size="sm">{sub.reviewed ? 'Edit Review' : 'Review'}</Button>
                  </Link>
                </td>
              </tr>
            ))}
            {!isLoading && submissions.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-muted-foreground">No submissions found for this hackathon.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
