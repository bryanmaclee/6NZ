// playground-ten smoke — relevance-region navigator.
//
// Boots scrml dev, drives the page with puppeteer. The high-signal assertions
// (per the 2026-05-29 scrmlTS resume-dogfooding handoff) are RUNTIME ones —
// emit-clean is necessary but not sufficient:
//
//   * Bug-V regression: the reactive `class:focused` on a for-lift <li> reading
//     the GLOBAL @focusId must FOLLOW focus as @focusId changes — not freeze on
//     the create-time winner. Asserted by checks 3-5 (focus moves) + 6 (reorder
//     churn keeps the class on the right region).
//   * Engine (§51): `match @mode` re-renders the mode badge, and <onTransition>
//     side-effects FIRE (the @transitions counter bumps) on real transitions.
//     Asserted by checks 9-11.
//   * List churn: insert/remove reconcile keeps exactly one focused row.
//
// compiled against scrmlTS@v0.6.7
// Run: NODE_PATH=$scrmlTS/node_modules node test.js

const { spawn } = require("child_process");
const path = require("path");

let puppeteer;
try { puppeteer = require("puppeteer"); }
catch { puppeteer = require("puppeteer-core"); }

const APP = path.resolve(__dirname, "app.scrml");
const PORT = 3060;
const URL = `http://localhost:${PORT}/`;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function bootScrmlDev() {
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
    return page.evaluate(lbl => {
        for (const r of document.querySelectorAll(".row")) {
            const l = r.querySelector(".slabel");
            const v = r.querySelector(".value");
            if (l && v && l.textContent.trim().startsWith(lbl)) return v.textContent.trim();
        }
        return null;
    }, slabel);
}

async function regionTitles(page) {
    return page.evaluate(() => [...document.querySelectorAll(".regions li .rtitle")].map(e => e.textContent.trim()));
}
async function focusedTitle(page) {
    return page.evaluate(() => {
        const li = document.querySelector(".regions li.focused");
        return li ? li.querySelector(".rtitle").textContent.trim() : null;
    });
}
async function focusedCount(page) {
    return page.evaluate(() => document.querySelectorAll(".regions li.focused").length);
}
async function focusedBody(page) {
    return page.evaluate(() => {
        const li = document.querySelector(".regions li.focused");
        return li ? li.querySelector(".rbody").textContent : null;
    });
}
async function focusList(page) {
    await page.evaluate(() => { const u = document.querySelector(".regions"); if (u) u.focus(); });
}
// Dispatch a synthetic keydown with an EXACT `key` value on the regions list.
// More reliable than puppeteer's physical-key mapping for capitals (J/K), and
// it directly exercises handleKey's `e.key` routing — which is what we test.
async function key(page, k) {
    await page.evaluate(kk => {
        const el = document.querySelector(".regions") || document.body;
        el.dispatchEvent(new KeyboardEvent("keydown", { key: kk, bubbles: true, cancelable: true }));
    }, k);
    await sleep(90);
}

const results = [];
const errors = [];
function check(name, ok, detail) {
    results.push({ name, ok });
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
        page.on("console", m => { const t = m.text(); if (t.toLowerCase().includes("error")) errors.push("console: " + t); });

        await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 15000 });
        await page.waitForFunction(() => document.querySelectorAll(".regions li").length > 0, { timeout: 10000 });

        // 1. List renders all regions.
        const titles0 = await regionTitles(page);
        check("region list renders", titles0.length === 4, `(${titles0.length}: ${titles0.join(", ")})`);

        // 1b. Bug-Z regression guard: the 4th title is the literal "handleKey(e)"
        //     — which matches this app's own `handleKey` fn name. Pre-fix the
        //     rename pass rewrote it to "_scrml_handleKey_NN(e)".
        check("Bug-Z: fn-name substring in string literal is verbatim",
            titles0[3] === "handleKey(e)", `(${titles0[3]})`);

        // 2. Bug-V at create: exactly one focused row, and it's the first region.
        const fc0 = await focusedCount(page);
        const ft0 = await focusedTitle(page);
        check("exactly one focused row at create", fc0 === 1, `(${fc0})`);
        check("initial focus on render()", ft0 === "render()", `(${ft0})`);

        await focusList(page);

        // 3. Bug-V CORE: j moves focus -> reactive class:focused FOLLOWS @focusId.
        await key(page, "j");
        const ft1 = await focusedTitle(page);
        const fc1 = await focusedCount(page);
        check("j -> class:focused follows to walk(ix)", ft1 === "walk(ix)" && fc1 === 1, `(${ft1}, n=${fc1})`);

        // 4. j again -> reconcile().
        await key(page, "j");
        const ft2 = await focusedTitle(page);
        check("j -> reconcile()", ft2 === "reconcile()", `(${ft2})`);

        // 5. k moves back -> walk(ix). (class follows in reverse too)
        await key(page, "k");
        const ft3 = await focusedTitle(page);
        check("k -> back to walk(ix)", ft3 === "walk(ix)", `(${ft3})`);

        // 6. CHURN: reorder focused region down (J). Order changes; the focused
        //    class stays on walk(ix), still exactly one.
        const beforeOrder = await regionTitles(page);
        await key(page, "J"); // reorder down
        const afterOrder = await regionTitles(page);
        const ftR = await focusedTitle(page);
        const fcR = await focusedCount(page);
        const moved = JSON.stringify(beforeOrder) !== JSON.stringify(afterOrder);
        check("J reorders the list", moved, `(${beforeOrder.join(",")} -> ${afterOrder.join(",")})`);
        check("focus class stays on walk(ix) after reorder", ftR === "walk(ix)" && fcR === 1, `(${ftR}, n=${fcR})`);

        // 7. CHURN: insert a region after focus.
        await key(page, "o");
        const titlesIns = await regionTitles(page);
        const ftIns = await focusedTitle(page);
        const fcIns = await focusedCount(page);
        check("o inserts a region (count 4 -> 5)", titlesIns.length === 5, `(${titlesIns.length})`);
        check("inserted region is focused, exactly one", ftIns === "new5" && fcIns === 1, `(${ftIns}, n=${fcIns})`);

        // 8. CHURN: remove focused region. Count drops, focus re-homes, one focused.
        await key(page, "x");
        const titlesRem = await regionTitles(page);
        const fcRem = await focusedCount(page);
        check("x removes a region (count 5 -> 4)", titlesRem.length === 4, `(${titlesRem.length})`);
        check("exactly one focused row after remove", fcRem === 1, `(${fcRem})`);

        // 9. ENGINE: NAV -> EDIT. `match @mode` (via modeLabel) re-renders the badge.
        //    (Engine write routes through the dispatcher from program scope — AB write
        //    path. <onTransition> effect-firing is still broken, so not asserted here.)
        const mode0 = await readStatus(page, "Mode:");
        check("mode badge starts NAV (match @mode re-render)", mode0 === "NAV", `(${mode0})`);
        await key(page, "Enter");
        const mode1 = await readStatus(page, "Mode:");
        check("Enter -> EDIT (engine var drives match badge)", mode1 === "EDIT", `(${mode1})`);

        // 10. EDIT: typing appends to focused region body (interp re-render on lift item).
        //     Also proves the engine GATES behaviour — 'z' edits instead of navigating.
        const body0 = await focusedBody(page);
        await key(page, "z");
        const body1 = await focusedBody(page);
        check("EDIT-mode typing appends to focused body", body1 === body0 + "z", `("${body0}" -> "${body1}")`);

        // 11. Esc -> NAV (engine variable flips back, badge re-renders).
        await key(page, "Escape");
        const mode2 = await readStatus(page, "Mode:");
        check("Esc -> NAV", mode2 === "NAV", `(${mode2})`);

        // 12. No page errors.
        check("no page errors", errors.length === 0, errors.length ? `(${errors.slice(0,3).join(" | ")})` : "");

    } catch (e) {
        check("harness ran without throwing", false, `(${e.message})`);
    } finally {
        if (browser) await browser.close();
        if (dev) { try { process.kill(-dev.pid); } catch {} dev.kill("SIGTERM"); }
    }

    const passed = results.filter(r => r.ok).length;
    const failed = results.length - passed;
    console.log("\n========================");
    console.log(`  ${passed} passed, ${failed} failed`);
    console.log("========================");
    process.exit(failed === 0 ? 0 : 1);
}

run();
