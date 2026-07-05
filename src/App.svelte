<script lang="ts">
  import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
  import { EditorState } from "@codemirror/state";
  import { EditorView, keymap } from "@codemirror/view";
  import { nsisLanguage } from "@nsis/codemirror";
  import { createFormatter } from "@nsis/dent";
  import Editor from "./Editor.svelte";

  let dark = $state(document.documentElement.dataset.theme !== "light");
  let themePreference = $state(localStorage.getItem("theme") || "system");

  let useTabs = $state(true);
  let singleQuote = $state(false);
  let trimEmptyLines = $state(true);
  let indentSize = $state(2);
  let printWidth = $state(120);
  let endOfLine = $state<"lf" | "crlf">("lf");
  let autoFormat = $state(true);

  let status = $state("");
  let error = $state("");
  let hasOutput = $state(false);
  let inputView: EditorView | undefined;
  let outputView: EditorView | undefined;
  let debounceTimer: ReturnType<typeof setTimeout>;
  let statusTimer: ReturnType<typeof setTimeout>;

  const mql = matchMedia("(prefers-color-scheme: light)");
  mql.addEventListener("change", () => {
    if (themePreference === "system") applyTheme("system");
  });

  function applyTheme(pref: string) {
    const isLight = pref === "light" || (pref === "system" && mql.matches);
    if (isLight) {
      document.documentElement.dataset.theme = "light";
    } else {
      delete document.documentElement.dataset.theme;
    }
    localStorage.setItem("theme", pref);
    dark = !isLight;
  }

  function scheduleAutoFormat() {
    if (!autoFormat) return;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(formatInput, 400);
  }

  function formatInput() {
    error = "";
    const source = inputView?.state.doc.toString() ?? "";

    if (!source.trim()) {
      setOutput("");
      return;
    }

    try {
      const { format } = createFormatter({
        useTabs,
        singleQuote,
        trimEmptyLines,
        indentSize,
        printWidth,
        endOfLine,
      });
      setOutput(format(source));
      clearTimeout(statusTimer);
      status = "Formatted";
      statusTimer = setTimeout(() => {
        status = "";
      }, 1500);
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
    }
  }

  function setOutput(text: string) {
    if (!outputView) return;
    outputView.dispatch({
      changes: { from: 0, to: outputView.state.doc.length, insert: text },
    });
    hasOutput = !!text.trim();
  }

  async function copyOutput() {
    const text = outputView?.state.doc.toString() ?? "";
    if (!text.trim()) return;
    await navigator.clipboard.writeText(text);
    clearTimeout(statusTimer);
    status = "Copied";
    statusTimer = setTimeout(() => {
      status = "";
    }, 1500);
  }

  function clear() {
    clearTimeout(debounceTimer);
    if (inputView) {
      inputView.dispatch({
        changes: { from: 0, to: inputView.state.doc.length, insert: "" },
      });
    }
    setOutput("");
    error = "";
    status = "";
  }

  const inputExtensions = [
    nsisLanguage,
    history(),
    keymap.of([...defaultKeymap, ...historyKeymap]),
    EditorView.lineWrapping,
    EditorView.updateListener.of((update) => {
      if (update.docChanged) scheduleAutoFormat();
    }),
  ];

  const outputExtensions = [
    nsisLanguage,
    EditorState.readOnly.of(true),
    EditorView.editable.of(false),
    EditorView.lineWrapping,
  ];
</script>

<header>
  <h1>Dent</h1>
  <fieldset class="settings" aria-label="Formatter settings">
    <label
      ><input
        type="checkbox"
        bind:checked={useTabs}
        onchange={scheduleAutoFormat}
      /> Tabs</label
    >
    <label
      ><input
        type="checkbox"
        bind:checked={singleQuote}
        onchange={scheduleAutoFormat}
      /> Single quotes</label
    >
    <label
      ><input
        type="checkbox"
        bind:checked={trimEmptyLines}
        onchange={scheduleAutoFormat}
      /> Trim empty lines</label
    >
    <label>
      Indent
      <select bind:value={indentSize} onchange={scheduleAutoFormat}>
        <option value={2}>2</option>
        <option value={4}>4</option>
        <option value={8}>8</option>
      </select>
    </label>
    <label>
      Width
      <input
        type="number"
        bind:value={printWidth}
        onchange={scheduleAutoFormat}
        min="40"
        max="320"
        step="10"
      />
    </label>
    <label>
      EOL
      <select bind:value={endOfLine} onchange={scheduleAutoFormat}>
        <option value="lf">LF</option>
        <option value="crlf">CRLF</option>
      </select>
    </label>
  </fieldset>
  <select
    class="theme-select"
    aria-label="Color theme"
    bind:value={themePreference}
    onchange={() => applyTheme(themePreference)}
  >
    <option value="system">System</option>
    <option value="light">Light</option>
    <option value="dark">Dark</option>
  </select>
</header>

<div class="editors">
  <div class="editor-pane">
    <div class="pane-header">Input</div>
    <Editor
      {dark}
      extensions={inputExtensions}
      label="NSIS input editor"
      oncreate={(v) => (inputView = v)}
    />
  </div>
  <div class="editor-pane">
    <div class="pane-header">Output</div>
    <Editor
      {dark}
      extensions={outputExtensions}
      label="Formatted output editor"
      oncreate={(v) => (outputView = v)}
    />
  </div>
</div>

<footer>
  <button class="btn-primary" onclick={formatInput}>Format</button>
  <button class="btn-secondary" onclick={clear}>Clear</button>
  <label class="auto-label">
    <input type="checkbox" bind:checked={autoFormat} /> Auto-format
  </label>
  {#if status}
    <span class="status" role="status" aria-live="polite">{status}</span>
  {/if}
  {#if error}
    <span class="error" role="alert">{error}</span>
  {/if}
  <button
    class="btn-secondary copy-btn"
    onclick={copyOutput}
    disabled={!hasOutput}>Copy</button
  >
</footer>
