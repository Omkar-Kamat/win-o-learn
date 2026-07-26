import { Outlet, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export default function AuthLayout() {
 const { theme, toggleTheme } = useTheme();

 return (
 <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 relative">
 <div className="absolute top-6 right-6">
 <button
 aria-label="Toggle theme"
 onClick={toggleTheme}
 className="p-2 hover:bg-primary/10 hover:text-primary transition-colors text-foreground"
 >
 {theme === 'dark' ? (
 <motion.div initial={{ rotate: -15, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}>
 <SunIcon className="w-6 h-6" />
 </motion.div>
 ) : (
 <motion.div initial={{ rotate: 15, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}>
 <MoonIcon className="w-6 h-6" />
 </motion.div>
 )}
 </button>
 </div>
 
 <div className="w-full max-w-md">
 <div className="text-center mb-8">
 <Link to="/">
 <h1 className="text-3xl font-semibold tracking-tight font-bold text-foreground hover:text-primary transition-colors">Win-O-Learn</h1>
 </Link>
 <p className="text-muted-foreground mt-2">Hackathon Management Platform</p>
 </div>
 <Outlet />
 </div>
 </div>
 );
}
