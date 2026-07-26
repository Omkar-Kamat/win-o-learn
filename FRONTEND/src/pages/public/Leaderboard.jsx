import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '../../api/axiosClient';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import LeaderboardTable from '../../components/hackathon/LeaderboardTable';

export default function Leaderboard() {
  const { id } = useParams();
  
  const { data: results, isLoading, error } = useQuery({
    queryKey: ['leaderboard', id],
    queryFn: async () => {
      const res = await axiosClient.get(`/hackathons/${id}/leaderboard`);
      return res.data.data;
    }
  });

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link to={`/hackathons/${id}`} className="text-muted-foreground hover:text-foreground">&larr; Back to Hackathon</Link>
      </div>
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-bold text-foreground">Leaderboard</h1>
        <p className="text-muted-foreground mt-2">Final results for Hackathon {id}</p>
      </div>
      
      <Card className="overflow-hidden">
        {isLoading && <div className="p-8 text-center text-muted-foreground">Loading leaderboard...</div>}
        {error && error.response?.status === 403 && <div className="p-8 text-center text-muted-foreground">Results are not published yet.</div>}
        {error && error.response?.status !== 403 && <div className="p-8 text-center text-destructive">Failed to load leaderboard.</div>}
        {!isLoading && !error && (!results || results.length === 0) && (
          <div className="p-8 text-center text-muted-foreground">Results are not published yet, or there are no submissions.</div>
        )}
        {!isLoading && !error && results && results.length > 0 && (
          <LeaderboardTable results={results} />
        )}
      </Card>
    </div>
  );
}
