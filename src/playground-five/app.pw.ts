// playground-five smoke — CM6 + vim modes (Playwright port).
//
// Boots scrml dev, drives the page with Playwright. Asserts (as test.steps):
//   1. CM6 loads (status reaches "CM6 mounted")
//   2. NORMAL badge visible by default
//   3. i -> INSERT
//   4. Esc -> NORMAL
//   5. v -> VISUAL
//   6. v in VISUAL -> NORMAL
//   7. NORMAL cursor parks at line 1 col 1 after k×20 + h×20
//   8. NORMAL j moves cursor down (cursorLine increments)
//   9. NORMAL k moves cursor up (cursorLine decrements)
//  10. NORMAL l moves cursor right within a line
//  11. NORMAL h moves cursor left within a line
//  12. NORMAL typing does NOT increase docLength (unbound keys suppressed)
//  13. i -> INSERT (re-enter for the typing test)
//  14. INSERT typing increases docLength
//  15. Esc returns to NORMAL
//  16. v -> VISUAL (for the selection-extend test)
//  17. VISUAL l extends head, keeps anchor (window.__cm state)
//  18. no page errors
//
// CM6 loads from esm.sh, so runtime network is required (expected — works).
//
// Ported from the puppeteer test.js (S18). The interaction is an inherently
// sequential state machine (each keypress builds on the last), so it is one
// test() sharing a page, subdivided by test.step for granular reporting.

import { test, expect, type Page } from "@playwright/test";
import { type ChildProcess } from "child_process";
import path from "path";
import { bootScrmlDev, killScrmlDev } from "../_pw/scrml-dev";

const APP = path.resolve(__dirname, "app.scrml");
const PORT = 3055;
const URL = `http://localhost:${PORT}/`;

let dev: ChildProcess | undefined;
const pageErrors: string[] = [];

test.beforeAll(async () => {
  dev = await bootScrmlDev(APP, PORT);
  // settle — the dev server's readiness log can precede first-serve readiness.
  await new Promise((r) => setTimeout(r, 1500));
});

test.afterAll(() => killScrmlDev(dev));

// --- DOM-walk / CM6-state helpers (identical semantics to the puppeteer harness) ---

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

async function activeMode(page: Page): Promise<string> {
  return await page.evaluate(() => {
    const insert = document.querySelector<HTMLElement>(".badge.insert");
    const normal = document.querySelector<HTMLElement>(".badge.normal");
    const visual = document.querySelector<HTMLElement>(".badge.visual");
    if (insert && insert.offsetParent) return "INSERT";
    if (normal && normal.offsetParent) return "NORMAL";
    if (visual && visual.offsetParent) return "VISUAL";
    return "NONE";
  });
}

async function readCursor(page: Page): Promise<{ line: number; col: number }> {
  const text = await readField(page, "Cursor:");
  if (!text) return { line: 0, col: 0 };
  // "line N, col M"
  const m = text.match(/line\s+(\d+),\s*col\s+(\d+)/);
  if (!m) return { line: 0, col: 0 };
  return { line: parseInt(m[1], 10), col: parseInt(m[2], 10) };
}

async function readDocLen(page: Page): Promise<number> {
  const text = await readField(page, "Doc:");
  if (!text) return 0;
  const m = text.match(/(\d+)\s+chars/);
  return m ? parseInt(m[1], 10) : 0;
}

async function press(page: Page, key: string): Promise<void> {
  await page.keyboard.press(key);
  await page.waitForTimeout(40);
}

test("playground-five — CM6 + vim modes", async ({ page }) => {
  page.on("pageerror", (e) => pageErrors.push(e.message));
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const t = msg.text();
    if (t.includes("favicon.ico") || t.includes("404 (Not Found)")) return;
    pageErrors.push("console: " + t);
  });

  // Resilience shim — a NO-OP when esm.sh is healthy. The playground loads
  // CodeMirror from esm.sh at runtime (`codemirror@6` + `@codemirror/view@6`).
  // esm.sh intermittently 500s on semver-RANGE meta lookups (`@codemirror/view@6`,
  // `@codemirror/view@^6.x`) while exact-pinned builds stay cached and serve 200.
  // When a range lookup 500s, we refetch the same module pinned to 6.43.0 (the
  // newest cached 6.x — what the ranges would resolve to anyway) so CM6 can still
  // mount, consistently. This touches only network transport for the third-party
  // CDN — never the app, never an assertion. When esm.sh serves the range
  // normally, every request passes through untouched.
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

  // 1. CM6 mounts — esm.sh fetch + mount can be slow, so wait generously for
  // both the editor DOM and the "CM6 mounted" status. (60s test cap in config.)
  await page.waitForFunction(
    () => {
      const v = document.querySelector<HTMLElement>(".cm-host .cm-editor");
      return !!v && v.offsetHeight > 0;
    },
    undefined,
    { timeout: 30_000 }
  );

  await test.step("1. CM6 mounted", async () => {
    const status = await readField(page, "CM6 status:");
    expect(status, `status=${status}`).toContain("mounted");
  });

  await test.step("2. default mode is NORMAL", async () => {
    expect(await activeMode(page)).toBe("NORMAL");
  });

  // Click into CM6 host so keystrokes go there.
  await page.click(".cm-host");
  await page.waitForTimeout(80);

  await test.step("3. i -> INSERT", async () => {
    await press(page, "i");
    expect(await activeMode(page)).toBe("INSERT");
  });

  await test.step("4. Esc -> NORMAL", async () => {
    await press(page, "Escape");
    expect(await activeMode(page)).toBe("NORMAL");
  });

  await test.step("5. v -> VISUAL", async () => {
    await press(page, "v");
    expect(await activeMode(page)).toBe("VISUAL");
  });

  await test.step("6. v in VISUAL -> NORMAL", async () => {
    await press(page, "v");
    expect(await activeMode(page)).toBe("NORMAL");
  });

  // Move to a known starting point (line 1, col 1) so we can make precise
  // assertions about j/k motion — hammer k then h to reach the top-left.
  let before: { line: number; col: number };
  await test.step("7. cursor at line 1 after k×20 + h×20", async () => {
    for (let i = 0; i < 20; i++) await press(page, "k");
    for (let i = 0; i < 20; i++) await press(page, "h");
    before = await readCursor(page);
    expect(
      before.line === 1 && before.col === 1,
      `got line=${before.line} col=${before.col}`
    ).toBe(true);
  });

  let afterJ: { line: number; col: number };
  await test.step("8. j moves cursor down", async () => {
    await press(page, "j");
    afterJ = await readCursor(page);
    expect(afterJ.line, `before=${before.line} after=${afterJ.line}`).toBe(before.line + 1);
  });

  await test.step("9. k moves cursor up", async () => {
    await press(page, "k");
    const afterK = await readCursor(page);
    expect(afterK.line, `${afterJ.line} -> ${afterK.line}`).toBe(afterJ.line - 1);
  });

  let afterL: { line: number; col: number };
  await test.step("10. l moves cursor right", async () => {
    const beforeL = await readCursor(page);
    await press(page, "l");
    afterL = await readCursor(page);
    expect(
      afterL.col > beforeL.col || afterL.line > beforeL.line,
      `before col=${beforeL.col} after col=${afterL.col}`
    ).toBe(true);
  });

  await test.step("11. h moves cursor left", async () => {
    await press(page, "h");
    const afterH = await readCursor(page);
    expect(
      afterH.col < afterL.col || afterH.line < afterL.line,
      `after l col=${afterL.col} after h col=${afterH.col}`
    ).toBe(true);
  });

  let docLenBefore: number;
  await test.step("12. NORMAL ignores unbound keys (no typing)", async () => {
    docLenBefore = await readDocLen(page);
    await press(page, "x"); // not bound in normal — should be ignored
    await press(page, "y");
    await press(page, "z");
    const docLenAfterNormalType = await readDocLen(page);
    expect(
      docLenAfterNormalType,
      `before=${docLenBefore} after=${docLenAfterNormalType}`
    ).toBe(docLenBefore);
  });

  await test.step("13. i -> INSERT (after typing test)", async () => {
    await press(page, "i");
    expect(await activeMode(page)).toBe("INSERT");
  });

  await test.step("14. INSERT typing increases docLength", async () => {
    await page.keyboard.type("ABC");
    await page.waitForTimeout(120);
    const docLenAfterInsert = await readDocLen(page);
    expect(
      docLenAfterInsert,
      `before=${docLenBefore} after=${docLenAfterInsert}`
    ).toBeGreaterThanOrEqual(docLenBefore + 3);
  });

  await test.step("15. Esc returns to NORMAL", async () => {
    await press(page, "Escape");
    expect(await activeMode(page)).toBe("NORMAL");
  });

  await test.step("16. v -> VISUAL (selection extend test)", async () => {
    await press(page, "v");
    expect(await activeMode(page)).toBe("VISUAL");
  });

  await test.step("17. VISUAL l extends head, keeps anchor", async () => {
    const selBefore = await page.evaluate(() => {
      const v = (window as any).__cm;
      if (!v) return null;
      const s = v.state.selection.main;
      return { anchor: s.anchor as number, head: s.head as number };
    });
    await press(page, "l");
    await press(page, "l");
    const selAfter = await page.evaluate(() => {
      const v = (window as any).__cm;
      const s = v.state.selection.main;
      return { anchor: s.anchor as number, head: s.head as number };
    });
    expect(
      selBefore !== null &&
        selAfter.anchor === selBefore.anchor &&
        selAfter.head > selBefore.head,
      JSON.stringify({ before: selBefore, after: selAfter })
    ).toBe(true);
    await press(page, "Escape");
  });

  await test.step("18. no page errors", async () => {
    expect(pageErrors, pageErrors.join(" | ")).toHaveLength(0);
  });
});
