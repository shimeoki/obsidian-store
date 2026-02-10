{ inputs, ... }:
let
    hash = "sha256-95g7dJWuWi9cg2ElkWwt1ToRt6lBXGoXBzpFfVIvZh4=";
in
{
    perSystem =
        { pkgs, ... }:
        let
            nodejs = pkgs.nodejs_24;
            pnpm = pkgs.pnpm_10;
        in
        {
            packages.default = pkgs.stdenv.mkDerivation (finalAttrs: {
                pname = "obsidian-store";
                inherit (pkgs.lib.importJSON "${inputs.self}/manifest.json")
                    version
                    ;

                src = "${inputs.self}";

                nativeBuildInputs = [
                    nodejs
                    pnpm.configHook
                ];

                pnpmDeps = pnpm.fetchDeps {
                    inherit (finalAttrs) pname version src;
                    inherit hash;
                    fetcherVersion = 2;
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
        };
}
