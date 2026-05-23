// playground-seven smoke — z-motion on CM6.
//
// Boots scrml dev, drives the page with puppeteer, asserts:
//   1. CM6 loads (status reaches "CM6 mounted")
//   2. NORMAL badge visible by default
//   3. i -> INSERT
//   4. Esc -> NORMAL
//   5. v -> VISUAL
//   6. v in VISUAL -> NORMAL
//   7. NORMAL j moves cursor down
//   8. NORMAL k moves cursor up
//   9. NORMAL h/l move within a line
//  10. INSERT typing increases docLength (TAP of non-motion key)
//  11. INSERT TAP of 'h' alone (no roll) types 'h' into the buffer
//  12. INSERT hold 'j' + tap any key → cursor moves down, NO type
//  13. INSERT hold 'k' + tap any key → cursor moves up, NO type
//  14. INSERT hold 'l' + tap any key → cursor moves right, NO type
//  15. Z-motion does not change @mode (still INSERT)
//
// Run: cd src/playground-seven && node test.js
//
// Requires puppeteer (NODE_PATH points at scrmlTS/node_modules).

const { spawn } = require("child_process");
const path = require("path");

let puppeteer;
try { puppeteer = require("puppeteer"); }
catch { puppeteer = require("puppeteer-core"); }

const APP = path.resolve(__dirname, "app.scrml");
const PORT = 3057;
const URL = `http://localhost:${PORT}/`;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function bootScrmlDev() {
    return new Promise((resolve, reject) => {
        const proc = spawn("scrml", ["dev", APP, "--port", String(PORT)], {
            stdio: ["ignore", "pipe", "pipe"],
        });
        let resolved = false;
        const onData = (buf) => {
            buf = String(buf);
            if (resolved) return;
            if (buf.includes("Serving") || buf.includes(String(PORT))) {
                resolved = true;
                resolve(proc);
            }
        };
        proc.stdout.on("data", onData);
        proc.stderr.on("data", onData);
        proc.on("error", reject);
        setTimeout(() => {
            if (!resolved) { resolved = true; resolve(proc); }
        }, 8000);
    });
}

async function readMode(page) {
    return await page.evaluate(() => {
        for (const sel of [".badge.insert", ".badge.normal", ".badge.visual"]) {
            const el = document.querySelector(sel);
            if (el && el.offsetParent !== null) return el.textContent.trim();
        }
        return null;
    });
}

async function readDocLength(page) {
    return await page.evaluate(() => {
        const v = window.__cm;
        return v ? v.state.doc.length : -1;
    });
}

async function readCursor(page) {
    return await page.evaluate(() => {
        const v = window.__cm;
        if (!v) return null;
        const h = v.state.selection.main.head;
        const line = v.state.doc.lineAt(h);
        return { head: h, line: line.number, col: h - line.from + 1 };
    });
}

async function readBufferAt(page, from, to) {
    return await page.evaluate(({ from, to }) => {
        const v = window.__cm;
        if (!v) return null;
        return v.state.sliceDoc(from, to);
    }, { from, to });
}

async function focusEditor(page) {
    await page.evaluate(() => {
        const cm = document.querySelector(".cm-host .cm-content");
        if (cm) cm.focus();
    });
}

async function pressKey(page, key) {
    await page.keyboard.press(key);
    await sleep(50);
}

// Hold one key while pressing another (release order matters).
// Sequence: holdKey down → rollKey down → rollKey up → holdKey up.
async function holdAndRoll(page, holdKey, rollKey) {
    await page.keyboard.down(holdKey);
    await sleep(15);
    await page.keyboard.down(rollKey);
    await sleep(5);
    await page.keyboard.up(rollKey);
    await sleep(5);
    await page.keyboard.up(holdKey);
    await sleep(50);
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
        await sleep(1500);

        console.log("Launching headless browser...");
        browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
        const page = await browser.newPage();
        page.on("pageerror", e => errors.push("pageerror: " + e.message));
        page.on("console", msg => {
            const t = msg.text();
            if (t.includes("error") || t.includes("Error")) errors.push("console: " + t);
        });

        await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 15000 });

        // 1. CM6 mounts
        await page.waitForFunction(() => {
            const v = document.querySelector(".cm-host .cm-editor");
            return v && v.offsetHeight > 0 && window.__cm;
        }, { timeout: 10000 });
        check("CM6 mounted", true);

        // 2. Starts in NORMAL
        await sleep(150);
        check("starts in NORMAL", (await readMode(page)) === "NORMAL");

        await focusEditor(page);

        // 3-6. Mode transitions.
        await pressKey(page, "i");
        check("i -> INSERT", (await readMode(page)) === "INSERT");

        await pressKey(page, "Escape");
        check("Esc -> NORMAL", (await readMode(page)) === "NORMAL");

        await pressKey(page, "v");
        check("v -> VISUAL", (await readMode(page)) === "VISUAL");

        await pressKey(page, "v");
        check("v in VISUAL -> NORMAL", (await readMode(page)) === "NORMAL");

        // 7-9. NORMAL motion.
        // Move to a known position (head=0), then move down.
        await page.evaluate(() => window.__cm.dispatch({ selection: { anchor: 0, head: 0 } }));
        await sleep(50);
        const c0 = await readCursor(page);
        await pressKey(page, "j");
        const cJ = await readCursor(page);
        check("NORMAL j moves cursor down", cJ.line > c0.line, `line ${c0.line} -> ${cJ.line}`);

        await pressKey(page, "k");
        const cK = await readCursor(page);
        check("NORMAL k moves cursor up", cK.line < cJ.line, `line ${cJ.line} -> ${cK.line}`);

        await pressKey(page, "l");
        const cL = await readCursor(page);
        check("NORMAL l moves cursor right", cL.head > cK.head, `head ${cK.head} -> ${cL.head}`);

        await pressKey(page, "h");
        const cH = await readCursor(page);
        check("NORMAL h moves cursor left", cH.head < cL.head, `head ${cL.head} -> ${cH.head}`);

        // 10. INSERT typing increases docLength via plain CM6 input.
        await pressKey(page, "i");
        const len0 = await readDocLength(page);
        await page.keyboard.type("xyz");
        await sleep(80);
        const len1 = await readDocLength(page);
        check("INSERT typing increases docLength", len1 > len0, `${len0} -> ${len1}`);

        // 11. INSERT TAP of motion-hold letter (h alone) types 'h' into buffer.
        const headBeforeTapH = (await readCursor(page)).head;
        await page.keyboard.down("h");
        await sleep(20);
        await page.keyboard.up("h");
        await sleep(100);
        const ch = await readBufferAt(page, headBeforeTapH, headBeforeTapH + 1);
        check("INSERT TAP 'h' types 'h'", ch === "h", `inserted '${ch}'`);

        // 12. INSERT hold 'j' + tap any key → cursor moves down, no type.
        const len2 = await readDocLength(page);
        const beforeJ = await readCursor(page);
        await holdAndRoll(page, "j", "x");
        const afterJ = await readCursor(page);
        const lenAfterJ = await readDocLength(page);
        check("z-motion [j](x) moves down, no type",
            afterJ.line > beforeJ.line && lenAfterJ === len2,
            `line ${beforeJ.line}->${afterJ.line}, len ${len2}->${lenAfterJ}`);

        // 13. INSERT hold 'k' + tap any key → cursor moves up.
        const beforeK = await readCursor(page);
        await holdAndRoll(page, "k", "x");
        const afterK = await readCursor(page);
        check("z-motion [k](x) moves up, no type",
            afterK.line < beforeK.line && (await readDocLength(page)) === len2,
            `line ${beforeK.line}->${afterK.line}`);

        // 14. INSERT hold 'l' + tap any key → cursor moves right.
        const beforeL = await readCursor(page);
        await holdAndRoll(page, "l", "x");
        const afterL = await readCursor(page);
        check("z-motion [l](x) moves right, no type",
            afterL.head > beforeL.head && (await readDocLength(page)) === len2,
            `head ${beforeL.head}->${afterL.head}`);

        // 15. Mode still INSERT through all z-motions.
        check("mode still INSERT after z-motions", (await readMode(page)) === "INSERT");

        // 16. No page errors except known Bug P (stop_scope_timers).
        const unknownErrors = errors.filter(e =>
            !e.includes("_scrml_stop_scope_timers") &&
            !e.includes("favicon"));
        check("no unexpected errors", unknownErrors.length === 0,
            unknownErrors.length ? unknownErrors.join(" | ") : "");
        if (errors.length && unknownErrors.length === 0) {
            console.log(`  NOTE: ${errors.length} known Bug P pageerror(s) ignored`);
        }
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
