# Contributing

## Issues

Before making a contribution, it's advised to open an issue first to discuss the
change beforehand. The process is the same for bug fixes, translations and new
features.

## AI

AI contributions are prohibited. By "AI" the policy means LLMs and all other
kinds of artificial intelligence. This includes, but not limited to:

- Agentic usage (100% AI code);
- Modifications of AI code (partial AI code);
- AI completions inside of an editor (AI-assisted code);
- Copy-pasting or rewriting from a chat (AI traced code).

This covers code, documentation, tests, translation, bug reports, comments on
issues, etc. - everything in the repository. The same applies to reading the
contents of the repository via AI: it's not allowed, even for local models.

While this is a mandatory requirement for every contribution, it cannot be
easily verified all the time. The decision to whether decline the contribution
because "it looks like AI" is still up to the maintainer.

## Commit style

This project follows [Conventional Commits](https://conventionalcommits.org) for
commit descriptions. Please make sure that you follow the format before
submitting a pull request.

## Development environment

The repository is a Nix flake, so if you use Nix and you use the new
`nix-command` and `flakes` experimental features, you can use these commands:

```sh
nix develop     # pnpm + nodejs with install hook. environment for building
nix fmt         # treefmt. formats the project
nix flake check # package + formatting. run before a pull request or a commit
```

If you don't use Nix, just make sure that pnpm (at least 11.18.0) is installed
on your system and is available.

It's recommended to test your changes in a blank/test Obsidian vault. Clone the
repository to the `.obsidian/plugins` directory and rename `obsidian-store` to
just `store`. Also install [Hot-Reload](https://github.com/pjeby/hot-reload)
plugin to view the changes without reopening the vault.

To build the project once, run:

```sh
pnpm build
```

To use a "watch" mode (rebuild on each change), run:

```sh
pnpm build --watch
```
