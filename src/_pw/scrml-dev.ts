// Shared Playwright helper — boots `scrml dev` for one playground app.
//
// Each playground owns a distinct port (p0=3050 … p10=3060, plus bridge
// ports for the LSP playgrounds), so booting per-spec is parallel-safe: two
// spec files never contend for the same port. This replaces the hand-rolled
// `spawn` + fixed-timeout readiness that lived in every puppeteer `test.js`.
//
// Usage in a spec:
//   import { bootScrmlDev, killScrmlDev } from "../_pw/scrml-dev";
//   let dev: ChildProcess | undefined;
//   test.beforeAll(async () => { dev = await bootScrmlDev(APP, PORT); });
//   test.afterAll(() => killScrmlDev(dev));

import { spawn, type ChildProcess } from "child_process";

// Resolve when scrml dev reports it's serving (or after a hard cap, matching
// the puppeteer harness's 8s fallback — the caller adds a settle wait + a
// waitForFunction on real DOM, so a slightly-early resolve is harmless).
export function bootScrmlDev(appPath: string, port: number): Promise<ChildProcess> {
  return new Promise((resolve, reject) => {
    const proc = spawn("scrml", ["dev", appPath, "--port", String(port)], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    let resolved = false;
    const onData = (b: Buffer) => {
      if (resolved) return;
      const s = String(b);
      if (s.includes("Serving") || s.includes(String(port))) {
        resolved = true;
        resolve(proc);
      }
    };
    proc.stdout.on("data", onData);
    proc.stderr.on("data", onData);
    proc.on("error", reject);
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(proc);
      }
    }, 8000);
  });
}

export function killScrmlDev(proc: ChildProcess | undefined): void {
  if (proc) {
    try {
      proc.kill();
    } catch {
      /* already gone */
    }
  }
}
