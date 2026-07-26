import { Link, useLocation } from 'react-router-dom';
import Card from '../ui/Card';
import StatusBadge from '../submission/StatusBadge';
import Badge from '../ui/Badge';

export default function HackathonCard({ hackathon }) {
  const location = useLocation();
  const isOrganizer = location.pathname.includes('/dashboard/organizer');

  const title = hackathon?.title || 'Hackathon Title';
  const description = hackathon?.description || 'A brief description of the hackathon goes here.';
  const prizePool = hackathon?.prizePool || 5000;
  const status = hackathon?.status || 'ongoing';
  const theme = hackathon?.theme || 'Web3';
  const mode = hackathon?.mode || 'Online';

  return (
    <Card hover padding="none" className="overflow-hidden flex flex-col h-full shadow-card">
      <div className="aspect-[16/9] bg-surface w-full rounded-t-[16px] border-b border-base relative">
        <div className="absolute top-3 right-3">
          <StatusBadge status={status} />
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex gap-2 mb-3">
          <Badge variant="default" size="sm">{theme}</Badge>
          <Badge variant="default" size="sm">{mode}</Badge>
        </div>
        
        <h3 className="text-title font-semibold text-body line-clamp-1 mb-1">{title}</h3>
        <p className="text-sm text-muted mb-4 line-clamp-2 flex-1">
          {description}
        </p>
        
        <div className="mt-auto border-t border-base pt-4 flex justify-between items-center text-sm">
          <span className="font-medium text-body">${prizePool.toLocaleString()} Prize</span>
          
          {isOrganizer ? (
            <Link to={`/dashboard/organizer/hackathons/${hackathon?._id || '1'}/manage`} className="text-primary font-medium hover:underline">
              Manage
            </Link>
          ) : (
            <Link to={`/hackathons/${hackathon?._id || '1'}`} className="text-primary font-medium hover:underline">
              View Details
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
}
