{
    description = "Manage your notes within a single folder.";

    outputs =
        { flakelight, systems, ... }@inputs:
        flakelight ./. {
            inherit inputs;
            systems = import systems;
            package = import ./package.nix;
            devShell = import ./shell.nix;
            imports = [ ./treefmt.nix ];
        };

    inputs = {
        nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
        systems.url = "github:nix-systems/default-linux";

        flakelight = {
            url = "github:nix-community/flakelight";
            inputs.nixpkgs.follows = "nixpkgs";
        };

        treefmt = {
            url = "github:numtide/treefmt-nix";
            inputs.nixpkgs.follows = "nixpkgs";
        };
    };
}
