# Changesets

This repo uses [Changesets](https://github.com/changesets/changesets) to manage versioning and changelog entries.

## When is a changeset required?

| Package                     | Changeset Required? | Why                                    |
| --------------------------- | ------------------- | -------------------------------------- |
| `packages/kumo/`            | **Yes**             | Published to npm as `@cloudflare/kumo` |
| `packages/kumo-docs-astro/` | No                  | Internal docs site, not published      |
| `packages/kumo-figma/`      | No                  | Figma plugin, not published to npm     |

The pre-push hook (`lefthook.yml`) enforces changesets only for `packages/kumo/` changes.

## Creating a changeset

```bash
pnpm changeset
```

Then:

- Select the package(s) you changed
- Choose the appropriate bump type (patch/minor/major)
- Write a short description of why the change matters

Commit the generated `.md` file in this folder.

## Why this file exists

If `.changeset/config.json` is missing, `pnpm changeset` fails with an `ENOENT` error. Keeping the config committed prevents that.
