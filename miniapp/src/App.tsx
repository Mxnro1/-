import React, { useEffect, useMemo, useState } from "react";
import { apiClient } from "./api/client";
import { useAuthStore } from "./state/authStore";
import { useI18n } from "./i18n";
import { MonthCalendar } from "./components/MonthCalendar";
import { TaskList } from "./components/TaskList";
import { TaskDetails } from "./components/TaskDetails";

declare global {
  interface Window {
    Telegram: any;
  }
}

type Event = {
  id: string;
  title: string;
  description?: string | null;
  startAt: string;
  endAt: string;
  allDay: boolean;
  status: string;
};

export const App: React.FC = () => {
  const t = useI18n();
  const { setAuth, user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);

  useEffect(() => {
    const init = async () => {
      try {
        const tg = window.Telegram?.WebApp;
        if (!tg) {
          setLoading(false);
          return;
        }
        tg.ready();

        const initData = tg.initData;
        if (!initData) {
          setLoading(false);
          return;
        }

        const resp = await apiClient.post("/auth/telegram-login", {
          initData
        });

        setAuth(resp.data.token, {
          id: resp.data.user.id,
          name: resp.data.user.name,
          telegramId: resp.data.user.telegramId,
          emailVerified: resp.data.user.emailVerified
        });

        // TODO: выбор компании и календаря (через отдельные запросы/экран)

        setLoading(false);
      } catch (e) {
        console.error("Auth failed", e);
        setLoading(false);
      }
    };

    void init();
  }, [setAuth]);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const today = new Date();
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        // TODO: подставлять выбранный календарь и компанию
        const resp = await apiClient.get("/events", {
          params: {
            calendarId: "default", // placeholder
            from: monthStart.toISOString(),
            to: monthEnd.toISOString()
          }
        });
        setEvents(resp.data.items);
      } catch (e) {
        console.error("Failed to load events", e);
      }
    };

    if (user) {
      void loadEvents();
    }
  }, [user]);

  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId) || null,
    [events, selectedEventId]
  );

  useEffect(() => {
    const loadComments = async () => {
      if (!selectedEventId) return;
      try {
        const resp = await apiClient.get("/comments", {
          params: { eventId: selectedEventId }
        });
        setComments(resp.data.items);
      } catch (e) {
        console.error("Failed to load comments", e);
      }
    };

    void loadComments();
  }, [selectedEventId]);

  const today = new Date();
  const tasksToday: Event[] = [];
  const tasksTomorrow: Event[] = [];
  const tasksOverdue: Event[] = [];
  const tasksInProgress: Event[] = [];

  events.forEach((e) => {
    const start = new Date(e.startAt);
    const isToday =
      start.toDateString() === today.toDateString();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const isTomorrow = start.toDateString() === tomorrow.toDateString();

    if (e.status === "IN_PROGRESS") {
      tasksInProgress.push(e);
    }
    if (isToday) {
      tasksToday.push(e);
    } else if (isTomorrow) {
      tasksTomorrow.push(e);
    } else if (start < today) {
      tasksOverdue.push(e);
    }
  });

  const handleAddComment = async (text: string) => {
    if (!selectedEvent) return;
    await apiClient.post("/comments", {
      eventId: selectedEvent.id,
      text
    });
    const resp = await apiClient.get("/comments", {
      params: { eventId: selectedEvent.id }
    });
    setComments(resp.data.items);
  };

  if (loading) {
    return <div>{t.loading}</div>;
  }

  if (!user) {
    return <div>{t.errors.unauthorized}</div>;
  }

  return (
    <div className="app">
      <header>
        <h1>{t.appTitle}</h1>
      </header>

      <main>
        <MonthCalendar
          currentDate={today}
          events={events}
          onSelectEvent={setSelectedEventId}
        />

        <TaskList
          today={tasksToday}
          tomorrow={tasksTomorrow}
          overdue={tasksOverdue}
          inProgress={tasksInProgress}
          onSelectTask={setSelectedEventId}
        />

        <TaskDetails
          task={
            selectedEvent
              ? {
                  id: selectedEvent.id,
                  title: selectedEvent.title,
                  description: selectedEvent.description,
                  status: selectedEvent.status,
                  allDay: selectedEvent.allDay,
                  startAt: selectedEvent.startAt,
                  endAt: selectedEvent.endAt,
                  readOnly: false // TODO: вычислять по правам
                }
              : null
          }
          comments={comments}
          onAddComment={handleAddComment}
        />
      </main>
    </div>
  );
};

