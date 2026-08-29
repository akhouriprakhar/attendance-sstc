export interface CollegeHoursStatus {
  isOpen: boolean;
  isSunday: boolean;
  isBeforeStart: boolean;
  isAfterEnd: boolean;
  todayName: string;
  message: string;
  subMessage: string;
  scheduleText: string;
  closingTimeStr: string;
  timeRemainingStr?: string;
}

/**
 * College schedule boundaries:
 * - Monday to Friday: 10:00 AM – 04:30 PM (10:00 – 16:30)
 * - Saturday: 10:00 AM – 02:00 PM (10:00 – 14:00)
 * - Sunday: Off-Day
 */
export const getCollegeHoursStatus = (date: Date = new Date()): CollegeHoursStatus => {
  const dayIndex = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const todayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  const currentHour = date.getHours();
  const currentMin = date.getMinutes();
  const nowInMins = currentHour * 60 + currentMin;

  const startMins = 10 * 60; // 10:00 AM -> 600

  // 1. Sunday (Full Off-Day)
  if (dayIndex === 0) {
    return {
      isOpen: false,
      isSunday: true,
      isBeforeStart: false,
      isAfterEnd: false,
      todayName,
      message: 'Sunday is an off-day. Classes resume Monday at 10:00 AM.',
      subMessage: 'Standard active hours: Mon–Fri (10:00 AM – 04:30 PM), Sat (10:00 AM – 02:00 PM).',
      scheduleText: 'Sunday Off-Day',
      closingTimeStr: 'Closed'
    };
  }

  // Saturday vs Weekdays closing time
  const isSaturday = dayIndex === 6;
  const endMins = isSaturday ? 14 * 60 : 16 * 60 + 30; // 14:00 (02:00 PM) or 16:30 (04:30 PM)
  const closingTimeStr = isSaturday ? '02:00 PM' : '04:30 PM';
  const scheduleText = `${todayName}: 10:00 AM – ${closingTimeStr}`;

  // 2. Before 10:00 AM
  if (nowInMins < startMins) {
    const minsUntil = startMins - nowInMins;
    const hours = Math.floor(minsUntil / 60);
    const mins = minsUntil % 60;
    const timeRemainingStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

    return {
      isOpen: false,
      isSunday: false,
      isBeforeStart: true,
      isAfterEnd: false,
      todayName,
      message: `Classes start at 10:00 AM today (${todayName}).`,
      subMessage: `Scheduled active hours: 10:00 AM – ${closingTimeStr} (starts in ${timeRemainingStr}).`,
      scheduleText,
      closingTimeStr,
      timeRemainingStr
    };
  }

  // 3. After closing time
  if (nowInMins >= endMins) {
    return {
      isOpen: false,
      isSunday: false,
      isBeforeStart: false,
      isAfterEnd: true,
      todayName,
      message: 'College hours have ended for today. Thank you for using TRACE.',
      subMessage: `Classes concluded at ${closingTimeStr}. You can still review, mark attendance, or export reports below.`,
      scheduleText,
      closingTimeStr
    };
  }

  // 4. Currently within active hours
  const minsLeft = endMins - nowInMins;
  const hoursLeft = Math.floor(minsLeft / 60);
  const minsRemaining = minsLeft % 60;
  const timeRemainingStr = hoursLeft > 0 ? `${hoursLeft}h ${minsRemaining}m` : `${minsRemaining}m`;

  return {
    isOpen: true,
    isSunday: false,
    isBeforeStart: false,
    isAfterEnd: false,
    todayName,
    message: 'College is currently in session.',
    subMessage: `Active hours: 10:00 AM – ${closingTimeStr} (${timeRemainingStr} remaining).`,
    scheduleText,
    closingTimeStr,
    timeRemainingStr
  };
};
