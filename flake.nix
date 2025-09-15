{
    description = "obsidian-store";

    inputs = {
        nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
        systems.url = "github:nix-systems/x86_64-linux";
    };

    # source: https://nixos-and-flakes.thiscute.world/development/intro#using-zsh-fish-instead-of-bash
    outputs =
        { nixpkgs, systems, ... }:
        let
            eachSystem = nixpkgs.lib.genAttrs (import systems);
        in
        {
            devShells = eachSystem (system: {
                default =
                    let
                        pkgs = import nixpkgs { inherit system; };
                    in
                    pkgs.mkShell {
                        packages = with pkgs; [
                            nodejs_24
                            pnpm
                            nushell
                        ];

                        shellHook = ''
                            pnpm install
                            exec nu
                        '';
                    };
            });
        };
}
