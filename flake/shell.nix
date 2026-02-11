{
    perSystem =
        { pkgs, ... }:
        {
            devShells.default = pkgs.mkShell {
                packages = with pkgs; [
                    nodejs_25
                    pnpm_10
                ];

                shellHook = ''
                    pnpm install
                '';
            };
        };
}
