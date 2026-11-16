import { defineConfig, devices } from "@playwright/test";

// The stack must already be running (`make up`). Base URLs can be overridden for other hosts.
const frontendUrl = process.env.E2E_BASE_URL ?? "http://localhost:5173";
const apiUrl = process.env.E2E_API_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  outputDir: "test-results",
  use: {
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "api",
      testDir: "./tests/api",
      use: { baseURL: apiUrl },
    },
    {
      name: "ui",
      testDir: "./tests/ui",
      use: { ...devices["Desktop Chrome"], baseURL: frontendUrl },
    },
  ],
});
