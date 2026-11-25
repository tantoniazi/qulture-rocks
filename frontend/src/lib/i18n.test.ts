import { currentLocale, translate, type MessageKey } from "./i18n";

function setBrowserLanguage(language: string) {
  Object.defineProperty(window.navigator, "language", { value: language, configurable: true });
}

afterEach(() => {
  Reflect.deleteProperty(window.navigator, "language");
});

describe("currentLocale", () => {
  it("uses pt-BR for any Portuguese browser language", () => {
    setBrowserLanguage("pt-BR");
    expect(currentLocale()).toBe("pt-BR");

    setBrowserLanguage("pt");
    expect(currentLocale()).toBe("pt-BR");
  });

  it("falls back to English for other languages", () => {
    setBrowserLanguage("fr-FR");
    expect(currentLocale()).toBe("en");
  });
});

describe("translate", () => {
  it("returns the English message for English browsers", () => {
    setBrowserLanguage("en-US");
    expect(translate("validation.passwords_do_not_match")).toBe("Passwords do not match");
  });

  it("returns the Portuguese message for Portuguese browsers", () => {
    setBrowserLanguage("pt-BR");
    expect(translate("validation.passwords_do_not_match")).toBe("As senhas não coincidem");
  });

  it("has a non-empty pt-BR message for every English key", () => {
    setBrowserLanguage("pt-BR");
    const keys = [
      "validation.email_required",
      "validation.password_required",
      "validation.name_required",
      "validation.invalid_email",
      "validation.password_too_short",
      "validation.passwords_do_not_match",
      "validation.reset_token_missing",
      "api.request_failed",
      "api.unexpected_error",
      "api.could_not_reach_server",
    ] satisfies MessageKey[];

    for (const key of keys) {
      expect(translate(key)).not.toBe("");
    }
  });
});
