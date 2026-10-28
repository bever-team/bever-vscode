# AGENTS.md

Guidance for coding agents working in this repository. Humans: see [CONTRIBUTING.md](CONTRIBUTING.md).

## What this is

The VS Code extension for `.bev` files: syntax highlighting (`syntaxes/bev.tmLanguage.json`), snippets (`snippets/bev.json`), language configuration, and diagnostics from `bever check` (`src/extension.ts`).

## Read first

| Topic | Document |
| --- | --- |
| Language | [bever.dev/reference/language](https://bever.dev/reference/language) (`../bever.dev/docs/reference/language.md` when checked out alongside) |
| Diagnostics output | [bever.dev/reference/diagnostics](https://bever.dev/reference/diagnostics), [bever.dev/reference/cli](https://bever.dev/reference/cli) |

## Commands

```sh
npm install
npm run compile
npm test        # grammar tests
```

## Rules

- Highlight and snippet only what the compiler accepts. Reserved keywords stay plain until they are implemented.
- Copy grammar changes to `docs/.vitepress/bev.tmLanguage.json` in bever.dev in the same change.
- Diagnostics come from `bever check` output (`path:line:column: error BEV1234: message`). The extension never reimplements language rules.
- The icon in `images/` is a packaged copy of the brand icon; do not redesign it.
