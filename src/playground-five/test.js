// playground-five smoke — CM6 + vim modes.
//
// Boots scrml dev, drives the page with puppeteer, asserts:
//   1. CM6 loads (status reaches "CM6 mounted")
//   2. NORMAL badge visible by default
//   3. i -> INSERT
//   4. Esc -> NORMAL
//   5. v -> VISUAL
//   6. v in VISUAL -> NORMAL
//   7. NORMAL j moves cursor down (cursorLine increments)
//   8. NORMAL k moves cursor up (cursorLine decrements)
//   9. NORMAL h/l move within a line
//  10. INSERT typing increases docLength
//  11. NORMAL typing does NOT increase docLength (suppressed)
//  12. VISUAL j extends selection (cursorCol/cursorLine moves but anchor stays)
//
// Run: cd src/playground-five && node test.js
//
// Requires bun + puppeteer-core (or puppeteer) installed at the
// monorepo root.

const { spawn } = require("child_process");
const path = require("path");

let puppeteer;
try { puppeteer = require("puppeteer"); }
catch { puppeteer = require("puppeteer-core"); }

const APP = path.resolve(__dirname, "app.scrml");
const PORT = 3055;
const URL = `http://localhost:${PORT}/`;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function bootDev() {
    const proc = spawn("scrml", ["dev", APP, "--port", String(PORT)], {
        stdio: ["ignore", "pipe", "pipe"],
    });
    let buf = "";
    return new Promise((resolve, reject) => {
        const onData = (d) => {
            buf += d.toString();
            if (buf.includes("Listening") || buf.includes("listening") || buf.includes(String(PORT))) {
                resolve(proc);
            }
        };
        proc.stdout.on("data", onData);
        proc.stderr.on("data", onData);
        proc.on("exit", (code) => reject(new Error("dev server exited early code=" + code + "\n" + buf)));
        setTimeout(() => resolve(proc), 4000); // fallback
    });
}

async function pressKey(page, key) {
    await page.keyboard.press(key);
    await sleep(40);
}

async function readText(page, selector) {
    return page.$eval(selector, (el) => el.textContent.trim());
}

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

async function activeMode(page) {
    return page.evaluate(() => {
        const insert = document.querySelector(".badge.insert");
        const normal = document.querySelector(".badge.normal");
        const visual = document.querySelector(".badge.visual");
        if (insert && insert.offsetParent) return "INSERT";
        if (normal && normal.offsetParent) return "NORMAL";
        if (visual && visual.offsetParent) return "VISUAL";
        return "NONE";
    });
}

async function readCursor(page) {
    const text = await readField(page, "Cursor:");
    if (!text) return { line: 0, col: 0 };
    // "line N, col M"
    const m = text.match(/line\s+(\d+),\s*col\s+(\d+)/);
    if (!m) return { line: 0, col: 0 };
    return { line: parseInt(m[1], 10), col: parseInt(m[2], 10) };
}

async function readDocLen(page) {
    const text = await readField(page, "Doc:");
    if (!text) return 0;
    const m = text.match(/(\d+)\s+chars/);
    return m ? parseInt(m[1], 10) : 0;
}

let passed = 0;
let failed = 0;
const errors = [];

function check(name, ok, detail) {
    if (ok) {
        passed++;
        console.log("  PASS:", name);
    } else {
        failed++;
        errors.push(name + (detail ? "  -- " + detail : ""));
        console.log("  FAIL:", name, detail || "");
    }
}

async function run() {
    let proc, browser;
    try {
        proc = await bootDev();
        await sleep(1500); // give the dev server a moment to start serving
        browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
        const page = await browser.newPage();
        const pageErrors = [];
        page.on("pageerror", (e) => pageErrors.push(e.message));
        page.on("console", (msg) => {
            if (msg.type() !== "error") return;
            const t = msg.text();
            if (t.includes("favicon.ico") || t.includes("404 (Not Found)")) return;
            pageErrors.push("console: " + t);
        });

        await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 15000 });
        await sleep(2500); // CM6 esm.sh fetch + mount

        // 1. CM6 mounts
        await page.waitForFunction(() => {
            const v = document.querySelector(".cm-host .cm-editor");
            return v && v.offsetHeight > 0;
        }, { timeout: 8000 });
        const status = await readField(page, "CM6 status:");
        check("CM6 mounted", status && status.includes("mounted"), "status=" + status);

        // 2. NORMAL by default
        check("default mode is NORMAL", (await activeMode(page)) === "NORMAL");

        // Click into CM6 host so keystrokes go there.
        await page.click(".cm-host");
        await sleep(80);

        // 3. i -> INSERT
        await pressKey(page, "i");
        check("i -> INSERT", (await activeMode(page)) === "INSERT");

        // 4. Esc -> NORMAL
        await pressKey(page, "Escape");
        check("Esc -> NORMAL", (await activeMode(page)) === "NORMAL");

        // 5. v -> VISUAL
        await pressKey(page, "v");
        check("v -> VISUAL", (await activeMode(page)) === "VISUAL");

        // 6. v in VISUAL -> NORMAL
        await pressKey(page, "v");
        check("v in VISUAL -> NORMAL", (await activeMode(page)) === "NORMAL");

        // Move to a known starting point (line 1, col 1) so we can
        // make precise assertions about j/k motion. We just hit k a
        // bunch to ensure we're at the top.
        for (let i = 0; i < 20; i++) { await pressKey(page, "k"); }
        for (let i = 0; i < 20; i++) { await pressKey(page, "h"); }
        const before = await readCursor(page);
        check("cursor at line 1 after k×20+h×20", before.line === 1 && before.col === 1,
            `got line=${before.line} col=${before.col}`);

        // 7. j moves cursor down
        await pressKey(page, "j");
        const afterJ = await readCursor(page);
        check("j moves cursor down", afterJ.line === before.line + 1, `before=${before.line} after=${afterJ.line}`);

        // 8. k moves cursor up
        await pressKey(page, "k");
        const afterK = await readCursor(page);
        check("k moves cursor up", afterK.line === afterJ.line - 1, `${afterJ.line} -> ${afterK.line}`);

        // 9. l moves right within a line
        const beforeL = await readCursor(page);
        await pressKey(page, "l");
        const afterL = await readCursor(page);
        check("l moves cursor right", afterL.col > beforeL.col || afterL.line > beforeL.line,
            `before col=${beforeL.col} after col=${afterL.col}`);

        // h moves back left
        await pressKey(page, "h");
        const afterH = await readCursor(page);
        check("h moves cursor left", afterH.col < afterL.col || afterH.line < afterL.line,
            `after l col=${afterL.col} after h col=${afterH.col}`);

        // 11. NORMAL typing does NOT increase docLength.
        const docLenBefore = await readDocLen(page);
        await pressKey(page, "x"); // not bound in normal — should be ignored
        await pressKey(page, "y");
        await pressKey(page, "z");
        const docLenAfterNormalType = await readDocLen(page);
        check("NORMAL ignores unbound keys (no typing)",
            docLenAfterNormalType === docLenBefore,
            `before=${docLenBefore} after=${docLenAfterNormalType}`);

        // 10. INSERT typing DOES increase docLength.
        await pressKey(page, "i");
        check("i -> INSERT (after typing test)", (await activeMode(page)) === "INSERT");
        await page.keyboard.type("ABC");
        await sleep(120);
        const docLenAfterInsert = await readDocLen(page);
        check("INSERT typing increases docLength",
            docLenAfterInsert >= docLenBefore + 3,
            `before=${docLenBefore} after=${docLenAfterInsert}`);

        // Esc back to normal so we can test visual.
        await pressKey(page, "Escape");
        check("Esc returns to NORMAL", (await activeMode(page)) === "NORMAL");

        // 12. VISUAL extends selection.
        await pressKey(page, "v");
        check("v -> VISUAL (selection extend test)", (await activeMode(page)) === "VISUAL");
        const selBefore = await page.evaluate(() => {
            const v = window.__cm;
            if (!v) return null;
            const s = v.state.selection.main;
            return { anchor: s.anchor, head: s.head };
        });
        await pressKey(page, "l");
        await pressKey(page, "l");
        const selAfter = await page.evaluate(() => {
            const v = window.__cm;
            const s = v.state.selection.main;
            return { anchor: s.anchor, head: s.head };
        });
        check("VISUAL l extends head, keeps anchor",
            selAfter.anchor === selBefore.anchor && selAfter.head > selBefore.head,
            JSON.stringify({ before: selBefore, after: selAfter }));

        await pressKey(page, "Escape");

        // pageerrors?
        check("no pageerrors", pageErrors.length === 0,
            pageErrors.length ? pageErrors.join(" | ") : "");

        await browser.close();
    } catch (e) {
        console.error("HARNESS ERROR:", e);
        errors.push("harness: " + e.message);
        failed++;
    } finally {
        if (proc) proc.kill();
    }

    console.log("\n========================");
    console.log(`  ${passed} passed, ${failed} failed`);
    console.log("========================\n");
    if (errors.length) {
        console.log("FAILURES:");
        for (const e of errors) console.log("  -", e);
    }
    process.exit(failed === 0 ? 0 : 1);
}

run();
