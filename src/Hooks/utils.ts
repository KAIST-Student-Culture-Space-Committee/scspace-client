import { Temporal } from "@js-temporal/polyfill";

const BUSINESS_TIME_ZONE = "Asia/Seoul";

export function getBusinessNow(): number {
  const now = Temporal.Now.zonedDateTimeISO(BUSINESS_TIME_ZONE);
  return (
    (((now.year * 12 + now.month - 1) * 32 + now.day) * 24 + now.hour) * 60 +
    now.minute
  );
}

function createDateUtils() {
  function getTime(
    date:
      | Date
      | {
          year?: number | 0;
          month?: number;
          day?: number;
          hour?: number;
          minute?: number;
        },
  ): number {
    if (date instanceof Date) {
      const year = date.getFullYear();
      const month = date.getMonth() + 12 * year;
      const day = date.getDate() + 32 * month;
      const hour = date.getHours() + day * 24;
      const minute = date.getMinutes() + hour * 60;

      return minute;
    }

    const year = date.year ?? 0;
    const month = date.month ?? 0;
    const day = date.day ?? 0;
    const hour = date.hour ?? 0;
    const minute = date.minute ?? 0;

    return (((year * 12 + month) * 32 + day) * 24 + hour) * 60 + minute;
  }

  function getMidnightTime(time: number) {
    return Math.floor(time / timeUnit.date) * timeUnit.date;
  }

  function addDays(time: number, days: number) {
    const { year, month, date, hour, minute } = getDateUnit(time);
    const next = Temporal.PlainDateTime.from({
      year,
      month: month + 1,
      day: date,
      hour,
      minute,
    }).add({ days });
    return getTime({
      year: next.year,
      month: next.month - 1,
      day: next.day,
      hour: next.hour,
      minute: next.minute,
    });
  }

  function addDateDays(date: Date, days: number) {
    const next = Temporal.PlainDate.from({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
    }).add({ days });
    return new Date(
      next.year,
      next.month - 1,
      next.day,
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      date.getMilliseconds(),
    );
  }

  function getDayOfWeek(date: Date) {
    return (
      Temporal.PlainDate.from({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
      }).dayOfWeek % 7
    );
  }

  function getDateDiffInDays(timeFrom: number, timeTo: number) {
    const from = getDateUnit(timeFrom);
    const to = getDateUnit(timeTo);
    const duration = Temporal.PlainDateTime.from({
      year: from.year,
      month: from.month + 1,
      day: from.date,
      hour: from.hour,
      minute: from.minute,
    }).until(
      Temporal.PlainDateTime.from({
        year: to.year,
        month: to.month + 1,
        day: to.date,
        hour: to.hour,
        minute: to.minute,
      }),
      { largestUnit: "minutes" },
    );
    return duration.minutes / (24 * 60);
  }

  function getDateUnit(time: number) {
    const minute = time % 60;
    time = Math.floor(time / 60);
    const hour = time % 24;
    time = Math.floor(time / 24);
    const date = time % 32;
    time = Math.floor(time / 32);
    const month = time % 12;
    const year = Math.floor(time / 12);

    return { year, month, date, hour, minute };
  }

  function getDateString(time: number) {
    const { year, month, date } = getDateUnit(time);
    return `${year}-${(month + 1).toString().padStart(2, "0")}-${date.toString().padStart(2, "0")}`;
  }

  function getString(time: number) {
    const dateString = getDateString(time);
    const { hour, minute } = getDateUnit(time);
    return `${dateString} ${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
  }

  function getDate(time: number) {
    const { year, month, date, hour, minute } = getDateUnit(time);
    const dateTime = Temporal.PlainDateTime.from({
      year,
      month: month + 1,
      day: date,
      hour,
      minute,
    });
    return new Date(
      dateTime.year,
      dateTime.month - 1,
      dateTime.day,
      dateTime.hour,
      dateTime.minute,
      0,
      0,
    );
  }

  function getDayOfWeekFromTime(time: number) {
    const { year, month, date } = getDateUnit(time);
    return (
      Temporal.PlainDate.from({
        year,
        month: month + 1,
        day: date,
      }).dayOfWeek % 7
    );
  }

  const minute = 1;
  const hour = minute * 60;
  const date = hour * 24;
  const month = date * 32;
  const year = month * 12;

  const timeUnit = {
    minute,
    hour,
    date,
    month,
    year,
  };

  return {
    getTime,
    getNow: getBusinessNow,
    getMidnightTime,
    addDays,
    addDateDays,
    getDayOfWeek,
    getDateDiffInDays,
    getDayOfWeekFromTime,
    getDateUnit,
    getDateString,
    getDate,
    getString,
    timeUnit,
  };
}

const DATE_UTILS = createDateUtils();

export function dateUtils() {
  return DATE_UTILS;
}

export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0;
  }

  const hue = Math.abs(hash) % 360;
  const saturation = 30 + (Math.abs(hash) % 20);
  const lightness = 70 + (Math.abs(hash) % 10);

  const s = saturation / 100;
  const l = lightness / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0,
    g = 0,
    b = 0;
  if (hue < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (hue < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (hue < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (hue < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (hue < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  const toHex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
