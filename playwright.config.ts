import { defineConfig } from "@playwright/test";

// 6nz playground smokes — Playwright runner.
//
// Each spec lives beside its playground (`src/playground-*/app.pw.ts`) and
// boots its own `scrml dev` in beforeAll on the playground's dedicated port,
// so specs are parallel-safe by construction (no shared server, no port
// contention). That's why there is no top-level `webServer` block here.
//
// `scrml` must be on PATH (bun global: ~/.bun/bin/scrml). Run: `npm test`
// or `npx playwright test src/playground-nine` for a single playground.
export default defineConfig({
  testDir: "src",
  testMatch: "**/*.pw.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  // Each spec spawns a scrml dev + a browser; cap concurrency so `npm test`
  // doesn't launch 11 dev servers + 11 browsers at once on a dev box.
  workers: process.env.CI ? 2 : 3,
  timeout: 60_000,
  reporter: [["list"]],
  use: {
    browserName: "chromium",
    headless: true,
    launchOptions: { args: ["--no-sandbox"] },
    trace: "retain-on-failure",
  },
});
