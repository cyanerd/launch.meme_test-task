import { useState } from 'react';

interface TokenData {
  avatar?: string;
  name: string;
  symbol: string;
}

interface TokenAvatarProps {
  token: TokenData;
  size?: number;
  className?: string;
}

export function TokenAvatar({ token, size = 8, className = '' }: TokenAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const hasValidAvatar = token.avatar && token.avatar !== '/api/placeholder/32/32' && !imageError;

  return (
    <div
      className={`w-${size} h-${size} flex-shrink-0 bg-primary/10 rounded-lg flex items-center justify-center overflow-hidden border border-primary/20 ${className}`}>
      {hasValidAvatar ? (
        <img
          src={token.avatar}
          alt={token.name}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className="text-primary text-xs font-semibold">
          {token.symbol.charAt(0)}
        </span>
      )}
    </div>
  );
}
