import { STATUS_COLORS } from '@/lib/types';

export function StatusBadge({ status }: { status: string }) {
  const colors = STATUS_COLORS[status] || 'bg-gray-100 text-gray-600 border-gray-300';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${colors} whitespace-nowrap`}>
      {status}
    </span>
  );
}
