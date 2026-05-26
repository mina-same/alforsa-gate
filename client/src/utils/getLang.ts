type LocalizedField = { en?: string; ar?: string } | string | null | undefined;

export function getLang(field: LocalizedField, lang: string): string {
  if (!field) return '';
  if (typeof field === 'string') return field;
  const key = lang === 'ar' ? 'ar' : 'en';
  return (field as any)[key] || (field as any).en || '';
}

export function getLangArr(field: any, lang: string): string[] {
  if (!field) return [];
  if (typeof field === 'string') {
    try { return JSON.parse(field); } catch { return [field]; }
  }
  const key = lang === 'ar' ? 'ar' : 'en';
  const val = (field as any)[key] || (field as any).en;
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') return [val];
  return [];
}
