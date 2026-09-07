// All helpers here work in Asia/Seoul (KST, UTC+9), matching the date rule
// in contracts/pds-schema-v2.json.

export function todayKST(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function formatDateKST(dateStr: string): string {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${y}.${m}.${d}`;
}

export function formatDateTimeKST(iso: string): string {
  const parts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}.${get("month")}.${get("day")} ${get("hour")}:${get("minute")}`;
}

// Converts a <input type="datetime-local"> value ("YYYY-MM-DDTHH:mm"),
// interpreted as Asia/Seoul wall-clock time, into a UTC ISO instant.
export function kstLocalToInstant(localValue: string): string {
  return new Date(`${localValue}:00+09:00`).toISOString();
}

// Converts a UTC ISO instant into a <input type="datetime-local"> value
// ("YYYY-MM-DDTHH:mm") in Asia/Seoul wall-clock time.
export function instantToKstLocal(iso: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

export function minutesBetween(startIso: string, endIso: string): number {
  const diff = (new Date(endIso).getTime() - new Date(startIso).getTime()) / 60000;
  return Math.max(0, Math.round(diff));
}

export function isPastKST(dateStr: string): boolean {
  return dateStr < todayKST();
}
