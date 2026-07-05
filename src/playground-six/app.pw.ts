// playground-six smoke — LSP diagnostics over WebSocket (Playwright port).
//
// Boots TWO processes: the LSP-over-WebSocket bridge (bun bridge.js) and the
// scrml dev server, then drives the page with Playwright. Asserts (as
// test.steps):
//   1. CM6 mounts
//   2. WS bridge reachable; LSP reaches "ready" status
//   3. Sample doc is clean: diagCount == 0
//   4. After replacing the buffer with a syntax error, diagCount > 0
//   5. The diagnostics panel renders text
//   6. After restoring clean scrml, diagCount returns to 0
//   7. No page errors
//
// Ported from the puppeteer test.js (S18). The interaction is an inherently
// sequential state machine (each edit builds on the last over a live LSP
// session), so it is one test() sharing a page, subdivided by test.step for
// granular reporting.

import { test, expect, type Page } from "@playwright/test";
import { spawn, type ChildProcess } from "child_process";
import path from "path";
import fs from "fs";
import { bootScrmlDev, killScrmlDev } from "../_pw/scrml-dev";

const APP = path.resolve(__dirname, "app.scrml");
const BRIDGE = path.resolve(__dirname, "bridge.js");
const SCRML_PORT = 3066;
const BRIDGE_PORT = 3061;
const URL = `http://localhost:${SCRML_PORT}/`;

// Resolve the scrml compiler dir the bridge needs for its LSP child. bridge.js
// falls back to `../../../scrml` (the canonical 6nz repo layout); that path is
// wrong when this spec runs from a git worktree (deeper on disk), so we pass
// SCRML_DIR explicitly. We pick the first candidate that actually contains the
// LSP server — no absolute literal, works in both layouts.
function resolveScrmlDir(): string {
  const candidates = [
    path.resolve(__dirname, "../../../scrml"), // canonical repo layout
    path.resolve(__dirname, "../../../../../../scrml"), // git-worktree layout
  ];
  for (const c of candidates) {
    if (fs.existsSync(path.join(c, "lsp/server.js"))) return c;
  }
  return candidates[0];
}

// Boot the bridge — replicates test.js bootBridge() exactly (command `bun`,
// arg BRIDGE, PORT env, readiness on "listening on ws://", 5s fallback), plus a
// SCRML_DIR override so the LSP child resolves regardless of on-disk layout.
function bootBridge(): Promise<ChildProcess> {
  const proc = spawn("bun", [BRIDGE], {
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, PORT: String(BRIDGE_PORT), SCRML_DIR: resolveScrmlDir() },
  });
  let buf = "";
  return new Promise((resolve) => {
    let resolved = false;
    const onData = (d: Buffer) => {
      buf += String(d);
      if (!resolved && buf.includes("listening on ws://")) {
        resolved = true;
        resolve(proc);
      }
    };
    proc.stdout!.on("data", onData);
    proc.stderr!.on("data", onData);
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(proc);
      }
    }, 5000);
  });
}

let bridge: ChildProcess | undefined;
let dev: ChildProcess | undefined;

test.beforeAll(async () => {
  // Match the puppeteer harness sequencing: bridge first (+800ms settle),
  // then scrml dev (+1500ms settle) so the WS handshake has time to land.
  bridge = await bootBridge();
  await new Promise((r) => setTimeout(r, 800));
  dev = await bootScrmlDev(APP, SCRML_PORT);
  await new Promise((r) => setTimeout(r, 1500));
});

test.afterAll(() => {
  killScrmlDev(dev);
  killScrmlDev(bridge); // same mechanism — just proc.kill()
});

// --- DOM-walk helpers (identical semantics to the puppeteer harness) ---

async function readField(page: Page, label: string): Promise<string | null> {
  return await page.evaluate((lbl) => {
    const rows = document.querySelectorAll(".row");
    for (const row of rows) {
      const slabel = row.querySelector(".slabel");
      const value = row.querySelector(".value");
      if (slabel && value && slabel.textContent!.trim().startsWith(lbl)) {
        return value.textContent!.trim();
      }
    }
    return null;
  }, label);
}

async function readDiagCount(page: Page): Promise<number> {
  const t = await readField(page, "Diagnostics:");
  return t ? parseInt(t, 10) : 0;
}

async function readLspStatus(page: Page): Promise<string | null> {
  return readField(page, "LSP:");
}

test("playground-six — LSP diagnostics over WebSocket", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (e) => pageErrors.push(e.message));
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const t = msg.text();
    if (t.includes("favicon.ico") || t.includes("404 (Not Found)")) return;
    pageErrors.push("console: " + t);
  });

  // Resilience shim — a NO-OP when esm.sh is healthy. The playground loads
  // CodeMirror from esm.sh at runtime (app.client.js imports `codemirror@6.0.2`
  // and `@codemirror/view@6`). esm.sh intermittently 500s on semver-RANGE meta
  // lookups (`@codemirror/view@6`, `@codemirror/view@^6.x`) while exact-pinned
  // builds stay cached and serve 200. When a range lookup 500s, we refetch the
  // same module pinned to 6.43.0 (the newest cached 6.x — what the ranges would
  // resolve to anyway) so CM6 can still mount, consistently. This touches
  // only network transport for the third-party CDN — never the app, never an
  // assertion. When esm.sh serves the range normally, every request passes
  // through untouched.
  await page.route(/https:\/\/esm\.sh\//, async (route) => {
    const reqUrl = route.request().url();
    try {
      let resp = await fetch(reqUrl);
      if (resp.status >= 500) {
        const pinned = reqUrl.replace(/@codemirror\/view@[^/?]+/, "@codemirror/view@6.43.0");
        if (pinned !== reqUrl) resp = await fetch(pinned);
      }
      const body = Buffer.from(await resp.arrayBuffer());
      await route.fulfill({
        status: resp.status,
        contentType: resp.headers.get("content-type") || "application/javascript",
        body,
      });
    } catch {
      await route.continue();
    }
  });

  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 15_000 });

  await test.step("1. CM6 mounted", async () => {
    await page.waitForFunction(
      () => {
        const v = document.querySelector<HTMLElement>(".cm-host .cm-editor");
        return !!v && v.offsetHeight > 0;
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
          if (
            l &&
            v &&
            l.textContent!.trim().startsWith("LSP:") &&
            v.textContent!.trim() === "ready"
          )
            return true;
        }
        return false;
      },
      undefined,
      { timeout: 10_000 }
    );
    expect(await readLspStatus(page)).toBe("ready");
  });

  // Give diagnostics a beat to arrive after didOpen.
  await page.waitForTimeout(800);

  await test.step("3. sample doc is clean (0 diagnostics)", async () => {
    const initialCount = await readDiagCount(page);
    expect(initialCount, `got ${initialCount}`).toBe(0);
  });

  await test.step("4. replacing with broken scrml surfaces diagnostics", async () => {
    // Inject a syntax error by REPLACING the buffer with a known-broken scrml
    // fragment via view.dispatch — independent of cursor/keyboard timing. The
    // replacement triggers didChange via the updateListener.
    await page.evaluate(() => {
      const v = (window as unknown as { __cm: any }).__cm;
      const doc = v.state.doc;
      v.dispatch({
        changes: { from: 0, to: doc.length, insert: "<program>\n${ @x = }\n</program>\n" },
      });
    });
    await page.waitForTimeout(1200);
    const afterBadCount = await readDiagCount(page);
    expect(afterBadCount, `got ${afterBadCount}`).toBeGreaterThan(0);
  });

  await test.step("5. diagnostics panel renders text", async () => {
    const diagText = await page.evaluate(() => {
      const el = document.querySelector(".diag-list");
      return el ? el.textContent!.trim() : "";
    });
    expect(diagText.length, `text=${diagText.slice(0, 200)}`).toBeGreaterThan(0);
  });

  await test.step("6. clean scrml clears diagnostics", async () => {
    await page.evaluate(() => {
      const v = (window as unknown as { __cm: any }).__cm;
      const doc = v.state.doc;
      v.dispatch({
        changes: { from: 0, to: doc.length, insert: "<program>\n<div>hello</div>\n</program>\n" },
      });
    });
    await page.waitForTimeout(1200);
    const afterFixCount = await readDiagCount(page);
    expect(afterFixCount, `got ${afterFixCount}`).toBe(0);
  });

  await test.step("7. no page errors", async () => {
    expect(pageErrors, pageErrors.join(" | ")).toHaveLength(0);
  });
});
