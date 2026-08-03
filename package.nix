{
    stdenv,
    lib,
    fetchPnpmDeps,
    pnpmConfigHook,
    pnpm_11,
    nodejs,
}:
let
    pnpm = pnpm_11;
in
stdenv.mkDerivation (finalAttrs: {
    pname = "obsidian-store";
    version = "0.8.0";
    src = ./.;

    meta = {
        description = "Manage your notes within a single folder.";
        homepage = "https://github.com/shimeoki/obsidian-store";
        license = lib.licenses.bsd3;
        platforms = lib.platforms.all;
    };

    nativeBuildInputs = [
        nodejs
        pnpm
        pnpmConfigHook
    ];

    pnpmDeps = fetchPnpmDeps {
        inherit (finalAttrs) pname version src;
        inherit pnpm;
        hash = "sha256-UCYU5ebQC2LHYmPe/Bs5rHcFcpYpwF2BLdguf9OgZns=";
        fetcherVersion = 4;
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
