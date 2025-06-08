import { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = {
  "en-US": require("date-fns/locale/en-US"),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface ScheduleEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  chapterId: string;
}

interface ScheduleProps {
  classroomId: string;
}

export function Schedule({ classroomId }: ScheduleProps) {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await fetch(`/api/planner/schedule?classroomId=${classroomId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch schedule");
        }
        const data = await response.json();
        setEvents(
          data.map((event: any) => ({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end),
          }))
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedule();
  }, [classroomId]);

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading schedule...</div>;
  }

  if (error) {
    return <div className="text-destructive p-8">{error}</div>;
  }

  return (
    <div className="h-[600px]">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%" }}
        className="rounded-lg border bg-card"
        eventPropGetter={(event) => ({
          className: "bg-primary hover:bg-primary/90",
        })}
        dayPropGetter={(date) => ({
          className: date.toDateString() === new Date().toDateString()
            ? "bg-primary/10"
            : "",
        })}
      />
    </div>
  );
} 