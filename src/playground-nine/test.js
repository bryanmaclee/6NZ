// playground-nine smoke — editor IR + logical traversal.
//
// Boots scrml dev, drives the page with puppeteer. Asserts:
//   1. Tree renders (recursive walk produces lines)
//   2. Initial cursor at root "program"
//   3. Auto-collapse ON initially → only root's path open
//   4. step-into (l) descends to first child
//   5. step-out (h) ascends to parent
//   6. next-sibling (j) moves across siblings
//   7. prev-sibling (k) moves back
//   8. toggle fold (z) collapses/expands cursor node
//   9. auto-collapse OFF (a) expands everything; ON re-folds
//  10. recursion works — a deep path renders all ancestors
//  11. no page errors
//
// Run: node test.js  (NODE_PATH=$scrmlTS/node_modules)

const { spawn } = require("child_process");
const path = require("path");

let puppeteer;
try { puppeteer = require("puppeteer"); }
catch { puppeteer = require("puppeteer-core"); }

const APP = path.resolve(__dirname, "app.scrml");
const PORT = 3059;
const URL = `http://localhost:${PORT}/`;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function bootScrmlDev() {
    return new Promise((resolve, reject) => {
        const proc = spawn("scrml", ["dev", APP, "--port", String(PORT)], { stdio: ["ignore", "pipe", "pipe"] });
        let resolved = false;
        const onData = b => {
            const s = String(b);
            if (resolved) return;
            if (s.includes("Serving") || s.includes(String(PORT))) { resolved = true; resolve(proc); }
        };
        proc.stdout.on("data", onData);
        proc.stderr.on("data", onData);
        proc.on("error", reject);
        setTimeout(() => { if (!resolved) { resolved = true; resolve(proc); } }, 8000);
    });
}

async function readStatus(page, slabel) {
    return await page.evaluate(lbl => {
        const rows = document.querySelectorAll(".row");
        for (const r of rows) {
            const l = r.querySelector(".slabel");
            const v = r.querySelector(".value");
            if (l && v && l.textContent.trim().startsWith(lbl)) return v.textContent.trim();
        }
        return null;
    }, slabel);
}

// Tree is rendered as a single <pre> reactive string; the cursor line
// is prefixed with "> " (Bug V workaround — per-line class binding in a
// for-lift doesn't track @cursorId; single ${...} string does).
async function treeLines(page) {
    return await page.evaluate(() => {
        const pre = document.querySelector(".tree");
        if (!pre) return [];
        return pre.textContent.split("\n");
    });
}

async function cursorText(page) {
    const lines = await treeLines(page);
    const cur = lines.find(l => l.startsWith("> "));
    return cur ? cur.trim() : null;
}

async function lineCount(page) {
    const lines = await treeLines(page);
    return lines.filter(l => l.trim().length > 0).length;
}

async function allLines(page) {
    return await treeLines(page);
}

async function focusTree(page) {
    await page.evaluate(() => { const t = document.querySelector(".tree"); if (t) t.focus(); });
}

async function press(page, key) { await page.keyboard.press(key); await sleep(80); }

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
        await sleep(1500);
        console.log("Launching headless browser...");
        browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
        const page = await browser.newPage();
        page.on("pageerror", e => errors.push("pageerror: " + e.message));
        page.on("console", m => { const t = m.text(); if (t.includes("error") || t.includes("Error")) errors.push("console: " + t); });

        await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 15000 });
        await page.waitForFunction(() => {
            const pre = document.querySelector(".tree");
            return pre && pre.textContent.trim().length > 0;
        }, { timeout: 10000 });

        // 1. Tree renders.
        const n0 = await lineCount(page);
        check("tree renders lines (recursive walk)", n0 >= 3, `${n0} lines`);

        // 2. Cursor at root.
        const cur0 = await cursorText(page);
        check("initial cursor at program root", cur0 && cur0.includes("program"), `(${cur0})`);

        // 3. Auto-collapse ON initially.
        const ac0 = await readStatus(page, "Auto-collapse:");
        check("auto-collapse ON initially", ac0 === "ON");

        await focusTree(page);

        // 4. step-into descends to first child (component Counter).
        await press(page, "l");
        const cur1 = await cursorText(page);
        check("step-into (l) -> first child", cur1 && cur1.includes("Counter"), `(${cur1})`);

        // 5. step-out ascends.
        await press(page, "h");
        const cur2 = await cursorText(page);
        check("step-out (h) -> parent", cur2 && cur2.includes("program"), `(${cur2})`);

        // 6. step into, then next sibling.
        await press(page, "l"); // -> Counter
        await press(page, "j"); // -> App (next sibling of Counter)
        const cur3 = await cursorText(page);
        check("next-sibling (j) -> App", cur3 && cur3.includes("App"), `(${cur3})`);

        // 7. prev sibling back to Counter.
        await press(page, "k");
        const cur4 = await cursorText(page);
        check("prev-sibling (k) -> Counter", cur4 && cur4.includes("Counter"), `(${cur4})`);

        // 8. auto-collapse OFF expands everything (more visible lines).
        //    (Cursor is on Counter from step 7.)
        const before = await lineCount(page);
        await press(page, "a"); // OFF
        const acOff = await readStatus(page, "Auto-collapse:");
        const afterOff = await lineCount(page);
        check("auto-collapse OFF expands all", acOff === "OFF" && afterOff >= before,
            `lines ${before} -> ${afterOff}`);
        check("OFF shows all 10 nodes", afterOff === 10, `(${afterOff} lines)`);

        // 9. Manual fold (z) under auto-collapse OFF — collapses Counter's
        //    subtree, so the visible line count drops.
        const linesPreFold = await lineCount(page);
        await press(page, "z"); // collapse Counter
        const linesPostFold = await lineCount(page);
        check("manual fold (z) collapses subtree", linesPostFold < linesPreFold,
            `lines ${linesPreFold} -> ${linesPostFold}`);
        await press(page, "z"); // expand back

        // 10. Recursion: with everything expanded, a deep path (program >
        //     Counter > increment() > render badge) should all be present.
        const lines = await allLines(page);
        const hasDeep = lines.some(l => l.includes("render badge"));
        check("recursion renders deep descendants", hasDeep,
            hasDeep ? "" : "(no 'render badge' line found)");

        // 11. auto-collapse back ON re-folds.
        await press(page, "a"); // ON again
        const acOn = await readStatus(page, "Auto-collapse:");
        const afterOn = await lineCount(page);
        check("auto-collapse ON re-folds", acOn === "ON" && afterOn < 10,
            `lines ${afterOn}`);

        // 12. No page errors.
        const unknown = errors.filter(e => !e.includes("favicon"));
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
