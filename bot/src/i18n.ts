export const messages = {
  ru: {
    notificationTitle: "Напоминание о задаче",
    taskNameLabel: "Название задачи",
    dueDateLabel: "Срок выполнения",
    accepted: "Вы отметили задачу как принятую в работу",
    completed: "Задача отмечена как завершённая",
    rescheduled: "Перенос срока будет обработан",
    actionFailed: "Не удалось выполнить действие. Попробуйте позже.",
    openInApp: "Открыть в приложении",
    buttons: {
      accept: "✅ Принял",
      done: "🏁 Завершить",
      reschedule: "⏰ Перенести срок"
    }
  }
};

export type Locale = keyof typeof messages;

export function t(key: keyof typeof messages.ru, locale: Locale = "ru") {
  return messages[locale][key];
}

