/**
 * Dynamic image URL resolver supporting dynamic visual asset linking
 */
export function resolveImageUrl(src: string | undefined, fallback: string): string {
  if (!src) return fallback;
  
  // If it's already an absolute or relative HTTP/assets URL, return as is
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/assets/')) {
    return src;
  }

  // Support clean dynamic paths
  return `/assets/aistudio/${src.replace(/^\/+/, '')}`;
}

export function formatGrade(val: number, max: number = 20): string {
  return `${val.toFixed(1)} / ${max}`;
}

export function getGradeBadgeColor(score: number, max: number = 20): { bg: string; text: string; ring: string } {
  const ratio = score / max;
  if (ratio >= 0.8) {
    return { bg: 'bg-emerald-500/15', text: 'text-emerald-700', ring: 'ring-emerald-500/30' };
  }
  if (ratio >= 0.6) {
    return { bg: 'bg-teal-500/15', text: 'text-teal-700', ring: 'ring-teal-500/30' };
  }
  if (ratio >= 0.5) {
    return { bg: 'bg-amber-500/15', text: 'text-amber-700', ring: 'ring-amber-500/30' };
  }
  return { bg: 'bg-rose-500/15', text: 'text-rose-700', ring: 'ring-rose-500/30' };
}

export function getAttendanceBadgeColor(status: string): { bg: string; text: string; label: string } {
  switch (status) {
    case 'present':
      return { bg: 'bg-emerald-500/15 text-emerald-700', text: 'text-emerald-700', label: 'Présent(e)' };
    case 'late':
      return { bg: 'bg-amber-500/15 text-amber-700', text: 'text-amber-700', label: 'En retard' };
    case 'excused':
      return { bg: 'bg-blue-500/15 text-blue-700', text: 'text-blue-700', label: 'Excusé(e)' };
    case 'absent':
    default:
      return { bg: 'bg-rose-500/15 text-rose-700', text: 'text-rose-700', label: 'Absent(e)' };
  }
}
