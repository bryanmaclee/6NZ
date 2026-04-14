// Puppeteer test harness for 6nz-playable prototype.
// Drives the editor via real key events, reads back textarea value + cursor,
// reports pass/fail per motion. Run: node test.js
//
// Each test is a small scenario:
//   seed: initial editor text + starting cursor offset
//   steps: array of key events to dispatch
//   expect: final text + final cursor position (or null for "don't care")

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const fileUrl = 'file://' + path.resolve(__dirname, 'index.html');

// ----- key helpers -----
// A step is a string with tokens:
//   "abc"       -> type these chars in sequence (natural typing, release each
//                  before next)
//   "<Esc>"     -> press Escape
//   "<Enter>"   -> press Enter
//   "<BS>"      -> Backspace
//   "<C-r>"     -> Ctrl+R
//   "<hold:h>"  -> press down key h, don't release
//   "<rel:h>"   -> release key h
//   "<down:k>"  -> alias for hold
//   "<up:k>"   -> alias for rel
//   sequence of z-motion: use explicit holds, e.g.
//     ["<hold:h>", "a", "<rel:h>"]  — press h, tap a, release h
//
// For simple normal-mode tests we pass a string like "3w" which is typed one
// key at a time.

function parseSteps(stepsArr) {
  // flatten: each item either a string of chars or a special token
  const out = [];
  for (const item of stepsArr) {
    if (typeof item !== 'string') continue;
    if (item.startsWith('<') && item.endsWith('>')) {
      out.push({ special: item.slice(1, -1) });
    } else {
      for (const ch of item) out.push({ char: ch });
    }
  }
  return out;
}

// Map single char to puppeteer key. We want e.key to be that char.
function puppeteerKeyForChar(ch) {
  return ch;
}

async function dispatchStep(page, step) {
  if (step.char !== undefined) {
    const ch = step.char;
    // uppercase letter: press Shift for the duration so e.key === 'X'
    const isUpper = ch.length === 1 && ch >= 'A' && ch <= 'Z';
    if (isUpper) await page.keyboard.down('Shift');
    await page.keyboard.down(ch);
    await page.keyboard.up(ch);
    if (isUpper) await page.keyboard.up('Shift');
    return;
  }
  const s = step.special;
  if (s === 'Esc')   { await page.keyboard.press('Escape'); return; }
  if (s === 'Enter') { await page.keyboard.press('Enter'); return; }
  if (s === 'BS')    { await page.keyboard.press('Backspace'); return; }
  if (s === 'Tab')   { await page.keyboard.press('Tab'); return; }
  if (s === 'Space') { await page.keyboard.press('Space'); return; }
  if (s.startsWith('C-')) {
    const k = s.slice(2);
    await page.keyboard.down('Control');
    await page.keyboard.press(k);
    await page.keyboard.up('Control');
    return;
  }
  if (s.startsWith('hold:') || s.startsWith('down:')) {
    const k = s.slice(5);
    await page.keyboard.down(k);
    return;
  }
  if (s.startsWith('rel:') || s.startsWith('up:')) {
    const k = s.slice(s.indexOf(':') + 1);
    await page.keyboard.up(k);
    return;
  }
  if (s === 'Sleep') { await new Promise(r => setTimeout(r, 30)); return; }
  throw new Error('unknown step: ' + s);
}

async function runScenario(page, scenario) {
  // Reset ALL internal state via the test hook. Leaves editor in NORMAL mode.
  await page.evaluate((text, pos) => {
    window.__6nz_reset(text, pos);
  }, scenario.seed.text, scenario.seed.pos || 0);

  // Enter the desired mode from NORMAL.
  if (scenario.seed.mode === 'insert') {
    await page.keyboard.down('i');
    await page.keyboard.up('i');
  } else if (scenario.seed.mode === 'visual') {
    await page.keyboard.down('v');
    await page.keyboard.up('v');
  }
  // Re-seat cursor in case 'i' shifted anything (it shouldn't).
  await page.evaluate((pos) => {
    const ed = document.getElementById('editor');
    ed.selectionStart = ed.selectionEnd = pos;
  }, scenario.seed.pos || 0);

  // dispatch all steps
  const steps = parseSteps(scenario.steps);
  for (const step of steps) {
    await dispatchStep(page, step);
    await new Promise(r => setTimeout(r, 8));
  }

  await new Promise(r => setTimeout(r, 30));

  // read back
  const result = await page.evaluate(() => {
    const ed = document.getElementById('editor');
    return {
      text: ed.value,
      pos: ed.selectionStart,
      selEnd: ed.selectionEnd,
      mode: document.getElementById('mode-indicator').textContent,
    };
  });

  // compare
  const okText = scenario.expect.text === undefined || result.text === scenario.expect.text;
  const okPos = scenario.expect.pos === undefined || result.pos === scenario.expect.pos;
  const okMode = scenario.expect.mode === undefined || result.mode === scenario.expect.mode;
  const pass = okText && okPos && okMode;
  return { pass, result, okText, okPos, okMode };
}

// ----- scenarios -----
const scenarios = [

  // === vim normal motions ===
  { name: 'normal: l moves right', seed: { text: 'hello', pos: 0, mode: 'normal' },
    steps: ['l'], expect: { pos: 1 } },
  { name: 'normal: h moves left',  seed: { text: 'hello', pos: 2, mode: 'normal' },
    steps: ['h'], expect: { pos: 1 } },
  { name: 'normal: 3l counts',     seed: { text: 'hello', pos: 0, mode: 'normal' },
    steps: ['3', 'l'], expect: { pos: 3 } },
  { name: 'normal: j line down',   seed: { text: 'abc\ndef\nghi', pos: 1, mode: 'normal' },
    steps: ['j'], expect: { pos: 5 } },
  { name: 'normal: k line up',     seed: { text: 'abc\ndef\nghi', pos: 5, mode: 'normal' },
    steps: ['k'], expect: { pos: 1 } },
  { name: 'normal: w word forward', seed: { text: 'foo bar baz', pos: 0, mode: 'normal' },
    steps: ['w'], expect: { pos: 4 } },
  { name: 'normal: b word back',    seed: { text: 'foo bar baz', pos: 4, mode: 'normal' },
    steps: ['b'], expect: { pos: 0 } },
  { name: 'normal: e word end',     seed: { text: 'foo bar baz', pos: 0, mode: 'normal' },
    steps: ['e'], expect: { pos: 2 } },
  { name: 'normal: 3w',             seed: { text: 'one two three four', pos: 0, mode: 'normal' },
    steps: ['3', 'w'], expect: { pos: 14 } },
  { name: 'normal: 0 line start',   seed: { text: 'hello world', pos: 5, mode: 'normal' },
    steps: ['0'], expect: { pos: 0 } },
  { name: 'normal: $ line end',     seed: { text: 'hello world', pos: 0, mode: 'normal' },
    steps: ['$'], expect: { pos: 11 } },
  { name: 'normal: ^ first non-blank', seed: { text: '  hello', pos: 6, mode: 'normal' },
    steps: ['^'], expect: { pos: 2 } },
  { name: 'normal: gg doc top',     seed: { text: 'a\nb\nc', pos: 4, mode: 'normal' },
    steps: ['g', 'g'], expect: { pos: 0 } },
  { name: 'normal: G doc bottom',   seed: { text: 'a\nb\nc', pos: 0, mode: 'normal' },
    steps: ['G'], expect: { pos: 4 } },
  { name: 'normal: { para back',    seed: { text: 'a\nb\n\nc\nd', pos: 6, mode: 'normal' },
    steps: ['{'], expect: { pos: 4 } },
  { name: 'normal: } para forward', seed: { text: 'a\nb\n\nc\nd', pos: 0, mode: 'normal' },
    steps: ['}'], expect: { pos: 4 } },
  { name: 'normal: % match paren',  seed: { text: 'x(ab)y', pos: 1, mode: 'normal' },
    steps: ['%'], expect: { pos: 4 } },
  { name: 'normal: fx find char',   seed: { text: 'hello world', pos: 0, mode: 'normal' },
    steps: ['f', 'o'], expect: { pos: 4 } },
  { name: 'normal: tx till char',   seed: { text: 'hello world', pos: 0, mode: 'normal' },
    steps: ['t', 'o'], expect: { pos: 3 } },
  { name: 'normal: ; repeat find',  seed: { text: 'hello world', pos: 0, mode: 'normal' },
    steps: ['f', 'o', ';'], expect: { pos: 7 } },
  { name: 'normal: , reverse find', seed: { text: 'hello world', pos: 7, mode: 'normal' },
    steps: ['f', 'o', ','], expect: { pos: 4 } },

  // === vim normal edits ===
  { name: 'normal: x delete char',  seed: { text: 'hello', pos: 1, mode: 'normal' },
    steps: ['x'], expect: { text: 'hllo', pos: 1 } },
  { name: 'normal: X delete back',  seed: { text: 'hello', pos: 2, mode: 'normal' },
    steps: ['X'], expect: { text: 'hllo', pos: 1 } },
  { name: 'normal: dd delete line', seed: { text: 'a\nb\nc', pos: 2, mode: 'normal' },
    steps: ['d', 'd'], expect: { text: 'a\nc' } },
  { name: 'normal: yy then p',      seed: { text: 'a\nb\nc', pos: 0, mode: 'normal' },
    steps: ['y', 'y', 'p'], expect: { text: 'a\na\nb\nc' } },
  { name: 'normal: D delete to EOL',seed: { text: 'hello world', pos: 5, mode: 'normal' },
    steps: ['D'], expect: { text: 'hello' } },
  { name: 'normal: dw delete word', seed: { text: 'foo bar baz', pos: 0, mode: 'normal' },
    steps: ['d', 'w'], expect: { text: 'bar baz' } },
  { name: 'normal: cw change word (leaves mode=INSERT)',
    seed: { text: 'foo bar', pos: 0, mode: 'normal' },
    steps: ['c', 'w'], expect: { text: 'bar', mode: 'INSERT' } },
  { name: 'normal: d$',             seed: { text: 'hello world', pos: 5, mode: 'normal' },
    steps: ['d', '$'], expect: { text: 'hello' } },
  { name: 'normal: r<c> replace',   seed: { text: 'hello', pos: 1, mode: 'normal' },
    steps: ['r', 'X'], expect: { text: 'hXllo' } },
  { name: 'normal: u undo after x', seed: { text: 'hello', pos: 1, mode: 'normal' },
    steps: ['x', 'u'], expect: { text: 'hello' } },
  { name: 'normal: J join lines',   seed: { text: 'a\nb', pos: 0, mode: 'normal' },
    steps: ['J'], expect: { text: 'a b' } },
  { name: 'normal: ~ toggle case',  seed: { text: 'abc', pos: 0, mode: 'normal' },
    steps: ['~'], expect: { text: 'Abc', pos: 1 } },
  { name: 'normal: >> indent',      seed: { text: 'hello', pos: 0, mode: 'normal' },
    steps: ['>', '>'], expect: { text: '  hello' } },
  { name: 'normal: << dedent',      seed: { text: '  hello', pos: 0, mode: 'normal' },
    steps: ['<', '<'], expect: { text: 'hello' } },
  { name: 'normal: o opens line',   seed: { text: 'a\nb', pos: 0, mode: 'normal' },
    steps: ['o'], expect: { text: 'a\n\nb', mode: 'INSERT' } },
  { name: 'normal: O opens above',  seed: { text: 'a\nb', pos: 0, mode: 'normal' },
    steps: ['O'], expect: { text: '\na\nb', mode: 'INSERT' } },
  { name: 'normal: i enters insert',seed: { text: 'abc', pos: 1, mode: 'normal' },
    steps: ['i', 'X'], expect: { text: 'aXbc', mode: 'INSERT' } },
  { name: 'normal: A appends at EOL', seed: { text: 'hi', pos: 0, mode: 'normal' },
    steps: ['A', '!'], expect: { text: 'hi!', mode: 'INSERT' } },
  { name: 'normal: I inserts at first non-blank',
    seed: { text: '  hi', pos: 3, mode: 'normal' },
    steps: ['I', 'X'], expect: { text: '  Xhi', mode: 'INSERT' } },
  { name: 'normal: diw delete inner word',
    seed: { text: 'foo bar baz', pos: 5, mode: 'normal' },
    steps: ['d', 'i', 'w'], expect: { text: 'foo  baz' } },

  // === Esc behavior ===
  { name: 'insert → Esc → normal mode indicator',
    seed: { text: 'abc', pos: 1, mode: 'insert' },
    steps: ['<Esc>'], expect: { mode: 'NORMAL' } },

  // === visual mode ===
  { name: 'visual: vll then d',
    seed: { text: 'hello', pos: 0, mode: 'normal' },
    steps: ['v', 'l', 'l', 'd'], expect: { text: 'lo' } },

  // === z-motions (insert) ===
  { name: 'z: [h](a) 1 right',
    seed: { text: 'hello', pos: 0, mode: 'insert' },
    steps: ['<hold:h>', 'a', '<rel:h>'], expect: { pos: 1, text: 'hello' } },
  { name: 'z: [h](as) 2 right',
    seed: { text: 'hello', pos: 0, mode: 'insert' },
    steps: ['<hold:h>', '<hold:a>', '<hold:s>', '<rel:a>', '<rel:s>', '<rel:h>'],
    expect: { pos: 2, text: 'hello' } },
  { name: 'z: [h](f) 1 left',
    seed: { text: 'hello', pos: 3, mode: 'insert' },
    steps: ['<hold:h>', 'f', '<rel:h>'], expect: { pos: 2, text: 'hello' } },
  { name: 'z: [w](j) word forward',
    seed: { text: 'foo bar baz', pos: 0, mode: 'insert' },
    steps: ['<hold:w>', 'j', '<rel:w>'], expect: { pos: 4, text: 'foo bar baz' } },
  { name: 'z: [sd](j) line down',
    seed: { text: 'abc\ndef\nghi', pos: 0, mode: 'insert' },
    steps: ['<hold:s>', '<hold:d>', 'j', '<rel:d>', '<rel:s>'],
    expect: { pos: 4, text: 'abc\ndef\nghi' } },
  { name: 'z: [a](j) line end',
    seed: { text: 'hello\nworld', pos: 0, mode: 'insert' },
    steps: ['<hold:a>', 'j', '<rel:a>'], expect: { pos: 5 } },
  { name: 'z: [a](l) line start',
    seed: { text: 'hello\nworld', pos: 3, mode: 'insert' },
    steps: ['<hold:a>', 'l', '<rel:a>'], expect: { pos: 0 } },
  { name: 'z: [g](l) doc top',
    seed: { text: 'a\nb\nc', pos: 3, mode: 'insert' },
    steps: ['<hold:g>', 'l', '<rel:g>'], expect: { pos: 0 } },
  { name: 'z: [g](j) doc bottom',
    seed: { text: 'a\nb\nc', pos: 0, mode: 'insert' },
    steps: ['<hold:g>', 'j', '<rel:g>'], expect: { pos: 4 } },

  // === plain typing ===
  { name: 'insert: natural typing "he"',
    seed: { text: '', pos: 0, mode: 'insert' },
    steps: ['h', 'e'], expect: { text: 'he', pos: 2 } },
  { name: 'insert: typing "hello" rollover',
    seed: { text: '', pos: 0, mode: 'insert' },
    steps: ['h', 'e', 'l', 'l', 'o'], expect: { text: 'hello', pos: 5 } },
];

// ----- feature tests (DOM-level, not keystroke-driven) -----
const featureTests = [
  {
    name: 'feature: palette opens on Ctrl+P',
    run: async (page) => {
      await page.evaluate(() => window.__6nz_reset('', 0));
      await page.focus('#editor');
      await page.keyboard.down('Control');
      await page.keyboard.press('p');
      await page.keyboard.up('Control');
      await new Promise(r => setTimeout(r, 30));
      const active = await page.evaluate(() => document.getElementById('palette').classList.contains('active'));
      // close it again for cleanup
      await page.keyboard.press('Escape');
      return active;
    },
  },
  {
    name: 'feature: syntax highlighter renders tokens',
    run: async (page) => {
      await page.evaluate(() => {
        window.__6nz_reset('const x = 1;', 0);
      });
      await new Promise(r => setTimeout(r, 60));
      const html = await page.evaluate(() => document.getElementById('hl-layer').innerHTML);
      return html.includes('tok-kw') && html.includes('tok-num');
    },
  },
  {
    name: 'feature: Ctrl+B toggles side panel visibility',
    run: async (page) => {
      await page.evaluate(() => window.__6nz_reset('', 0));
      await page.focus('#editor');
      const before = await page.evaluate(() => document.getElementById('panels').classList.contains('hidden'));
      await page.keyboard.down('Control');
      await page.keyboard.press('b');
      await page.keyboard.up('Control');
      await new Promise(r => setTimeout(r, 30));
      const after = await page.evaluate(() => document.getElementById('panels').classList.contains('hidden'));
      // toggle back
      await page.keyboard.down('Control');
      await page.keyboard.press('b');
      await page.keyboard.up('Control');
      return before !== after;
    },
  },
  {
    name: 'feature: F2 opens settings modal',
    run: async (page) => {
      await page.evaluate(() => window.__6nz_reset('', 0));
      await page.focus('#editor');
      await page.keyboard.press('F2');
      await new Promise(r => setTimeout(r, 30));
      const active = await page.evaluate(() => document.getElementById('settings').classList.contains('active'));
      await page.keyboard.press('Escape');
      return active;
    },
  },
  {
    name: 'feature: refs panel lists occurrences of word at cursor',
    run: async (page) => {
      await page.evaluate(() => {
        window.__6nz_reset('function foo() {}\nfoo();\nfoo();', 10);  // on "foo" def
      });
      await new Promise(r => setTimeout(r, 250));
      const count = await page.evaluate(() => {
        return document.querySelectorAll('#panel-body .panel-ref').length;
      });
      return count >= 2;  // at least two other foo occurrences
    },
  },
  {
    name: 'feature: inline expand shows ghost panel for defined symbol',
    run: async (page) => {
      await page.evaluate(() => {
        window.__6nz_reset('function greet(x) {\n  return x;\n}\ngreet(42);', 36);  // cursor on "greet" call
      });
      await page.focus('#editor');
      await page.keyboard.down('Control');
      await page.keyboard.press('Enter');
      await page.keyboard.up('Control');
      await new Promise(r => setTimeout(r, 60));
      const active = await page.evaluate(() => document.getElementById('inline-ghost').classList.contains('active'));
      const sym = await page.evaluate(() => document.getElementById('gh-sym').textContent);
      await page.keyboard.press('Escape');
      return active && sym === 'greet';
    },
  },
  {
    name: 'feature: workspace :new creates a file',
    run: async (page) => {
      await page.evaluate(() => {
        localStorage.removeItem('$6nz:workspace');
        window.__6nz_reset('', 0);
      });
      await page.focus('#editor');
      // open cmdline
      await page.keyboard.press(':');
      await new Promise(r => setTimeout(r, 20));
      await page.type('#cmdline-input', 'new scratch.js');
      await page.keyboard.press('Enter');
      await new Promise(r => setTimeout(r, 30));
      const fname = await page.evaluate(() => document.getElementById('filename').textContent);
      const inWs = await page.evaluate(() => {
        const ws = JSON.parse(localStorage.getItem('$6nz:workspace') || '{}');
        return ws.files && 'scratch.js' in ws.files;
      });
      return fname === 'scratch.js' && inWs;
    },
  },
  {
    name: 'feature: settings persist across reset',
    run: async (page) => {
      await page.evaluate(() => {
        const s = JSON.parse(localStorage.getItem('$6nz:settings') || '{}');
        s.fontSize = 18;
        localStorage.setItem('$6nz:settings', JSON.stringify(s));
      });
      // reload to pick up
      await page.reload();
      await page.waitForSelector('#editor');
      await new Promise(r => setTimeout(r, 80));
      const fs = await page.evaluate(() => document.getElementById('editor').style.fontSize);
      // cleanup
      await page.evaluate(() => localStorage.removeItem('$6nz:settings'));
      return fs === '18px';
    },
  },
];

// ----- runner -----
(async () => {
  console.log('launching puppeteer...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();
  page.on('pageerror', err => console.log('  [pageerror]', err.message));
  await page.goto(fileUrl);
  await page.waitForSelector('#editor');
  // click to focus
  await page.click('#editor');

  const results = [];
  for (const sc of scenarios) {
    try {
      const r = await runScenario(page, sc);
      results.push({ name: sc.name, ...r });
    } catch (e) {
      results.push({ name: sc.name, pass: false, error: e.message });
    }
  }
  // feature tests
  for (const ft of featureTests) {
    try {
      const ok = await ft.run(page);
      results.push({ name: ft.name, pass: !!ok });
    } catch (e) {
      results.push({ name: ft.name, pass: false, error: e.message });
    }
  }

  console.log('');
  let passed = 0, failed = 0;
  for (const r of results) {
    if (r.pass) {
      passed++;
      console.log('  PASS  ' + r.name);
    } else {
      failed++;
      const detail = r.error
        ? 'ERROR: ' + r.error
        : `text=${JSON.stringify(r.result && r.result.text)} pos=${r.result && r.result.pos} mode=${r.result && r.result.mode}`;
      console.log('  FAIL  ' + r.name);
      console.log('        ' + detail);
    }
  }
  console.log(`\n${passed} passed, ${failed} failed, ${results.length} total`);

  // JSON summary
  fs.writeFileSync(
    path.join(__dirname, 'test-results.json'),
    JSON.stringify(results, null, 2)
  );

  await browser.close();
  process.exit(failed ? 1 : 0);
})();
