import { bedMinutes, reminderMinutes, wakeMinutes } from '@/lib/sleepWindow';

describe('sleep window times', () => {
  it('bedtime = wake time minus sleep hours, wrapping past midnight', () => {
    // wake 07:00, 7h → bed 00:00
    expect(bedMinutes({ sleepHours: 7, wakeHour: 7, wakeMinute: 0 })).toBe(0);
    // wake 06:30, 7.5h → bed 23:00 the evening before
    expect(bedMinutes({ sleepHours: 7.5, wakeHour: 6, wakeMinute: 30 })).toBe(23 * 60);
  });

  it('never allows a window below 5.5 hours', () => {
    // asks for 4h, gets 5.5h: wake 07:00 → bed 01:30
    expect(bedMinutes({ sleepHours: 4, wakeHour: 7, wakeMinute: 0 })).toBe(90);
  });

  it('reminder is 30 minutes before bedtime and wraps across midnight', () => {
    expect(reminderMinutes({ sleepHours: 7, wakeHour: 7, wakeMinute: 0 }, 30)).toBe(23 * 60 + 30);
    expect(reminderMinutes({ sleepHours: 7.5, wakeHour: 6, wakeMinute: 30 }, 30)).toBe(22 * 60 + 30);
  });

  it('wake minutes', () => {
    expect(wakeMinutes({ sleepHours: 7, wakeHour: 5, wakeMinute: 45 })).toBe(345);
  });
});
