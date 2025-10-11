{ inputs, ... }:
{
    imports = [
        inputs.treefmt.flakeModule
    ];

    perSystem = {
        treefmt = {
            programs = {
                # keep-sorted start block=yes newline_separated=yes
                deno = {
                    enable = true;
                    includes = [
                        "src/"
                        "deno.json"
                        "manifest.json"
                        "package.json"
                        "tsconfig.json"
                        "vite.config.ts"
                    ];
                };

                keep-sorted = {
                    enable = true;
                };

                nixfmt = {
                    enable = true;
                    width = 80;
                };
                # keep-sorted end
            };

            settings.formatter = {
                # TODO: use indent option after numtide/treefmt-nix#416
                nixfmt.options = [ "--indent=4" ];
            };
        };
    };
}
