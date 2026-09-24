import { en } from './en';
import { zh } from './zh';
import { ja } from './ja';
import { ko } from './ko';
import { ru } from './ru';
import { processingStrings } from './processing';

export type Language = 'en' | 'zh' | 'ja' | 'ko' | 'ru';

const enAll = { ...en, ...processingStrings.en };

export type TranslationKey = keyof typeof enAll;

export const translations: Record<Language, Partial<Record<TranslationKey, string>>> = {
  en: enAll,
  zh: { ...zh, ...processingStrings.zh },
  ja: { ...ja, ...processingStrings.ja },
  ko: { ...ko, ...processingStrings.ko },
  ru: { ...ru, ...processingStrings.ru },
};
