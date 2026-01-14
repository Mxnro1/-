import React, { useState } from "react";
import { useI18n } from "../i18n";

type Comment = {
  id: string;
  userName?: string;
  text: string;
  createdAt: string;
};

type TaskDetailsProps = {
  task:
    | {
        id: string;
        title: string;
        description?: string | null;
        status: string;
        allDay: boolean;
        startAt: string;
        endAt: string;
        readOnly: boolean;
      }
    | null;
  comments: Comment[];
  onAddComment: (text: string) => Promise<void>;
};

export const TaskDetails: React.FC<TaskDetailsProps> = ({
  task,
  comments,
  onAddComment
}) => {
  const t = useI18n();
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);

  if (!task) {
    return null;
  }

  const handleSubmit = async () => {
    if (!commentText.trim()) return;
    setLoading(true);
    try {
      await onAddComment(commentText.trim());
      setCommentText("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="task-details">
      <h2>{task.title}</h2>
      {task.description && <p>{task.description}</p>}

      <div className="meta">
        <div>
          <strong>{t.task.status}:</strong> {task.status}
        </div>
        <div>
          <strong>{t.task.allDay}:</strong> {task.allDay ? "Да" : "Нет"}
        </div>
        <div>
          <strong>{t.task.startAt}:</strong>{" "}
          {new Date(task.startAt).toLocaleString("ru-RU")}
        </div>
        <div>
          <strong>{t.task.endAt}:</strong>{" "}
          {new Date(task.endAt).toLocaleString("ru-RU")}
        </div>
      </div>

      {task.readOnly && (
        <div className="readonly-hint">{t.task.readOnlyHint}</div>
      )}

      <section className="comments">
        <h3>{t.task.comments}</h3>
        {comments.length === 0 ? (
          <div className="empty">—</div>
        ) : (
          <ul>
            {comments.map((c) => (
              <li key={c.id}>
                <div className="comment-header">
                  {c.userName && <strong>{c.userName}</strong>}{" "}
                  <span>
                    {new Date(c.createdAt).toLocaleString("ru-RU", {
                      dateStyle: "short",
                      timeStyle: "short"
                    })}
                  </span>
                </div>
                <div>{c.text}</div>
              </li>
            ))}
          </ul>
        )}

        {!task.readOnly && (
          <div className="add-comment">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={t.task.addCommentPlaceholder}
            />
            <button onClick={handleSubmit} disabled={loading}>
              {t.task.addCommentButton}
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

