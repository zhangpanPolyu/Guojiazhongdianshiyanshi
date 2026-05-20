/**
 * Direct entry point for the Expo dev workflow.
 * Opens port immediately (so health check passes), then starts Metro in background.
 * Run directly: node scripts/dev-server.js
 */
const http = require("http");
const { spawn } = require("child_process");
const path = require("path");

const PORT = parseInt(process.env.PORT || "8008", 10);
const METRO_PORT = PORT + 1;
const projectRoot = path.resolve(__dirname, "..");

// Inherit/set Expo env vars from Replit env
const expoEnv = {
  ...process.env,
  PORT: String(METRO_PORT),
  EXPO_PACKAGER_PROXY_URL: process.env.EXPO_PACKAGER_PROXY_URL
    || (process.env.REPLIT_EXPO_DEV_DOMAIN ? `https://${process.env.REPLIT_EXPO_DEV_DOMAIN}` : undefined),
  EXPO_PUBLIC_DOMAIN: process.env.EXPO_PUBLIC_DOMAIN || process.env.REPLIT_DEV_DOMAIN,
  EXPO_PUBLIC_REPL_ID: process.env.EXPO_PUBLIC_REPL_ID || process.env.REPL_ID,
  REACT_NATIVE_PACKAGER_HOSTNAME: process.env.REACT_NATIVE_PACKAGER_HOSTNAME || process.env.REPLIT_DEV_DOMAIN,
};

let metroReady = false;

function checkMetroHealth() {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${METRO_PORT}/status`, (res) => {
      resolve(res.statusCode < 500);
    });
    req.on("error", () => resolve(false));
    req.setTimeout(2000, () => { req.destroy(); resolve(false); });
  });
}

async function pollMetro() {
  for (let i = 0; i < 300; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    if (await checkMetroHealth()) {
      metroReady = true;
      console.log(`[dev-server] Metro ready on port ${METRO_PORT}`);
      return;
    }
  }
  console.error("[dev-server] Metro did not become ready in 300s");
}

// Open proxy port immediately so the workflow health check detects it
const server = http.createServer((req, res) => {
  if (!metroReady) {
    res.writeHead(200, { "content-type": "text/html" });
    res.end(
      `<!DOCTYPE html><html><head><meta charset="utf-8"><meta http-equiv="refresh" content="3">` +
      `<title>Starting...</title><style>body{background:#050814;color:#00F0FF;font-family:monospace;` +
      `display:flex;align-items:center;justify-content:center;height:100vh;margin:0;flex-direction:column;gap:16px}` +
      `</style></head><body><div style="font-size:24px;letter-spacing:4px">FIELD ENGINEER</div>` +
      `<div style="color:#4A6080;font-size:13px">Metro bundler starting \u2014 please wait...</div></body></html>`
    );
    return;
  }
  // Proxy to Metro
  const options = {
    hostname: "127.0.0.1",
    port: METRO_PORT,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: `localhost:${METRO_PORT}` },
  };
  const proxy = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });
  proxy.on("error", (err) => {
    if (!res.headersSent) {
      res.writeHead(502, { "content-type": "text/plain" });
      res.end("Metro unavailable: " + err.message);
    }
  });
  req.pipe(proxy, { end: true });
});

server.on("upgrade", (req, socket, head) => {
  // Proxy WebSocket upgrades to Metro
  const net = require("net");
  const upstream = net.createConnection(METRO_PORT, "127.0.0.1", () => {
    upstream.write(
      `${req.method} ${req.url} HTTP/1.1\r\n` +
      Object.entries(req.headers).map(([k, v]) => `${k}: ${v}`).join("\r\n") +
      `\r\n\r\n`
    );
    upstream.write(head);
    socket.pipe(upstream).pipe(socket);
  });
  upstream.on("error", () => socket.destroy());
  socket.on("error", () => upstream.destroy());
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[dev-server] Listening on 0.0.0.0:${PORT}, proxying Metro on ${METRO_PORT}`);
});

// Start Metro
const metro = spawn("pnpm", ["exec", "expo", "start", "--localhost", "--port", String(METRO_PORT)], {
  stdio: ["ignore", "pipe", "pipe"],
  cwd: projectRoot,
  env: expoEnv,
});
metro.stdout.on("data", (d) => { const t = d.toString().trim(); if (t) console.log("[Metro]", t); });
metro.stderr.on("data", (d) => { const t = d.toString().trim(); if (t) console.error("[Metro Err]", t); });
metro.on("exit", (code) => { console.log("[dev-server] Metro exited", code); process.exit(code ?? 1); });

process.on("SIGTERM", () => { metro.kill("SIGTERM"); server.close(); process.exit(0); });
process.on("SIGINT", () => { metro.kill("SIGINT"); server.close(); process.exit(0); });

pollMetro();
