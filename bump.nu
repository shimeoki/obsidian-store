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

    let version = $'($target.major).($target.minor).($target.patch)'

    bump manifest.json $version
    bump package.json $version
}
