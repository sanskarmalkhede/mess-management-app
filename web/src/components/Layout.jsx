import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/owners', label: 'Owners', icon: '👤' },
  { path: '/messes', label: 'Messes', icon: '🏪' },
  { path: '/members', label: 'Members', icon: '👥' },
  { path: '/attendance', label: 'Attendance', icon: '✅' },
  { path: '/menu-history', label: 'Menu History', icon: '🍽️' },
  { path: '/polls', label: 'Polls', icon: '📊' },
];

export default function Layout({ children }) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-[var(--dark-950)]">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-20' : 'w-64'} bg-[var(--dark-900)] border-r border-[var(--dark-700)] transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-4 border-b border-[var(--dark-700)] flex items-center justify-between">
          {!collapsed && <span className="text-xl font-bold text-white">MessPro</span>}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-[var(--dark-700)] text-[var(--dark-400)]"
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-[var(--primary-600)] text-white'
                    : 'text-[var(--dark-400)] hover:bg-[var(--dark-700)] hover:text-white'
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              {!collapsed && <span className="ml-3">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-[var(--dark-700)]">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-[var(--primary-600)] flex items-center justify-center text-white font-bold">
              {profile?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            {!collapsed && (
              <div className="ml-3 flex-1">
                <p className="text-white text-sm font-medium">{profile?.name || 'Admin'}</p>
                <button
                  onClick={handleSignOut}
                  className="text-[var(--error)] text-xs hover:underline"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
