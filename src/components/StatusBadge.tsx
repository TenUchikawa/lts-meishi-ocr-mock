import { CheckCircle, AlertCircle } from 'lucide-react';
import type { CardStatus } from '../types';

interface StatusBadgeProps {
  status: CardStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  if (status === 'verified') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
        <CheckCircle className="w-3.5 h-3.5" />
        確認済み
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
      <AlertCircle className="w-3.5 h-3.5" />
      未確認
    </span>
  );
}
