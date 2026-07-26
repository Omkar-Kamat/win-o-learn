import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-border py-12 mt-auto bg-muted/50">
      <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-lg font-bold text-foreground mb-4">Win-O-Learn</h3>
          <p className="text-sm text-muted-foreground">The minimal, professional hackathon management platform.</p>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-4">Platform</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/hackathons" className="hover:text-primary transition-colors">Browse Hackathons</Link></li>
            <li><Link to="/hackathons" className="hover:text-primary transition-colors">Leaderboards</Link></li>
            <li><Link to="/signup" className="hover:text-primary transition-colors">Organize an Event</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-4">Legal</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><span className="cursor-pointer hover:text-primary transition-colors">Terms of Service</span></li>
            <li><span className="cursor-pointer hover:text-primary transition-colors">Privacy Policy</span></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
