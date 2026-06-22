'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, CalendarClock, Archive, FileText,
  HelpCircle, Settings, Recycle, Cpu, CloudRain, BarChart2
} from 'lucide-react';

const nav = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Oil Exchange', href: '/oil-exchange', icon: Recycle },
  { label: 'E-Waste Market', href: '/ewaste', icon: Cpu },
  { label: 'Rainwater AI', href: '/rainwater', icon: CloudRain },
  { label: 'Schedule Pickup', href: '/schedule', icon: CalendarClock },
  { label: 'My Collections', href: '/collections', icon: Archive },
  { label: 'Compliance Docs', href: '/compliance', icon: FileText },
  { label: 'Reports', href: '/reports', icon: BarChart2 },
  { label: 'Help', href: '/help', icon: HelpCircle },
];

export default function Sidebar() {
  const path = usePathname();
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

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ label, href, icon: Icon }) => {
          const active = path === href || path.startsWith(href + '/');
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? 'font-semibold border-l-4 pl-2'
                  : 'text-gray-600 hover:bg-gray-50'
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
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: '#1B5E20' }}>SU</div>
          <div>
            <div className="text-sm font-semibold" style={{ color: '#1F2A24' }}>Suraj U.</div>
            <div className="text-xs" style={{ color: '#5B6B63' }}>SYMBIOSIS INDORE</div>
          </div>
        </div>
        <Link href="/settings" className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 px-1">
          <Settings size={14} /> Settings
        </Link>
      </div>
    </aside>
  );
}
