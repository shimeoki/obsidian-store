#!/usr/bin/env nu

let current = (
    open manifest.json
    | get version
    | parse "{major}.{minor}.{patch}"
    | into int major minor patch
)

def increase [name: string]: table -> table {
    $in | update $name { $in + 1 }
}

def reset [name: string]: table -> table {
    $in | update $name 0
}

def bump [file: string, version: string]: nothing -> nothing {
    open $file | update version $version | save --force $file
}

def main [bump: string] {
    let target = (match $bump {
        major => ($current | reset patch | reset minor | increase major),
        minor => ($current | reset patch | increase minor),
        patch => ($current | increase patch),
        _ => (error make { msg: 'invalid bump' }),
    })

    nix fmt
    nix flake check

    let version = $'($target.major.0).($target.minor.0).($target.patch.0)'

    bump manifest.json $version
    bump package.json $version

    nix fmt

    git add manifest.json
    git add package.json

    git commit -m $'chore: bump version to ($version)'
    git tag -a $version -m $version
}
