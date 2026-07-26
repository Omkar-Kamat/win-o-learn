import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '../../api/axiosClient';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

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

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Link to="/dashboard/judge/hackathons" className="text-muted hover:text-body">&larr; Back to Hackathons</Link>
      </div>

      <div>
        <h1 className="text-h1 font-bold text-body">Submission Queue</h1>
        <p className="text-muted mt-2">Evaluate projects for Hackathon {hackathonId}</p>
      </div>

      <Card padding="none" className="overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface border-b border-base">
            <tr>
              <th className="px-6 py-4 font-semibold text-body">Project Name</th>
              <th className="px-6 py-4 font-semibold text-body">Team</th>
              <th className="px-6 py-4 font-semibold text-body">Status</th>
              <th className="px-6 py-4 font-semibold text-body text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-muted">Loading submissions...</td>
              </tr>
            )}
            {!isLoading && submissions.map(sub => (
              <tr key={sub._id} className="border-b border-base last:border-0 hover:bg-surface/50 transition-colors">
                <td className="px-6 py-4 font-medium text-body">{sub.projectName}</td>
                <td className="px-6 py-4 text-muted">{sub.teamName}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full font-medium text-tiny ${sub.reviewed ? 'badge-success' : 'badge-warning'}`}>
                    {sub.reviewed ? 'Reviewed' : 'Pending'}
                  </span>
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
                <td colSpan="4" className="px-6 py-8 text-center text-muted">No submissions found for this hackathon.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
