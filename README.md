# Dent Desktop

A desktop application for [NSIS](https://nsis.sourceforge.io), built with
[Deno](https://deno.com) and [Svelte](https://svelte.dev).

## Prerequisites

Development requires [Deno](https://deno.com) v2.9 or later. You may use
[Mise](https://mise.jdx.dev/) for setup:

```sh
mise install
```

## Development

Start the development server:

```sh
deno task dev
```

## Building

Bundle the frontend:

```sh
deno task bundle
```

Build the desktop app for the current platform:

```sh
deno task build
```

### Build Output

| Platform | Output                                                          |
| -------- | --------------------------------------------------------------- |
| macOS    | `Dent.app/`                                                     |
| Windows  | `Dent/` (contains `Dent.bat`, `Dent.dll`, `laufey_webview.exe`) |

## License

This work is licensed under [The MIT License](LICENSE).
