// playground-three smoke — CM6 mount + scrml↔CM6 bridge.
//
// Boots scrml dev, drives the page with puppeteer, asserts:
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
// Run: NODE_PATH=$scrmlTS/node_modules node src/playground-three/test.js
//
// Requires bun + puppeteer-core (or puppeteer) installed at the
// monorepo root.

const { spawn } = require("child_process");
const path = require("path");

let puppeteer;
try { puppeteer = require("puppeteer"); }
catch { puppeteer = require("puppeteer-core"); }

const APP = path.resolve(__dirname, "app.scrml");
const PORT = 3053;
const URL = `http://localhost:${PORT}/`;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function bootScrmlDev() {
    return new Promise((resolve, reject) => {
        const proc = spawn("scrml", ["dev", APP, "--port", String(PORT)], { stdio: ["ignore", "pipe", "pipe"] });
        let resolved = false;
        const onData = b => {
            const s = String(b);
            if (resolved) return;
            if (s.includes("Serving") || s.includes("Listening") || s.includes("listening") || s.includes(String(PORT))) {
                resolved = true;
                resolve(proc);
            }
        };
        proc.stdout.on("data", onData);
        proc.stderr.on("data", onData);
        proc.on("error", reject);
        proc.on("exit", (code) => { if (!resolved) reject(new Error("dev server exited early code=" + code)); });
        setTimeout(() => { if (!resolved) { resolved = true; resolve(proc); } }, 8000); // fallback
    });
}

// Status rows render as `.row` with a `.slabel`/`.value` pair (CM6 status:,
// Characters:, Lines:, Preview:). Read by the slabel prefix.
async function readField(page, label) {
    return page.$$eval(".row", (rows, label) => {
        for (const row of rows) {
            const slabel = row.querySelector(".slabel");
            const value = row.querySelector(".value");
            if (slabel && value && slabel.textContent.trim().startsWith(label)) {
                return value.textContent.trim();
            }
        }
        return null;
    }, label);
}

async function readCharCount(page) {
    const text = await readField(page, "Characters:");
    if (!text) return 0;
    const m = text.match(/(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
}

async function readLineCount(page) {
    const text = await readField(page, "Lines:");
    if (!text) return 0;
    const m = text.match(/(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
}

const results = [];
const errors = [];
function check(name, ok, detail) {
    results.push({ name, ok, detail });
    console.log(`  ${ok ? "PASS" : "FAIL"}: ${name}${detail ? " " + detail : ""}`);
}

async function run() {
    let dev, browser;
    try {
        console.log("Booting scrml dev...");
        dev = await bootScrmlDev();
        await sleep(1500); // give the dev server a moment to start serving
        console.log("Launching headless browser...");
        browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
        const page = await browser.newPage();
        const pageErrors = [];
        page.on("pageerror", (e) => pageErrors.push("pageerror: " + e.message));
        page.on("console", (msg) => {
            if (msg.type() !== "error") return;
            const t = msg.text();
            if (t.includes("favicon.ico") || t.includes("404 (Not Found)")) return;
            pageErrors.push("console: " + t);
        });

        await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 15000 });

        // 1. Page chrome renders.
        await page.waitForFunction(() => {
            const h = document.querySelector("h1");
            return h && h.textContent.includes("playground-three");
        }, { timeout: 10000 });
        const title = await page.$eval("h1", el => el.textContent.trim());
        check("page chrome renders (h1 title)", title.includes("playground-three"), `(${title})`);

        // 2. CM6 reaches the mounted status. CM6 is fetched live from esm.sh, so
        //    wait on the status flip rather than a fixed sleep. The Ready phase
        //    renders "CM6 loaded and mounted".
        await page.waitForFunction(() => {
            const rows = document.querySelectorAll(".row");
            for (const row of rows) {
                const slabel = row.querySelector(".slabel");
                const value = row.querySelector(".value");
                if (slabel && value && slabel.textContent.trim().startsWith("CM6 status:")) {
                    return value.textContent.includes("mounted");
                }
            }
            return false;
        }, { timeout: 20000 });
        const status = await readField(page, "CM6 status:");
        check("CM6 reaches mounted status", status && status.includes("mounted"), `status=${status}`);

        // 3. CM6 root mounts on the scrml-rendered .cm-host div.
        const hasEditor = await page.evaluate(() => {
            const v = document.querySelector(".cm-host .cm-editor");
            return !!(v && v.offsetHeight > 0);
        });
        check(".cm-editor mounted in .cm-host", hasEditor);

        // 4. CM6 editable surface present.
        const hasContent = await page.evaluate(() => !!document.querySelector(".cm-host .cm-content"));
        check(".cm-content present (editable surface)", hasContent);

        // 5. EditorView exposed on window.__cm.
        const hasView = await page.evaluate(() => {
            const v = window.__cm;
            return !!(v && v.state && typeof v.state.doc.length === "number");
        });
        check("window.__cm EditorView exposed", hasView);

        // 6. scrml Characters cell reflects the mounted doc length.
        const chars0 = await readCharCount(page);
        check("scrml Characters cell reflects doc length", chars0 > 0, `chars=${chars0}`);

        // 7. scrml Lines cell reflects the mounted doc line count.
        const lines0 = await readLineCount(page);
        check("scrml Lines cell reflects line count", lines0 > 0, `lines=${lines0}`);

        // 8. Focus CM6 and type — the scrml-side Characters cell must grow
        //    (state flows CM6 -> scrml through the updateListener bridge).
        await page.click(".cm-host .cm-content");
        await sleep(120);
        await page.keyboard.type("ABCDE");
        await sleep(200);
        const chars1 = await readCharCount(page);
        check("typing into CM6 increases scrml Characters", chars1 >= chars0 + 5,
            `before=${chars0} after=${chars1}`);

        // 9. The bridge reflects typed text in the scrml Preview cell. The doc
        //    starts with "// This editor..." so typed text lands inside the
        //    first 100 chars the preview slices.
        const preview = await readField(page, "Preview:");
        check("scrml Preview cell reflects CM6 doc", preview && preview.length > 0 && preview.includes("//"),
            `preview="${preview ? preview.slice(0, 40) : preview}..."`);

        // 10. No page errors.
        const unknown = pageErrors.filter(e => !e.includes("favicon"));
        check("no page errors", unknown.length === 0, unknown.join(" | "));

    } catch (e) {
        console.error("HARNESS ERROR:", e.message);
        check("harness", false, e.message);
    } finally {
        if (browser) await browser.close();
        if (dev) try { dev.kill(); } catch {}
    }

    const passed = results.filter(r => r.ok).length;
    const failed = results.length - passed;
    console.log(`\n========================`);
    console.log(`  ${passed} passed, ${failed} failed`);
    console.log(`========================`);
    if (failed) {
        console.log("\nFAILURES:");
        for (const r of results) if (!r.ok) console.log("  - " + r.name + (r.detail ? " -- " + r.detail : ""));
    }
    process.exit(failed ? 1 : 0);
}

run();
