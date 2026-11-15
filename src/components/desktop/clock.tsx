"use client";

import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, 5_000);
  return () => window.clearInterval(id);
}

function format(date: Date) {
  const day = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return { iso: date.toISOString(), day: day.replace(",", ""), time };
}

// Snapshot is a minute-resolution string so React only re-renders when the display changes.
const getSnapshot = () => new Date().toISOString().slice(0, 16);
const getServerSnapshot = () => null;

/** Live menu-bar clock in the macOS "Mon Jun 10  9:41 AM" format. Renders client-side only. */
export function Clock() {
  const minute = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!minute) {
    return <span className="inline-block w-[118px]" aria-hidden="true" />;
  }

  const { iso, day, time } = format(new Date());
  return (
    <time dateTime={iso} className="whitespace-pre tabular-nums">
      <span className="max-sm:hidden">{day}  </span>
      {time}
    </time>
  );
}
