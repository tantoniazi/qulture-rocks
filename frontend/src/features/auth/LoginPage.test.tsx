import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AuthContext, type AuthContextValue } from "./AuthContext";
import { LoginPage } from "./LoginPage";

function renderLogin(overrides: Partial<AuthContextValue> = {}) {
  const value: AuthContextValue = {
    session: null,
    signIn: vi.fn().mockResolvedValue(undefined),
    signUp: vi.fn(),
    signOut: vi.fn(),
    ...overrides,
  };

  render(
    <AuthContext.Provider value={value}>
      <MemoryRouter initialEntries={["/login"]}>
        <LoginPage />
      </MemoryRouter>
    </AuthContext.Provider>,
  );

  return value;
}

describe("LoginPage", () => {
  it("shows validation errors and does not call the API when fields are empty", async () => {
    const auth = renderLogin();

    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(screen.getByRole("alert")).toHaveTextContent("Email is required");
    expect(auth.signIn).not.toHaveBeenCalled();
  });

  it("submits the credentials", async () => {
    const auth = renderLogin();

    await userEvent.type(screen.getByLabelText(/email/i), "ana@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "password123");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(auth.signIn).toHaveBeenCalledWith("ana@example.com", "password123"));
  });

  it("links to the signup page", () => {
    renderLogin();

    expect(screen.getByRole("link", { name: /create an account/i })).toHaveAttribute("href", "/signup");
  });
});
