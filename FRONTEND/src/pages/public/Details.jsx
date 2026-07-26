import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '../../api/axiosClient';
import Button from '../../components/ui/Button';

export default function Details() {
  const { id } = useParams();

  const { data: hackathon, isLoading, error } = useQuery({
    queryKey: ['hackathon', id],
    queryFn: async () => {
      const res = await axiosClient.get(`/hackathons/${id}`);
      return res.data.data;
    }
  });

  if (isLoading) return <div className="max-w-4xl mx-auto text-muted mt-10">Loading hackathon details...</div>;
  if (error || !hackathon) return <div className="max-w-4xl mx-auto text-error mt-10">Failed to load hackathon details.</div>;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="h-64 bg-surface rounded-[20px] w-full border border-base relative overflow-hidden">
        {hackathon.bannerUrl && (
          <img src={hackathon.bannerUrl} alt={hackathon.title} className="w-full h-full object-cover" />
        )}
      </div>
      
      <div className="space-y-4">
        <h1 className="text-h1 font-bold text-body">{hackathon.title}</h1>
        <p className="text-muted capitalize">{hackathon.mode} • {hackathon.theme} Theme</p>
        
        <div className="prose text-body max-w-none">
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
