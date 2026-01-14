// Простая i18n-структура для сообщений API.
// Сейчас используется только ru, но структура готова к добавлению en и др. языков.

type Locale = "ru" | "en";

type Messages = {
  errors: {
    unauthorized: string;
    forbidden: string;
    invalidSignature: string;
    invalidInput: string;
    notFound: string;
  };
  auth: {
    telegramLoginSuccess: string;
    emailVerificationRequired: string;
    emailVerificationSent: string;
    emailVerified: string;
  };
  invites: {
    inviteSent: string;
    inviteInvalid: string;
    inviteAccepted: string;
  };
};

const ru: Messages = {
  errors: {
    unauthorized: "Требуется аутентификация",
    forbidden: "Недостаточно прав для выполнения действия",
    invalidSignature: "Некорректная подпись Telegram",
    invalidInput: "Некорректные данные запроса",
    notFound: "Ресурс не найден",
  },
  auth: {
    telegramLoginSuccess: "Успешный вход через Telegram",
    emailVerificationRequired: "Необходимо подтвердить email для доступа к компании",
    emailVerificationSent: "Код подтверждения email отправлен",
    emailVerified: "Email успешно подтверждён",
  },
  invites: {
    inviteSent: "Приглашение отправлено",
    inviteInvalid: "Приглашение недействительно или истекло",
    inviteAccepted: "Приглашение принято, доступ к компании предоставлен",
  },
};

const en: Messages = {
  // TODO: заполнить при добавлении en-US
  ...ru,
};

const dictionaries: Record<Locale, Messages> = {
  ru,
  en,
};

const DEFAULT_LOCALE: Locale = "ru";

export function t() {
  // На данном этапе жёстко используем ru.
  // В будущем можно читать локаль из пользователя/заголовков.
  const locale: Locale = DEFAULT_LOCALE;
  return dictionaries[locale];
}

