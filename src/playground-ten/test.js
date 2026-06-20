// playground-ten smoke — relevance-region navigator + §36 input-state.
//
// Boots scrml dev, drives the page with puppeteer. Live-verifies the v0.7.0
// fixes the rebuild restores, on a real runtime surface:
//   1. List renders 4 regions (for-lift)
//   2. Region title "handleKey(e)" renders VERBATIM (Bug Z — rename-in-string)
//   3. URL "https://..." renders verbatim (Bug X — // in string)
//   4. Initial focus = region 0; badge = NAV
//   5. j focuses next, k focuses prev (navigation)
//   6. exactly one .focused row, and it MOVES with j/k (Bug-V — class:focused
//      on for-lift reading global @focusId; was frozen-on-create)
//   7. Enter toggles Nav<->Edit; badge updates; @transitions increments
//      (Bug AB — bare @mode=.Variant write routes through engine dispatcher,
//      fires <onTransition>)
//   8. churn: o inserts / x removes; .focused stays correct (Bug-V under churn)
//   9. §36: cursor x/y + lastKey readout present (NOTE: markup-interp reactivity
//      of input-state reads is the open dogfood question — observed, not asserted)
//  10. no page errors
//
// Run: NODE_PATH=$scrml/node_modules node test.js

const { spawn } = require("child_process");
const path = require("path");

let puppeteer;
try { puppeteer = require("puppeteer"); }
catch { puppeteer = require("puppeteer-core"); }

const APP = path.resolve(__dirname, "app.scrml");
const PORT = 3060;
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

async function regionTitles(page) {
    return await page.evaluate(() =>
        Array.from(document.querySelectorAll(".region .rtitle")).map(e => e.textContent.trim()));
}
async function focusedTitles(page) {
    return await page.evaluate(() =>
        Array.from(document.querySelectorAll(".region.focused .rtitle")).map(e => e.textContent.trim()));
}
async function text(page, sel) {
    return await page.evaluate(s => { const e = document.querySelector(s); return e ? e.textContent.trim() : null; }, sel);
}
async function focusNav(page) {
    await page.evaluate(() => { const t = document.querySelector(".nav-pane"); if (t) t.focus(); });
}
async function press(page, key) { await page.keyboard.press(key); await sleep(90); }

const results = [];
const errors = [];
function check(name, ok, detail) {
    results.push({ name, ok, detail });
    console.log(`  ${ok ? "PASS" : "FAIL"}: ${name}${detail ? " " + detail : ""}`);
}
function note(msg) { console.log(`  NOTE: ${msg}`); }

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
        page.on("console", m => { const t = m.text(); if (/error/i.test(t)) errors.push("console: " + t); });

        await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 15000 });
        await page.waitForFunction(() => document.querySelectorAll(".region").length > 0, { timeout: 10000 });

        // 1. list renders.
        const titles0 = await regionTitles(page);
        check("list renders 4 regions", titles0.length === 4, `(${titles0.length})`);

        // 2. Bug Z — fn-name-in-string preserved verbatim.
        check("Bug Z: title 'handleKey(e)' verbatim", titles0.includes("handleKey(e)"),
            `(${JSON.stringify(titles0)})`);

        // 3. Bug X — URL with // preserved.
        const url0 = await text(page, ".region .rurl");
        check("Bug X: URL with // renders", !!url0 && url0.includes("https://"), `(${url0})`);

        // 4. initial focus + badge.
        const f0 = await focusedTitles(page);
        check("initial: exactly one focused row", f0.length === 1, `(${f0.length})`);
        check("initial focus = handleKey(e)", f0[0] === "handleKey(e)", `(${f0[0]})`);
        const badge0 = await text(page, ".badge");
        check("initial badge = NAV", badge0 === "NAV", `(${badge0})`);

        await focusNav(page);

        // 5 + 6. j moves focus; exactly one focused; Bug-V follows.
        await press(page, "j");
        const f1 = await focusedTitles(page);
        check("j -> focus next (focusNext)", f1.length === 1 && f1[0] === "focusNext()", `(${JSON.stringify(f1)})`);

        await press(page, "j");
        const f2 = await focusedTitles(page);
        check("j -> focus modeBadge(m)", f2.length === 1 && f2[0] === "modeBadge(m)", `(${JSON.stringify(f2)})`);

        await press(page, "k");
        const f3 = await focusedTitles(page);
        check("k -> focus back to focusNext()", f3.length === 1 && f3[0] === "focusNext()", `(${JSON.stringify(f3)})`);

        // 7. Enter toggles mode; transitions increments (Bug AB).
        const tr0 = await text(page, ".value.tr");
        await press(page, "Enter");
        const badge1 = await text(page, ".badge");
        const tr1 = await text(page, ".value.tr");
        check("Enter -> badge EDIT", badge1 === "EDIT", `(${badge1})`);
        check("Bug AB: <onTransition> fired (transitions 0->1)", tr0 === "0" && tr1 === "1", `(${tr0} -> ${tr1})`);
        await press(page, "Enter");
        const tr2 = await text(page, ".value.tr");
        const badge2 = await text(page, ".badge");
        check("Enter again -> NAV + transitions 2", badge2 === "NAV" && tr2 === "2", `(${badge2}, ${tr2})`);

        // 8. churn: insert + remove, focused stays singular + correct (Bug-V churn).
        // cursor on focusNext() (id 1). 'o' inserts region_4 after it and focuses it.
        await press(page, "o");
        const afterInsert = await regionTitles(page);
        const fIns = await focusedTitles(page);
        check("o -> inserts region (count 5)", afterInsert.length === 5, `(${afterInsert.length})`);
        check("Bug-V churn: exactly one focused after insert", fIns.length === 1, `(${fIns.length})`);
        check("insert focuses the new region", fIns[0] === "region_4()", `(${fIns[0]})`);
        // 'x' removes focused region_4.
        await press(page, "x");
        const afterRemove = await regionTitles(page);
        const fRem = await focusedTitles(page);
        check("x -> removes region (count 4)", afterRemove.length === 4, `(${afterRemove.length})`);
        check("Bug-V churn: exactly one focused after remove", fRem.length === 1, `(${fRem.length})`);

        // 9. §36 input-state readout present (reactivity is the open question -> NOTE).
        const mx0 = await text(page, ".value.mx");
        const my0 = await text(page, ".value.my");
        check("§36: cursor x/y readout present", mx0 !== null && my0 !== null, `(x=${mx0} y=${my0})`);
        await page.mouse.move(123, 77);
        await sleep(150);
        const mx1 = await text(page, ".value.mx");
        if (mx1 !== mx0) note(`§36 mouse markup-interp IS reactive on move (x ${mx0} -> ${mx1})`);
        else note(`§36 mouse markup-interp did NOT re-render on move (x stayed ${mx0}) — reads update in a loop/event, not bare markup interp`);
        const lk0 = await text(page, ".value.lk");
        note(`§36 keys.lastKey readout = ${JSON.stringify(lk0)}`);

        // 10. no page errors.
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
