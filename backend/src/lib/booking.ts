// Online booking window for an event. In-person sales (sales executives) are not limited by this.

type BookingFields = {
  isActive: boolean;
  bookingOpensAt: Date | null;
  bookingClosesAt: Date | null;
};

function formatUk(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

// Returns why online booking is not allowed right now, or null when it is open.
export function bookingBlockReason(event: BookingFields, now = new Date()): string | null {
  if (!event.isActive) return 'Booking is closed for this event.';
  if (!event.bookingOpensAt) return 'Tickets for this event will be available soon.';
  if (now < event.bookingOpensAt) return `Tickets go on sale on ${formatUk(event.bookingOpensAt)} (UK time).`;
  if (event.bookingClosesAt && now >= event.bookingClosesAt) return 'Booking is closed for this event.';
  return null;
}

// Reads an optional date from a request body.
// undefined = not sent, null = cleared, Date = set. Throws on an invalid date.
export function parseOptionalDate(value: unknown): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  const d = new Date(String(value));
  if (isNaN(d.getTime())) throw new Error('INVALID_DATE');
  return d;
}
