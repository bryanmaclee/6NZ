// playground-ten smoke — relevance-region navigator + §36 input-state (Playwright port).
//
// Boots scrml dev, drives the page with Playwright. Live-verifies the v0.7.0
// fixes the rebuild restores, on a real runtime surface (as test.steps):
//   1. List renders 4 regions (for-lift)
//   2. Region title "handleKey(e)" renders VERBATIM (Bug Z — rename-in-string)
//   3. URL "https://..." renders verbatim (Bug X — // in string)
//   4. Initial focus = region 0; badge = NAV
//   5. j focuses next, k focuses prev (navigation)
//   6. exactly one .focused row, and it MOVES with j/k (Bug-V — class:focused
//      on for-lift reading global @focusId; was frozen-on-create)
//   7. Enter toggles Nav<->Edit; badge updates; @transitions increments
//      (Bug AB — bare @mode=.Variant write routes through engine dispatcher,
//      fires <onTransition>)
//   8. churn: o inserts / x removes; .focused stays correct (Bug-V under churn)
//   9. §36: cursor x/y + lastKey readout present (NOTE: markup-interp reactivity
//      of input-state reads is the open dogfood question — observed, not asserted)
//  10. no page errors
//
// Ported from the puppeteer test.js (S18). The interaction is an inherently
// sequential state machine (each keypress builds on the last), so it is one
// test() sharing a page, subdivided by test.step for granular reporting.

import { test, expect, type Page } from "@playwright/test";
import { type ChildProcess } from "child_process";
import path from "path";
import { bootScrmlDev, killScrmlDev } from "../_pw/scrml-dev";

const APP = path.resolve(__dirname, "app.scrml");
const PORT = 3060;
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

async function regionTitles(page: Page): Promise<string[]> {
  return await page.evaluate(() =>
    Array.from(document.querySelectorAll(".region .rtitle")).map((e) => e.textContent!.trim())
  );
}

async function focusedTitles(page: Page): Promise<string[]> {
  return await page.evaluate(() =>
    Array.from(document.querySelectorAll(".region.focused .rtitle")).map((e) =>
      e.textContent!.trim()
    )
  );
}

async function text(page: Page, sel: string): Promise<string | null> {
  return await page.evaluate((s) => {
    const e = document.querySelector(s);
    return e ? e.textContent!.trim() : null;
  }, sel);
}

async function focusNav(page: Page): Promise<void> {
  await page.evaluate(() => {
    const t = document.querySelector<HTMLElement>(".nav-pane");
    if (t) t.focus();
  });
}

async function press(page: Page, key: string): Promise<void> {
  await page.keyboard.press(key);
  await page.waitForTimeout(80);
}

test("playground-ten — relevance-region navigator + §36 input-state", async ({ page }) => {
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("console", (m) => {
    const t = m.text();
    if (/error/i.test(t)) errors.push("console: " + t);
  });

  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 15_000 });
  await page.waitForFunction(() => document.querySelectorAll(".region").length > 0, undefined, {
    timeout: 10_000,
  });

  // 1. list renders.
  await test.step("1. list renders 4 regions", async () => {
    const titles0 = await regionTitles(page);
    expect(titles0.length, `(${titles0.length})`).toBe(4);
  });

  // 2. Bug Z — fn-name-in-string preserved verbatim.
  await test.step("2. Bug Z: title 'handleKey(e)' verbatim", async () => {
    const titles0 = await regionTitles(page);
    expect(titles0, `(${JSON.stringify(titles0)})`).toContain("handleKey(e)");
  });

  // 3. Bug X — URL with // preserved.
  await test.step("3. Bug X: URL with // renders", async () => {
    const url0 = await text(page, ".region .rurl");
    expect(!!url0 && url0.includes("https://"), `(${url0})`).toBe(true);
  });

  // 4. initial focus + badge.
  await test.step("4. initial: exactly one focused row", async () => {
    const f0 = await focusedTitles(page);
    expect(f0.length, `(${f0.length})`).toBe(1);
  });

  await test.step("4b. initial focus = handleKey(e)", async () => {
    const f0 = await focusedTitles(page);
    expect(f0[0], `(${f0[0]})`).toBe("handleKey(e)");
  });

  await test.step("4c. initial badge = NAV", async () => {
    const badge0 = await text(page, ".badge");
    expect(badge0, `(${badge0})`).toBe("NAV");
  });

  await focusNav(page);

  // 5 + 6. j moves focus; exactly one focused; Bug-V follows.
  await test.step("5. j -> focus next (focusNext)", async () => {
    await press(page, "j");
    const f1 = await focusedTitles(page);
    expect(
      f1.length === 1 && f1[0] === "focusNext()",
      `(${JSON.stringify(f1)})`
    ).toBe(true);
  });

  await test.step("6. j -> focus modeBadge(m)", async () => {
    await press(page, "j");
    const f2 = await focusedTitles(page);
    expect(
      f2.length === 1 && f2[0] === "modeBadge(m)",
      `(${JSON.stringify(f2)})`
    ).toBe(true);
  });

  await test.step("6b. k -> focus back to focusNext()", async () => {
    await press(page, "k");
    const f3 = await focusedTitles(page);
    expect(
      f3.length === 1 && f3[0] === "focusNext()",
      `(${JSON.stringify(f3)})`
    ).toBe(true);
  });

  // 7. Enter toggles mode; transitions increments (Bug AB).
  await test.step("7. Enter -> badge EDIT + Bug AB: onTransition fires", async () => {
    const tr0 = await text(page, ".value.tr");
    await press(page, "Enter");
    const badge1 = await text(page, ".badge");
    const tr1 = await text(page, ".value.tr");
    expect(badge1, `(${badge1})`).toBe("EDIT");
    expect(tr0 === "0" && tr1 === "1", `(${tr0} -> ${tr1})`).toBe(true);
  });

  await test.step("7b. Enter again -> NAV + transitions 2", async () => {
    await press(page, "Enter");
    const tr2 = await text(page, ".value.tr");
    const badge2 = await text(page, ".badge");
    expect(badge2 === "NAV" && tr2 === "2", `(${badge2}, ${tr2})`).toBe(true);
  });

  // 8. churn: insert + remove, focused stays singular + correct (Bug-V churn).
  // cursor on focusNext() (id 1). 'o' inserts region_4 after it and focuses it.
  await test.step("8. o -> inserts region (count 5), focuses new region", async () => {
    await press(page, "o");
    const afterInsert = await regionTitles(page);
    const fIns = await focusedTitles(page);
    expect(afterInsert.length, `(${afterInsert.length})`).toBe(5);
    expect(fIns.length, `(${fIns.length})`).toBe(1);
    expect(fIns[0], `(${fIns[0]})`).toBe("region_4()");
  });

  await test.step("8b. x -> removes region (count 4), exactly one focused", async () => {
    await press(page, "x");
    const afterRemove = await regionTitles(page);
    const fRem = await focusedTitles(page);
    expect(afterRemove.length, `(${afterRemove.length})`).toBe(4);
    expect(fRem.length, `(${fRem.length})`).toBe(1);
  });

  // 9. §36 input-state readout present (reactivity is the open question -> NOTE).
  await test.step("9. §36: cursor x/y readout present", async () => {
    const mx0 = await text(page, ".value.mx");
    const my0 = await text(page, ".value.my");
    expect(mx0 !== null && my0 !== null, `(x=${mx0} y=${my0})`).toBe(true);

    await page.mouse.move(123, 77);
    await page.waitForTimeout(150);
    const mx1 = await text(page, ".value.mx");
    if (mx1 !== mx0) {
      console.log(`  NOTE: §36 mouse markup-interp IS reactive on move (x ${mx0} -> ${mx1})`);
    } else {
      console.log(
        `  NOTE: §36 mouse markup-interp did NOT re-render on move (x stayed ${mx0}) — reads update in a loop/event, not bare markup interp`
      );
    }
    const lk0 = await text(page, ".value.lk");
    console.log(`  NOTE: §36 keys.lastKey readout = ${JSON.stringify(lk0)}`);
  });

  // 10. no page errors.
  await test.step("10. no page errors", async () => {
    const unknown = errors.filter((e) => !e.includes("favicon"));
    expect(unknown, unknown.join(" | ")).toHaveLength(0);
  });
});
