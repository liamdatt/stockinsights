import { addDays, format, isValid, parse } from 'date-fns'

const DATE_KEY_FORMAT = 'yyyy-MM-dd'
const DATE_KEY_REGEX = /^\d{4}-\d{2}-\d{2}$/

export type DateRange = {
  start: Date
  end: Date
}

function parseDateKeyLocal(dateKey: string): Date | null {
  if (!DATE_KEY_REGEX.test(dateKey)) {
    return null
  }

  const parsed = parse(dateKey, DATE_KEY_FORMAT, new Date())
  if (!isValid(parsed)) {
    return null
  }

  if (format(parsed, DATE_KEY_FORMAT) !== dateKey) {
    return null
  }

  return parsed
}

export function isValidDateKey(dateKey: string): boolean {
  return parseDateKeyLocal(dateKey) !== null
}

export function getDateRangeForDateKey(dateKey: string): DateRange | null {
  const parsed = parseDateKeyLocal(dateKey)
  if (!parsed) {
    return null
  }

  const [year, month, day] = dateKey.split('-').map(Number)
  const start = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
  const end = addDays(start, 1)

  return { start, end }
}

export function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function formatDateKey(dateKey: string, pattern: string): string {
  const parsed = parseDateKeyLocal(dateKey)
  if (!parsed) {
    return dateKey
  }

  return format(parsed, pattern)
}
