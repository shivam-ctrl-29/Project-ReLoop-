import { CloudRain } from 'lucide-react';

export default function AlertBanner({ message, action }: { message: string; action?: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 rounded-xl mb-5 border border-amber-200"
      style={{ background: '#FDF3E3' }}>
      <div className="flex items-center gap-3">
        <CloudRain size={18} style={{ color: '#F59E0B' }} />
        <span className="text-sm" style={{ color: '#1F2A24' }}>{message}</span>
      </div>
      {action && (
        <button className="text-xs font-semibold px-4 py-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50" style={{ color: '#1F2A24' }}>
          {action}
        </button>
      )}
    </div>
  );
}
