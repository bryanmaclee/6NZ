#!/usr/bin/env bun
// playground-six — LSP-over-WebSocket bridge.
//
// Spawns scrmlTS's LSP (`bun lsp/server.js --stdio`) and exposes it
// to the browser over WebSocket. Browsers can't shell out to a child
// process; this bridge is the workaround.
//
// Wire:
//
//   browser <-- WebSocket (JSON frame) --> bridge <-- stdio
//      (Content-Length framed JSON-RPC) --> LSP child
//
// Each WebSocket frame from the browser is one JSON-RPC message —
// we Content-Length-frame it and write to the LSP child's stdin.
// LSP responses come back Content-Length-framed; we parse them and
// send each as a single WebSocket frame.
//
// Run: bun src/playground-six/bridge.js
//      (defaults to PORT=3061 and LSP at scrmlTS via SCRMLTS_DIR env)
//
// Stop: SIGINT (Ctrl+C). Bridge will SIGTERM the LSP child.

const PORT = parseInt(process.env.PORT || "3061", 10);
// Resolve scrmlTS relative to this bridge: 6NZ/src/playground-six/bridge.js
// → ../../../scrmlTS — works across machines (was hardcoded /home/bryan-maclee/).
const SCRMLTS_DIR = process.env.SCRMLTS_DIR ||
    new URL("../../../scrmlTS", import.meta.url).pathname;

console.log("[bridge] spawning LSP:", `bun ${SCRMLTS_DIR}/lsp/server.js --stdio`);

const lsp = Bun.spawn({
    cmd: ["bun", `${SCRMLTS_DIR}/lsp/server.js`, "--stdio"],
    cwd: SCRMLTS_DIR,
    stdin: "pipe",
    stdout: "pipe",
    stderr: "inherit",
});

// Track currently-connected websocket. MVP: one client at a time.
let ws = null;

// --- LSP stdout parsing (Content-Length framing) ---------------
//
// Frames look like:
//   Content-Length: 123\r\n
//   \r\n
//   <123 bytes of UTF-8 JSON>
//
// We accumulate bytes into a buffer and pull frames as they complete.

let stdoutBuf = new Uint8Array(0);

function appendBytes(a, b) {
    const out = new Uint8Array(a.length + b.length);
    out.set(a, 0);
    out.set(b, a.length);
    return out;
}

function tryExtractFrame() {
    // Look for "\r\n\r\n" (header end).
    const HEADER_END = [13, 10, 13, 10];
    let headerEnd = -1;
    for (let i = 0; i + 3 < stdoutBuf.length; i++) {
        if (stdoutBuf[i] === HEADER_END[0]
            && stdoutBuf[i+1] === HEADER_END[1]
            && stdoutBuf[i+2] === HEADER_END[2]
            && stdoutBuf[i+3] === HEADER_END[3]) {
            headerEnd = i;
            break;
        }
    }
    if (headerEnd < 0) return null;

    const headerStr = new TextDecoder().decode(stdoutBuf.subarray(0, headerEnd));
    const m = headerStr.match(/Content-Length:\s*(\d+)/i);
    if (!m) {
        console.error("[bridge] malformed LSP header:", headerStr);
        // Discard up to the header-end and keep going.
        stdoutBuf = stdoutBuf.subarray(headerEnd + 4);
        return null;
    }
    const len = parseInt(m[1], 10);
    const bodyStart = headerEnd + 4;
    if (stdoutBuf.length < bodyStart + len) return null; // wait for more

    const body = stdoutBuf.subarray(bodyStart, bodyStart + len);
    stdoutBuf = stdoutBuf.subarray(bodyStart + len);
    return new TextDecoder().decode(body);
}

(async () => {
    const reader = lsp.stdout.getReader();
    while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        stdoutBuf = appendBytes(stdoutBuf, value);
        let frame;
        while ((frame = tryExtractFrame()) !== null) {
            // Forward to current ws client.
            if (ws && ws.readyState === 1) {
                try { ws.send(frame); }
                catch (e) { console.error("[bridge] ws.send failed:", e.message); }
            }
        }
    }
    console.log("[bridge] LSP stdout closed.");
})();

// --- WebSocket server -----------------------------------------
//
// Bun.serve handles upgrades. `message` fires per incoming frame.

const server = Bun.serve({
    port: PORT,
    fetch(req, srv) {
        if (srv.upgrade(req)) return; // upgraded to WS
        return new Response("playground-six bridge — connect via WebSocket", { status: 200 });
    },
    websocket: {
        open(socket) {
            console.log("[bridge] ws client connected");
            // MVP: only one client. Newest wins.
            if (ws && ws.readyState === 1) {
                try { ws.close(1000, "replaced by new connection"); } catch {}
            }
            ws = socket;
        },
        message(socket, message) {
            // message is a string (JSON-RPC) per our convention.
            const json = typeof message === "string" ? message : new TextDecoder().decode(message);
            const body = new TextEncoder().encode(json);
            const header = `Content-Length: ${body.length}\r\n\r\n`;
            const headerBytes = new TextEncoder().encode(header);
            const frame = appendBytes(headerBytes, body);
            try {
                lsp.stdin.write(frame);
            } catch (e) {
                console.error("[bridge] lsp.stdin write failed:", e.message);
            }
        },
        close(socket) {
            console.log("[bridge] ws client disconnected");
            if (ws === socket) ws = null;
        },
    },
});

console.log(`[bridge] listening on ws://localhost:${server.port}`);

// SIGINT cleanup.
process.on("SIGINT", () => {
    console.log("\n[bridge] shutting down...");
    try { lsp.kill(); } catch {}
    server.stop(true);
    process.exit(0);
});
