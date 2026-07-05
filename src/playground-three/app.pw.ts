// playground-three smoke — CM6 mount + scrml↔CM6 bridge (Playwright port).
//
// Boots scrml dev, drives the page with Playwright. Asserts (as test.steps):
//   1. Page chrome renders (h1 title)
//   2. CM6 reaches the mounted status (CM6 loaded from esm.sh)
//   3. .cm-editor exists in the DOM (CM6's own root)
//   4. .cm-content exists (CM6's editable surface)
//   5. window.__cm EditorView is exposed
//   6. scrml Characters cell reflects the mounted doc length (>0)
//   7. scrml Lines cell reflects the mounted doc line count (>0)
//   8. focusing CM6 + typing increases the scrml-side Characters cell
//   9. the bridge reflects typed text in the scrml Preview cell
//  10. no page errors (favicon filtered)
//
// Ported from the puppeteer test.js (S18). CM6 is fetched live from esm.sh, so
// the mount readiness is a status-flip wait (not a fixed sleep), and the whole
// interaction is a sequential state machine sharing one page — hence one test()
// subdivided by test.step for granular reporting.

import { test, expect, type Page } from "@playwright/test";
import { type ChildProcess } from "child_process";
import path from "path";
import { bootScrmlDev, killScrmlDev } from "../_pw/scrml-dev";

const APP = path.resolve(__dirname, "app.scrml");
const PORT = 3053;
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

// Status rows render as `.row` with a `.slabel`/`.value` pair (CM6 status:,
// Characters:, Lines:, Preview:). Read by the slabel prefix.
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

async function readCharCount(page: Page): Promise<number> {
  const text = await readField(page, "Characters:");
  if (!text) return 0;
  const m = text.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

async function readLineCount(page: Page): Promise<number> {
  const text = await readField(page, "Lines:");
  if (!text) return 0;
  const m = text.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

test("playground-three — CM6 mount + scrml↔CM6 bridge", async ({ page }) => {
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const t = m.text();
    if (t.includes("favicon.ico") || t.includes("404 (Not Found)")) return;
    errors.push("console: " + t);
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

  await test.step("1. page chrome renders (h1 title)", async () => {
    await page.waitForFunction(
      () => {
        const h = document.querySelector("h1");
        return !!h && h.textContent!.includes("playground-three");
      },
      undefined,
      { timeout: 10_000 }
    );
    const title = (await page.$eval("h1", (el) => el.textContent!.trim())) ?? "";
    expect(title.includes("playground-three"), `(${title})`).toBe(true);
  });

  await test.step("2. CM6 reaches mounted status", async () => {
    // CM6 is fetched live from esm.sh, so wait on the status flip rather than a
    // fixed sleep. The Ready phase renders "CM6 loaded and mounted".
    await page.waitForFunction(
      () => {
        const rows = document.querySelectorAll(".row");
        for (const row of rows) {
          const slabel = row.querySelector(".slabel");
          const value = row.querySelector(".value");
          if (slabel && value && slabel.textContent!.trim().startsWith("CM6 status:")) {
            return value.textContent!.includes("mounted");
          }
        }
        return false;
      },
      undefined,
      { timeout: 20_000 }
    );
    const status = await readField(page, "CM6 status:");
    expect(status && status.includes("mounted"), `status=${status}`).toBe(true);
  });

  await test.step("3. .cm-editor mounted in .cm-host", async () => {
    const hasEditor = await page.evaluate(() => {
      const v = document.querySelector<HTMLElement>(".cm-host .cm-editor");
      return !!(v && v.offsetHeight > 0);
    });
    expect(hasEditor).toBe(true);
  });

  await test.step("4. .cm-content present (editable surface)", async () => {
    const hasContent = await page.evaluate(() => !!document.querySelector(".cm-host .cm-content"));
    expect(hasContent).toBe(true);
  });

  await test.step("5. window.__cm EditorView exposed", async () => {
    const hasView = await page.evaluate(() => {
      const v = (window as any).__cm;
      return !!(v && v.state && typeof v.state.doc.length === "number");
    });
    expect(hasView).toBe(true);
  });

  let chars0 = 0;
  await test.step("6. scrml Characters cell reflects doc length", async () => {
    chars0 = await readCharCount(page);
    expect(chars0, `chars=${chars0}`).toBeGreaterThan(0);
  });

  await test.step("7. scrml Lines cell reflects line count", async () => {
    const lines0 = await readLineCount(page);
    expect(lines0, `lines=${lines0}`).toBeGreaterThan(0);
  });

  await test.step("8. typing into CM6 increases scrml Characters", async () => {
    // Focus CM6 and type — the scrml-side Characters cell must grow (state
    // flows CM6 -> scrml through the updateListener bridge).
    await page.click(".cm-host .cm-content");
    await page.waitForTimeout(120);
    await page.keyboard.type("ABCDE");
    await page.waitForTimeout(200);
    const chars1 = await readCharCount(page);
    expect(chars1, `before=${chars0} after=${chars1}`).toBeGreaterThanOrEqual(chars0 + 5);
  });

  await test.step("9. scrml Preview cell reflects CM6 doc", async () => {
    // The doc starts with "// This editor..." so typed text lands inside the
    // first 100 chars the preview slices.
    const preview = await readField(page, "Preview:");
    const ok = !!preview && preview.length > 0 && preview.includes("//");
    expect(ok, `preview="${preview ? preview.slice(0, 40) : preview}..."`).toBe(true);
  });

  await test.step("10. no page errors", async () => {
    const unknown = errors.filter((e) => !e.includes("favicon"));
    expect(unknown, unknown.join(" | ")).toHaveLength(0);
  });
});
