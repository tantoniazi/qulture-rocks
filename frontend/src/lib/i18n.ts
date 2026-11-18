// Error messages shown to the user. English is the source; pt-BR must define every key.
const en = {
  "validation.email_required": "Email is required",
  "validation.password_required": "Password is required",
  "validation.name_required": "Name is required",
  "validation.invalid_email": "Enter a valid email",
  "validation.password_too_short": "Password must have at least 8 characters",
  "validation.passwords_do_not_match": "Passwords do not match",
  "validation.reset_token_missing": "Reset link is missing its token",
  "api.request_failed": "Request failed",
  "api.unexpected_error": "Unexpected error",
  "api.could_not_reach_server": "Could not reach the server",
} as const;

export type MessageKey = keyof typeof en;
export type Locale = "en" | "pt-BR";

const messages: Record<Locale, Record<MessageKey, string>> = {
  en,
  "pt-BR": {
    "validation.email_required": "O e-mail é obrigatório",
    "validation.password_required": "A senha é obrigatória",
    "validation.name_required": "O nome é obrigatório",
    "validation.invalid_email": "Informe um e-mail válido",
    "validation.password_too_short": "A senha precisa ter pelo menos 8 caracteres",
    "validation.passwords_do_not_match": "As senhas não coincidem",
    "validation.reset_token_missing": "O link de redefinição não contém o token",
    "api.request_failed": "A requisição falhou",
    "api.unexpected_error": "Erro inesperado",
    "api.could_not_reach_server": "Não foi possível conectar ao servidor",
  },
};

export function currentLocale(): Locale {
  return navigator.language.toLowerCase().startsWith("pt") ? "pt-BR" : "en";
}

export function translate(key: MessageKey): string {
  return messages[currentLocale()][key];
}
