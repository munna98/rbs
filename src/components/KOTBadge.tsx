import { Printer, Check } from 'lucide-react';

interface KOTBadgeProps {
  kotPrinted: boolean;
  kotNumber?: string;
  size?: 'sm' | 'md';
}

const KOTBadge = ({ kotPrinted, kotNumber, size = 'md' }: KOTBadgeProps) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
  };

  if (kotPrinted) {
    return (
      <span className={`inline-flex items-center gap-1 bg-green-100 text-green-800 rounded-full font-semibold ${sizeClasses[size]}`}>
        <Check className="w-3 h-3" />
        KOT Printed
        {kotNumber && ` (${kotNumber})`}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 bg-orange-100 text-orange-800 rounded-full font-semibold ${sizeClasses[size]}`}>
      <Printer className="w-3 h-3" />
      KOT Pending
      {kotNumber && ` (${kotNumber})`}
    </span>
  );
};

export default KOTBadge;