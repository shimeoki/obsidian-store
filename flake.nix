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
            devShells = eachSystem (
                system:
                let
                    pkgs = import nixpkgs { inherit system; };
                in
                {
                    default = pkgs.mkShell {
                        packages = with pkgs; [
                            nodejs_24
                            pnpm_10
                            nushell
                        ];

                        shellHook = ''
                            pnpm install
                            exec nu
                        '';
                    };
                }
            );

            packages = eachSystem (
                system:
                let
                    pkgs = import nixpkgs { inherit system; };
                    nodejs = pkgs.nodejs_24;
                    pnpm = pkgs.pnpm_10;
                in
                {
                    default = pkgs.stdenv.mkDerivation (finalAttrs: {
                        pname = "obsidian-store";
                        version = "0.4.1";
                        src = ./.;

                        nativeBuildInputs = [
                            nodejs
                            pnpm.configHook
                        ];

                        pnpmDeps = pnpm.fetchDeps {
                            inherit (finalAttrs) pname version src;
                            fetcherVersion = 2;
                            hash = "sha256-Aq7Z7Hjmy9iOhbd/p3XfQ2G9dmoNUaX0xh8XVbt7qSA=";
                        };

                        buildPhase = ''
                            pnpm build
                        '';

                        installPhase = ''
                            mkdir -p $out/store
                            cp main.js $out/store/main.js
                            cp manifest.json $out/store/manifest.json
                        '';
                    });
                }
            );
        };
}
