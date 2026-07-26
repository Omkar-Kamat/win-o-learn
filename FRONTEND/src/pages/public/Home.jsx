import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';

export default function Home() {
  return (
    <div className="flex flex-col gap-24 py-12">
      <section className="text-center max-w-3xl mx-auto space-y-6">
        <h1 className="text-hero font-bold text-body leading-tight">Build the Future.</h1>
        <p className="text-h3 font-medium text-muted">
          Discover, compete, and organize world-class hackathons on a platform designed for clarity.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Link to="/hackathons">
            <Button size="lg">Explore Hackathons</Button>
          </Link>
          <Link to="/signup">
            <Button variant="secondary" size="lg">Host an Event</Button>
          </Link>
        </div>
      </section>

      <section className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-h2 font-semibold text-body">Featured Events</h2>
            <p className="text-muted">Top prize pools and exciting challenges.</p>
          </div>
          <Link to="/hackathons" className="text-primary font-medium hover:underline">View all</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-card border border-base rounded-[16px] animate-pulse"></div>
          <div className="h-64 bg-card border border-base rounded-[16px] animate-pulse"></div>
          <div className="h-64 bg-card border border-base rounded-[16px] animate-pulse"></div>
        </div>
      </section>
    </div>
  );
}
