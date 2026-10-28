# Contributing to Bever for VS Code

```sh
npm install
npm run compile
npm test
```

- The grammar follows the [language reference](https://bever.dev/reference/language). Highlight only constructs the compiler accepts; reserved keywords stay plain until they are implemented.
- Copy grammar changes to `docs/.vitepress/bev.tmLanguage.json` in [bever.dev](https://github.com/bever-team/bever.dev).
- Diagnostics come from `bever check`; the extension never reimplements language rules.

By participating you agree to follow the [code of conduct](https://github.com/bever-team/.github/blob/main/CODE_OF_CONDUCT.md).
