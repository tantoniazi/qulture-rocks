import { API_URL } from "./env";
import { currentLocale, translate } from "./i18n";

export class ApiError extends Error {
  readonly status: number;
  readonly errors: string[];

  constructor(status: number, errors: string[]) {
    super(errors.join(", ") || translate("api.request_failed"));
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  token?: string;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json", "Accept-Language": currentLocale() };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (response.status === 204) return undefined as T;

  const payload = (await response.json().catch(() => ({}))) as T & { errors?: string[] };
  if (!response.ok) throw new ApiError(response.status, payload.errors ?? [translate("api.unexpected_error")]);
  return payload;
}
