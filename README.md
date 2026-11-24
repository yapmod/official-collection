# Official Yapmod Collection

The official plugin and theme collections maintained by Yapmod. Add the collection once and use **Refresh collection** in the client to see newly published plugins. Choose which plugins to install and enable individually.

[Browse the catalog](https://yapmod.github.io/official-collection/) · [Collection index](https://raw.githubusercontent.com/yapmod/official-collection/plugin-dist/index.json)

## Add the plugin collection

In Yapmod Client, open **Plugins → Add Plugin → Collection**, paste the collection index URL above, and select **Add Collection**.

## Add the theme collection

In **Themes → Add Theme → Collection**, paste the URL below and select **Add Collection**. Expand **Official Yapmod Themes**, install **Black**, and enable it.

```text
https://raw.githubusercontent.com/yapmod/official-collection/main/themes/index.json
```

Black is published by ilyeshdz for personal, non-commercial use. [Theme source and preview](https://github.com/ilyeshdz/yapmod-theme) · [License](https://github.com/ilyeshdz/yapmod-theme/blob/main/themes/black/LICENSE)

## Maintain the registry

The catalog and publishing workflow are based on [yapmod/plugin-starter](https://github.com/yapmod/plugin-starter). Collection metadata lives in `collection.json`. For each future plugin, add a folder under `plugins/<slug>/` containing an `index.tsx` entry and a `package.json` with its name, author, description and version. Keep the slug stable because it is part of the download URL.

Using Node 24 and pnpm 12, run `pnpm install --frozen-lockfile`, `pnpm test`, and `pnpm build`. The build generates the index and catalog in `dist/`, including when the collection is empty. GitHub Actions checks pull requests and publishes successful main builds to GitHub Pages and the `plugin-dist` branch.
