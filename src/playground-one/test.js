// playground-one smoke — vim-style mode state machine via <engine for=Mode>.
//
// Boots scrml dev, drives the page with puppeteer. Asserts:
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
// Run: node test.js  (NODE_PATH=$scrml/node_modules)

const { spawn } = require("child_process");
const path = require("path");

let puppeteer;
try { puppeteer = require("puppeteer"); }
catch { puppeteer = require("puppeteer-core"); }

const APP = path.resolve(__dirname, "app.scrml");
const PORT = 3051;
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

// Reads the visible mode badge text. The <match for=Mode> renders exactly one
// `.badge` element; V-LINE shares the `.visual` class with VISUAL, so we read
// the text, not the class.
async function badgeText(page) {
    return await page.evaluate(() => {
        const b = document.querySelector(".mode-display .badge");
        return b ? b.textContent.trim() : null;
    });
}

// Reads a `.value` from the status panel by its `.slabel` prefix.
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

// Number of transition-log entries rendered via `<each in=@log>`. The empty
// branch renders a single "no transitions yet" li, so we exclude it.
async function logCount(page) {
    return await page.evaluate(() => {
        const items = [...document.querySelectorAll(".loglist li")];
        return items.filter(li => li.textContent.trim() !== "no transitions yet").length;
    });
}

async function focusSurface(page) {
    await page.evaluate(() => { const t = document.querySelector(".surface"); if (t) t.focus(); });
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
            const b = document.querySelector(".mode-display .badge");
            return b && b.textContent.trim().length > 0;
        }, { timeout: 10000 });

        // 1. App renders the mode badge.
        const b0 = await badgeText(page);
        check("mode badge renders", b0 !== null, `(${b0})`);

        // 2. Initial mode INSERT (engine initial=.Insert).
        check("initial mode is INSERT", b0 === "INSERT", `(${b0})`);

        // 3. Log empty initially.
        const lc0 = await logCount(page);
        check("transition log empty initially", lc0 === 0, `(${lc0} entries)`);

        await focusSurface(page);

        // 4. Esc from Insert -> NORMAL (legal: Insert => Normal).
        await press(page, "Escape");
        const bNormal = await badgeText(page);
        check("Esc -> NORMAL", bNormal === "NORMAL", `(${bNormal})`);

        // 5. i from Normal -> INSERT (legal: Normal => Insert).
        await press(page, "i");
        const bInsert = await badgeText(page);
        check("i (from Normal) -> INSERT", bInsert === "INSERT", `(${bInsert})`);

        // 6. Esc -> NORMAL, then v -> VISUAL (legal: Normal => Visual).
        await press(page, "Escape");
        await press(page, "v");
        const bVisual = await badgeText(page);
        check("v (from Normal) -> VISUAL", bVisual === "VISUAL", `(${bVisual})`);

        // 7. V from Visual -> V-LINE (legal: Visual => VisualLine).
        await press(page, "V");
        const bVLine = await badgeText(page);
        check("V (from Visual) -> V-LINE", bVLine === "V-LINE", `(${bVLine})`);

        // 8. v from V-LINE -> VISUAL (legal: VisualLine => Visual).
        await press(page, "v");
        const bVisual2 = await badgeText(page);
        check("v (from V-LINE) -> VISUAL", bVisual2 === "VISUAL", `(${bVisual2})`);

        // 9. Transition log grew via <each>.
        const lc1 = await logCount(page);
        check("transition log grows via <each>", lc1 >= 4, `(${lc1} entries)`);

        // 10. Last trigger status row reflects the latest transition (v).
        const trig = await readStatus(page, "Last trigger:");
        check("last-trigger status reflects transition", trig === "v", `(${trig})`);

        // 11. Clear resets to INSERT + empties log.
        await page.click(".reset-btn");
        await sleep(120);
        const bReset = await badgeText(page);
        const lcReset = await logCount(page);
        check("clear resets to INSERT and empties log",
            bReset === "INSERT" && lcReset === 0,
            `(mode=${bReset}, log=${lcReset})`);

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
