import { formatDistanceToNow, format } from 'date-fns';

export function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return dateStr;
  }
}

export function formatDateFull(dateStr: string): string {
  try {
    return format(new Date(dateStr), 'dd MMM yyyy, hh:mm a');
  } catch {
    return dateStr;
  }
}
