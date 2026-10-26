import { describe, expect, it } from 'vitest';
import { MAIN_STYLES } from '../data/genres';
import { GENRE_GLOSSES, STYLE_SUGGESTIONS, genreGloss, styleSuggestions } from './styleSuggestions';

describe('style suggestions', () => {
  it('gloss every genre of the studio in each language that has a file, and nothing else', () => {
    expect(Object.keys(GENRE_GLOSSES).sort()).toEqual(['ja', 'ko', 'ru', 'zh']);
    for (const [language, glosses] of Object.entries(GENRE_GLOSSES)) {
      expect([...glosses!.keys()], language).toEqual(MAIN_STYLES);
      for (const [genre, gloss] of glosses!) expect(gloss, `${language}: ${genre}`).not.toBe('');
    }
  });

  it('show the gloss beside the English the model reads; this studio suggests its genres alone', () => {
    expect(STYLE_SUGGESTIONS).toEqual([]);
    expect(genreGloss('dubstep', 'zh')).toBe('回响贝斯');
    expect(genreGloss('dubstep', 'ru')).toBe('дабстеп');
    expect(genreGloss('dubstep', 'en')).toBeUndefined();
    const zh = styleSuggestions('zh', MAIN_STYLES);
    expect(zh).toHaveLength(MAIN_STYLES.length);
    expect(zh[0]).toEqual({ value: MAIN_STYLES[0], label: genreGloss(MAIN_STYLES[0], 'zh') });
    expect(styleSuggestions('en', MAIN_STYLES).every(item => item.label === undefined)).toBe(true);
  });
});
