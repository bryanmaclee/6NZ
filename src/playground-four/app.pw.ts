// playground-four smoke — keystroke-granular undo TREE on a line buffer.
//
// Boots scrml dev, drives the page with Playwright. Asserts (as test.steps):
//   1. Tree renders rows (treeRowsOf flatten + <each>, §17.7)
//   2. Initial current node is the root "#0 root"
//   3. Mode badge shows INSERT by default (<match> on @mode, engine initial=.Insert)
//   4. §4.17 GUARD: tree text shows INTERPOLATED labels, not literal "${...}"
//      (this is the <pre>${...} raw-content silent-drop regression; <pre>->div fix)
//   5. INSERT typing changes the buffer (renderBuffer caret)
//   6. INSERT typing grows the undo tree (one node per keystroke)
//   7. current node tracks the newest edit ("#3 ins 'c'")
//   8. Esc -> NORMAL badge
//   9. u undoes: current node moves to its parent (buffer reverts)
//  10. Ctrl+R redoes: current node moves to the youngest child
//  11. branch + chronological walk: g- / g+ (-/=) move across branches by id
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
const PORT = 3054;
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

// Tree rows: <each in=@treeRows> renders one `.treerow` per node, with a
// reactive `class:current` binding. The current row also carries a textual
// "> " prefix; non-current rows are "  "-prefixed.
async function treeRows(page: Page): Promise<string[]> {
  return await page.evaluate(() =>
    [...document.querySelectorAll(".tree .treerow")].map((el) => el.textContent ?? "")
  );
}

async function rowCount(page: Page): Promise<number> {
  const rows = await treeRows(page);
  return rows.filter((r) => r.trim().length > 0).length;
}

// Current node label (the row with class:current — its text is "> #N ...").
async function currentRow(page: Page): Promise<string | null> {
  return await page.evaluate(() => {
    const cur = document.querySelector(".tree .treerow.current");
    return cur ? cur.textContent!.trim() : null;
  });
}

async function bufferText(page: Page): Promise<string | null> {
  return await page.evaluate(() => {
    const b = document.querySelector(".buffer");
    return b ? b.textContent : null;
  });
}

// Active mode badge from the <match for=Mode on=@mode> projection.
async function activeMode(page: Page): Promise<string> {
  return await page.evaluate(() => {
    const ins = document.querySelector<HTMLElement>(".badge.insert");
    const nor = document.querySelector<HTMLElement>(".badge.normal");
    if (ins && ins.offsetParent) return "INSERT";
    if (nor && nor.offsetParent) return "NORMAL";
    return "NONE";
  });
}

async function focusSurface(page: Page): Promise<void> {
  await page.evaluate(() => {
    const s = document.querySelector<HTMLElement>(".surface");
    if (s) s.focus();
  });
  await page.waitForTimeout(40);
}

async function press(page: Page, key: string): Promise<void> {
  await page.keyboard.press(key);
  await page.waitForTimeout(80);
}

test("playground-four — keystroke-granular undo TREE on a line buffer", async ({ page }) => {
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const t = m.text();
    if (t.includes("favicon") || t.includes("404")) return;
    errors.push("console: " + t);
  });

  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 15_000 });
  await page.waitForFunction(
    () => {
      const t = document.querySelector(".tree");
      return !!t && t.querySelectorAll(".treerow").length > 0;
    },
    undefined,
    { timeout: 10_000 }
  );

  await test.step("1. tree renders rows (treeRowsOf + <each>)", async () => {
    const n0 = await rowCount(page);
    expect(n0, `${n0} rows`).toBeGreaterThanOrEqual(1);
  });

  await test.step("2. initial current node is #0 root", async () => {
    const cur0 = await currentRow(page);
    expect(cur0, `(${cur0})`).toContain("#0");
    expect(cur0, `(${cur0})`).toContain("root");
  });

  await test.step("3. mode badge INSERT by default", async () => {
    expect(await activeMode(page)).toBe("INSERT");
  });

  await test.step("4. §4.17 guard: no literal '${' in tree text", async () => {
    const rows0 = await treeRows(page);
    const hasLiteralTemplate = rows0.some((r) => r.includes("${"));
    expect(
      hasLiteralTemplate,
      hasLiteralTemplate ? `(found: ${rows0.find((r) => r.includes("${"))})` : ""
    ).toBe(false);
  });

  await focusSurface(page);

  await test.step("5/6. INSERT typing changes the buffer AND grows the tree", async () => {
    const rowsBeforeType = await rowCount(page);
    await press(page, "a");
    await press(page, "b");
    await press(page, "c");
    const bufAfterType = await bufferText(page);
    const rowsAfterType = await rowCount(page);
    expect(bufAfterType, `(buffer=${JSON.stringify(bufAfterType)})`).toContain("abc");
    expect(rowsAfterType, `rows ${rowsBeforeType} -> ${rowsAfterType}`).toBe(rowsBeforeType + 3);
  });

  await test.step("7. current node tracks newest edit (#3 ins 'c')", async () => {
    const curNewest = await currentRow(page);
    expect(curNewest, `(${curNewest})`).toContain("#3");
    expect(curNewest, `(${curNewest})`).toContain("'c'");
  });

  await test.step("8. Esc -> NORMAL badge", async () => {
    await press(page, "Escape");
    expect(await activeMode(page)).toBe("NORMAL");
  });

  await test.step("9. u undo -> parent node (#2), buffer reverts", async () => {
    await press(page, "u");
    const curAfterU = await currentRow(page);
    const bufAfterU = await bufferText(page);
    expect(curAfterU, `(${curAfterU})`).toContain("#2");
    expect(bufAfterU, `(buffer=${JSON.stringify(bufAfterU)})`).toContain("ab");
    expect(bufAfterU, `(buffer=${JSON.stringify(bufAfterU)})`).not.toContain("abc");
  });

  await test.step("10. Ctrl+R redo -> youngest child (#3)", async () => {
    await page.keyboard.down("Control");
    await page.keyboard.press("r");
    await page.keyboard.up("Control");
    await page.waitForTimeout(80);
    const curAfterRedo = await currentRow(page);
    expect(curAfterRedo, `(${curAfterRedo})`).toContain("#3");
  });

  // 11. Branch + chronological walk.
  //   We are at #3 (chain 0->1->2->3 = "abc"). Undo twice to #1, switch to
  //   insert, type a different char -> creates a NEW branch child #4 off #1.
  //   Tree now branches at #1: [#2->#3] and [#4]. Then -/= (g-/g+) walk by id
  //   across BOTH branches chronologically (id order), exercising the branch nav.
  await test.step("11a. branch created: new node #4 off #1", async () => {
    await press(page, "u"); // #3 -> #2
    await press(page, "u"); // #2 -> #1
    await press(page, "i"); // Normal -> Insert
    await press(page, "Z"); // new branch: commit #4 (ins 'Z') off #1
    const rowsAfterBranch = await rowCount(page);
    const curBranch = await currentRow(page);
    expect(curBranch, `(now=${curBranch}, rows=${rowsAfterBranch})`).toContain("#4");
    expect(curBranch, `(now=${curBranch}, rows=${rowsAfterBranch})`).toContain("'Z'");
    expect(rowsAfterBranch, `(now=${curBranch}, rows=${rowsAfterBranch})`).toBe(5);
  });

  await test.step("11b. g- (-) chronological back across branches (#4 -> #3)", async () => {
    await press(page, "Escape"); // Insert -> Normal
    await press(page, "-"); // g-: #4 -> #3 (crosses branch boundary by id)
    const curMinus = await currentRow(page);
    expect(curMinus, `(${curMinus})`).toContain("#3");
  });

  await test.step("11c. g+ (=) chronological forward across branches (#3 -> #4)", async () => {
    await press(page, "="); // g+: #3 -> #4
    const curPlus = await currentRow(page);
    expect(curPlus, `(${curPlus})`).toContain("#4");
  });

  await test.step("12. no page errors", async () => {
    const unknown = errors.filter((e) => !e.includes("favicon"));
    expect(unknown, unknown.join(" | ")).toHaveLength(0);
  });
});
