import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';

export default function Sidebar({ mobileOpen = false, onClose }) {
  const { role } = useAuth();
  const location = useLocation();

  const navItems = {
    [ROLES.ADMIN]: [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Users', path: '/dashboard/admin/users' },
      { label: 'Hackathons', path: '/dashboard/admin/hackathons' },
      { label: 'Teams', path: '/dashboard/admin/teams' },
      { label: 'Analytics', path: '/dashboard/admin/analytics' },
    ],
    [ROLES.ORGANIZER]: [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'My Hackathons', path: '/dashboard/organizer/hackathons' },
    ],
    [ROLES.PARTICIPANT]: [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'My Registrations', path: '/dashboard/participant/registrations' },
      { label: 'My Submissions', path: '/dashboard/participant/submissions' },
      { label: 'My Invites', path: '/dashboard/participant/invites' },
    ],
    [ROLES.JUDGE]: [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Assigned Hackathons', path: '/dashboard/judge/hackathons' },
      { label: 'My Reviews', path: '/dashboard/judge/reviews' },
    ],
  };

  const links = navItems[role] || [];

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />
      )}
      <aside className={`w-64 bg-card border-r border-border flex-col h-screen z-50 ${mobileOpen ? 'flex fixed top-0 left-0' : 'hidden'} md:flex md:sticky md:top-0`}>
        <div className="h-[72px] flex items-center px-6 border-b border-border shrink-0">
          <Link to="/" className="text-xl font-bold text-foreground">Win-O-Learn</Link>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1">
            {links.map((link) => {
              const isActive = location.pathname === link.path || (link.path !== '/dashboard' && location.pathname.startsWith(link.path));
              return (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    onClick={onClose}
                    className={`block px-6 py-3 text-sm font-medium transition-colors border-l-4 ${
                      isActive 
                        ? 'bg-primary/10 text-primary-foreground border-primary' 
                        : 'text-muted-foreground hover:bg-muted/50 border-transparent hover:text-foreground'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-4 border-t border-border shrink-0 space-y-1">
          <Link 
            to="/profile" 
            onClick={onClose}
            className={`block px-6 py-3 text-sm font-medium transition-colors border-l-4 ${
              location.pathname === '/profile' 
                ? 'bg-primary/10 text-primary-foreground border-primary' 
                : 'text-muted-foreground hover:bg-muted/50 border-transparent hover:text-foreground'
            }`}
          >
            Profile
          </Link>
        </div>
      </aside>
    </>
  );
}
