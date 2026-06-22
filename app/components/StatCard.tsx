import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  unit?: string;
  change?: string;
  changeType?: 'up' | 'stable' | 'info';
  icon: LucideIcon;
  color?: 'green' | 'amber' | 'blue';
}

const colorMap = {
  green: { bg: '#F1F8F0', icon: '#1B5E20' },
  amber: { bg: '#FDF3E3', icon: '#F59E0B' },
  blue:  { bg: '#E8F2FC', icon: '#2196F3' },
};

export default function StatCard({ label, value, unit, change, changeType = 'up', icon: Icon, color = 'green' }: StatCardProps) {
  const c = colorMap[color];
  const changeColor = changeType === 'up' ? '#1B5E20' : changeType === 'stable' ? '#5B6B63' : '#2196F3';
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex-1 min-w-0">
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: c.bg }}>
          <Icon size={17} style={{ color: c.icon }} />
        </div>
        {change && (
          <span className="text-xs font-semibold" style={{ color: changeColor }}>{change}</span>
        )}
      </div>
      <div className="text-xs mb-1" style={{ color: '#5B6B63' }}>{label}</div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold" style={{ color: '#1F2A24', fontFamily: 'Georgia, serif' }}>{value}</span>
        {unit && <span className="text-sm font-medium" style={{ color: '#5B6B63' }}>{unit}</span>}
      </div>
    </div>
  );
}
