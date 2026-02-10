{
    description = "obsidian-store";

    outputs =
        inputs:
        inputs.flake-parts.lib.mkFlake { inherit inputs; } {
            systems = import inputs.systems;
            imports = [ ./flake ];
        };

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
}
