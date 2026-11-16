// Unique, readable test data so runs never collide with each other or with seeded data.
let counter = 0;

export function uniqueSuffix(): string {
  counter += 1;
  return `${Date.now().toString(36)}${counter}${Math.random().toString(36).slice(2, 6)}`;
}

export function newUser() {
  const suffix = uniqueSuffix();
  return {
    name: `Tester ${suffix}`,
    email: `tester.${suffix}@example.com`,
    password: "password123",
  };
}

export function newCompanyName(): string {
  return `E2E Company ${uniqueSuffix()}`;
}

export function newPerson(label: string) {
  const suffix = uniqueSuffix();
  return { name: `${label} ${suffix}`, email: `${label.toLowerCase()}.${suffix}@example.com` };
}
