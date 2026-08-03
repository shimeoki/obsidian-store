# Contributing

## Issues

Before making a contribution, it's advised to open an issue first to discuss
the change beforehand. The process is the same for bug fixes, translations and
new features.

## AI

This project follows "Read-Only AI Policy". This means that all changes should
be done manually, by hand. This includes, for example:

- Agentic usage (100% AI code);
- Modifications of AI code (partial AI code);
- AI completions inside of an editor (AI-assisted code);
- Copy-pasting from a chat (AI traced code).

This covers code, documentation, tests and translation - everything in the
repository.

However, this doesn't include use cases of AI for:

- Searching and researching;
- Debugging;
- Analyzing for vulnerabilites;
- And more.

Therefore, the policy is called "Read-Only" in terms of "AI cannot write to the
codebase in any shape or form", but AI can be used for actions limited on just
reading the project's contents.

While this is a mandatory requirement for every contribution, it cannot be
easily verified all the time. The decision to whether decline the contribution
because "it looks like AI" is still up to the maintainer.

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
