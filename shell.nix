{
    mkShell,
    nodejs_25,
    pnpm_10,
}:
mkShell {
    packages = [
        nodejs_25
        pnpm_10
    ];

    shellHook = ''
        pnpm install
    '';
}
