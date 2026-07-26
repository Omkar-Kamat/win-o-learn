import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function TeamCard({ team }) {
  return (
    <Card className={`hover:shadow-md transition-shadow flex flex-col`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold tracking-tight font-semibold text-foreground line-clamp-1">{team.name}</h3>
        {team.role === 'leader' && (
          <Badge variant="default">Leader</Badge>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-6 flex-1 line-clamp-3">
        {team.description || 'No description provided.'}
      </p>
      <div className="flex justify-between items-center mt-auto border-t border-border pt-4">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{team.memberCount}</span> members
        </div>
        <Link to={`/teams/${team._id}`} className="text-primary font-medium hover:underline text-sm">
          Manage Team
        </Link>
      </div>
    </Card>
  );
}
