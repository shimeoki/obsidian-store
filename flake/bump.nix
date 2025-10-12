{
    perSystem =
        { pkgs, ... }:
        {
            apps.bump.program = pkgs.writeShellApplication {
                name = "obsidian-store-bump";

                runtimeInputs = with pkgs; [
                    nushell
                    git
                    nix
                ];

                text = ''
                    version="$(./bump.nu "$1")"

                    nix fmt
                    git add manifest.json
                    git add package.json

                    git commit -m "chore: bump version to $version"
                    git tag -a "$version" -m "$version"
                '';
            };
        };
}
