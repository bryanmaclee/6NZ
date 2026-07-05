// playground-zero smoke — Z-motion release-order classifier (Playwright port).
//
// Boots scrml dev, drives the page with Playwright. Asserts (as test.steps):
//   1. Chrome renders (h1 "playground-zero", textarea surface, >=4 panels)
//   2. Initial "Last classification" reads "press keys to begin"
//   3. Empty log shows the <empty> fallback "no events yet"
//   4. A single tap (down+up, nothing else held) classifies as TAP
//   5. The <each>-rendered log grows by one <li> after the tap
//   6. "Currently down" reflects held keys mid-gesture
//   7. A roll (j down, k down, release k) classifies k as ROLL
//   8. Releasing the still-held earlier key classifies it as HOLD
//   9. Log keeps newest-first order (most recent classification on top)
//  10. Clear button empties the log + resets last-event, <empty> returns
//  11. no page errors
//
// The interaction is an inherently sequential state machine (each keypress
// builds on the last), so the normal checks are ONE test() sharing a page,
// subdivided by test.step for granular reporting — exactly like p9.
//
// The ONE puppeteer xfail — "<empty> fallback cleared once log is non-empty" —
// is ported as a SEPARATE test annotated `test.fail()`. scrml's <each>/<empty>
// codegen does NOT tear down the fallback text on the empty->non-empty
// transition (first <li> is appended beside leftover "no events yet"); filed
// to scrml 2026-06-24. While the bug is present the assertion fails, which
// test.fail() expects → suite stays green. When scrml fixes it the test will
// unexpectedly PASS, flipping the suite red — the Playwright equivalent of the
// puppeteer xfail->xpass signal to delete the annotation.

import { test, expect, type Page } from "@playwright/test";
import { type ChildProcess } from "child_process";
import path from "path";
import { bootScrmlDev, killScrmlDev } from "../_pw/scrml-dev";

const APP = path.resolve(__dirname, "app.scrml");
const PORT = 3050;
const URL = `http://localhost:${PORT}/`;

let dev: ChildProcess | undefined;

test.beforeAll(async () => {
  dev = await bootScrmlDev(APP, PORT);
  // settle — the dev server's readiness log can precede first-serve readiness.
  await new Promise((r) => setTimeout(r, 1500));
});

test.afterAll(() => killScrmlDev(dev));

// --- DOM-walk helpers (identical semantics to the puppeteer harness) ---

// Read a status .value by its sibling .label prefix (e.g. "Last classification:").
async function readStatus(page: Page, lbl: string): Promise<string | null> {
  return await page.evaluate((label) => {
    const rows = document.querySelectorAll(".status .row, .row");
    for (const r of rows) {
      const l = r.querySelector(".label");
      const v = r.querySelector(".value");
      if (l && v && l.textContent!.trim().startsWith(label)) return v.textContent!.trim();
    }
    return null;
  }, lbl);
}

// The real <li> entries rendered by `<each in=@log>`.
async function logItems(page: Page): Promise<string[]> {
  return await page.evaluate(() =>
    [...document.querySelectorAll(".log li")].map((el) => el.textContent!.trim())
  );
}

// True iff the <empty> fallback text "no events yet" is currently mounted in
// the log (as a bare text node inside the each-mount, no <li> wrapper).
async function emptyFallbackPresent(page: Page): Promise<boolean> {
  return await page.evaluate(() => {
    const ol = document.querySelector(".log");
    if (!ol) return false;
    const mount = ol.querySelector("[data-scrml-each-mount]") || ol;
    let txt = "";
    for (const n of mount.childNodes) {
      if (n.nodeType === Node.TEXT_NODE) txt += n.textContent;
    }
    return txt.includes("no events yet");
  });
}

async function focusSurface(page: Page): Promise<void> {
  await page.click(".surface");
  await page.waitForTimeout(80);
}

// Drive raw key down/up so we control release order (the classifier keys off it).
async function keyDown(page: Page, key: string): Promise<void> {
  await page.keyboard.down(key);
  await page.waitForTimeout(80);
}
async function keyUp(page: Page, key: string): Promise<void> {
  await page.keyboard.up(key);
  await page.waitForTimeout(80);
}

// Navigate to the app and wait for the first render.
async function openApp(page: Page): Promise<void> {
  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 15_000 });
  await page.waitForFunction(
    () => {
      const h = document.querySelector(".app h1");
      return !!h && h.textContent!.trim().length > 0;
    },
    undefined,
    { timeout: 10_000 }
  );
}

test("playground-zero — Z-motion release-order classifier", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("console", (m) => {
    const t = m.text();
    if (t.includes("error") || t.includes("Error")) errors.push("console: " + t);
  });

  await openApp(page);

  await test.step("1. chrome renders (title + surface + panels)", async () => {
    const chrome = await page.evaluate(() => {
      const h = document.querySelector(".app h1");
      const surface = document.querySelector("textarea.surface");
      const panels = document.querySelectorAll(".panel").length;
      return { title: h ? h.textContent!.trim() : null, hasSurface: !!surface, panels };
    });
    expect(chrome.title, `title=${chrome.title}`).toBe("playground-zero");
    expect(chrome.hasSurface, "surface present").toBe(true);
    expect(chrome.panels, `${chrome.panels} panels`).toBeGreaterThanOrEqual(4);
  });

  await test.step("2. initial last-classification placeholder", async () => {
    const last0 = await readStatus(page, "Last classification:");
    expect(last0, `(${last0})`).toBe("press keys to begin");
  });

  await test.step("3. empty log shows <empty> fallback", async () => {
    const items0 = await logItems(page);
    const empty0 = await emptyFallbackPresent(page);
    expect(items0, JSON.stringify(items0)).toHaveLength(0);
    expect(empty0, `fallback=${empty0}`).toBe(true);
  });

  await focusSurface(page);

  await test.step("4. single tap classifies as TAP", async () => {
    await keyDown(page, "a");
    await keyUp(page, "a");
    const lastTap = await readStatus(page, "Last classification:");
    expect(lastTap, `(${lastTap})`).toBe("TAP(a)");
  });

  await test.step("5. <each> log grows after tap", async () => {
    const itemsTap = await logItems(page);
    expect(itemsTap, JSON.stringify(itemsTap)).toHaveLength(1);
    expect(itemsTap[0], JSON.stringify(itemsTap)).toBe("TAP(a)");
    // NOTE: the "<empty> fallback cleared" assertion is the tracked xfail,
    // ported as a separate test.fail() below — deliberately NOT checked here.
  });

  await test.step("6. currently-down lists held keys", async () => {
    await keyDown(page, "j"); // earlier key, stays down
    await keyDown(page, "k"); // later key
    const down = await readStatus(page, "Currently down:");
    expect(down, `(${down})`).toBe("j k");
  });

  await test.step("7. release-while-earlier-held classifies as ROLL", async () => {
    await keyUp(page, "k");
    const lastRoll = await readStatus(page, "Last classification:");
    expect(lastRoll, `(${lastRoll})`).toBe("ROLL(k)");
  });

  await test.step("8. earlier key with intervening release classifies as HOLD", async () => {
    await keyUp(page, "j");
    const lastHold = await readStatus(page, "Last classification:");
    expect(lastHold, `(${lastHold})`).toBe("HOLD(j)");
  });

  await test.step("9. log is newest-first", async () => {
    const itemsOrder = await logItems(page);
    expect(itemsOrder.slice(0, 3), JSON.stringify(itemsOrder.slice(0, 3))).toEqual([
      "HOLD(j)",
      "ROLL(k)",
      "TAP(a)",
    ]);
  });

  await test.step("10. clear empties log + resets last-event, <empty> returns", async () => {
    await page.click(".reset-btn");
    await page.waitForTimeout(120);
    const lastClear = await readStatus(page, "Last classification:");
    const itemsClear = await logItems(page);
    const emptyClear = await emptyFallbackPresent(page);
    const downClear = await readStatus(page, "Currently down:");
    expect(lastClear, `(${lastClear})`).toBe("reset");
    expect(itemsClear, JSON.stringify(itemsClear)).toHaveLength(0);
    expect(emptyClear, `fallback=${emptyClear}`).toBe(true);
    expect(downClear, `(${JSON.stringify(downClear)})`).toBe("");
  });

  await test.step("11. no page errors", async () => {
    const unknown = errors.filter((e) => !e.includes("favicon"));
    expect(unknown, unknown.join(" | ")).toHaveLength(0);
  });
});

// --- Tracked xfail (puppeteer `xfail()` → Playwright `test.fail()`) ---
//
// scrml Bug AI: `<each>` with an `<empty>` fallback does not tear down the
// fallback on the empty->non-empty transition, so the first appended <li>
// renders BESIDE the leftover "no events yet" text. The assertion below is the
// check AS WRITTEN (fallback should be gone once the log is non-empty); it
// currently fails, which test.fail() expects, keeping the suite green. If scrml
// fixes the bug the assertion will pass, the test will UNEXPECTEDLY PASS, and
// Playwright will flip the suite red — the signal to delete this annotation and
// fold the check back into step 5 above.
test("Bug AI — <each>/<empty> fallback leak (tracked xfail)", async ({ page }) => {
  test.fail(
    true,
    "scrml Bug AI: <each>/<empty> fallback not torn down on empty->non-empty; filed 2026-06-24"
  );

  await openApp(page);
  await focusSurface(page);

  // A single tap makes the log non-empty (one real <li>).
  await keyDown(page, "a");
  await keyUp(page, "a");

  const itemsTap = await logItems(page);
  expect(itemsTap, JSON.stringify(itemsTap)).toEqual(["TAP(a)"]);

  // The <empty> fallback text MUST be gone now that the list is non-empty.
  // (It isn't — that's the bug this test tracks.)
  const emptyTap = await emptyFallbackPresent(page);
  expect(emptyTap, `fallback still present=${emptyTap}`).toBe(false);
});
