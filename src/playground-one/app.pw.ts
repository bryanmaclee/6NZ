// playground-one smoke — vim-style mode state machine via <engine for=Mode>.
//
// Boots scrml dev, drives the page with Playwright. Asserts (as test.steps):
//   1. App renders (mode badge present)
//   2. Initial mode is INSERT (engine initial=.Insert)
//   3. Log empty initially ("no transitions yet")
//   4. Esc (from Insert) -> NORMAL
//   5. i (from Normal) -> INSERT  (legal round-trip)
//   6. Esc -> NORMAL, then v -> VISUAL  (legal: Normal -> Visual)
//   7. V (from Visual) -> V-LINE     (legal: Visual -> VisualLine)
//   8. v (from V-LINE) -> VISUAL     (legal: VisualLine -> Visual)
//   9. transition log grows via <each> (li count > 0)
//  10. Last trigger status row reflects the latest transition
//  11. Clear (clearMode) resets to INSERT and empties the log
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
const PORT = 3051;
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

// Reads the visible mode badge text. The <match for=Mode> renders exactly one
// `.badge` element; V-LINE shares the `.visual` class with VISUAL, so we read
// the text, not the class.
async function badgeText(page: Page): Promise<string | null> {
  return await page.evaluate(() => {
    const b = document.querySelector(".mode-display .badge");
    return b ? b.textContent!.trim() : null;
  });
}

// Reads a `.value` from the status panel by its `.slabel` prefix.
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

// Number of transition-log entries rendered via `<each in=@log>`. The empty
// branch renders a single "no transitions yet" li, so we exclude it.
async function logCount(page: Page): Promise<number> {
  return await page.evaluate(() => {
    const items = [...document.querySelectorAll(".loglist li")];
    return items.filter((li) => li.textContent!.trim() !== "no transitions yet").length;
  });
}

async function focusSurface(page: Page): Promise<void> {
  await page.evaluate(() => {
    const t = document.querySelector<HTMLElement>(".surface");
    if (t) t.focus();
  });
}

async function press(page: Page, key: string): Promise<void> {
  await page.keyboard.press(key);
  await page.waitForTimeout(80);
}

test("playground-one — vim-style mode state machine", async ({ page }) => {
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("console", (m) => {
    const t = m.text();
    if (t.includes("error") || t.includes("Error")) errors.push("console: " + t);
  });

  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 15_000 });
  await page.waitForFunction(
    () => {
      const b = document.querySelector(".mode-display .badge");
      return !!b && b.textContent!.trim().length > 0;
    },
    undefined,
    { timeout: 10_000 }
  );

  let b0: string | null = null;

  await test.step("1. mode badge renders", async () => {
    b0 = await badgeText(page);
    expect(b0, `(${b0})`).not.toBeNull();
  });

  await test.step("2. initial mode is INSERT", async () => {
    expect(b0, `(${b0})`).toBe("INSERT");
  });

  await test.step("3. transition log empty initially", async () => {
    const lc0 = await logCount(page);
    expect(lc0, `(${lc0} entries)`).toBe(0);
  });

  await focusSurface(page);

  await test.step("4. Esc -> NORMAL", async () => {
    await press(page, "Escape");
    const bNormal = await badgeText(page);
    expect(bNormal, `(${bNormal})`).toBe("NORMAL");
  });

  await test.step("5. i (from Normal) -> INSERT", async () => {
    await press(page, "i");
    const bInsert = await badgeText(page);
    expect(bInsert, `(${bInsert})`).toBe("INSERT");
  });

  await test.step("6. v (from Normal) -> VISUAL", async () => {
    await press(page, "Escape");
    await press(page, "v");
    const bVisual = await badgeText(page);
    expect(bVisual, `(${bVisual})`).toBe("VISUAL");
  });

  await test.step("7. V (from Visual) -> V-LINE", async () => {
    await press(page, "V");
    const bVLine = await badgeText(page);
    expect(bVLine, `(${bVLine})`).toBe("V-LINE");
  });

  await test.step("8. v (from V-LINE) -> VISUAL", async () => {
    await press(page, "v");
    const bVisual2 = await badgeText(page);
    expect(bVisual2, `(${bVisual2})`).toBe("VISUAL");
  });

  await test.step("9. transition log grows via <each>", async () => {
    const lc1 = await logCount(page);
    expect(lc1, `(${lc1} entries)`).toBeGreaterThanOrEqual(4);
  });

  await test.step("10. last-trigger status reflects transition", async () => {
    const trig = await readStatus(page, "Last trigger:");
    expect(trig, `(${trig})`).toBe("v");
  });

  await test.step("11. clear resets to INSERT and empties log", async () => {
    await page.click(".reset-btn");
    await page.waitForTimeout(120);
    const bReset = await badgeText(page);
    const lcReset = await logCount(page);
    expect(bReset, `(mode=${bReset}, log=${lcReset})`).toBe("INSERT");
    expect(lcReset, `(mode=${bReset}, log=${lcReset})`).toBe(0);
  });

  await test.step("12. no page errors", async () => {
    const unknown = errors.filter((e) => !e.includes("favicon"));
    expect(unknown, unknown.join(" | ")).toHaveLength(0);
  });
});
