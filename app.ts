// The UI is a standard Vite + Svelte app built to `dist/`. This entrypoint
// serves that build over HTTP; `deno desktop` opens a native window and points
// an embedded webview at the local server. The same code runs in a browser via
// `deno task dev`.

const WEB = new URL("./dist/", import.meta.url);

const WINDOW_WIDTH = 1100;
const WINDOW_HEIGHT = 750;
const WINDOW_TITLE = "Dent";

const APP_IDENTIFIER = "org.nsis-dev.dent";
const THEME_KEY = ["prefs", "theme"];
const DEFAULT_THEME = "system";

/** Per-user data directory for the OS the app is running on. */
function dataDir(): string {
  if (Deno.build.os === "windows") {
    return `${Deno.env.get("APPDATA") ?? "."}\\${APP_IDENTIFIER}`;
  }

  const home = Deno.env.get("HOME") ?? ".";

  if (Deno.build.os === "darwin") {
    return `${home}/Library/Application Support/${APP_IDENTIFIER}`;
  }

  const xdg = Deno.env.get("XDG_DATA_HOME") ?? `${home}/.local/share`;

  return `${xdg}/${APP_IDENTIFIER}`;
}

// `deno desktop` serves on a different port each launch, so the webview's
// `localStorage` — where dent-ui keeps its theme preference — starts empty every
// time. Hold the preference here instead; `src/main.ts` seeds `localStorage`
// from this store on boot and mirrors writes back to it.
const dir = dataDir();
await Deno.mkdir(dir, { recursive: true });
const kv = await Deno.openKv(`${dir}/prefs.sqlite`);

async function servePrefs(req: Request): Promise<Response> {
  if (req.method === "GET") {
    const { value } = await kv.get<string>(THEME_KEY);

    return new Response(value ?? DEFAULT_THEME, {
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  if (req.method === "PUT") {
    await kv.set(THEME_KEY, await req.text());

    return new Response(null, { status: 204 });
  }

  return new Response("Method not allowed", { status: 405 });
}

const CONTENT_TYPES: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

async function serveStatic(pathname: string): Promise<Response> {
  const rel = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");

  try {
    const data = await Deno.readFile(new URL(rel, WEB));
    const ext = rel.slice(rel.lastIndexOf("."));

    return new Response(data, {
      headers: {
        "content-type": CONTENT_TYPES[ext] ?? "application/octet-stream",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

// In a `deno desktop` build, adopt the startup window to set its title and a
// sensible default size. Guarded so plain `deno run` (browser dev) still works.
type DesktopWindow = {
  setSize?: (width: number, height: number) => void;
  setTitle?: (title: string) => void;
};

const desktop = Deno as unknown as {
  BrowserWindow?: new (options: Record<string, unknown>) => DesktopWindow;
};

if (desktop.BrowserWindow) {
  const window = new desktop.BrowserWindow({
    title: WINDOW_TITLE,
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
  });

  // The first construction adopts the already-open startup window; set the size
  // explicitly, and once more after launch in case the backend restores a
  // previous frame.
  const size = () => window.setSize?.(WINDOW_WIDTH, WINDOW_HEIGHT);
  size();
  window.setTitle?.(WINDOW_TITLE);
  setTimeout(size, 250);
}

Deno.serve((req: Request) => {
  const { pathname } = new URL(req.url);

  if (pathname === "/api/prefs/theme") {
    return servePrefs(req);
  }

  return serveStatic(pathname);
});
