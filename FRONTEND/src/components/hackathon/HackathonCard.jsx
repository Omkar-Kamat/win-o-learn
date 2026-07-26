import { Link, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import StatusBadge from '../submission/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { getHackathonStatus } from '../../utils/hackathonStatus';

export default function HackathonCard({ hackathon }) {
 const location = useLocation();
 const isOrganizer = location.pathname.includes('/dashboard/organizer');

 const title = hackathon?.title || 'Hackathon Title';
 const description = hackathon?.description || 'A brief description of the hackathon goes here.';
 const prizePool = hackathon?.prizePool || 5000;
 const theme = hackathon?.theme || 'Web3';
 const mode = hackathon?.mode || 'Online';
 const status = getHackathonStatus(hackathon);
 return (
 <Card className="hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full shadow-card p-0">
 <div className="aspect-[16/9] bg-muted/50 w-full border-b border-border relative overflow-hidden">
 {hackathon?.banner && (
 <img 
 src={hackathon.banner} 
 alt={title} 
 className="w-full h-full object-cover" 
 />
 )}
 <div className="absolute top-3 right-3">
 <StatusBadge status={status} />
 </div>
 </div>
 <div className="p-5 flex flex-col flex-1">
 <div className="flex gap-2 mb-3">
 <Badge variant="default" size="sm">{theme}</Badge>
 <Badge variant="default" size="sm">{mode}</Badge>
 </div>
 
 <h3 className="text-xl font-semibold tracking-tight font-semibold text-foreground line-clamp-1 mb-1">{title}</h3>
 <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
 {description}
 </p>
 
 <div className="mt-auto border-t border-border pt-4 flex justify-between items-center text-sm">
 <span className="font-medium text-foreground">${prizePool.toLocaleString()} Prize</span>
 
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
