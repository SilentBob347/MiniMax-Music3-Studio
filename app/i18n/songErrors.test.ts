import { describe, expect, it } from 'vitest';
import { songErrorText } from './songErrors';

describe('songErrorText', () => {
  it('fills the fields into the template of the window language', () => {
    const failure = { message: 'English text', code: 'kv_cache_short', params: { needed: 1575, tokens: 73, frames: 1500, seconds: 60, max_seq: 512, suggest: 2048 } };
    const ru = songErrorText(failure, 'ru');
    expect(ru).toContain('1575');
    expect(ru).toContain('ограничен 512');
    expect(ru).toContain('не меньше 2048');
    expect(songErrorText(failure, 'ja')).toContain('512');
  });

  it('shows the service text as it is without a code or a template', () => {
    expect(songErrorText({ message: 'raw words' }, 'ru')).toBe('raw words');
    expect(songErrorText({ message: 'raw words', code: 'no_such_code' }, 'ko')).toBe('raw words');
    expect(songErrorText(null, 'en')).toBe('');
  });

  it('keeps a placeholder whose field did not come', () => {
    expect(songErrorText({ message: 'x', code: 'engine_fatal', params: {} }, 'en')).toBe('The engine stopped this song: {line}');
  });

  it('says what an exit code means in the window\'s language', () => {
    const failure = { message: 'x', code: 'lost_exit_at_line', params: { exit: '0xc000001d', meaning: 'illegal_instruction', line: '[AR] Frame 3' } };
    expect(songErrorText(failure, 'ru')).toContain('(инструкция, которой нет у этого процессора, код выхода 0xc000001d)');
    expect(songErrorText({ ...failure, params: { ...failure.params, meaning: 'other' } }, 'en')).toContain('(it closed, exit code 0xc000001d)');
  });
});
