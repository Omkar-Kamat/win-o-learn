import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '../../api/axiosClient';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

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
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-bold text-foreground">My Reviews</h1>
        <p className="text-muted-foreground mt-2">History of submissions you have evaluated.</p>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 font-semibold text-foreground">Project</th>
              <th className="px-6 py-4 font-semibold text-foreground">Hackathon</th>
              <th className="px-6 py-4 font-semibold text-foreground">Date Evaluated</th>
              <th className="px-6 py-4 font-semibold text-foreground text-right">Total Score</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-muted-foreground">Loading reviews...</td>
              </tr>
            )}
            {!isLoading && reviews.map(r => {
              const hackathon = dashboard?.hackathons?.find(h => h._id === r.hackathon);
              return (
                <tr key={r._id} className="border-b border-border last:border-0 hover:bg-muted/50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">{r.submission?.projectName || 'Unknown Project'}</td>
                  <td className="px-6 py-4 text-muted-foreground">{hackathon?.title || 'Unknown Hackathon'}</td>
                  <td className="px-6 py-4 text-muted-foreground">{new Date(r.updatedAt || r.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right font-bold text-primary">{r.totalScore}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!isLoading && reviews.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">You haven't completed any reviews yet.</div>
        )}
      </Card>
    </div>
  );
}
