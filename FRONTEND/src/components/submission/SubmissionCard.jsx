import Card from '../ui/Card';
import Button from '../ui/Button';
import StatusBadge from './StatusBadge';

export default function SubmissionCard({ submission, onView }) {
  return (
    <Card hover className="flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-title font-semibold text-body mb-1">{submission.projectName}</h3>
          <p className="text-sm text-muted">{submission.hackathonName}</p>
        </div>
        <StatusBadge status={submission.status} />
      </div>
      
      <div className="mt-auto pt-4 border-t border-base flex justify-between items-center text-sm">
        <span className="text-muted">Submitted on {submission.submittedAt}</span>
        {onView && <Button variant="secondary" size="sm" onClick={() => onView(submission._id)}>View Details</Button>}
      </div>
    </Card>
  );
}
