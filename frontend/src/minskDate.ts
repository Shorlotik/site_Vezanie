/** Отображение дат заказов в часовом поясе Минска (как на бэкенде в письмах). */
const MINSK = "Europe/Minsk";

const dateOpts: Intl.DateTimeFormatOptions = {
  timeZone: MINSK,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
};

const timeOpts: Intl.DateTimeFormatOptions = {
  timeZone: MINSK,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
};

const dateTimeOpts: Intl.DateTimeFormatOptions = {
  ...dateOpts,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
};

export function formatDateMinsk(iso: string | null): { d: string; t: string } {
  if (!iso) return { d: "—", t: "" };
  const dt = new Date(iso);
  return {
    d: dt.toLocaleDateString("ru-RU", dateOpts),
    t: dt.toLocaleTimeString("ru-RU", timeOpts),
  };
}

export function formatDateTimeMinsk(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("ru-RU", dateTimeOpts);
}
