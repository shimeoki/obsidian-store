# Store

Manage your notes within a single folder. Almost.

![banner](./banner.png)

## Usage

> [!WARNING]
> Though the plugin should be safe to the data, it's almost impossible to revert
> the changes to the vault's structure made by this plugin. You **should** make
> a backup of the vault before the first use.

It's recommended to read the documentation before installing the plugin. It's
hard to describe in a few words why this plugin is even needed and what it does,
so a separate usage "book" is needed.

See [docs](./docs).

## Installation

### Community plugins

This plugin is not available in Community plugins tab in Obsidian yet, because
the plugin isn't stable right now. When the plugin's 1.0.0 version releases, I
will submit a ticket.

### BRAT

You can install [BRAT](https://github.com/TfTHacker/obsidian42-brat) to
install/update the plugin automatically. Add the repository URL in "Beta plugin
list" section. It's recommended to not use the "latest version" tag right now,
because the plugin is not stable yet. Use a specific version (like 0.7.0).

### GitHub releases

This repository has automatic GitHub releases, so you can manually install the
plugin in `vault/.obsidian/plugins/store` by copying `main.js` and
`manifest.json` there.

### Nix

This repository is a Nix flake and contains a package for the plugin. You can
either:

1. Use package for `obsidian` module in
   [home-manager](https://github.com/nix-community/home-manager/).
2. Manually install the package contents in `vault/.obsidian/plugins/store`.

## Contributing

All contributions with the suspicion of AI usage in text/code are immediately
declined.

I use Nix for development, so this repository contains everything you need as a
Nix flake:

```sh
nix develop     # pnpm + nodejs with install hook
nix fmt         # treefmt
nix flake check # package + formatting
```
