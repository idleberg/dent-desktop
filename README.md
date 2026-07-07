# Dent Desktop

> A desktop application for [dent](https://www.npmjs.org/package/@nsis/dent),
> the opinionated [NSIS](https://nsis.sourceforge.io/) code formatter.

![Screenshot](https://raw.githubusercontent.com/idleberg/dent-desktop/main/resources/screenshot.png)

> [!NOTE]
> I have little to no interest in creating a Desktop app for `dent`, but I was intrigued to try out
> [Deno Desktop](https://docs.deno.com/runtime/desktop/). Don't bet on longtime support for this
> app, it's merely a fun experiment.

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
