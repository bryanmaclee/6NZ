// playground-two smoke — hjkl + z-motion rolls against a real buffer.
//
// Boots scrml dev, drives the page with Playwright. Asserts (as test.steps):
//   1. Buffer renders (before/cursor/after segments present)
//   2. Initial mode is NORMAL (vim convention)
//   3. Cursor renders as a block in NORMAL (.cursor.block-cursor)
//   4. l moves the cursor right within a line (@cursor++)
//   5. h moves the cursor left (@cursor--)
//   6. j moves the cursor down a line (col preserved, pos jumps a line)
//   7. k moves the cursor back up a line
//   8. i -> INSERT badge; cursor becomes the insert caret
//   9. Esc -> NORMAL badge
//  10. INSERT typing inserts into the buffer (buffer grows)
//  11. z-motion: in INSERT, hold l + tap a key nudges cursor right
//      WITHOUT typing the held 'l' and WITHOUT leaving INSERT
//  12. no page errors
//
// Ported from the puppeteer test.js (S18). The interaction is an inherently
// sequential state machine (each keypress builds on the last), so it is one
// test() sharing a page, subdivided by test.step for granular reporting.

import { test, expect, type Page } from "@playwright/test";
import { type ChildProcess } from "child_process";
import path from "path";
import { bootScrmlDev, killScrmlDev } from "../_pw/scrml-dev";

const APP = path.resolve(__dirname, "app.scrml");
const PORT = 3052;
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

// The cursor offset is directly observable: `.seg.before` renders
// @buffer.slice(0, @cursor), so its length === @cursor.
async function cursorPos(page: Page): Promise<number> {
  return await page.evaluate(() => {
    const b = document.querySelector(".buffer-pane .seg.before");
    return b ? b.textContent!.length : -1;
  });
}

// The mode badge is a <match> — exactly one badge element renders.
async function activeMode(page: Page): Promise<string> {
  return await page.evaluate(() => {
    if (document.querySelector(".badge.insert")) return "INSERT";
    if (document.querySelector(".badge.normal")) return "NORMAL";
    if (document.querySelector(".badge.visual")) return "VISUAL";
    return "NONE";
  });
}

async function bufferLen(page: Page): Promise<number> {
  return await page.evaluate(() => {
    const before = document.querySelector(".buffer-pane .seg.before");
    const cur = document.querySelector(".buffer-pane .seg.cursor");
    const after = document.querySelector(".buffer-pane .seg.after");
    return (
      (before ? before.textContent!.length : 0) +
      (cur ? cur.textContent!.length : 0) +
      (after ? after.textContent!.length : 0)
    );
  });
}

async function cursorClass(page: Page): Promise<string> {
  return await page.evaluate(() => {
    const c = document.querySelector(".buffer-pane .seg.cursor");
    return c ? c.className : "";
  });
}

async function focusPane(page: Page): Promise<void> {
  await page.evaluate(() => {
    const p = document.querySelector<HTMLElement>(".buffer-pane");
    if (p) p.focus();
  });
  await page.waitForTimeout(40);
}

async function press(page: Page, key: string): Promise<void> {
  await page.keyboard.press(key);
  await page.waitForTimeout(80);
}

test("playground-two — hjkl + z-motion rolls against a real buffer", async ({ page }) => {
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("console", (m) => {
    const t = m.text();
    if (t.includes("error") || t.includes("Error")) errors.push("console: " + t);
  });

  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 15_000 });
  await page.waitForFunction(
    () => {
      const b = document.querySelector(".buffer-pane .seg.before");
      const c = document.querySelector(".buffer-pane .seg.cursor");
      return b !== null && c !== null;
    },
    undefined,
    { timeout: 10_000 }
  );

  await test.step("1. buffer renders (segments populated)", async () => {
    const len0 = await bufferLen(page);
    expect(len0, `${len0} chars`).toBeGreaterThan(50);
  });

  await test.step("2. initial mode is NORMAL", async () => {
    expect(await activeMode(page)).toBe("NORMAL");
  });

  await test.step("3. cursor is block in NORMAL", async () => {
    const cls0 = await cursorClass(page);
    expect(cls0, `(${cls0})`).toContain("block-cursor");
  });

  await focusPane(page);

  let posStart: number;
  let posL: number;
  await test.step("4. l moves cursor right", async () => {
    posStart = await cursorPos(page);
    await press(page, "l");
    posL = await cursorPos(page);
    expect(posL, `${posStart} -> ${posL}`).toBe(posStart + 1);
  });

  await test.step("5. h moves cursor left", async () => {
    await press(page, "h");
    const posH = await cursorPos(page);
    expect(posH, `${posL} -> ${posH}`).toBe(posL - 1);
  });

  let posJ: number;
  await test.step("6. j moves cursor down a line", async () => {
    // Line 0 ("Welcome to 6nz.") is 15 chars then a newline at offset 15,
    // so moving down from col 0 lands the cursor past offset 15.
    const posPreJ = await cursorPos(page);
    await press(page, "j");
    posJ = await cursorPos(page);
    expect(posJ, `${posPreJ} -> ${posJ}`).toBeGreaterThan(posPreJ);
  });

  await test.step("7. k moves cursor up a line", async () => {
    await press(page, "k");
    const posK = await cursorPos(page);
    expect(posK, `${posJ} -> ${posK}`).toBeLessThan(posJ);
  });

  await test.step("8. i -> INSERT badge; cursor becomes insert caret", async () => {
    await press(page, "i");
    expect(await activeMode(page)).toBe("INSERT");
    const clsI = await cursorClass(page);
    expect(clsI, `(${clsI})`).toContain("insert-cursor");
  });

  await test.step("9. Esc -> NORMAL badge", async () => {
    await press(page, "Escape");
    expect(await activeMode(page)).toBe("NORMAL");
  });

  await test.step("10. INSERT typing grows the buffer", async () => {
    await press(page, "i");
    const lenPreType = await bufferLen(page);
    await page.keyboard.type("XYZ");
    await page.waitForTimeout(150);
    const lenPostType = await bufferLen(page);
    expect(lenPostType, `${lenPreType} -> ${lenPostType}`).toBe(lenPreType + 3);
  });

  await test.step(
    "11. z-motion roll in INSERT: hold l + tap key nudges cursor right without typing, stays INSERT",
    async () => {
      // The roll fires cursor motion (right) on the inner key's keydown and
      // does NOT type the held 'l'. We stay in INSERT throughout. Net: cursor
      // advances by 1 (the roll), buffer length unchanged (neither the 'l'
      // nor the inner key is typed).
      const posPreRoll = await cursorPos(page);
      const lenPreRoll = await bufferLen(page);
      const modePreRoll = await activeMode(page);
      await page.keyboard.down("l"); // hold motion key
      await page.waitForTimeout(60);
      await page.keyboard.press("o"); // roll: tap under the hold -> right
      await page.waitForTimeout(60);
      await page.keyboard.up("l"); // release the hold (classifies HOLD)
      await page.waitForTimeout(100);
      const posPostRoll = await cursorPos(page);
      const lenPostRoll = await bufferLen(page);
      const modePostRoll = await activeMode(page);
      const detail = `pos ${posPreRoll}->${posPostRoll}, len ${lenPreRoll}->${lenPostRoll}, mode ${modePreRoll}->${modePostRoll}`;
      expect(posPostRoll, detail).toBe(posPreRoll + 1);
      expect(lenPostRoll, detail).toBe(lenPreRoll);
      expect(modePreRoll, detail).toBe("INSERT");
      expect(modePostRoll, detail).toBe("INSERT");
    }
  );

  await press(page, "Escape");

  await test.step("12. no page errors", async () => {
    const unknown = errors.filter((e) => !e.includes("favicon"));
    expect(unknown, unknown.join(" | ")).toHaveLength(0);
  });
});
