import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";
import { API_URL } from "../lib/env";

const TOOL_LINKS = [
  { label: "Swagger", path: "/api-docs" },
  { label: "GraphiQL", path: "/graphiql" },
  { label: "Sidekiq", path: "/sidekiq" },
];

export function Layout({ children }: { children: ReactNode }) {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="brand">
          Qulture Organogram
        </Link>
        <nav className="tool-links" aria-label="Developer tools">
          {TOOL_LINKS.map((tool) => (
            <a key={tool.path} href={`${API_URL}${tool.path}`} target="_blank" rel="noreferrer">
              {tool.label}
            </a>
          ))}
        </nav>
        {session && (
          <div className="user-area">
            <span>{session.user.name}</span>
            <button type="button" className="button button-ghost" onClick={handleSignOut}>
              Sign out
            </button>
          </div>
        )}
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
}
