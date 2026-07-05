const bundleJs = await Deno.readTextFile(
  new URL("./dist/bundle.js", import.meta.url),
);

function html(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Dent</title>
<style>
	:root {
		--bg: #1e1e2e;
		--surface: #313244;
		--overlay: #45475a;
		--text: #cdd6f4;
		--subtext: #a6adc8;
		--blue: #89b4fa;
		--mauve: #cba6f7;
		--red: #f38ba8;
		--green: #a6e3a1;
		--border: #585b70;
		--radius: 6px;
	}

	[data-theme="light"] {
		--bg: #eff1f5;
		--surface: #e6e9ef;
		--overlay: #ccd0da;
		--text: #4c4f69;
		--subtext: #6c6f85;
		--blue: #1e66f5;
		--mauve: #8839ef;
		--red: #d20f39;
		--green: #40a02b;
		--border: #bcc0cc;
	}

	* { box-sizing: border-box; margin: 0; padding: 0; }

	body {
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
		background: var(--bg);
		color: var(--text);
		height: 100vh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		-webkit-user-select: none;
		user-select: none;
	}

	#app {
		display: contents;
	}

	header {
		padding: 12px 16px;
		display: flex;
		align-items: center;
		gap: 16px;
		border-bottom: 1px solid var(--border);
		flex-shrink: 0;
	}

	header h1 {
		font-size: 16px;
		font-weight: 600;
		color: var(--blue);
	}

	.settings {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 12px;
		font-size: 13px;
		border: none;
		padding: 0;
	}

	.settings label {
		display: flex;
		align-items: center;
		gap: 5px;
		color: var(--subtext);
		cursor: pointer;
	}

	.settings input[type="checkbox"] {
		accent-color: var(--blue);
	}

	.settings select,
	.settings input[type="number"] {
		background: var(--surface);
		color: var(--text);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 3px 6px;
		font-size: 13px;
		font-family: inherit;
	}

	.settings input[type="number"] { width: 70px; }

	.theme-select {
		margin-left: auto;
		background: var(--surface);
		color: var(--text);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 3px 6px;
		font-size: 12px;
		font-family: inherit;
		cursor: pointer;
	}

	.editors {
		flex: 1;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0;
		min-height: 0;
	}

	.editor-pane {
		display: flex;
		flex-direction: column;
		min-height: 0;
	}

	.editor-pane:first-child {
		border-right: 1px solid var(--border);
	}

	.pane-header {
		padding: 8px 12px;
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--subtext);
		background: var(--surface);
		border-bottom: 1px solid var(--border);
		flex-shrink: 0;
	}

footer {
		padding: 8px 16px;
		display: flex;
		align-items: center;
		gap: 12px;
		border-top: 1px solid var(--border);
		flex-shrink: 0;
	}

	button {
		font-family: inherit;
		font-size: 13px;
		font-weight: 500;
		padding: 5px 14px;
		border-radius: var(--radius);
		border: 1px solid transparent;
		cursor: pointer;
		transition: background 0.15s;
	}

	.btn-primary {
		background: var(--blue);
		color: var(--bg);
	}
	.btn-primary:hover { filter: brightness(1.1); }

	.btn-secondary {
		background: var(--surface);
		color: var(--text);
		border-color: var(--border);
	}
	.btn-secondary:hover { background: var(--overlay); }

	.status {
		font-size: 12px;
		color: var(--green);
	}

	.error {
		font-size: 12px;
		color: var(--red);
	}

	.copy-btn {
		margin-left: auto;
	}

	.auto-label {
		display: flex;
		align-items: center;
		gap: 5px;
		font-size: 13px;
		color: var(--subtext);
		cursor: pointer;
	}

	button:disabled {
		opacity: 0.4;
		cursor: default;
	}
</style>
</head>
<body>
	<div id="app"></div>

<script>
	(function() {
		var mql = matchMedia('(prefers-color-scheme: light)');
		var stored = localStorage.getItem('theme') || 'system';
		var isLight = stored === 'light' || (stored === 'system' && mql.matches);
		if (isLight) document.documentElement.dataset.theme = 'light';
	})();
</script>
<script src="/bundle.js" type="module"></script>
</body>
</html>`;
}

Deno.serve((req: Request) => {
  const url = new URL(req.url);

  if (url.pathname === "/bundle.js") {
    return new Response(bundleJs, {
      headers: { "content-type": "application/javascript; charset=utf-8" },
    });
  }

  return new Response(html(), {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
});
