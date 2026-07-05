// playground-nine smoke — editor IR + logical traversal (Playwright port).
//
// Boots scrml dev, drives the page with Playwright. Asserts (as test.steps):
//   1. Tree renders (recursive walk produces lines)
//   2. Initial cursor at root "program"
//   3. Auto-collapse ON initially → only root's path open
//   4. step-into (l) descends to first child
//   5. step-out (h) ascends to parent
//   6. next-sibling (j) moves across siblings
//   7. prev-sibling (k) moves back
//   8. auto-collapse OFF (a) expands everything → all 10 nodes
//   9. manual fold (z) collapses cursor's subtree
//  10. recursion works — a deep path renders all ancestors
//  11. auto-collapse ON re-folds
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
const PORT = 3059;
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

async function treeLines(page: Page): Promise<string[]> {
  return await page.evaluate(() =>
    [...document.querySelectorAll(".tree .line")].map((el) => el.textContent ?? "")
  );
}

async function cursorText(page: Page): Promise<string | null> {
  const lines = await treeLines(page);
  const cur = lines.find((l) => l.startsWith("> "));
  return cur ? cur.trim() : null;
}

async function lineCount(page: Page): Promise<number> {
  const lines = await treeLines(page);
  return lines.filter((l) => l.trim().length > 0).length;
}

async function focusTree(page: Page): Promise<void> {
  await page.evaluate(() => {
    const t = document.querySelector<HTMLElement>(".tree");
    if (t) t.focus();
  });
}

async function press(page: Page, key: string): Promise<void> {
  await page.keyboard.press(key);
  await page.waitForTimeout(80);
}

test("playground-nine — editor IR + logical traversal", async ({ page }) => {
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("console", (m) => {
    const t = m.text();
    if (t.includes("error") || t.includes("Error")) errors.push("console: " + t);
  });

  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 15_000 });
  await page.waitForFunction(
    () => {
      const pre = document.querySelector(".tree");
      return !!pre && pre.textContent!.trim().length > 0;
    },
    undefined,
    { timeout: 10_000 }
  );

  await test.step("1. tree renders lines (recursive walk)", async () => {
    const n0 = await lineCount(page);
    expect(n0, `${n0} lines`).toBeGreaterThanOrEqual(3);
  });

  await test.step("2. initial cursor at program root", async () => {
    const cur0 = await cursorText(page);
    expect(cur0, `(${cur0})`).toContain("program");
  });

  await test.step("3. auto-collapse ON initially", async () => {
    expect(await readStatus(page, "Auto-collapse:")).toBe("ON");
  });

  await focusTree(page);

  await test.step("4. step-into (l) -> first child (Counter)", async () => {
    await press(page, "l");
    const cur1 = await cursorText(page);
    expect(cur1, `(${cur1})`).toContain("Counter");
  });

  await test.step("5. step-out (h) -> parent (program)", async () => {
    await press(page, "h");
    const cur2 = await cursorText(page);
    expect(cur2, `(${cur2})`).toContain("program");
  });

  await test.step("6. next-sibling (j) -> App", async () => {
    await press(page, "l"); // -> Counter
    await press(page, "j"); // -> App (next sibling of Counter)
    const cur3 = await cursorText(page);
    expect(cur3, `(${cur3})`).toContain("App");
  });

  await test.step("7. prev-sibling (k) -> Counter", async () => {
    await press(page, "k");
    const cur4 = await cursorText(page);
    expect(cur4, `(${cur4})`).toContain("Counter");
  });

  await test.step("8. auto-collapse OFF (a) expands all 10 nodes", async () => {
    const before = await lineCount(page);
    await press(page, "a"); // OFF
    expect(await readStatus(page, "Auto-collapse:")).toBe("OFF");
    const afterOff = await lineCount(page);
    expect(afterOff, `lines ${before} -> ${afterOff}`).toBeGreaterThanOrEqual(before);
    expect(afterOff, `(${afterOff} lines)`).toBe(10);
  });

  await test.step("9. manual fold (z) collapses subtree", async () => {
    const linesPreFold = await lineCount(page);
    await press(page, "z"); // collapse Counter
    const linesPostFold = await lineCount(page);
    expect(linesPostFold, `lines ${linesPreFold} -> ${linesPostFold}`).toBeLessThan(linesPreFold);
    await press(page, "z"); // expand back
  });

  await test.step("10. recursion renders deep descendants", async () => {
    const lines = await treeLines(page);
    const hasDeep = lines.some((l) => l.includes("render badge"));
    expect(hasDeep, hasDeep ? "" : "(no 'render badge' line found)").toBe(true);
  });

  await test.step("11. auto-collapse ON re-folds", async () => {
    await press(page, "a"); // ON again
    expect(await readStatus(page, "Auto-collapse:")).toBe("ON");
    const afterOn = await lineCount(page);
    expect(afterOn, `lines ${afterOn}`).toBeLessThan(10);
  });

  await test.step("12. no page errors", async () => {
    const unknown = errors.filter((e) => !e.includes("favicon"));
    expect(unknown, unknown.join(" | ")).toHaveLength(0);
  });
});
