// playground-eleven smoke — flonav: keyboard orchestration nav + modal prompt.
//
// Drives the single keyboard surface with Playwright and asserts (as steps):
//   1. Tree renders (floView spine)
//   2. Initial mode NORMAL
//   3. Initial cursor at "fleet" root
//   4. Auto-collapse ON initially
//   5. step-into (l) -> "scrml"
//   6. step-out (h) -> "fleet"
//   7. into scrml -> first facet "satellite"; j -> next sibling "vcs"; k -> back
//   8. auto-collapse OFF (a) expands all 15 nodes; ON re-folds
//   9. i -> INSERT mode
//  10. typing composes the prompt buffer
//  11. Enter routes the prompt to the cursor node, clears buffer, back to NORMAL
//  12. Esc from INSERT discards + returns to NORMAL
//  13. no page errors
//
// The surface owns the mode (no <input>, no per-row handlers) so it's clear of
// the verified scrml <each>-body defects. One sequential test() + test.step().

import { test, expect, type Page } from "@playwright/test";
import { type ChildProcess } from "child_process";
import path from "path";
import { bootScrmlDev, killScrmlDev } from "../_pw/scrml-dev";

const APP = path.resolve(__dirname, "app.scrml");
const PORT = 3070;
const URL = `http://localhost:${PORT}/`;

let dev: ChildProcess | undefined;
const errors: string[] = [];

test.beforeAll(async () => {
  dev = await bootScrmlDev(APP, PORT);
  await new Promise((r) => setTimeout(r, 1500));
});
test.afterAll(() => killScrmlDev(dev));

async function modeBadge(page: Page): Promise<string> {
  return (await page.textContent(".mode-display .badge"))!.trim();
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
  return (await treeLines(page)).filter((l) => l.trim().length > 0).length;
}
async function readStatus(page: Page, lbl: string): Promise<string | null> {
  return await page.evaluate((label) => {
    for (const r of document.querySelectorAll(".status .row")) {
      const l = r.querySelector(".slabel");
      const v = r.querySelector(".value");
      if (l && v && l.textContent!.trim().startsWith(label)) return v.textContent!.trim();
    }
    return null;
  }, lbl);
}
async function promptText(page: Page): Promise<string> {
  // strip the trailing block caret shown in INSERT
  return ((await page.textContent(".prompt-bar .prompt-text")) ?? "").replace(/█/g, "").trim();
}
async function focusSurface(page: Page): Promise<void> {
  await page.evaluate(() => document.querySelector<HTMLElement>(".surface")?.focus());
}
async function selectedCount(page: Page): Promise<number> {
  return await page.locator(".tree .line.selected").count();
}
async function press(page: Page, key: string): Promise<void> {
  await page.keyboard.press(key);
  await page.waitForTimeout(80);
}

test("playground-eleven — flonav keyboard nav + modal prompt", async ({ page }) => {
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("console", (m) => {
    const t = m.text();
    if (t.includes("error") || t.includes("Error")) errors.push("console: " + t);
  });

  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 15_000 });
  await page.waitForFunction(
    () => {
      const t = document.querySelector(".tree");
      return !!t && t.textContent!.trim().length > 0;
    },
    undefined,
    { timeout: 10_000 }
  );

  await test.step("1. tree renders", async () => {
    expect(await lineCount(page)).toBeGreaterThanOrEqual(3);
  });
  await test.step("2. initial mode NORMAL", async () => {
    expect(await modeBadge(page)).toBe("NORMAL");
  });
  await test.step("3. initial cursor at fleet root", async () => {
    const c = await cursorText(page);
    expect(c, `(${c})`).toContain("fleet");
  });
  await test.step("4. auto-collapse ON initially", async () => {
    expect(await readStatus(page, "Auto-collapse:")).toBe("ON");
  });

  await focusSurface(page);

  await test.step("5. step-into (l) -> scrml", async () => {
    await press(page, "l");
    const c = await cursorText(page);
    expect(c, `(${c})`).toContain("scrml");
  });
  await test.step("6. step-out (h) -> fleet", async () => {
    await press(page, "h");
    const c = await cursorText(page);
    expect(c, `(${c})`).toContain("fleet");
  });
  await test.step("7. into scrml, j/k across facet siblings", async () => {
    await press(page, "l"); // -> scrml
    await press(page, "l"); // -> satellite (first facet)
    expect(await cursorText(page)).toContain("satellite");
    await press(page, "j"); // -> vcs
    expect(await cursorText(page)).toContain("vcs");
    await press(page, "k"); // -> satellite
    expect(await cursorText(page)).toContain("satellite");
  });
  await test.step("8. auto-collapse OFF expands all 15 nodes; ON re-folds", async () => {
    const before = await lineCount(page);
    await press(page, "a"); // OFF
    expect(await readStatus(page, "Auto-collapse:")).toBe("OFF");
    const off = await lineCount(page);
    expect(off, `lines ${before} -> ${off}`).toBe(15);
    await press(page, "a"); // ON
    expect(await readStatus(page, "Auto-collapse:")).toBe("ON");
    expect(await lineCount(page)).toBeLessThan(15);
  });

  await test.step("9. i -> INSERT mode", async () => {
    await press(page, "i");
    expect(await modeBadge(page)).toBe("INSERT");
  });
  await test.step("10. typing composes the prompt buffer", async () => {
    await page.keyboard.type("hi");
    await page.waitForTimeout(80);
    expect(await promptText(page)).toContain("hi");
  });
  await test.step("11. Enter routes the prompt, clears buffer, back to NORMAL", async () => {
    await press(page, "Enter");
    expect(await modeBadge(page)).toBe("NORMAL");
    expect(await promptText(page)).toBe("");
    const first = (await page.textContent(".loglist li")) ?? "";
    expect(first).toContain("hi");
  });
  await test.step("12. Esc from INSERT discards + returns to NORMAL", async () => {
    await press(page, "i");
    expect(await modeBadge(page)).toBe("INSERT");
    await page.keyboard.type("zz");
    await page.waitForTimeout(60);
    await press(page, "Escape");
    expect(await modeBadge(page)).toBe("NORMAL");
    expect(await promptText(page)).toBe("");
  });
  await test.step("13. v enters VISUAL and fully expands the tree", async () => {
    // navigate to a stable start: up to fleet, into scrml, into first facet
    await press(page, "h");
    await press(page, "h");
    await press(page, "l"); // -> scrml
    await press(page, "l"); // -> satellite
    await press(page, "v");
    expect(await modeBadge(page)).toBe("VISUAL");
    expect(await lineCount(page), "VISUAL force-expands all nodes").toBe(15);
  });
  await test.step("14. j/k extend the selection range", async () => {
    expect(await selectedCount(page), "anchor selected").toBeGreaterThanOrEqual(1);
    await press(page, "j");
    await press(page, "j");
    expect(await selectedCount(page), "selection grew").toBeGreaterThanOrEqual(3);
  });
  await test.step("15. i -> INSERT batch-routes one prompt to all selected nodes", async () => {
    await press(page, "i");
    expect(await modeBadge(page)).toBe("INSERT");
    await page.keyboard.type("ping");
    await page.waitForTimeout(80);
    await press(page, "Enter");
    expect(await modeBadge(page)).toBe("NORMAL");
    const first = (await page.textContent(".loglist li")) ?? "";
    expect(first, "batch entry marks multiple targets").toContain("[");
    expect(first).toContain("ping");
    // auto-collapse restored after the VISUAL->INSERT flow
    expect(await readStatus(page, "Auto-collapse:")).toBe("ON");
  });
  await test.step("16. Esc from VISUAL clears selection + restores NORMAL", async () => {
    await press(page, "v");
    expect(await modeBadge(page)).toBe("VISUAL");
    await press(page, "Escape");
    expect(await modeBadge(page)).toBe("NORMAL");
    expect(await selectedCount(page)).toBe(0);
    expect(await readStatus(page, "Auto-collapse:")).toBe("ON");
  });
  await test.step("17. no page errors", async () => {
    const unknown = errors.filter((e) => !e.includes("favicon"));
    expect(unknown, unknown.join(" | ")).toHaveLength(0);
  });
});
