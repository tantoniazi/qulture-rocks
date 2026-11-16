import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AuthContext, type AuthContextValue } from "./AuthContext";
import { SignupPage } from "./SignupPage";

function renderSignup() {
  const value: AuthContextValue = {
    session: null,
    signIn: vi.fn(),
    signUp: vi.fn().mockResolvedValue(undefined),
    signOut: vi.fn(),
  };

  render(
    <AuthContext.Provider value={value}>
      <MemoryRouter initialEntries={["/signup"]}>
        <SignupPage />
      </MemoryRouter>
    </AuthContext.Provider>,
  );

  return value;
}

describe("SignupPage", () => {
  it("blocks submission when passwords differ", async () => {
    const auth = renderSignup();

    await userEvent.type(screen.getByLabelText("Name"), "Ana");
    await userEvent.type(screen.getByLabelText("Email"), "ana@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "password123");
    await userEvent.type(screen.getByLabelText("Confirm password"), "password999");
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(screen.getByRole("alert")).toHaveTextContent("Passwords do not match");
    expect(auth.signUp).not.toHaveBeenCalled();
  });

  it("creates the account with valid data", async () => {
    const auth = renderSignup();

    await userEvent.type(screen.getByLabelText("Name"), "Ana");
    await userEvent.type(screen.getByLabelText("Email"), "ana@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "password123");
    await userEvent.type(screen.getByLabelText("Confirm password"), "password123");
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(auth.signUp).toHaveBeenCalledWith({
      name: "Ana",
      email: "ana@example.com",
      password: "password123",
      passwordConfirmation: "password123",
    });
  });
});
