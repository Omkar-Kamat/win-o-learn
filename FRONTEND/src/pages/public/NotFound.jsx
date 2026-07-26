import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function NotFound() {
 return (
 <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
 <h1 className="text-5xl font-extrabold tracking-tight lg:text-6xl font-bold text-foreground">404</h1>
 <p className="text-2xl font-semibold tracking-tight text-muted-foreground">Page not found.</p>
 <Link to="/">
 <Button>Go Home</Button>
 </Link>
 </div>
 );
}
