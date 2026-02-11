{ inputs, lib, ... }:
let
    manifest = lib.importJSON "${inputs.self}/manifest.json";
    hash = "sha256-+oX3kERF+y58gJBggoA9KcERMaPDuhH9puDlWLNzDRo=";
in
{
    perSystem =
        { pkgs, ... }:
        let
            inherit (pkgs) pnpmConfigHook;
            nodejs = pkgs.nodejs_25;
            pnpm = pkgs.pnpm_10.override { inherit nodejs; };

            package = pkgs.stdenv.mkDerivation (finalAttrs: {
                pname = "obsidian-store";
                inherit (manifest) version;

                src = "${inputs.self}";

                nativeBuildInputs = [
                    nodejs
                    pnpm
                    pnpmConfigHook
                ];

                pnpmDeps = pkgs.fetchPnpmDeps {
                    inherit (finalAttrs) pname version src;
                    inherit hash pnpm;
                    fetcherVersion = 3;
                };

                buildPhase = ''
                    pnpm build
                '';

                installPhase = ''
                    mkdir -p $out
                    cp main.js $out/main.js
                    cp manifest.json $out/manifest.json
                '';
            });
        in
        {
            packages.default = package;
            checks.default = package;
        };
}
