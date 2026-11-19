/**
 * Normalization utilities for Student Name, School Name, and Class Name
 * Prevents fragmented statistical groupings due to variations in spacing and casing.
 */

export function normalizeStudentName(name: string): string {
  if (!name) return '';
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((w) => (w.length > 0 ? w.charAt(0).toUpperCase() + w.slice(1) : ''))
    .join(' ');
}

export function normalizeSchoolKey(school: string): string {
  if (!school) return '';
  return school
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/^(trường|truong)\s+/i, '');
}

export function normalizeSchoolName(school: string): string {
  if (!school) return '';
  const s = school.trim().replace(/\s+/g, ' ');
  return s
    .split(' ')
    .map((w) => {
      if (w.length === 0) return '';
      if (w.toLowerCase() === 'thpt') return 'THPT';
      if (w.toLowerCase() === 'thcs') return 'THCS';
      if (w.toLowerCase() === 'trường') return 'Trường';
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(' ');
}

export function normalizeClassName(className: string): string {
  if (!className) return '';
  let c = className.trim().replace(/\s+/g, ' ');

  // Strip "lớp" or "lop" prefix if entered by user (e.g. "Lớp 10A1" -> "10A1")
  c = c.replace(/^(lớp|lop)\s+/i, '');

  // Normalize patterns like "10 a 1", "10-a-1", "10_a1" -> "10A1"
  c = c.replace(/^(\d+)\s*[-_.]?\s*([a-zA-Z]+)\s*[-_.]?\s*(\d*)$/, (_m, g1, g2, g3) => {
    return `${g1}${g2.toUpperCase()}${g3 || ''}`;
  });

  return c.toUpperCase();
}
