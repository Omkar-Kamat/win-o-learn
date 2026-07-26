import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      <h1 className="text-hero font-bold text-body">404</h1>
      <p className="text-h3 text-muted">Page not found.</p>
      <Link to="/">
        <Button>Go Home</Button>
      </Link>
    </div>
  );
}
