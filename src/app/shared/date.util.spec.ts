import { fromApiDate, toIsoDate } from './date.util';

describe('date helpers', () => {
  it('toIsoDate keeps the calendar day the user picked', () => {
    expect(toIsoDate(new Date(2026, 0, 31))).toBe('2026-01-31');
    expect(toIsoDate(new Date(2026, 8, 5))).toBe('2026-09-05');
  });

  it('fromApiDate reads the calendar day of an API date', () => {
    const date = fromApiDate('2026-02-28T00:00:00.000Z');
    expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([2026, 1, 28]);
  });
});
