// Reads the emails captured by MailHog, the local SMTP server the backend sends through.
const MAILHOG_URL = process.env.E2E_MAILHOG_URL ?? "http://localhost:8025";

interface CapturedMessage {
  Content: {
    Headers: Record<string, string[]>;
    Body: string;
  };
}

export async function waitForEmail(to: string, subject: string, timeoutMs = 15_000): Promise<string> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const match = await findEmail(to, subject);
    if (match) return match;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`No email "${subject}" was captured for ${to}`);
}

async function findEmail(to: string, subject: string): Promise<string | null> {
  const response = await fetch(`${MAILHOG_URL}/api/v2/messages`);
  const { items } = (await response.json()) as { items: CapturedMessage[] };
  const match = items.find(
    (message) =>
      message.Content.Headers.To?.includes(to) &&
      message.Content.Headers.Subject?.some((line) => line.includes(subject)),
  );
  return match ? decodeQuotedPrintable(match.Content.Body) : null;
}

// Restores the text of a quoted-printable body, so URLs are not split or escaped.
function decodeQuotedPrintable(body: string): string {
  return body.replace(/=\r?\n/g, "").replace(/=3D/g, "=");
}

export function extractResetToken(body: string): string {
  const match = /reset-password\?token=([A-Za-z0-9_-]+)/.exec(body);
  if (!match) throw new Error("The reset email does not contain a reset link");
  return match[1];
}
