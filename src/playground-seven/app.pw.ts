// playground-seven smoke — z-motion on CM6 (Playwright port).
//
// Boots scrml dev, drives the page with Playwright. Asserts (as test.steps):
//   1. CM6 loads (status reaches "CM6 mounted")
//   2. NORMAL badge visible by default
//   3. i -> INSERT
//   4. Esc -> NORMAL
//   5. v -> VISUAL
//   6. v in VISUAL -> NORMAL
//   7. NORMAL j moves cursor down
//   8. NORMAL k moves cursor up
//   9. NORMAL l moves cursor right
//  10. NORMAL h moves cursor left
//  11. INSERT typing increases docLength (TAP of non-motion key)
//  12. INSERT TAP of 'h' alone (no roll) types 'h' into the buffer
//  13. INSERT hold 'j' + tap any key -> cursor moves down, NO type
//  14. INSERT hold 'k' + tap any key -> cursor moves up, NO type
//  15. INSERT hold 'l' + tap any key -> cursor moves right, NO type
//  16. Z-motion does not change @mode (still INSERT)
//  17. no page errors (known Bug P _scrml_stop_scope_timers + favicon ignored)
//
// Ported from the puppeteer test.js (S18). The interaction is an inherently
// sequential state machine (each keypress/hold builds on the last), so it is
// one test() sharing a page, subdivided by test.step for granular reporting.

import { test, expect, type Page } from "@playwright/test";
import { type ChildProcess } from "child_process";
import path from "path";
import { bootScrmlDev, killScrmlDev } from "../_pw/scrml-dev";

const APP = path.resolve(__dirname, "app.scrml");
const PORT = 3057;
const URL = `http://localhost:${PORT}/`;

let dev: ChildProcess | undefined;
const errors: string[] = [];

test.beforeAll(async () => {
  dev = await bootScrmlDev(APP, PORT);
  // settle — the dev server's readiness log can precede first-serve readiness.
  await new Promise((r) => setTimeout(r, 1500));
});

test.afterAll(() => killScrmlDev(dev));

// --- DOM-walk helpers (identical semantics to the puppeteer harness) ---

async function readMode(page: Page): Promise<string | null> {
  return await page.evaluate(() => {
    for (const sel of [".badge.insert", ".badge.normal", ".badge.visual"]) {
      const el = document.querySelector(sel);
      if (el && (el as HTMLElement).offsetParent !== null) return el.textContent!.trim();
    }
    return null;
  });
}

async function readDocLength(page: Page): Promise<number> {
  return await page.evaluate(() => {
    const v = (window as any).__cm;
    return v ? v.state.doc.length : -1;
  });
}

async function readCursor(
  page: Page
): Promise<{ head: number; line: number; col: number } | null> {
  return await page.evaluate(() => {
    const v = (window as any).__cm;
    if (!v) return null;
    const h = v.state.selection.main.head;
    const line = v.state.doc.lineAt(h);
    return { head: h, line: line.number, col: h - line.from + 1 };
  });
}

async function readBufferAt(page: Page, from: number, to: number): Promise<string | null> {
  return await page.evaluate(
    ({ from, to }) => {
      const v = (window as any).__cm;
      if (!v) return null;
      return v.state.sliceDoc(from, to);
    },
    { from, to }
  );
}

async function focusEditor(page: Page): Promise<void> {
  await page.evaluate(() => {
    const cm = document.querySelector<HTMLElement>(".cm-host .cm-content");
    if (cm) cm.focus();
  });
}

async function pressKey(page: Page, key: string): Promise<void> {
  await page.keyboard.press(key);
  await page.waitForTimeout(80);
}

// Hold one key while pressing another (release order matters).
// Sequence: holdKey down -> rollKey down -> rollKey up -> holdKey up.
async function holdAndRoll(page: Page, holdKey: string, rollKey: string): Promise<void> {
  await page.keyboard.down(holdKey);
  await page.waitForTimeout(15);
  await page.keyboard.down(rollKey);
  await page.waitForTimeout(5);
  await page.keyboard.up(rollKey);
  await page.waitForTimeout(5);
  await page.keyboard.up(holdKey);
  await page.waitForTimeout(80);
}

test("playground-seven — z-motion on CM6", async ({ page }) => {
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("console", (m) => {
    const t = m.text();
    if (t.includes("error") || t.includes("Error")) errors.push("console: " + t);
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
        const v = document.querySelector(".cm-host .cm-editor");
        return !!v && (v as HTMLElement).offsetHeight > 0 && !!(window as any).__cm;
      },
      undefined,
      { timeout: 10_000 }
    );
  });

  await test.step("2. starts in NORMAL", async () => {
    await page.waitForTimeout(150);
    expect(await readMode(page)).toBe("NORMAL");
  });

  await focusEditor(page);

  await test.step("3. i -> INSERT", async () => {
    await pressKey(page, "i");
    expect(await readMode(page)).toBe("INSERT");
  });

  await test.step("4. Esc -> NORMAL", async () => {
    await pressKey(page, "Escape");
    expect(await readMode(page)).toBe("NORMAL");
  });

  await test.step("5. v -> VISUAL", async () => {
    await pressKey(page, "v");
    expect(await readMode(page)).toBe("VISUAL");
  });

  await test.step("6. v in VISUAL -> NORMAL", async () => {
    await pressKey(page, "v");
    expect(await readMode(page)).toBe("NORMAL");
  });

  // Move to a known position (head=0), then move down.
  await page.evaluate(() => (window as any).__cm.dispatch({ selection: { anchor: 0, head: 0 } }));
  await page.waitForTimeout(50);
  let c0: { head: number; line: number; col: number } | null = null;
  let cJ: { head: number; line: number; col: number } | null = null;
  let cK: { head: number; line: number; col: number } | null = null;
  let cL: { head: number; line: number; col: number } | null = null;
  let cH: { head: number; line: number; col: number } | null = null;

  await test.step("7. NORMAL j moves cursor down", async () => {
    c0 = await readCursor(page);
    await pressKey(page, "j");
    cJ = await readCursor(page);
    expect(cJ!.line, `line ${c0!.line} -> ${cJ!.line}`).toBeGreaterThan(c0!.line);
  });

  await test.step("8. NORMAL k moves cursor up", async () => {
    await pressKey(page, "k");
    cK = await readCursor(page);
    expect(cK!.line, `line ${cJ!.line} -> ${cK!.line}`).toBeLessThan(cJ!.line);
  });

  await test.step("9. NORMAL l moves cursor right", async () => {
    await pressKey(page, "l");
    cL = await readCursor(page);
    expect(cL!.head, `head ${cK!.head} -> ${cL!.head}`).toBeGreaterThan(cK!.head);
  });

  await test.step("10. NORMAL h moves cursor left", async () => {
    await pressKey(page, "h");
    cH = await readCursor(page);
    expect(cH!.head, `head ${cL!.head} -> ${cH!.head}`).toBeLessThan(cL!.head);
  });

  let len2 = -1;

  await test.step("11. INSERT typing increases docLength", async () => {
    await pressKey(page, "i");
    const len0 = await readDocLength(page);
    await page.keyboard.type("xyz");
    await page.waitForTimeout(80);
    const len1 = await readDocLength(page);
    expect(len1, `${len0} -> ${len1}`).toBeGreaterThan(len0);
  });

  await test.step("12. INSERT TAP 'h' types 'h'", async () => {
    const headBeforeTapH = (await readCursor(page))!.head;
    await page.keyboard.down("h");
    await page.waitForTimeout(20);
    await page.keyboard.up("h");
    await page.waitForTimeout(100);
    const ch = await readBufferAt(page, headBeforeTapH, headBeforeTapH + 1);
    expect(ch, `inserted '${ch}'`).toBe("h");
  });

  let beforeJ: { head: number; line: number; col: number } | null = null;
  let afterJ: { head: number; line: number; col: number } | null = null;

  await test.step("13. z-motion [j](x) moves down, no type", async () => {
    len2 = await readDocLength(page);
    beforeJ = await readCursor(page);
    await holdAndRoll(page, "j", "x");
    afterJ = await readCursor(page);
    const lenAfterJ = await readDocLength(page);
    expect(
      afterJ!.line > beforeJ!.line && lenAfterJ === len2,
      `line ${beforeJ!.line}->${afterJ!.line}, len ${len2}->${lenAfterJ}`
    ).toBe(true);
  });

  await test.step("14. z-motion [k](x) moves up, no type", async () => {
    const beforeK = await readCursor(page);
    await holdAndRoll(page, "k", "x");
    const afterK = await readCursor(page);
    expect(
      afterK!.line < beforeK!.line && (await readDocLength(page)) === len2,
      `line ${beforeK!.line}->${afterK!.line}`
    ).toBe(true);
  });

  await test.step("15. z-motion [l](x) moves right, no type", async () => {
    const beforeL = await readCursor(page);
    await holdAndRoll(page, "l", "x");
    const afterL = await readCursor(page);
    expect(
      afterL!.head > beforeL!.head && (await readDocLength(page)) === len2,
      `head ${beforeL!.head}->${afterL!.head}`
    ).toBe(true);
  });

  await test.step("16. mode still INSERT after z-motions", async () => {
    expect(await readMode(page)).toBe("INSERT");
  });

  await test.step("17. no unexpected errors", async () => {
    const unknown = errors.filter(
      (e) => !e.includes("_scrml_stop_scope_timers") && !e.includes("favicon")
    );
    expect(unknown, unknown.join(" | ")).toHaveLength(0);
  });
});
