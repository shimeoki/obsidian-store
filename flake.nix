{
    description = "obsidian-store";

    inputs = {
        nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";

        flake-parts.url = "github:hercules-ci/flake-parts";
        systems.url = "github:nix-systems/x86_64-linux";

        treefmt = {
            url = "github:numtide/treefmt-nix";
            inputs = {
                nixpkgs.follows = "nixpkgs";
            };
        };
    };

    outputs =
        inputs:
        inputs.flake-parts.lib.mkFlake { inherit inputs; } {
            systems = import inputs.systems;

            imports = [
                # keep-sorted start
                ./flake/bump.nix
                ./flake/dev.nix
                ./flake/fmt.nix
                ./flake/pkg.nix
                # keep-sorted end
            ];
        };
}
