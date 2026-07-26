import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion, useScroll, useTransform, AnimatePresence, useSpring } from 'framer-motion';
import HackathonCard from '../../components/hackathon/HackathonCard';
import { useHackathons } from '../../hooks/useHackathons';
import { useAuth } from '../../context/AuthContext';
import { UserGroupIcon, CodeBracketIcon, TrophyIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '../../api/axiosClient';

// Timeline sequence variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.15, delayChildren: 0.2 } 
  }
};

// Spring physics variants
const itemVariants = {
  hidden: { y: 40, opacity: 0, scale: 0.9 },
  visible: { 
    y: 0, 
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 24, mass: 0.8 }
  }
};

export default function Home() {
  const { data, isLoading } = useHackathons();
  const { user } = useAuth();
  const hackathons = data?.hackathons || [];
  
  // Exit Animation & Layout state
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  // Motion values & Scroll Animations
  const { scrollY } = useScroll();
  const smoothScrollY = useSpring(scrollY, { stiffness: 100, damping: 30, restDelta: 0.001 });
  
  // Independent transforms based on scroll
  const heroY = useTransform(smoothScrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(smoothScrollY, [0, 300], [1, 0]);
  const bgScale = useTransform(smoothScrollY, [0, 1000], [1, 1.2]);

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

  const stats = [
    { label: 'Hackathons Hosted', value: statsData ? formatNumber(statsData.totalHackathons) : '500+' },
    { label: 'Active Developers', value: statsData ? formatNumber(statsData.totalDevelopers) : '50k+' },
    { label: 'In Prizes Awarded', value: statsData ? formatNumber(statsData.totalPrizePool) : '$2M+' },
    { label: 'Countries Reached', value: statsData ? formatNumber(statsData.countriesReached) : '120+' },
  ];

  return (
    <motion.div layout className="flex flex-col gap-24 py-12 relative overflow-hidden">
      
      {/* Background motion value scaling */}
      <motion.div 
        className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"
        style={{ scale: bgScale }}
      />

      {/* Exit Animation and Layout Animation */}
      <AnimatePresence mode="popLayout">
        {showAnnouncement && (
          <motion.div 
            layout
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="mx-auto max-w-4xl px-4 w-full"
          >
            <div className="bg-primary text-primary-foreground p-4 flex justify-between items-center shadow-lg">
              <span className="font-medium tracking-wide">🎉 Welcome to the new Win-O-Learn platform experience!</span>
              <button onClick={() => setShowAnnouncement(false)} className="hover:bg-primary-foreground/20 p-1 transition-colors">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section with Scroll Parallax */}
      <motion.section 
        layout
        className="text-center max-w-4xl mx-auto space-y-8 px-4"
        style={{ y: heroY, opacity: heroOpacity }}
      >
        {/* Native Gestures: Drag, Hover, Tap */}
        <motion.div 
          drag
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          dragElastic={0.2}
          whileHover={{ scale: 1.05, rotate: -2 }}
          whileTap={{ scale: 0.95, rotate: 2 }}
          className="inline-block py-1 px-3 bg-primary/10 text-primary text-sm font-semibold mb-4 cursor-grab active:cursor-grabbing shadow-sm"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          The Premier Hackathon Platform (Drag me!)
        </motion.div>
        
        <motion.h1 
          className="text-5xl font-extrabold tracking-tight lg:text-7xl font-bold text-foreground leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Build the <span className="text-primary">Future.</span>
        </motion.h1>
        
        <motion.p 
          className="text-xl md:text-2xl font-medium text-muted-foreground max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
        >
          Discover, compete, and organize world-class hackathons on a platform designed for clarity and performance.
        </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row justify-center gap-4 pt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: "spring" }}
        >
          <Link to="/hackathons">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg shadow-md">Explore Hackathons</Button>
            </motion.div>
          </Link>
          <Link to={user ? "/dashboard" : "/signup"}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg border-2 shadow-sm">
                {user ? "Go to Dashboard" : "Host an Event"}
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </motion.section>

      {/* Stats / Social Proof with Timeline sequence */}
      <section className="bg-muted/30 py-16 border-y border-border overflow-hidden">
        <motion.div 
          className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {stats.map((stat, idx) => (
            <motion.div 
              key={idx} 
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.05, color: "var(--color-primary)" }}
              transition={{ type: "spring", stiffness: 400 }}
              className="p-4 bg-background border border-border shadow-sm"
            >
              <div className="text-4xl font-black text-primary mb-2">{stat.value}</div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Featured Events */}
      <section className="space-y-10 max-w-[1440px] mx-auto px-6 w-full overflow-hidden">
        <motion.div 
          className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          viewport={{ once: true, margin: "-50px" }}
        >
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Featured Events</h2>
            <p className="text-muted-foreground mt-2 text-lg">Top prize pools and exciting challenges.</p>
          </div>
          <Link to="/hackathons" className="text-primary font-semibold hover:underline flex items-center gap-1 group">
            View all events 
            <motion.span 
              className="inline-block"
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              &rarr;
            </motion.span>
          </Link>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col gap-4 p-4 border border-border bg-card">
                  <div className="h-48 bg-muted animate-pulse"></div>
                  <div className="h-6 bg-muted w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-muted w-1/2 animate-pulse"></div>
                  <div className="h-10 bg-muted w-full mt-auto animate-pulse"></div>
                </div>
              ))}
            </>
          ) : hackathons.length > 0 ? (
            hackathons.slice(0, 6).map(hackathon => (
              <motion.div 
                key={hackathon._id} 
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <HackathonCard hackathon={hackathon} />
              </motion.div>
            ))
          ) : (
            <motion.div 
              variants={itemVariants} 
              className="col-span-full py-20 text-center bg-muted/20 border border-border border-dashed shadow-inner"
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
              >
                <TrophyIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
              </motion.div>
              <h3 className="text-2xl font-bold text-foreground mb-2">No active hackathons</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                There are currently no featured hackathons available. Be the first to host one!
              </p>
              <Link to={user ? "/dashboard" : "/signup"}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
                  <Button>Host a Hackathon</Button>
                </motion.div>
              </Link>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* How it Works */}
      <section className="max-w-6xl mx-auto px-6 py-12 overflow-hidden">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          viewport={{ once: true, margin: "-50px" }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">How It Works</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Whether you are competing or organizing, we provide all the tools you need to succeed from start to finish.
          </p>
        </motion.div>
        
        <motion.div 
          className="grid md:grid-cols-3 gap-12 text-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div 
            variants={itemVariants} 
            className="flex flex-col items-center p-6 border border-border bg-card shadow-sm"
            whileHover={{ y: -10, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)" }}
          >
            <motion.div 
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.8, type: "spring" }}
              className="w-16 h-16 bg-primary/10 text-primary flex items-center justify-center mb-6 shadow-inner"
            >
              <UserGroupIcon className="w-8 h-8" />
            </motion.div>
            <h3 className="text-xl font-bold mb-3">1. Form a Team</h3>
            <p className="text-muted-foreground leading-relaxed">
              Find teammates, send invites, and manage your squad all in one place.
            </p>
          </motion.div>
          
          <motion.div 
            variants={itemVariants} 
            className="flex flex-col items-center p-6 border border-border bg-card shadow-sm"
            whileHover={{ y: -10, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)" }}
          >
            <motion.div 
              whileHover={{ rotate: -360 }}
              transition={{ duration: 0.8, type: "spring" }}
              className="w-16 h-16 bg-primary/10 text-primary flex items-center justify-center mb-6 shadow-inner"
            >
              <CodeBracketIcon className="w-8 h-8" />
            </motion.div>
            <h3 className="text-xl font-bold mb-3">2. Build & Submit</h3>
            <p className="text-muted-foreground leading-relaxed">
              Work on your project and submit it seamlessly through our platform before the deadline.
            </p>
          </motion.div>
          
          <motion.div 
            variants={itemVariants} 
            className="flex flex-col items-center p-6 border border-border bg-card shadow-sm"
            whileHover={{ y: -10, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)" }}
          >
            <motion.div 
              whileHover={{ scale: 1.2, rotate: 15 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-16 h-16 bg-primary/10 text-primary flex items-center justify-center mb-6 shadow-inner"
            >
              <TrophyIcon className="w-8 h-8" />
            </motion.div>
            <h3 className="text-xl font-bold mb-3">3. Win Prizes</h3>
            <p className="text-muted-foreground leading-relaxed">
              Judges review submissions in a streamlined interface, and winners take home the glory.
            </p>
          </motion.div>
        </motion.div>
      </section>
    </motion.div>
  );
}
