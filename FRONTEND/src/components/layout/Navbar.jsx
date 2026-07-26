import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { SunIcon, MoonIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <nav className="h-[72px] bg-card border-b border-border px-6 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <Link to="/" className="text-xl font-bold text-foreground">Win-O-Learn</Link>
        <div className="hidden md:flex items-center gap-4">
          <Link to="/hackathons" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Browse Hackathons</Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Dialog>
          <DialogTrigger render={<button className="p-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" />}>
            <MagnifyingGlassIcon className="w-5 h-5" />
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Search</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              navigate(`/hackathons?search=${e.target.search.value}`);
            }}>
              <Input autoFocus name="search" placeholder="Search hackathons, themes..." className="w-full" />
              <div className="mt-4 flex justify-end">
                <Button type="submit">Search</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-muted/50 text-foreground transition-colors"
        >
          {theme === 'dark' ? (
            <motion.div initial={{ rotate: -15, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}>
              <SunIcon className="w-5 h-5" />
            </motion.div>
          ) : (
            <motion.div initial={{ rotate: 15, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}>
              <MoonIcon className="w-5 h-5" />
            </motion.div>
          )}
        </button>

        {user ? (
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-sm font-medium text-primary hover:underline">Dashboard</Link>
            <button onClick={logout} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Logout</button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Log In</Link>
            <Link to="/signup" className="px-4 py-2 bg-primary text-on-primary rounded-[10px] text-sm font-medium hover:bg-primary-hover transition-colors">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
