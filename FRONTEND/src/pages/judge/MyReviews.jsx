import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '../../api/axiosClient';
import Card from '../../components/ui/Card';

export default function MyReviews() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['dashboard', 'judge'],
    queryFn: async () => {
      const res = await axiosClient.get('/dashboard/judge');
      return res.data.data;
    }
  });

  const reviews = dashboard?.reviews || [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-h1 font-bold text-body">My Reviews</h1>
        <p className="text-muted mt-2">History of submissions you have evaluated.</p>
      </div>

      <Card padding="none" className="overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface border-b border-base">
            <tr>
              <th className="px-6 py-4 font-semibold text-body">Project</th>
              <th className="px-6 py-4 font-semibold text-body">Hackathon</th>
              <th className="px-6 py-4 font-semibold text-body">Date Evaluated</th>
              <th className="px-6 py-4 font-semibold text-body text-right">Total Score</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-muted">Loading reviews...</td>
              </tr>
            )}
            {!isLoading && reviews.map(r => {
              const hackathon = dashboard?.hackathons?.find(h => h._id === r.hackathon);
              return (
                <tr key={r._id} className="border-b border-base last:border-0 hover:bg-surface/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-body">{r.submission?.projectName || 'Unknown Project'}</td>
                  <td className="px-6 py-4 text-muted">{hackathon?.title || 'Unknown Hackathon'}</td>
                  <td className="px-6 py-4 text-muted">{new Date(r.updatedAt || r.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right font-bold text-primary">{r.totalScore}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!isLoading && reviews.length === 0 && (
          <div className="p-8 text-center text-muted">You haven't completed any reviews yet.</div>
        )}
      </Card>
    </div>
  );
}
