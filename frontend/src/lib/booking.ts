// Online booking window helpers. All booking times are shown and entered in UK time.

const UK_TZ = "Europe/London";

export type BookingState =
  | { kind: "closed"; label: string }
  | { kind: "soon"; label: string }
  | { kind: "upcoming"; label: string; opensAt: Date }
  | { kind: "open"; label: string };

type BookingEvent = {
  isActive: boolean;
  bookingOpensAt?: string | null;
  bookingClosesAt?: string | null;
};

function ukParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: UK_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return { y: get("year"), m: get("month"), d: get("day"), h: get("hour"), min: get("minute") };
}

// "2026-11-08" for the UK calendar day of `date`
function ukDayKey(date: Date): string {
  const p = ukParts(date);
  return `${p.y}-${p.m}-${p.d}`;
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

const formatTime = (d: Date) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: UK_TZ, hour: "numeric", minute: "2-digit", hour12: true }).format(d);

const formatDay = (d: Date, withYear: boolean) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: UK_TZ,
    weekday: "short",
    day: "numeric",
    month: "short",
    ...(withYear && { year: "numeric" }),
  }).format(d);

export function getBookingState(event: BookingEvent, now = new Date()): BookingState {
  const closesAt = event.bookingClosesAt ? new Date(event.bookingClosesAt) : null;
  if (!event.isActive || (closesAt && now >= closesAt)) {
    return { kind: "closed", label: "Booking Closed" };
  }
  if (!event.bookingOpensAt) {
    return { kind: "soon", label: "Tickets available soon" };
  }

  const opensAt = new Date(event.bookingOpensAt);
  if (now >= opensAt) return { kind: "open", label: "On sale" };

  const time = formatTime(opensAt);
  const openDay = ukDayKey(opensAt);
  if (openDay === ukDayKey(now)) {
    return { kind: "upcoming", opensAt, label: `On sale today at ${time}` };
  }
  if (openDay === ukDayKey(addDays(now, 1))) {
    return { kind: "upcoming", opensAt, label: `On sale from tomorrow, ${formatDay(opensAt, false)} · ${time}` };
  }
  const sameYear = ukParts(opensAt).y === ukParts(now).y;
  return { kind: "upcoming", opensAt, label: `On sale from ${formatDay(opensAt, !sameYear)} · ${time}` };
}

// ISO string -> "YYYY-MM-DDTHH:mm" in UK time, for <input type="datetime-local">
export function isoToUkInput(iso?: string | null): string {
  if (!iso) return "";
  const p = ukParts(new Date(iso));
  return `${p.y}-${p.m}-${p.d}T${p.h}:${p.min}`;
}

// "YYYY-MM-DDTHH:mm" typed as UK time -> ISO string (handles GMT/BST)
export function ukInputToIso(value: string): string | null {
  if (!value) return null;
  const [datePart, timePart = "00:00"] = value.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  const [h, min] = timePart.split(":").map(Number);
  const wallAsUtc = Date.UTC(y, m - 1, d, h, min);
  // Offset of UK time from UTC at that moment (0 in winter, 1h in summer)
  const offsetAt = (ms: number) => {
    const p = ukParts(new Date(ms));
    return Date.UTC(+p.y, +p.m - 1, +p.d, +p.h, +p.min) - ms;
  };
  let utc = wallAsUtc - offsetAt(wallAsUtc);
  utc = wallAsUtc - offsetAt(utc);
  return new Date(utc).toISOString();
}
