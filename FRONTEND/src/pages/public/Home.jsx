import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import HackathonCard from '../../components/hackathon/HackathonCard';
import { useHackathons } from '../../hooks/useHackathons';
import { useAuth } from '../../context/AuthContext';
import { UserGroupIcon, CodeBracketIcon, TrophyIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '../../api/axiosClient';

export default function Home() {
  const { data, isLoading } = useHackathons(); // Fetches all events
  const { user } = useAuth();
  const hackathons = data?.hackathons || [];

  const { data: statsData } = useQuery({
    queryKey: ['public-stats'],
    queryFn: async () => {
      const res = await axiosClient.get('/dashboard/public/stats');
      return res.data.data;
    }
  });

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M+';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k+';
    return num + '+';
  };

  const totalHackathons = statsData ? formatNumber(statsData.totalHackathons) : '500+';
  const totalDevelopers = statsData ? formatNumber(statsData.totalDevelopers) : '50k+';
  const totalPrizePool = statsData ? '$' + formatNumber(statsData.totalPrizePool) : '$2M+';
  const countriesReached = statsData ? formatNumber(statsData.countriesReached) : '120+';

  return (
    <div className="flex flex-col gap-24 py-12">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-8 px-4">
        <div className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
          The Premier Hackathon Platform
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight lg:text-7xl font-bold text-foreground leading-tight">
          Build the <span className="text-primary">Future.</span>
        </h1>
        <p className="text-xl md:text-2xl font-medium text-muted-foreground max-w-2xl mx-auto">
          Discover, compete, and organize world-class hackathons on a platform designed for clarity and performance.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Link to="/hackathons">
            <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg">Explore Hackathons</Button>
          </Link>
          <Link to={user ? "/dashboard" : "/signup"}>
            <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg border-2">
              {user ? "Go to Dashboard" : "Host an Event"}
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats / Social Proof */}
      <section className="bg-muted/30 py-16 border-y border-border">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-black text-primary mb-2">{totalHackathons}</div>
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Hackathons Hosted</div>
          </div>
          <div>
            <div className="text-4xl font-black text-primary mb-2">{totalDevelopers}</div>
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Developers</div>
          </div>
          <div>
            <div className="text-4xl font-black text-primary mb-2">{totalPrizePool}</div>
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">In Prizes Awarded</div>
          </div>
          <div>
            <div className="text-4xl font-black text-primary mb-2">{countriesReached}</div>
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Countries Reached</div>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="space-y-10 max-w-[1440px] mx-auto px-6 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Featured Events</h2>
            <p className="text-muted-foreground mt-2 text-lg">Top prize pools and exciting challenges.</p>
          </div>
          <Link to="/hackathons" className="text-primary font-semibold hover:underline flex items-center gap-1">
            View all events &rarr;
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col gap-4">
                  <div className="h-48 bg-muted rounded-[16px] animate-pulse"></div>
                  <div className="h-6 bg-muted rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
                  <div className="h-10 bg-muted rounded-[10px] w-full mt-auto animate-pulse"></div>
                </div>
              ))}
            </>
          ) : hackathons.length > 0 ? (
            hackathons.slice(0, 6).map(hackathon => (
              <HackathonCard key={hackathon._id} hackathon={hackathon} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-muted/20 rounded-[24px] border border-border border-dashed">
              <TrophyIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-2xl font-bold text-foreground mb-2">No active hackathons</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                There are currently no featured hackathons available. Be the first to host one!
              </p>
              <Link to={user ? "/dashboard" : "/signup"}>
                <Button>Host a Hackathon</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* How it Works */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">How It Works</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Whether you are competing or organizing, we provide all the tools you need to succeed from start to finish.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-12 text-center">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <UserGroupIcon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-3">1. Form a Team</h3>
            <p className="text-muted-foreground leading-relaxed">
              Find teammates, send invites, and manage your squad all in one place.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <CodeBracketIcon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-3">2. Build & Submit</h3>
            <p className="text-muted-foreground leading-relaxed">
              Work on your project and submit it seamlessly through our platform before the deadline.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <TrophyIcon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-3">3. Win Prizes</h3>
            <p className="text-muted-foreground leading-relaxed">
              Judges review submissions in a streamlined interface, and winners take home the glory.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
