import React from "react";
import { useI18n } from "../i18n";

type Task = {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  status: string;
};

type Props = {
  today: Task[];
  tomorrow: Task[];
  overdue: Task[];
  inProgress: Task[];
  onSelectTask: (id: string) => void;
};

export const TaskList: React.FC<Props> = ({
  today,
  tomorrow,
  overdue,
  inProgress,
  onSelectTask
}) => {
  const t = useI18n();

  const renderSection = (title: string, tasks: Task[]) => (
    <section className="task-section">
      <h3>{title}</h3>
      {tasks.length === 0 ? (
        <div className="empty">—</div>
      ) : (
        <ul>
          {tasks.map((task) => (
            <li key={task.id}>
              <button onClick={() => onSelectTask(task.id)}>{task.title}</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );

  return (
    <div className="task-list">
      {renderSection(t.sections.today, today)}
      {renderSection(t.sections.tomorrow, tomorrow)}
      {renderSection(t.sections.overdue, overdue)}
      {renderSection(t.sections.inProgress, inProgress)}
    </div>
  );
};

