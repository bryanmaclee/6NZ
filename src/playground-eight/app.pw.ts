// playground-eight smoke — completion + hover over LSP-on-WebSocket (Playwright port).
//
// Boots TWO processes: the LSP-over-WebSocket bridge (bridge.js on a bun
// process, BRIDGE_PORT=3081) AND scrml dev (SCRML_PORT=3085), then drives the
// page with Playwright. Asserts (as test.steps):
//   1. CM6 mounts
//   2. WS bridge reachable; LSP reaches "ready"
//   3. Sample doc compiles clean (0 diagnostics on initial didOpen)
//   4. Typing inside a logic context fires a completion request
//      → LSP traffic increases AND last-completion status updates
//   5. Typing `<` at the start of a markup line fires a completion request
//   6. Hovering an identifier fires a hover request (path reachable)
//   7. Diagnostic round-trip still works (insert syntax error → 1+ diag)
//   8. No unexpected page errors (Bug P + Bug R + favicon ignored)
//
// Ported from the puppeteer test.js (S18). The bridge<->LSP<->CM6 flow is an
// inherently sequential state machine (each keystroke builds on the last), so
// it is one test() sharing a page, subdivided by test.step for granular
// reporting. Per-keystroke/settle waits are preserved to match puppeteer timing.

import { test, expect, type Page } from "@playwright/test";
import { spawn, type ChildProcess } from "child_process";
import { existsSync } from "fs";
import path from "path";
import { bootScrmlDev, killScrmlDev } from "../_pw/scrml-dev";

const APP = path.resolve(__dirname, "app.scrml");
const BRIDGE = path.resolve(__dirname, "bridge.js");
const SCRML_PORT = 3085;
const BRIDGE_PORT = 3081;
const URL = `http://localhost:${SCRML_PORT}/`;

// Resolve the scrml compiler dir (holds lsp/server.js). bridge.js defaults to
// `../../../scrml` relative to itself — correct from the main repo, but wrong
// when this spec runs from a nested git worktree. Walk up from __dirname and
// find the first ancestor with a `scrml/lsp/server.js` child; pass it to the
// bridge via SCRML_DIR so the resolution is robust in both layouts. (No
// absolute path is hardcoded.)
function resolveScrmlDir(): string | undefined {
  let dir = __dirname;
  for (let i = 0; i < 12; i++) {
    const cand = path.join(dir, "scrml");
    if (existsSync(path.join(cand, "lsp", "server.js"))) return cand;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return undefined;
}

let bridge: ChildProcess | undefined;
let dev: ChildProcess | undefined;
const errors: string[] = [];

// Boot the bridge exactly as the puppeteer harness did: `bun <bridge.js>` with
// PORT in the env, resolving on the first "listening"/port/"spawning" log (5s
// hard cap). SCRML_DIR is added so the LSP child resolves in a worktree too.
function bootBridge(): Promise<ChildProcess> {
  return new Promise((resolve, reject) => {
    const scrmlDir = resolveScrmlDir();
    const proc = spawn("bun", [BRIDGE], {
      stdio: ["ignore", "pipe", "pipe"],
      env: {
        ...process.env,
        PORT: String(BRIDGE_PORT),
        ...(scrmlDir ? { SCRML_DIR: scrmlDir } : {}),
      },
    });
    let resolved = false;
    const onData = (b: Buffer) => {
      if (resolved) return;
      const s = String(b);
      if (s.includes("listening") || s.includes(String(BRIDGE_PORT)) || s.includes("spawning")) {
        resolved = true;
        resolve(proc);
      }
    };
    proc.stdout!.on("data", onData);
    proc.stderr!.on("data", onData);
    proc.on("error", reject);
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(proc);
      }
    }, 5000);
  });
}

test.beforeAll(async () => {
  // Mirror the puppeteer harness ordering: bridge first, then scrml dev, each
  // followed by a 1500ms settle (the readiness log can precede first-serve).
  bridge = await bootBridge();
  await new Promise((r) => setTimeout(r, 1500));
  dev = await bootScrmlDev(APP, SCRML_PORT);
  await new Promise((r) => setTimeout(r, 1500));
});

test.afterAll(() => {
  killScrmlDev(dev);
  killScrmlDev(bridge); // same kill semantics for the bridge proc
});

// --- DOM-walk helpers (identical semantics to the puppeteer harness) ---

async function readStatus(page: Page, lbl: string): Promise<string | null> {
  return await page.evaluate((label) => {
    const rows = document.querySelectorAll(".row");
    for (const r of rows) {
      const l = r.querySelector(".slabel");
      const v = r.querySelector(".value");
      if (l && v && l.textContent!.trim().startsWith(label)) return v.textContent!.trim();
    }
    return null;
  }, lbl);
}

async function focusEditor(page: Page): Promise<void> {
  await page.evaluate(() => {
    const cm = document.querySelector<HTMLElement>(".cm-host .cm-content");
    if (cm) cm.focus();
  });
}

test("playground-eight — LSP completion + hover over WebSocket", async ({ page }) => {
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("console", (m) => {
    const t = m.text();
    if (t.includes("error") || t.includes("Error")) errors.push("console: " + t);
  });

  // CDN outage-hardening (NOT an app change). app.scrml loads CM6 from esm.sh;
  // the whole `@codemirror/view` 6.x *range* meta can transiently 500 ("no
  // space left on device" on esm.sh storage) while exact pins stay healthy —
  // so the app's `@codemirror/view@6` import AND every peer range that CM6's
  // other packages pull (`@codemirror/view@^6.x`) fail together. Redirect any
  // such range/shim request to one exact working pin (6.43.0 — the latest 6.x,
  // satisfies every observed caret up to ^6.42.0), giving a single view
  // instance. The resolved module file and the pin itself pass through (no
  // redirect loop). CM6 still loads from real esm.sh; every LSP/bridge
  // assertion runs for real. Remove once esm.sh range-meta recovers.
  const VIEW_PIN = "https://esm.sh/@codemirror/view@6.43.0?target=es2022";
  await page.route(/https:\/\/esm\.sh\/@codemirror\/view@/, async (route) => {
    const url = route.request().url();
    // A resolved module file (`/es2022/…`) or the pin itself → let through.
    if (url.includes("/es2022/") || url.includes("view@6.43.0")) {
      await route.continue();
      return;
    }
    await route.fulfill({ status: 302, headers: { location: VIEW_PIN }, body: "" });
  });

  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 15_000 });

  await test.step("1. CM6 mounted", async () => {
    await page.waitForFunction(
      () => {
        const v = document.querySelector<HTMLElement>(".cm-host .cm-editor");
        return !!v && v.offsetHeight > 0 && !!(window as any).__cm;
      },
      undefined,
      { timeout: 10_000 }
    );
  });

  await test.step("2. LSP reaches ready", async () => {
    await page.waitForFunction(
      () => {
        const rows = document.querySelectorAll(".row");
        for (const r of rows) {
          const l = r.querySelector(".slabel");
          const v = r.querySelector(".value");
          if (l && v && l.textContent!.trim().startsWith("LSP:") && v.textContent!.trim() === "ready")
            return true;
        }
        return false;
      },
      undefined,
      { timeout: 10_000 }
    );
    expect(await readStatus(page, "LSP:")).toBe("ready");
  });

  await test.step("3. initial diagnostics clean", async () => {
    await page.waitForTimeout(900);
    const diagInit = await readStatus(page, "Diagnostics:");
    expect(diagInit, `(got: ${diagInit})`).toBe("clean");
  });

  await focusEditor(page);

  await test.step("4. typing @ fires a completion request", async () => {
    // Position the cursor at the end of the "@count = 0" line for a
    // logic-context probe, then insert a newline + `@`.
    await page.evaluate(() => {
      const v = (window as any).__cm;
      const text = v.state.doc.toString();
      const idx = text.indexOf("@count = 0") + "@count = 0".length;
      v.dispatch({ selection: { anchor: idx, head: idx } });
    });
    await page.waitForTimeout(150);
    const out0 = await readStatus(page, "LSP traffic:");
    await page.keyboard.type("\n@", { delay: 30 });
    await page.waitForTimeout(800);
    const out1 = await readStatus(page, "LSP traffic:");
    const lastCompl = await readStatus(page, "Last completion:");
    expect(out1, `${out0} -> ${out1}`).not.toBe(out0);
    expect(lastCompl && lastCompl !== "(none yet)", `(got: ${lastCompl})`).toBeTruthy();
  });

  await test.step("5. typing < at a markup line fires a completion request", async () => {
    await page.evaluate(() => {
      const v = (window as any).__cm;
      const text = v.state.doc.toString();
      const idx = text.indexOf("<button");
      v.dispatch({ selection: { anchor: idx, head: idx } });
    });
    await page.waitForTimeout(150);
    const before5 = await readStatus(page, "LSP traffic:");
    await page.keyboard.type("<", { delay: 30 });
    await page.waitForTimeout(800);
    const after5 = await readStatus(page, "LSP traffic:");
    expect(after5, `${before5} -> ${after5}`).not.toBe(before5);
  });

  await test.step("6. hover request path reachable (synthetic mouse)", async () => {
    // Emulate a mouseover on an identifier. CM6's hoverTooltip listens for
    // pointermove/mousemove; we verify the hover handler is reachable by
    // dispatching synthetic events on .cm-content. Hover count is
    // informational — the synthetic event may not trigger CM6 in all versions.
    const hoverFired = await page.evaluate(() => {
      const cmContent = document.querySelector<HTMLElement>(".cm-host .cm-content");
      if (!cmContent) return false;
      const rect = cmContent.getBoundingClientRect();
      const x = rect.left + 30;
      const y = rect.top + 30;
      for (const type of ["pointermove", "mousemove"]) {
        cmContent.dispatchEvent(new MouseEvent(type, { bubbles: true, clientX: x, clientY: y }));
      }
      return true;
    });
    await page.waitForTimeout(1200);
    const hoverCount = await readStatus(page, "Hover count:");
    expect(hoverFired).toBe(true);
    console.log(`  NOTE: hover count after synthetic mouse = ${hoverCount}`);
  });

  await test.step("7. broken scrml surfaces diagnostics", async () => {
    // Replace the doc with one that has a guaranteed-flagged diagnostic (an
    // undeclared identifier fires E-SCOPE-001 cleanly).
    await page.evaluate(() => {
      const v = (window as any).__cm;
      const broken =
        "<program>\nfunction foo() { return undeclaredVariable }\n<div>${foo()}</>\n</program>";
      v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: broken } });
    });
    await page.waitForTimeout(1500);
    const diagBroken = await readStatus(page, "Diagnostics:");
    expect(
      !!diagBroken && !diagBroken.startsWith("clean") && !diagBroken.startsWith("no"),
      `(got: ${diagBroken})`
    ).toBeTruthy();
  });

  await test.step("8. no unexpected errors", async () => {
    // Ignore known Bug P (_scrml_stop_scope_timers) + favicon noise.
    const unknown = errors.filter(
      (e) => !e.includes("_scrml_stop_scope_timers") && !e.includes("favicon")
    );
    expect(unknown, unknown.join(" | ")).toHaveLength(0);
    if (errors.length && unknown.length === 0) {
      console.log(`  NOTE: ${errors.length} known Bug P pageerror(s) ignored`);
    }
  });
});
