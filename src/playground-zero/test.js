// playground-zero smoke — Z-motion release-order classifier (SPEC v0.4 §5).
//
// Boots scrml dev, drives the page with puppeteer. Asserts:
//   1. Chrome renders (h1 "playground-zero", input surface, panels)
//   2. Initial "Last classification" reads "press keys to begin"
//   3. Empty log shows the <empty> fallback "no events yet"
//   4. A single tap (down+up, nothing else held) classifies as TAP
//   5. The <each>-rendered log grows by one <li> after the tap
//   6. The <empty> fallback clears once the log is non-empty
//      [XFAIL: Bug AI — scrml <each>/<empty> fallback is not torn down on the
//       empty->non-empty transition; filed to scrml 2026-06-24. Flips to XPASS
//       (suite fails) when scrml fixes it, prompting removal of the xfail.]
//   7. "Currently down" reflects held keys mid-gesture
//   8. A roll (A down, B down, release B) classifies B as ROLL
//   9. Releasing the still-held earlier key classifies it as HOLD
//  10. Log keeps newest-first order (most recent classification on top)
//  11. Clear button empties the log + resets last-event, <empty> returns
//  12. no page errors
//
// Run: node test.js  (NODE_PATH=$scrmlTS/node_modules)

const { spawn } = require("child_process");
const path = require("path");

let puppeteer;
try { puppeteer = require("puppeteer"); }
catch { puppeteer = require("puppeteer-core"); }

const APP = path.resolve(__dirname, "app.scrml");
const PORT = 3050;
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

// Read a status .value by its sibling .label prefix (e.g. "Last classification:").
async function readStatus(page, label) {
    return await page.evaluate(lbl => {
        const rows = document.querySelectorAll(".status .row, .row");
        for (const r of rows) {
            const l = r.querySelector(".label");
            const v = r.querySelector(".value");
            if (l && v && l.textContent.trim().startsWith(lbl)) return v.textContent.trim();
        }
        return null;
    }, label);
}

// The event log is an <ol class="log"> rendered per-entry via `<each in=@log>` —
// one <li> per classification. The `<empty : "no events yet">` fallback renders
// its body as a bare text node inside the each-mount (no <li> wrapper), so the
// two are read separately: `logItems()` returns the real <li> entries, while
// `emptyFallbackPresent()` reports whether the "no events yet" text is mounted.
async function logItems(page) {
    return await page.evaluate(() => {
        return [...document.querySelectorAll(".log li")].map(el => el.textContent.trim());
    });
}

// True iff the <empty> fallback text "no events yet" is currently in the log.
async function emptyFallbackPresent(page) {
    return await page.evaluate(() => {
        const ol = document.querySelector(".log");
        if (!ol) return false;
        // Direct text content of the each-mount, excluding any <li> entries.
        const mount = ol.querySelector("[data-scrml-each-mount]") || ol;
        let txt = "";
        for (const n of mount.childNodes) {
            if (n.nodeType === Node.TEXT_NODE) txt += n.textContent;
        }
        return txt.includes("no events yet");
    });
}

async function focusSurface(page) {
    await page.click(".surface");
    await sleep(80);
}

// Drive raw key down/up so we control release order (the classifier keys off it).
async function keyDown(page, key) { await page.keyboard.down(key); await sleep(80); }
async function keyUp(page, key) { await page.keyboard.up(key); await sleep(80); }

const results = [];
const errors = [];
function check(name, ok, detail) {
    results.push({ name, ok, detail });
    console.log(`  ${ok ? "PASS" : "FAIL"}: ${name}${detail ? " " + detail : ""}`);
}
// Known-failing check tied to an upstream bug. `ok` is the assertion as written
// (true == bug fixed). While the bug is present it reports XFAIL and does NOT fail
// the suite; if it starts passing it reports XPASS and DOES fail the suite — a loud
// signal to delete the xfail and promote the check back to a plain `check()`.
function xfail(name, ok, detail, ref) {
    const xpass = ok === true;
    results.push({ name, detail, xfail: true, xpass, ref });
    if (xpass) {
        console.log(`  XPASS: ${name} -- now PASSING; ${ref} appears FIXED — remove the xfail${detail ? " (" + detail + ")" : ""}`);
    } else {
        console.log(`  XFAIL: ${name} (known: ${ref})${detail ? " " + detail : ""}`);
    }
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
            const h = document.querySelector(".app h1");
            return h && h.textContent.trim().length > 0;
        }, { timeout: 10000 });

        // 1. Chrome renders.
        const chrome = await page.evaluate(() => {
            const h = document.querySelector(".app h1");
            const surface = document.querySelector("textarea.surface");
            const panels = document.querySelectorAll(".panel").length;
            return { title: h ? h.textContent.trim() : null, hasSurface: !!surface, panels };
        });
        check("chrome renders (title + surface + panels)",
            chrome.title === "playground-zero" && chrome.hasSurface && chrome.panels >= 4,
            `title=${chrome.title} surface=${chrome.hasSurface} panels=${chrome.panels}`);

        // 2. Initial last-classification message.
        const last0 = await readStatus(page, "Last classification:");
        check("initial last-classification placeholder", last0 === "press keys to begin", `(${last0})`);

        // 3. Empty log shows the <empty> fallback (no real <li> entries yet).
        const items0 = await logItems(page);
        const empty0 = await emptyFallbackPresent(page);
        check("empty log shows <empty> fallback",
            items0.length === 0 && empty0, `items=${JSON.stringify(items0)} fallback=${empty0}`);

        await focusSurface(page);

        // 4. A single tap (down+up, nothing else held) -> TAP.
        await keyDown(page, "a");
        await keyUp(page, "a");
        const lastTap = await readStatus(page, "Last classification:");
        check("single tap classifies as TAP", lastTap === "TAP(a)", `(${lastTap})`);

        // 5. The <each>-rendered log now has one real entry, and the <empty>
        //    fallback text must be GONE now that the list is non-empty.
        const itemsTap = await logItems(page);
        const emptyTap = await emptyFallbackPresent(page);
        check("<each> log grows after tap",
            itemsTap.length === 1 && itemsTap[0] === "TAP(a)", JSON.stringify(itemsTap));
        xfail("<empty> fallback cleared once log is non-empty",
            emptyTap === false, `fallback still present=${emptyTap}`,
            "Bug AI — scrml <each>/<empty> codegen");

        // 6. "Currently down" reflects held keys mid-gesture.
        await keyDown(page, "j"); // earlier key, stays down
        await keyDown(page, "k"); // later key
        const down = await readStatus(page, "Currently down:");
        check("currently-down lists held keys", down === "j k", `(${down})`);

        // 7. Release the later key while the earlier is still down -> ROLL.
        await keyUp(page, "k");
        const lastRoll = await readStatus(page, "Last classification:");
        check("release-while-earlier-held classifies as ROLL", lastRoll === "ROLL(k)", `(${lastRoll})`);

        // 8. Release the earlier key — a release happened during its window -> HOLD.
        await keyUp(page, "j");
        const lastHold = await readStatus(page, "Last classification:");
        check("earlier key with intervening release classifies as HOLD", lastHold === "HOLD(j)", `(${lastHold})`);

        // 9. Newest classification is at the top of the log (newest-first).
        const itemsOrder = await logItems(page);
        check("log is newest-first",
            itemsOrder[0] === "HOLD(j)" && itemsOrder[1] === "ROLL(k)" && itemsOrder[2] === "TAP(a)",
            JSON.stringify(itemsOrder.slice(0, 3)));

        // 10. Clear button empties the log and resets last-event; <empty> returns.
        await page.click(".reset-btn");
        await sleep(120);
        const lastClear = await readStatus(page, "Last classification:");
        const itemsClear = await logItems(page);
        const emptyClear = await emptyFallbackPresent(page);
        const downClear = await readStatus(page, "Currently down:");
        check("clear resets last-event to 'reset'", lastClear === "reset", `(${lastClear})`);
        check("clear empties log -> <empty> fallback",
            itemsClear.length === 0 && emptyClear, `items=${JSON.stringify(itemsClear)} fallback=${emptyClear}`);
        check("clear empties currently-down", downClear === "", `(${JSON.stringify(downClear)})`);

        // 11. No page errors.
        const unknown = errors.filter(e => !e.includes("favicon"));
        check("no page errors", unknown.length === 0, unknown.join(" | "));
    } catch (e) {
        console.error("HARNESS ERROR:", e.message);
        check("harness", false, e.message);
    } finally {
        if (browser) await browser.close();
        if (dev) try { dev.kill(); } catch {}
    }

    const real = results.filter(r => !r.xfail);
    const passed = real.filter(r => r.ok).length;
    const xfails = results.filter(r => r.xfail && !r.xpass).length;
    const xpasses = results.filter(r => r.xpass);
    const failedReal = real.filter(r => !r.ok);
    const failed = failedReal.length + xpasses.length; // an XPASS is a failure
    console.log(`\n========================`);
    console.log(`  ${passed} passed, ${xfails} xfail, ${failed} failed`);
    console.log(`========================`);
    if (failed) {
        console.log("\nFAILURES:");
        for (const r of failedReal) console.log("  - " + r.name + (r.detail ? " -- " + r.detail : ""));
        for (const r of xpasses) console.log("  - XPASS " + r.name + " -- " + r.ref + " appears fixed; remove the xfail");
    }
    process.exit(failed ? 1 : 0);
}

run();
