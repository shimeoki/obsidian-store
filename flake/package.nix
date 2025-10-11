{ inputs, ... }:
let
    version = "0.5.0";
    hash = "sha256-Mqc1hRqaHJ0KTCPSv7N9MwFRCntCKTppPtwY7fIkPFY=";
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
                inherit version;

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
                    mkdir -p $out/store
                    cp main.js $out/store/main.js
                    cp manifest.json $out/store/manifest.json
                '';
            });
        };
}
