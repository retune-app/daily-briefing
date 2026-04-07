import type { CalendarResponse } from "../types.js";

export function getCalendarToday(timezone: string = "America/New_York"): CalendarResponse {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "long",
  });

  const parts = formatter.formatToParts(now);
  const year = parts.find(p => p.type === "year")?.value || "";
  const month = parts.find(p => p.type === "month")?.value || "";
  const day = parts.find(p => p.type === "day")?.value || "";
  const weekday = parts.find(p => p.type === "weekday")?.value || "";

  const dateStr = `${year}-${month}-${day}`;

  return {
    date: dateStr,
    dayOfWeek: weekday,
    events: [],
    summary: `Today is ${weekday}, ${dateStr}. No calendar integration configured — connect Google Calendar or Apple Calendar in Poke Kitchen to see your events here.`,
  };
}

export function formatCalendarResponse(cal: CalendarResponse): string {
  const lines = [
    `Calendar for ${cal.dayOfWeek}, ${cal.date}`,
    ``,
  ];

  if (cal.events.length === 0) {
    lines.push(cal.summary);
  } else {
    for (const event of cal.events) {
      lines.push(`- ${event.time}: ${event.title} (${event.duration})`);
      if (event.notes) lines.push(`  ${event.notes}`);
    }
    lines.push(``);
    lines.push(cal.summary);
  }

  return lines.join("\n");
}
