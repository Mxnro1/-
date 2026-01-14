import React from "react";
import { useI18n } from "../i18n";

type Props = {
  currentDate: Date;
  events: Array<{
    id: string;
    title: string;
    startAt: string;
  }>;
  onSelectEvent: (id: string) => void;
};

export const MonthCalendar: React.FC<Props> = ({
  currentDate,
  events,
  onSelectEvent
}) => {
  const t = useI18n();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const startWeekDay = (firstDayOfMonth.getDay() + 6) % 7; // Пн=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: Array<{
    date: Date | null;
  }> = [];

  for (let i = 0; i < startWeekDay; i++) {
    cells.push({ date: null });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ date: new Date(year, month, day) });
  }

  const eventsByDay = new Map<string, typeof events>();
  events.forEach((e) => {
    const d = new Date(e.startAt);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (!eventsByDay.has(key)) eventsByDay.set(key, []);
    eventsByDay.get(key)!.push(e);
  });

  return (
    <div className="month-calendar">
      <div className="weekdays">
        {t.calendar.weekdaysShort.map((w) => (
          <div key={w} className="weekday">
            {w}
          </div>
        ))}
      </div>
      <div className="grid">
        {cells.map((cell, idx) => {
          if (!cell.date) {
            return <div key={idx} className="cell empty" />;
          }
          const key = `${cell.date.getFullYear()}-${cell.date.getMonth()}-${cell.date.getDate()}`;
          const dayEvents = eventsByDay.get(key) || [];
          return (
            <div key={idx} className="cell">
              <div className="date-number">{cell.date.getDate()}</div>
              <div className="events">
                {dayEvents.map((e) => (
                  <button
                    key={e.id}
                    className="event"
                    onClick={() => onSelectEvent(e.id)}
                  >
                    {e.title}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

