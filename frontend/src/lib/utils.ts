import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';

// Utility for combining Tailwind CSS classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date to human-readable string
export function formatDate(date: string, formatString: string = 'PPP') {
  try {
    return format(parseISO(date), formatString);
  } catch (error) {
    return date;
  }
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

// Calculate total budget
export function calculateTotalBudget(items: { estimated_cost: number }[]): number {
  return items.reduce((total, item) => total + item.estimated_cost, 0);
}

// Calculate total spent
export function calculateTotalSpent(items: { actual_cost: number | null }[]): number {
  return items.reduce((total, item) => total + (item.actual_cost || 0), 0);
}

// Generate random avatar URL
export function getAvatarUrl(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
}

// Build initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}