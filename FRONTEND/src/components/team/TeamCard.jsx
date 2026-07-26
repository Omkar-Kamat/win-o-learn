import { Link } from 'react-router-dom';
import Card from '../ui/Card';

export default function TeamCard({ team }) {
  return (
    <Card hover className="flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-title font-semibold text-body line-clamp-1">{team.name}</h3>
        {team.role === 'leader' && (
          <span className="badge-primary text-tiny px-2 py-1 rounded-full whitespace-nowrap bg-primary-light text-primary-text-on">Leader</span>
        )}
      </div>
      <p className="text-sm text-muted mb-6 flex-1 line-clamp-3">
        {team.description || 'No description provided.'}
      </p>
      <div className="flex justify-between items-center mt-auto border-t border-base pt-4">
        <div className="text-sm text-muted">
          <span className="font-medium text-body">{team.memberCount}</span> members
        </div>
        <Link to={`/teams/${team._id}`} className="text-primary font-medium hover:underline text-sm">
          Manage Team
        </Link>
      </div>
    </Card>
  );
}
