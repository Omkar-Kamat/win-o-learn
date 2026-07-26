import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';

export default function Sidebar() {
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
    ],
    [ROLES.JUDGE]: [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Assigned Hackathons', path: '/dashboard/judge/hackathons' },
      { label: 'My Reviews', path: '/dashboard/judge/reviews' },
    ],
  };

  const links = navItems[role] || [];

  return (
    <aside className="w-64 bg-card border-r border-base flex-col hidden md:flex h-screen sticky top-0">
      <div className="h-[72px] flex items-center px-6 border-b border-base shrink-0">
        <Link to="/" className="text-xl font-bold text-body">Win-O-Learn</Link>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          {links.map((link) => {
            const isActive = location.pathname === link.path || (link.path !== '/dashboard' && location.pathname.startsWith(link.path));
            return (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`block px-6 py-3 text-sm font-medium transition-colors border-l-4 ${
                    isActive 
                      ? 'bg-primary-light text-primary-text-on border-primary' 
                      : 'text-muted hover:bg-surface border-transparent hover:text-body'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-base shrink-0 space-y-1">
        <Link 
          to="/profile" 
          className={`block px-6 py-3 text-sm font-medium transition-colors border-l-4 ${
            location.pathname === '/profile' 
              ? 'bg-primary-light text-primary-text-on border-primary' 
              : 'text-muted hover:bg-surface border-transparent hover:text-body'
          }`}
        >
          Profile
        </Link>
      </div>
    </aside>
  );
}
