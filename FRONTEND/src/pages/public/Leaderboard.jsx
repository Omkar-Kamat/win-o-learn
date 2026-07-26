import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '../../api/axiosClient';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import LeaderboardTable from '../../components/hackathon/LeaderboardTable';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';

export default function Leaderboard() {
  const { id } = useParams();
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.02]);
  
  const { data: results, isLoading, error } = useQuery({
    queryKey: ['leaderboard', id],
    queryFn: async () => {
      const res = await axiosClient.get(`/hackathons/${id}/leaderboard`);
      return res.data.data;
    },
    retry: false
  });

  return (
    <motion.div 
      className="space-y-8 max-w-4xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="flex items-center gap-4"
        whileHover={{ x: -5 }}
      >
        <Link to={`/hackathons/${id}`} className="text-muted-foreground hover:text-foreground font-medium">
          &larr; Back to Hackathon
        </Link>
      </motion.div>
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
      >
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-bold text-foreground">Leaderboard</h1>
        <p className="text-muted-foreground mt-2">Final results for Hackathon {id}</p>
      </motion.div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key="leaderboard-card"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -30, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          style={{ scale }}
        >
          <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="p-8 text-center text-muted-foreground"
              >
                Loading leaderboard...
              </motion.div>
            )}
            {error && error.response?.status === 403 && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="p-8 text-center text-muted-foreground"
              >
                Results are not published yet.
              </motion.div>
            )}
            {error && error.response?.status !== 403 && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="p-8 text-center text-destructive"
              >
                Failed to load leaderboard.
              </motion.div>
            )}
            {!isLoading && !error && (!results || results.length === 0) && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="p-8 text-center text-muted-foreground"
              >
                Results are not published yet, or there are no submissions.
              </motion.div>
            )}
            {!isLoading && !error && results && results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              >
                <LeaderboardTable results={results} />
              </motion.div>
            )}
          </Card>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
