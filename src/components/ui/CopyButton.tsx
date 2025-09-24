import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CopyButtonProps {
  address: string;
  size?: number;
  padding?: string;
  title?: string;
  className?: string;
}

export function CopyButton({
  address,
  size = 14,
  padding = 'p-1',
  title = 'Copy address',
  className
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  return (
    <button
      className={cn(
        `${padding} rounded-lg hover:bg-accent/50 transition-colors text-muted-foreground hover:text-foreground`,
        className
      )}
      onClick={handleCopy}
      title={title}
    >
      {copied ? (
        <Check size={size} className="text-green-400" />
      ) : (
        <Copy size={size} />
      )}
    </button>
  );
}
