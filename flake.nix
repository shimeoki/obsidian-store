{
    description = "obsidian-store";

    inputs = {
        nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
        systems.url = "github:nix-systems/x86_64-linux";

        git-hooks = {
            url = "github:cachix/git-hooks.nix";
            inputs.nixpkgs.follows = "nixpkgs";
        };
    };

    # source: https://nixos-and-flakes.thiscute.world/development/intro#using-zsh-fish-instead-of-bash
    outputs =
        {
            nixpkgs,
            systems,
            git-hooks,
            ...
        }:
        let
            forEachSystem = nixpkgs.lib.genAttrs (import systems);
            getPkgs = system: import nixpkgs { inherit system; };

            mkHooks =
                system:
                git-hooks.lib.${system}.run {
                    src = ./.;
                    hooks = {
                        denofmt.enable = true;

                        nixfmt-rfc-style = {
                            enable = true;
                            settings.width = 80;
                            args = [ "--indent=4" ];
                        };
                    };
                };

            mkFormatter =
                system:
                let
                    pkgs = getPkgs system;
                    hooks = mkHooks system;
                    inherit (hooks.config) package configFile;

                    script = ''
                        ${package}/bin/pre-commit run --all-files \
                            --config ${configFile}
                    '';
                in
                pkgs.writeShellScriptBin "obsidian-store-fmt" script;

            mkDevShell =
                system:
                let
                    pkgs = getPkgs system;
                    hooks = mkHooks system;
                    inherit (hooks) shellHook enabledPackages;
                in
                pkgs.mkShell {
                    packages = with pkgs; [
                        nodejs_24
                        pnpm_10
                        nushell
                    ];

                    buildInputs = enabledPackages;

                    shellHook = shellHook + ''
                        pnpm install
                        exec nu
                    '';
                };

            mkPackage =
                system:
                let
                    pkgs = getPkgs system;
                    nodejs = pkgs.nodejs_24;
                    pnpm = pkgs.pnpm_10;
                in
                pkgs.stdenv.mkDerivation (finalAttrs: {
                    pname = "obsidian-store";
                    version = "0.5.0";
                    src = ./.;

                    nativeBuildInputs = [
                        nodejs
                        pnpm.configHook
                    ];

                    pnpmDeps = pnpm.fetchDeps {
                        inherit (finalAttrs) pname version src;
                        fetcherVersion = 2;
                        hash = "sha256-Mqc1hRqaHJ0KTCPSv7N9MwFRCntCKTppPtwY7fIkPFY=";
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
        in
        {
            formatter = forEachSystem mkFormatter;

            checks = forEachSystem (system: {
                pre-commit = mkHooks system;
            });

            devShells = forEachSystem (system: {
                default = mkDevShell system;
            });

            packages = forEachSystem (system: {
                default = mkPackage system;
            });
        };
}
