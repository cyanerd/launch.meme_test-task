import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names into a single string
 * @param inputs - ClassValue[]
 * @returns merged class name string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number with suffixes (K, M, B, T)
 * @param num - number to format
 * @param decimals - number of decimal places (default 1)
 * @returns formatted string with suffix
 */
export function formatNumberWithSuffix(num: number, decimals: number = 1): string {
  if (num === 0) return '0';

  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (absNum >= 1000000000000) { // 1T
    return `${sign}${(absNum / 1000000000000).toFixed(decimals)}T`;
  } else if (absNum >= 1000000000) { // 1B
    return `${sign}${(absNum / 1000000000).toFixed(decimals)}B`;
  } else if (absNum >= 1000000) { // 1M
    return `${sign}${(absNum / 1000000).toFixed(decimals)}M`;
  } else if (absNum >= 1000) { // 1K
    return `${sign}${(absNum / 1000).toFixed(decimals)}K`;
  } else {
    return `${sign}${absNum.toFixed(decimals)}`;
  }
}

/**
 * Formats currency with suffixes (K, M, B, T)
 * @param amount - currency amount
 * @param decimals - number of decimal places (default 1)
 * @returns formatted string with currency symbol and suffix
 */
export function formatCurrencyWithSuffix(amount: number, decimals: number = 1): string {
  return `$${formatNumberWithSuffix(amount, decimals)}`;
}

/**
 * Formats file size in bytes to human readable format
 * @param bytes - file size in bytes
 * @returns formatted string (e.g., "1.5 MB", "512 KB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Extracts and formats error messages from API responses
 * @param error - Error object or string from API
 * @param fallbackMessage - Default message if parsing fails
 * @returns Formatted error message
 */
export function getApiErrorMessage(error: unknown, fallbackMessage: string = 'An error occurred. Please try again.'): string {
  if (error && typeof error === 'object') {
    // Handle backend error response format
    if ('message' in error && typeof error.message === 'string') {
      // Handle HTTP error format: "HTTP error! status: 413, message: {...}"
      const messageStr = error.message;
      const messagePrefix = 'message: ';

      const messageIndex = messageStr.indexOf(messagePrefix);
      if (messageIndex !== -1) {
        const jsonPart = messageStr.substring(messageIndex + messagePrefix.length);
        try {
          const parsed = JSON.parse(jsonPart);
          if (parsed && typeof parsed === 'object' && 'message' in parsed) {
            return parsed.message.charAt(0).toUpperCase() + parsed.message.slice(1);
          }
        } catch {
          // If parsing fails, continue to other checks
        }
      }

      // Try to parse the whole message as JSON
      try {
        const parsed = JSON.parse(messageStr);
        if (parsed && typeof parsed === 'object' && 'message' in parsed) {
          return parsed.message.charAt(0).toUpperCase() + parsed.message.slice(1);
        }
      } catch {
        // If parsing fails, use the message as is
      }
      return error.message.charAt(0).toUpperCase() + error.message.slice(1);
    } else if ('error' in error && typeof error.error === 'string') {
      return error.error.charAt(0).toUpperCase() + error.error.slice(1);
    }
  } else if (typeof error === 'string') {
    // Handle HTTP error format in string: "HTTP error! status: 413, message: {...}"
    const messagePrefix = 'message: ';
    const messageIndex = error.indexOf(messagePrefix);

    if (messageIndex !== -1) {
      const jsonPart = error.substring(messageIndex + messagePrefix.length);
      try {
        const parsed = JSON.parse(jsonPart);
        if (parsed && typeof parsed === 'object' && 'message' in parsed) {
          return parsed.message.charAt(0).toUpperCase() + parsed.message.slice(1);
        }
      } catch {
        // If parsing fails, continue to other checks
      }
    }

    // Try to parse the whole string as JSON
    try {
      const parsed = JSON.parse(error);
      if (parsed && typeof parsed === 'object' && 'message' in parsed) {
        return parsed.message.charAt(0).toUpperCase() + parsed.message.slice(1);
      }
    } catch {
      // If parsing fails, use the string as is
      return error.charAt(0).toUpperCase() + error.slice(1);
    }
  }
  return fallbackMessage;
}

/**
 * Format an address by showing first N and last M characters with ellipsis
 * @param address - The address to format
 * @param startChars - Number of characters to show from the start (default: 4)
 * @param endChars - Number of characters to show from the end (default: 4)
 * @returns Formatted address string
 */
export function formatAddress(address: string, startChars: number = 4, endChars: number = 4): string {
  if (!address || address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Format a date as relative time (e.g., "5m ago", "2h ago", "1d ago")
 * @param date - The date to format
 * @returns Relative time string
 */
export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }
}

/**
 * Format price with appropriate decimal places based on magnitude
 * @param price - The price to format
 * @returns Formatted price string with dollar sign
 */
export function formatPrice(price: number): string {
  if (price === 0) return '$0.0000';
  if (price >= 0.01) {
    return `$${price.toFixed(4)}`;
  } else if (price >= 0.0001) {
    return `$${price.toFixed(6)}`;
  } else if (price >= 0.000001) {
    return `$${price.toFixed(8)}`;
  } else {
    // For very small numbers, use more readable format
    const priceStr = price.toString();
    const match = priceStr.match(/^(\d\.\d+)e-(\d+)$/);

    if (match) {
      const base = match[1];
      const zeros = parseInt(match[2]) - 1; // -1 because we already have a digit before the decimal point

      // Subscript characters for the number of zeros
      const subscriptMap: { [key: number]: string } = {
        0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄',
        5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉'
      };

      const subscript = zeros.toString().split('').map(digit => subscriptMap[parseInt(digit)] || digit).join('');

      return `$${base}₀${subscript}`;
    }

    return `$${price.toFixed(10)}`;
  }
}
