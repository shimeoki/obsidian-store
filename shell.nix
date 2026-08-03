{
    mkShell,
    pnpm_11,
    nodejs,
}:
mkShell {
    packages = [
        nodejs
        pnpm_11
    ];

    shellHook = ''
        pnpm install
    '';
}
