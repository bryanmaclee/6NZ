// playground-four smoke — keystroke-granular undo TREE on a line buffer.
//
// Boots scrml dev, drives the page with puppeteer. Asserts:
//   1. Tree renders rows (treeRowsOf flatten + <each>, §17.7)
//   2. Initial current node is the root "#0 root"
//   3. Mode badge shows INSERT by default (<match> on @mode, engine initial=.Insert)
//   4. §4.17 GUARD: tree text shows INTERPOLATED labels, not literal "${...}"
//      (this is the <pre>${...} raw-content silent-drop regression; <pre>->div fix)
//   5. INSERT typing changes the buffer (renderBuffer caret)
//   6. INSERT typing grows the undo tree (one node per keystroke)
//   7. current node tracks the newest edit ("#3 ins 'c'")
//   8. Esc -> NORMAL badge
//   9. u undoes: current node moves to its parent (buffer reverts)
//  10. Ctrl+R redoes: current node moves to the youngest child
//  11. branch + chronological walk: g- / g+ (-/=) move across branches by id
//  12. no page errors
//
// Run: NODE_PATH=$scrmlTS/node_modules node src/playground-four/test.js

const { spawn } = require("child_process");
const path = require("path");

let puppeteer;
try { puppeteer = require("puppeteer"); }
catch { puppeteer = require("puppeteer-core"); }

const APP = path.resolve(__dirname, "app.scrml");
const PORT = 3054;
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

// Tree rows: <each in=@treeRows> renders one `.treerow` per node, with a
// reactive `class:current` binding. The current row also carries a textual
// "> " prefix; non-current rows are "  "-prefixed.
async function treeRows(page) {
    return await page.evaluate(() =>
        [...document.querySelectorAll(".tree .treerow")].map(el => el.textContent));
}

async function rowCount(page) {
    const rows = await treeRows(page);
    return rows.filter(r => r.trim().length > 0).length;
}

// Current node label (the row with class:current — its text is "> #N ...").
async function currentRow(page) {
    return await page.evaluate(() => {
        const cur = document.querySelector(".tree .treerow.current");
        return cur ? cur.textContent.trim() : null;
    });
}

async function bufferText(page) {
    return await page.evaluate(() => {
        const b = document.querySelector(".buffer");
        return b ? b.textContent : null;
    });
}

// Active mode badge from the <match for=Mode on=@mode> projection.
async function activeMode(page) {
    return await page.evaluate(() => {
        const ins = document.querySelector(".badge.insert");
        const nor = document.querySelector(".badge.normal");
        if (ins && ins.offsetParent) return "INSERT";
        if (nor && nor.offsetParent) return "NORMAL";
        return "NONE";
    });
}

async function focusSurface(page) {
    await page.evaluate(() => { const s = document.querySelector(".surface"); if (s) s.focus(); });
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
        page.on("console", m => {
            if (m.type() !== "error") return;
            const t = m.text();
            if (t.includes("favicon") || t.includes("404")) return;
            errors.push("console: " + t);
        });

        await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 15000 });
        await page.waitForFunction(() => {
            const t = document.querySelector(".tree");
            return t && t.querySelectorAll(".treerow").length > 0;
        }, { timeout: 10000 });

        // 1. Tree renders rows.
        const n0 = await rowCount(page);
        check("tree renders rows (treeRowsOf + <each>)", n0 >= 1, `${n0} rows`);

        // 2. Initial current node is the root "#0 root".
        const cur0 = await currentRow(page);
        check("initial current node is #0 root", cur0 && cur0.includes("#0") && cur0.includes("root"), `(${cur0})`);

        // 3. Mode badge shows INSERT by default.
        check("mode badge INSERT by default", (await activeMode(page)) === "INSERT");

        // 4. §4.17 GUARD: tree shows interpolated labels, not literal "${".
        const rows0 = await treeRows(page);
        const hasLiteralTemplate = rows0.some(r => r.includes("${"));
        check("§4.17 guard: no literal '${' in tree text", !hasLiteralTemplate,
            hasLiteralTemplate ? `(found: ${rows0.find(r => r.includes("${"))})` : "");

        await focusSurface(page);

        // 5/6. INSERT typing changes the buffer AND grows the tree.
        const rowsBeforeType = await rowCount(page);
        const bufBeforeType = await bufferText(page);
        await press(page, "a");
        await press(page, "b");
        await press(page, "c");
        const bufAfterType = await bufferText(page);
        const rowsAfterType = await rowCount(page);
        check("INSERT typing changes the buffer", bufAfterType && bufAfterType.includes("abc"),
            `(buffer=${JSON.stringify(bufAfterType)})`);
        check("INSERT typing grows the undo tree", rowsAfterType === rowsBeforeType + 3,
            `rows ${rowsBeforeType} -> ${rowsAfterType}`);

        // 7. current node tracks the newest edit ("#3 ins 'c'").
        const curNewest = await currentRow(page);
        check("current node tracks newest edit (#3 ins 'c')",
            curNewest && curNewest.includes("#3") && curNewest.includes("'c'"), `(${curNewest})`);

        // 8. Esc -> NORMAL badge.
        await press(page, "Escape");
        check("Esc -> NORMAL badge", (await activeMode(page)) === "NORMAL");

        // 9. u undoes: current moves to parent (#3 -> #2), buffer reverts to "ab".
        await press(page, "u");
        const curAfterU = await currentRow(page);
        const bufAfterU = await bufferText(page);
        check("u undo -> parent node (#2)", curAfterU && curAfterU.includes("#2"), `(${curAfterU})`);
        check("u undo reverts buffer (abc -> ab)", bufAfterU && bufAfterU.includes("ab") && !bufAfterU.includes("abc"),
            `(buffer=${JSON.stringify(bufAfterU)})`);

        // 10. Ctrl+R redoes: current moves to youngest child (#2 -> #3).
        await page.keyboard.down("Control");
        await page.keyboard.press("r");
        await page.keyboard.up("Control");
        await sleep(80);
        const curAfterRedo = await currentRow(page);
        check("Ctrl+R redo -> youngest child (#3)", curAfterRedo && curAfterRedo.includes("#3"), `(${curAfterRedo})`);

        // 11. Branch + chronological walk.
        //   We are at #3 (chain 0->1->2->3 = "abc"). Undo twice to #1, switch to
        //   insert, type a different char -> creates a NEW branch child #4 off #1.
        //   Tree now branches at #1: [#2->#3] and [#4]. Then -/= (g-/g+) walk by id
        //   across BOTH branches chronologically (id order), exercising the branch nav.
        await press(page, "u");          // #3 -> #2
        await press(page, "u");          // #2 -> #1
        const curAtBranchPoint = await currentRow(page);
        await press(page, "i");          // Normal -> Insert
        await press(page, "Z");          // new branch: commit #4 (ins 'Z') off #1
        const rowsAfterBranch = await rowCount(page);
        const curBranch = await currentRow(page);
        check("branch created: new node #4 off #1",
            curBranch && curBranch.includes("#4") && curBranch.includes("'Z'") && rowsAfterBranch === 5,
            `(branchPoint=${curAtBranchPoint}, now=${curBranch}, rows=${rowsAfterBranch})`);

        // Back to Normal, then walk chronologically with - (g-) and = (g+).
        await press(page, "Escape");     // Insert -> Normal
        await press(page, "-");          // g-: #4 -> #3 (crosses branch boundary by id)
        const curMinus = await currentRow(page);
        check("g- (-) chronological back across branches (#4 -> #3)",
            curMinus && curMinus.includes("#3"), `(${curMinus})`);
        await press(page, "=");          // g+: #3 -> #4
        const curPlus = await currentRow(page);
        check("g+ (=) chronological forward across branches (#3 -> #4)",
            curPlus && curPlus.includes("#4"), `(${curPlus})`);

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
