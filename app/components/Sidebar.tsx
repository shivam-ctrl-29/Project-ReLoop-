'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, CalendarClock, Archive, FileText,
  HelpCircle, Settings, Recycle, Cpu, CloudRain, BarChart2, LogOut, ShoppingBag, ShieldCheck, Trophy, Store
} from 'lucide-react';
import { useUser, ROLE_LABELS } from '@/lib/useUser';

const nav = [
  { label: 'Dashboard',      href: '/dashboard',   icon: LayoutDashboard, roles: ['admin','dept_head','buyer','recycler'] },
  { label: 'Oil Exchange',   href: '/oil-exchange', icon: Recycle,         roles: ['admin','dept_head','buyer'] },
  { label: 'E-Waste Market', href: '/ewaste',       icon: Cpu,             roles: ['admin','dept_head','buyer','recycler'] },
  { label: 'Rainwater AI',   href: '/rainwater',    icon: CloudRain,       roles: ['admin','dept_head'] },
  { label: 'Schedule Pickup',href: '/schedule',     icon: CalendarClock,   roles: ['admin','dept_head','recycler'] },
  { label: 'My Collections', href: '/collections',  icon: Archive,         roles: ['admin','dept_head'] },
  { label: 'My Orders',      href: '/orders',       icon: ShoppingBag,     roles: ['buyer'] },
  { label: 'Seller Portal',  href: '/seller',       icon: Store,           roles: ['admin','dept_head'] },
  { label: 'Compliance Docs',href: '/compliance',   icon: FileText,        roles: ['admin','dept_head'] },
  { label: 'Reports',        href: '/reports',      icon: BarChart2,       roles: ['admin'] },
  { label: 'Admin Panel',    href: '/admin',        icon: ShieldCheck,     roles: ['admin'] },
  { label: 'Leaderboard',   href: '/leaderboard',  icon: Trophy,          roles: ['admin','dept_head','buyer','recycler'] },
  { label: 'Help',           href: '/help',         icon: HelpCircle,      roles: ['admin','dept_head','buyer','recycler'] },
];

const roleBadgeColor: Record<string, string> = {
  admin:     '#1B5E20',
  dept_head: '#2196F3',
  buyer:     '#F59E0B',
  recycler:  '#7C3AED',
};

export default function Sidebar() {
  const path = usePathname();
  const router = useRouter();
  const user = useUser();

  const role = user?.role ?? 'buyer';
  const visibleNav = nav.filter(item => item.roles.includes(role));

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('reloop_user');
    router.push('/login');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-white border-r border-gray-100 flex flex-col z-20">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#1B5E20' }}>
            <Recycle size={16} color="white" />
          </div>
          <div>
            <div className="font-bold text-base leading-tight" style={{ fontFamily: 'Georgia, serif', color: '#1B5E20' }}>ReLoop</div>
            <div className="text-xs" style={{ color: '#5B6B63' }}>Circular Resource Mgmt</div>
          </div>
        </div>
      </div>

      {/* Role badge */}
      {user && (
        <div className="px-4 pt-3 pb-1">
          <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full text-white"
            style={{ background: roleBadgeColor[role] ?? '#1B5E20' }}>
            {ROLE_LABELS[role] ?? role}
          </span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {visibleNav.map(({ label, href, icon: Icon }) => {
          const active = path === href || path.startsWith(href + '/');
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active ? 'font-semibold border-l-4 pl-2' : 'text-gray-600 hover:bg-gray-50'
              }`}
              style={active ? { background: '#F1F8F0', color: '#1B5E20', borderColor: '#1B5E20' } : {}}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: roleBadgeColor[role] ?? '#1B5E20' }}>
            {initials}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate" style={{ color: '#1F2A24' }}>{user?.name ?? '—'}</div>
            <div className="text-xs truncate" style={{ color: '#5B6B63' }}>
              {user?.institution ? user.institution.split(' ').slice(0,2).join(' ').toUpperCase() : 'RELOOP'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/settings" className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 px-1">
            <Settings size={13} /> Settings
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600 px-1 ml-auto">
            <LogOut size={13} /> Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
