const BUDAPEST_TIMEZONE = 'Europe/Budapest';

const BUDAPEST_DATE_TIME_FORMATTER = new Intl.DateTimeFormat('hu-HU', {
  timeZone: BUDAPEST_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
});

const BUDAPEST_PARTS_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: BUDAPEST_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
});

function parseBudapestParts(value: Date): { date: string; hour: string; minute: string; year: number; month: number; day: number } {
  const parts = BUDAPEST_PARTS_FORMATTER.formatToParts(value);
  const lookup = new Map(parts.map((part) => [part.type, part.value]));
  const year = Number(lookup.get('year'));
  const month = Number(lookup.get('month'));
  const day = Number(lookup.get('day'));
  const hour = lookup.get('hour') ?? '00';
  const minute = lookup.get('minute') ?? '00';

  return {
    date: `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
    hour,
    minute,
    year,
    month,
    day
  };
}

function parseDateInput(date: string): { year: number; month: number; day: number } {
  const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    throw new Error('Invalid Budapest date format. Expected YYYY-MM-DD.');
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3])
  };
}

export function formatBudapestDateTime(isoString: string | null | undefined): string {
  if (!isoString) {
    return '—';
  }

  const parsed = new Date(isoString);
  if (Number.isNaN(parsed.getTime())) {
    return String(isoString);
  }

  const parts = parseBudapestParts(parsed);
  return `${parts.year.toString().padStart(4, '0')}.${parts.month.toString().padStart(2, '0')}.${parts.day
    .toString()
    .padStart(2, '0')} ${parts.hour}:${parts.minute}`;
}

export function getBudapestDateKey(isoString: string | null | undefined): string | null {
  if (!isoString) return null;
  const parsed = new Date(isoString);
  if (Number.isNaN(parsed.getTime())) return null;
  return parseBudapestParts(parsed).date;
}

export function getBudapestNow(now = new Date()): {
  nowUtc: string;
  nowBudapest: string;
  date: string;
  hour: number;
  minute: number;
} {
  const parts = parseBudapestParts(now);
  return {
    nowUtc: now.toISOString(),
    nowBudapest: formatBudapestDateTime(now.toISOString()),
    date: parts.date,
    hour: Number(parts.hour),
    minute: Number(parts.minute)
  };
}

export function buildUtcIsoFromBudapestParts(date: string, hour: string | number, minute: string | number): string {
  const { year, month, day } = parseDateInput(date);
  const parsedHour = typeof hour === 'string' ? Number(hour) : hour;
  const parsedMinute = typeof minute === 'string' ? Number(minute) : minute;

  if (!Number.isInteger(parsedHour) || parsedHour < 0 || parsedHour > 23) {
    throw new Error('Invalid Budapest hour.');
  }

  if (!Number.isInteger(parsedMinute) || parsedMinute < 0 || parsedMinute > 59) {
    throw new Error('Invalid Budapest minute.');
  }

  const targetNaiveUtc = Date.UTC(year, month - 1, day, parsedHour, parsedMinute, 0, 0);
  let candidateUtc = targetNaiveUtc;

  for (let index = 0; index < 4; index += 1) {
    const budapestCandidate = parseBudapestParts(new Date(candidateUtc));
    const candidateNaiveUtc = Date.UTC(
      budapestCandidate.year,
      budapestCandidate.month - 1,
      budapestCandidate.day,
      Number(budapestCandidate.hour),
      Number(budapestCandidate.minute),
      0,
      0
    );

    const delta = targetNaiveUtc - candidateNaiveUtc;
    if (delta === 0) {
      break;
    }

    candidateUtc += delta;
  }

  const resolved = parseBudapestParts(new Date(candidateUtc));
  if (resolved.date !== date || Number(resolved.hour) !== parsedHour || Number(resolved.minute) !== parsedMinute) {
    throw new Error('Unable to resolve Budapest local time to UTC timestamp.');
  }

  return new Date(candidateUtc).toISOString();
}

export function getBudapestDayRange(date: string): { startUtcIso: string; endUtcIso: string } {
  const { year, month, day } = parseDateInput(date);
  const startUtcIso = buildUtcIsoFromBudapestParts(date, 0, 0);
  const nextDayDate = new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0, 0)).toISOString().slice(0, 10);

  return {
    startUtcIso,
    endUtcIso: buildUtcIsoFromBudapestParts(nextDayDate, 0, 0)
  };
}

export function getBudapestDateTimeParts(isoString: string | null | undefined): { date: string; hour: string; minute: string } {
  if (!isoString) {
    return { date: '', hour: '', minute: '' };
  }

  const parsed = new Date(isoString);
  if (Number.isNaN(parsed.getTime())) {
    return { date: '', hour: '', minute: '' };
  }

  const parts = parseBudapestParts(parsed);
  return {
    date: parts.date,
    hour: parts.hour,
    minute: parts.minute
  };
}

export function parseBudapestDateTimeInput(value: string): string {
  const localMatch = value.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::\d{2})?$/);
  if (localMatch) {
    return buildUtcIsoFromBudapestParts(localMatch[1], localMatch[2], localMatch[3]);
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error('Invalid datetime value.');
  }

  return parsed.toISOString();
}

export { BUDAPEST_TIMEZONE, BUDAPEST_DATE_TIME_FORMATTER };
