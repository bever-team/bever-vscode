# Bever for Visual Studio Code

Language support for [Bever](https://bever.dev) `.bev` files.

> **Bever is pre-alpha.** The language and APIs will change in breaking ways between releases, and there is no upgrade path yet. Do not use it for production data. See [Status](https://bever.dev/guide/what-is-bever#status).

- **Highlighting** for entities, fields, types, relationships, actions, `By` rules, and `Present` blocks
- **Errors as you type**, from `bever check`, with file, line, and column
- **Snippets** for entities, fields, enums, relationships, actions, pickers, and presentation (`entity`, `field`, `enum`, `rel`, `owner`, `action`, `present`, ...)
- Comment toggling, bracket matching, and indentation-based folding

## Requirements

Error checking runs the Bever CLI. Install it with:

```sh
dotnet tool install --global --prerelease Bever.Cli
```

Without the CLI, highlighting and snippets still work, and the extension tells you how to install it.

## Settings

| Setting | Default | Description |
| --- | --- | --- |
| `bever.check.enabled` | `true` | Check `.bev` files and show errors |
| `bever.check.command` | `bever` | The CLI command |
| `bever.check.arguments` | `["check"]` | Arguments before the folder of the checked file |

The extension checks the folder that contains the open file, so entities declared in other files of the same `bev/` folder resolve.

## Develop

```sh
npm install
npm run compile
npm test
```

Open this folder in VS Code and press F5 to start an Extension Development Host. Package with `npx @vscode/vsce package`.

The grammar in `syntaxes/bev.tmLanguage.json` also highlights `.bev` code on [bever.dev](https://github.com/bever-team/bever.dev); keep the copies in sync.

## License

Licensed under the [Apache License 2.0](LICENSE). "Bever" and the Bever logo are trademarks; see [TRADEMARKS.md](https://github.com/bever-team/bever/blob/main/TRADEMARKS.md).
