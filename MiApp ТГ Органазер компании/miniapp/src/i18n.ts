export type Locale = "ru" | "en";

const ru = {
  appTitle: "Органайзер компании",
  loading: "Загрузка...",
  sections: {
    today: "Сегодня",
    tomorrow: "Завтра",
    overdue: "Просроченные",
    inProgress: "В работе"
  },
  calendar: {
    monthViewTitle: "Календарь",
    weekdaysShort: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]
  },
  task: {
    title: "Название задачи",
    description: "Описание",
    status: "Статус",
    comments: "Комментарии",
    addCommentPlaceholder: "Оставьте комментарий...",
    addCommentButton: "Добавить комментарий",
    readOnlyHint: "Просмотр только для чтения",
    allDay: "Весь день",
    startAt: "Начало",
    endAt: "Окончание"
  },
  errors: {
    failedToLoad: "Не удалось загрузить данные",
    unauthorized: "Требуется вход через Telegram"
  }
};

const en: typeof ru = {
  // TODO: заполнить при добавлении en-US
  ...ru
};

const dictionaries: Record<Locale, typeof ru> = {
  ru,
  en
};

const DEFAULT_LOCALE: Locale = "ru";

export function useI18n() {
  const locale: Locale = DEFAULT_LOCALE;
  return dictionaries[locale];
}

