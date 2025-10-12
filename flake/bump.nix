{ inputs, ... }:
{
    perSystem =
        { pkgs, ... }:
        let
            inherit (pkgs.lib.importJSON "${inputs.self}/manifest.json")
                version
                ;
        in
        {
            apps.bump = pkgs.writeShellApplication {
                name = "obsidian-store-bump";

                runtimeInputs = with pkgs; [
                    nushell
                    git
                    nix
                ];

                runtimeEnv = {
                    VERSION = version;
                };

                text = ''
                    ./bump.nu $1

                    nix fmt
                    git add manifest.json
                    git add package.json

                    git commit -m "chore: bump version to $VERSION"
                    git tag -a "$VERSION" -m "$VERSION"
                '';
            };
        };
}
