// playground-two smoke — hjkl + z-motion rolls against a real buffer.
//
// Boots scrml dev, drives the page with puppeteer. Asserts:
//   1. Buffer renders (before/cursor/after segments present)
//   2. Initial mode is NORMAL (vim convention)
//   3. Cursor renders as a block in NORMAL (.cursor.block-cursor)
//   4. l moves the cursor right within a line (@cursor++)
//   5. h moves the cursor left (@cursor--)
//   6. j moves the cursor down a line (col preserved, pos jumps a line)
//   7. k moves the cursor back up a line
//   8. i -> INSERT badge; cursor becomes the insert caret
//   9. Esc -> NORMAL badge
//  10. INSERT typing inserts into the buffer (buffer grows)
//  11. z-motion: in INSERT, hold l + tap a key nudges cursor right
//      WITHOUT typing the held 'l' and WITHOUT leaving INSERT
//  12. no page errors
//
// Run: node test.js  (NODE_PATH=$scrmlTS/node_modules)

const { spawn } = require("child_process");
const path = require("path");

let puppeteer;
try { puppeteer = require("puppeteer"); }
catch { puppeteer = require("puppeteer-core"); }

const APP = path.resolve(__dirname, "app.scrml");
const PORT = 3052;
const URL = `http://localhost:${PORT}/`;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function bootScrmlDev() {
    return new Promise((resolve, reject) => {
        const proc = spawn("scrml", ["dev", APP, "--port", String(PORT)], { stdio: ["ignore", "pipe", "pipe"] });
        let resolved = false;
        const onData = b => {
            const s = String(b);
            if (resolved) return;
            if (s.includes("Serving") || s.includes("Listening") || s.includes(String(PORT))) { resolved = true; resolve(proc); }
        };
        proc.stdout.on("data", onData);
        proc.stderr.on("data", onData);
        proc.on("error", reject);
        setTimeout(() => { if (!resolved) { resolved = true; resolve(proc); } }, 8000);
    });
}

// The cursor offset is directly observable: `.seg.before` renders
// @buffer.slice(0, @cursor), so its length === @cursor.
async function cursorPos(page) {
    return await page.evaluate(() => {
        const b = document.querySelector(".buffer-pane .seg.before");
        return b ? b.textContent.length : -1;
    });
}

// The mode badge is a <match> — exactly one badge element renders.
async function activeMode(page) {
    return await page.evaluate(() => {
        if (document.querySelector(".badge.insert")) return "INSERT";
        if (document.querySelector(".badge.normal")) return "NORMAL";
        if (document.querySelector(".badge.visual")) return "VISUAL";
        return "NONE";
    });
}

async function bufferLen(page) {
    return await page.evaluate(() => {
        const before = document.querySelector(".buffer-pane .seg.before");
        const cur = document.querySelector(".buffer-pane .seg.cursor");
        const after = document.querySelector(".buffer-pane .seg.after");
        return (before ? before.textContent.length : 0) +
               (cur ? cur.textContent.length : 0) +
               (after ? after.textContent.length : 0);
    });
}

async function cursorClass(page) {
    return await page.evaluate(() => {
        const c = document.querySelector(".buffer-pane .seg.cursor");
        return c ? c.className : "";
    });
}

async function focusPane(page) {
    await page.evaluate(() => { const p = document.querySelector(".buffer-pane"); if (p) p.focus(); });
    await sleep(40);
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
            const b = document.querySelector(".buffer-pane .seg.before");
            const c = document.querySelector(".buffer-pane .seg.cursor");
            return b !== null && c !== null;
        }, { timeout: 10000 });

        // 1. Buffer renders.
        const len0 = await bufferLen(page);
        check("buffer renders (segments populated)", len0 > 50, `${len0} chars`);

        // 2. Initial mode NORMAL (vim convention).
        check("initial mode is NORMAL", (await activeMode(page)) === "NORMAL");

        // 3. Cursor renders as block in NORMAL.
        const cls0 = await cursorClass(page);
        check("cursor is block in NORMAL", cls0.includes("block-cursor"), `(${cls0})`);

        await focusPane(page);

        // 4. l moves cursor right (@cursor 0 -> 1).
        const posStart = await cursorPos(page);
        await press(page, "l");
        const posL = await cursorPos(page);
        check("l moves cursor right", posL === posStart + 1, `${posStart} -> ${posL}`);

        // 5. h moves cursor left, back to start.
        await press(page, "h");
        const posH = await cursorPos(page);
        check("h moves cursor left", posH === posL - 1, `${posL} -> ${posH}`);

        // 6. j moves cursor down a line. Line 0 ("Welcome to 6nz.") is 15
        //    chars then a newline at offset 15, so moving down from col 0
        //    lands the cursor past offset 15.
        const posPreJ = await cursorPos(page);
        await press(page, "j");
        const posJ = await cursorPos(page);
        check("j moves cursor down a line", posJ > posPreJ, `${posPreJ} -> ${posJ}`);

        // 7. k moves cursor back up.
        await press(page, "k");
        const posK = await cursorPos(page);
        check("k moves cursor up a line", posK < posJ, `${posJ} -> ${posK}`);

        // 8. i -> INSERT, cursor becomes the insert caret.
        await press(page, "i");
        check("i -> INSERT badge", (await activeMode(page)) === "INSERT");
        const clsI = await cursorClass(page);
        check("cursor is insert caret in INSERT", clsI.includes("insert-cursor"), `(${clsI})`);

        // 9. Esc -> NORMAL.
        await press(page, "Escape");
        check("Esc -> NORMAL badge", (await activeMode(page)) === "NORMAL");

        // 10. INSERT typing grows the buffer. (A bare printable char that
        //     is NOT a motion-hold types immediately on keydown.)
        await press(page, "i");
        const lenPreType = await bufferLen(page);
        await page.keyboard.type("XYZ");
        await sleep(150);
        const lenPostType = await bufferLen(page);
        check("INSERT typing grows buffer", lenPostType === lenPreType + 3,
            `${lenPreType} -> ${lenPostType}`);

        // 11. z-motion roll in INSERT: hold 'l' then tap another key. The
        //     roll fires cursor motion (right) on the inner key's keydown
        //     and does NOT type the held 'l'. We stay in INSERT throughout.
        //     Net: cursor advances by 1 (the roll), buffer length unchanged
        //     (neither the 'l' nor the inner key is typed).
        const posPreRoll = await cursorPos(page);
        const lenPreRoll = await bufferLen(page);
        const modePreRoll = await activeMode(page);
        await page.keyboard.down("l");      // hold motion key
        await sleep(60);
        await page.keyboard.press("o");     // roll: tap under the hold -> right
        await sleep(60);
        await page.keyboard.up("l");        // release the hold (classifies HOLD)
        await sleep(100);
        const posPostRoll = await cursorPos(page);
        const lenPostRoll = await bufferLen(page);
        const modePostRoll = await activeMode(page);
        check("z-motion roll nudges cursor right without typing, stays INSERT",
            posPostRoll === posPreRoll + 1 && lenPostRoll === lenPreRoll &&
            modePreRoll === "INSERT" && modePostRoll === "INSERT",
            `pos ${posPreRoll}->${posPostRoll}, len ${lenPreRoll}->${lenPostRoll}, mode ${modePreRoll}->${modePostRoll}`);

        await press(page, "Escape");

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
