<script lang="ts">
  import { Compartment, EditorState, type Extension } from "@codemirror/state";
  import { EditorView } from "@codemirror/view";
  import { onMount } from "svelte";
  import { darkTheme, editorTheme, lightTheme } from "./themes";

  let {
    dark = true,
    extensions = [] as Extension[],
    label = "",
    oncreate,
  }: {
    dark?: boolean;
    extensions?: Extension[];
    label?: string;
    oncreate?: (view: EditorView) => void;
  } = $props();

  let container: HTMLDivElement;
  let view: EditorView | undefined;
  const themeCompartment = new Compartment();

  onMount(() => {
    view = new EditorView({
      state: EditorState.create({
        doc: "",
        extensions: [
          themeCompartment.of(dark ? darkTheme : lightTheme),
          editorTheme,
          ...extensions,
        ],
      }),
      parent: container,
    });
    oncreate?.(view);
    return () => view?.destroy();
  });

  $effect(() => {
    const theme = dark ? darkTheme : lightTheme;
    view?.dispatch({ effects: themeCompartment.reconfigure(theme) });
  });
</script>

<div bind:this={container} aria-label={label}></div>

<style>
  div {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
  div :global(.cm-editor) {
    flex: 1;
    min-height: 0;
  }
</style>
