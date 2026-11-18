import { validateForgotPassword, validateLogin, validateNewPassword, validateSignup } from "./validation";

describe("validateForgotPassword", () => {
  it("requires an email", () => {
    expect(validateForgotPassword("  ")).toEqual(["Email is required"]);
    expect(validateForgotPassword("ana@example.com")).toEqual([]);
  });
});

describe("validateNewPassword", () => {
  it("requires at least 8 characters and a matching confirmation", () => {
    expect(validateNewPassword("short", "short")).toEqual(["Password must have at least 8 characters"]);
    expect(validateNewPassword("password123", "password124")).toEqual(["Passwords do not match"]);
    expect(validateNewPassword("password123", "password123")).toEqual([]);
  });
});

describe("validateLogin", () => {
  it("requires email and password", () => {
    expect(validateLogin("", "")).toEqual(["Email is required", "Password is required"]);
  });

  it("accepts filled credentials", () => {
    expect(validateLogin("ana@example.com", "secret")).toEqual([]);
  });
});

describe("validateSignup", () => {
  const valid = { name: "Ana", email: "ana@example.com", password: "password123", passwordConfirmation: "password123" };

  it("accepts a valid input", () => {
    expect(validateSignup(valid)).toEqual([]);
  });

  it("reports every problem at once", () => {
    const errors = validateSignup({ name: " ", email: "nope", password: "short", passwordConfirmation: "other" });

    expect(errors).toEqual([
      "Name is required",
      "Enter a valid email",
      "Password must have at least 8 characters",
      "Passwords do not match",
    ]);
  });
});
