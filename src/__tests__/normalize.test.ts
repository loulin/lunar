import { describe, expect, it } from 'vitest';
import { normalizeGregorianInput } from '../utils/normalize';
import { InvalidGregorianDateError } from '../errors';

describe('normalizeGregorianInput', () => {
  it('接受 Date 并返回副本', () => {
    const source = new Date('2024-02-10T00:00:00.000Z');
    const normalized = normalizeGregorianInput(source);

    expect(normalized).not.toBe(source);
    expect(normalized.toISOString()).toBe(source.toISOString());
  });

  it('接受对象输入', () => {
    const normalized = normalizeGregorianInput({ year: 2024, month: 2, day: 10 });

    expect(normalized.getUTCFullYear()).toBe(2024);
    expect(normalized.getUTCMonth()).toBe(1);
    expect(normalized.getUTCDate()).toBe(10);
  });

  it('非法日期抛错', () => {
    expect(() => normalizeGregorianInput({ year: 2024, month: 2, day: 31 })).toThrow(
      InvalidGregorianDateError
    );
  });
});
