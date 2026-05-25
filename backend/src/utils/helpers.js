import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

export const formatDate  = (d, fmt = 'MMM D, YYYY') => dayjs(d).format(fmt);
export const fromNow     = (d)  => dayjs(d).fromNow();
export const isOverdue   = (d)  => dayjs().isAfter(dayjs(d));
export const daysLeft    = (d)  => dayjs(d).diff(dayjs(), 'day');

export const gradeColor  = (g) => g >= 90 ? 'success' : g >= 70 ? 'primary' : g >= 50 ? 'warning' : 'error';
export const gradeLabel  = (g) => g >= 90 ? 'A' : g >= 80 ? 'B' : g >= 70 ? 'C' : g >= 60 ? 'D' : 'F';

export const categoryColor = {
  'Web Development': '#1565c0',
  'Data Science':    '#6a1b9a',
  'Design':          '#00838f',
  'Marketing':       '#e65100',
  'Business':        '#2e7d32',
  'Other':           '#37474f',
};

export const truncate = (s, n = 100) => s?.length > n ? s.slice(0, n) + '…' : s;
export const fmtSecs  = (s) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;
