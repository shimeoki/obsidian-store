{
    stdenv,
    fetchPnpmDeps,
    pnpmConfigHook,
    nodejs_25,
    pnpm_10,
}:
let
    nodejs = nodejs_25;
    pnpm = pnpm_10.override { inherit nodejs; };
in
stdenv.mkDerivation (finalAttrs: {
    pname = "obsidian-store";
    version = "0.7.1";

    src = ./.;

    nativeBuildInputs = [
        nodejs
        pnpm
        pnpmConfigHook
    ];

    pnpmDeps = fetchPnpmDeps {
        inherit (finalAttrs) pname version src;
        inherit pnpm;
        hash = "sha256-wtDSUyPV8Hg8xeSNfC6nz2TJrXeiUzGTnXIw7kQRZH8=";
        fetcherVersion = 3;
    };

    buildPhase = ''
        runHook preBuild

        pnpm build

        runHook postBuild
    '';

    installPhase = ''
        runHook preInstall

        mkdir -p $out
        cp manifest.json $out
        cp main.js $out

        runHook postInstall
    '';
})
