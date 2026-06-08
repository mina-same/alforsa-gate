import { fetchEmojis } from 'emojibase';
import arAnnotations from 'cldr-annotations-full/annotations/ar/annotations.json';

export type EmojiEntry = {
  emoji: string;
  short_code: string;
  keywords?: string[];
  label?: string;
};

const emojiCache = new Map<string, EmojiEntry[]>();

const normalizeEmojiUnicode = (v: string): string => String(v || '').replace(/\uFE0F/g, '');

const normalizeEmojiLocale = (locale: string): string => {
  const l = String(locale || 'en').toLowerCase();
  if (l.startsWith('ar')) return 'en';
  if (l.startsWith('en')) return 'en';
  return l;
};

const hasArabicChars = (v: string): boolean => /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(v);

const arKeywordsByEmoji = (() => {
  const map = new Map<string, string[]>();
  const annotations = (arAnnotations as any)?.annotations?.annotations;
  if (!annotations || typeof annotations !== 'object') return map;

  for (const [emoji, data] of Object.entries(annotations)) {
    const defaults = (data as any)?.default;
    if (!Array.isArray(defaults) || defaults.length === 0) continue;
    map.set(normalizeEmojiUnicode(emoji), defaults.map((v) => String(v)));
  }

  return map;
})();

export async function loadEmojiData(locale: string = 'en'): Promise<EmojiEntry[]> {
  if (emojiCache.has(locale)) return emojiCache.get(locale)!;

  const normalizedLocale = normalizeEmojiLocale(locale);

  try {
    const data = await fetchEmojis(normalizedLocale as any, {
      shortcodes: ['github'],
    });

    const mapped = (data as any[]).map((e: any) => {
      const short = String(e.shortcodes?.[0] || '');
      const keywords = Array.isArray(e.tags) ? [...e.tags] : [];
      return {
        emoji: String(e.emoji || ''),
        short_code: short,
        keywords,
        label: String(e.label || ''),
      };
    });

    emojiCache.set(locale, mapped);
    return mapped;
  } catch {
    if (normalizedLocale !== 'en') {
      const fallback = await loadEmojiData('en');
      emojiCache.set(locale, fallback);
      return fallback;
    }
    return [];
  }
}

export function filterEmojis(query: string, emojis: EmojiEntry[]): EmojiEntry[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const isArabicQuery = hasArabicChars(q);

  return emojis
    .filter((e) => {
      const cldrArKeywords = arKeywordsByEmoji.get(normalizeEmojiUnicode(e.emoji)) || [];
      const combinedKeywords = isArabicQuery
        ? [...(e.keywords || []), ...cldrArKeywords]
        : (e.keywords || []);
      const matchesShort = e.short_code.toLowerCase().includes(q);
      const matchesLabel = e.label?.toLowerCase().includes(q);
      const matchesKeyword = combinedKeywords.some((k) => String(k).toLowerCase().includes(q));
      return Boolean(matchesShort || matchesLabel || matchesKeyword);
    })
    .slice(0, 30);
}
