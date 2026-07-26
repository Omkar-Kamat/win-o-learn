import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StatusBadge from './StatusBadge';

export default function SubmissionCard({ submission, onView }) {
 return (
 <Card className={`hover:shadow-md transition-shadow flex flex-col h-full p-6`}>
 <div className="flex justify-between items-start mb-4">
 <div>
 <h3 className="text-xl font-semibold tracking-tight font-semibold text-foreground mb-1">{submission.projectName}</h3>
 <p className="text-sm text-muted-foreground">{submission.hackathonName}</p>
 </div>
 <StatusBadge status={submission.status} />
 </div>
 
 <div className="mt-auto pt-4 border-t border-border flex justify-between items-center text-sm">
 <span className="text-muted-foreground">Submitted on {submission.submittedAt}</span>
 {onView && <Button variant="secondary" size="sm" onClick={() => onView(submission._id)}>View Details</Button>}
 </div>
 </Card>
 );
}
