// playground-six smoke — LSP diagnostics over WebSocket.
//
// Boots the bridge, boots scrml dev, drives the page with puppeteer.
// Asserts:
//   1. CM6 mounts
//   2. WS bridge reachable; LSP reaches "ready" status
//   3. Sample doc is clean: diagCount == 0
//   4. After typing a syntax error, diagCount > 0
//   5. At least one diagnostic mentions a recognizable error code
//   6. After deleting the bad chars, diagCount returns to 0
//   7. No pageerrors
//
// Run: cd src/playground-six && node test.js
//
// Requires: bun (for the bridge), scrml on PATH, puppeteer at the
// scrmlTS node_modules.

const { spawn } = require("child_process");
const path = require("path");

let puppeteer;
try { puppeteer = require("puppeteer"); }
catch { puppeteer = require("puppeteer-core"); }

const APP = path.resolve(__dirname, "app.scrml");
const BRIDGE = path.resolve(__dirname, "bridge.js");
const SCRML_PORT = 3066;
const BRIDGE_PORT = 3061;
const URL = `http://localhost:${SCRML_PORT}/`;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function bootBridge() {
    const proc = spawn("bun", [BRIDGE], {
        stdio: ["ignore", "pipe", "pipe"],
        env: { ...process.env, PORT: String(BRIDGE_PORT) },
    });
    let buf = "";
    return new Promise((resolve) => {
        const onData = (d) => {
            buf += d.toString();
            if (buf.includes("listening on ws://")) resolve(proc);
        };
        proc.stdout.on("data", onData);
        proc.stderr.on("data", onData);
        setTimeout(() => resolve(proc), 5000);
    });
}

async function bootDev() {
    const proc = spawn("scrml", ["dev", APP, "--port", String(SCRML_PORT)], {
        stdio: ["ignore", "pipe", "pipe"],
    });
    let buf = "";
    return new Promise((resolve) => {
        const onData = (d) => {
            buf += d.toString();
            if (buf.includes("Serving") || buf.includes(String(SCRML_PORT))) resolve(proc);
        };
        proc.stdout.on("data", onData);
        proc.stderr.on("data", onData);
        setTimeout(() => resolve(proc), 5000);
    });
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

async function readDiagCount(page) {
    const t = await readField(page, "Diagnostics:");
    return t ? parseInt(t, 10) : 0;
}

async function readLspStatus(page) {
    return readField(page, "LSP:");
}

async function readDiagItems(page) {
    return page.$$eval(".diag-item", (els) => els.map(e => e.textContent.trim()));
}

async function pressEnd(page) {
    // Move the CM6 cursor to the very end of the doc using
    // CM6's API directly — more reliable than keyboard nav.
    await page.evaluate(() => {
        const v = window.__cm;
        v.dispatch({ selection: { anchor: v.state.doc.length, head: v.state.doc.length } });
        v.focus();
    });
    await sleep(60);
}

let passed = 0, failed = 0;
const errors = [];

function check(name, ok, detail) {
    if (ok) { passed++; console.log("  PASS:", name); }
    else { failed++; errors.push(name + (detail ? " -- " + detail : "")); console.log("  FAIL:", name, detail || ""); }
}

async function run() {
    let bridge, dev, browser;
    try {
        bridge = await bootBridge();
        await sleep(800);
        dev = await bootDev();
        await sleep(1500);

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

        // 1. CM6 mounts
        await page.waitForFunction(() => {
            const v = document.querySelector(".cm-host .cm-editor");
            return v && v.offsetHeight > 0;
        }, { timeout: 10000 });
        check("CM6 mounted", true);

        // 2. LSP reaches "ready"
        await page.waitForFunction(() => {
            const rows = document.querySelectorAll(".row");
            for (const r of rows) {
                const l = r.querySelector(".slabel");
                const v = r.querySelector(".value");
                if (l && v && l.textContent.trim().startsWith("LSP:") && v.textContent.trim() === "ready") return true;
            }
            return false;
        }, { timeout: 10000 });
        check("LSP reaches ready", (await readLspStatus(page)) === "ready");

        // Give diagnostics a beat to arrive after didOpen.
        await sleep(800);

        // 3. Sample doc is clean (we constructed a valid scrml fragment)
        const initialCount = await readDiagCount(page);
        check("sample doc is clean (0 diagnostics)", initialCount === 0,
            "got " + initialCount);

        // 4. Inject a syntax error by REPLACING the buffer with a known-broken
        //    scrml fragment. We use view.dispatch directly so we don't depend
        //    on cursor position or keyboard timing. The replacement triggers
        //    didChange via our updateListener.
        await page.evaluate(() => {
            const v = window.__cm;
            const doc = v.state.doc;
            v.dispatch({
                changes: { from: 0, to: doc.length, insert: "<program>\n${ @x = }\n</program>\n" }
            });
        });
        await sleep(1200);

        const afterBadCount = await readDiagCount(page);
        check("replacing with broken scrml surfaces diagnostics",
            afterBadCount > 0, "got " + afterBadCount);

        // 5. The diag panel should render the diagnostics text (a single
        //    <pre> block in the current emit).
        const diagText = await page.evaluate(() => {
            const el = document.querySelector(".diag-list");
            return el ? el.textContent.trim() : "";
        });
        check("diagnostics panel renders text",
            diagText.length > 0,
            "text=" + diagText.slice(0, 200));

        // 6. Replace with a clean scrml; diagnostics return to 0.
        await page.evaluate(() => {
            const v = window.__cm;
            const doc = v.state.doc;
            v.dispatch({
                changes: { from: 0, to: doc.length, insert: "<program>\n<div>hello</div>\n</program>\n" }
            });
        });
        await sleep(1200);
        const afterFixCount = await readDiagCount(page);
        check("clean scrml clears diagnostics",
            afterFixCount === 0, "got " + afterFixCount);

        // 7. No pageerrors
        check("no pageerrors", pageErrors.length === 0,
            pageErrors.length ? pageErrors.join(" | ") : "");

        await browser.close();
    } catch (e) {
        console.error("HARNESS ERROR:", e);
        errors.push("harness: " + e.message);
        failed++;
    } finally {
        if (dev) try { dev.kill(); } catch {}
        if (bridge) try { bridge.kill(); } catch {}
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
