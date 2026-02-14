import { normalizePath } from "obsidian"

export interface FeatureSetting {
    enable: boolean
    exclude: ExcludeSetting
}

export interface ExcludeSetting {
    paths: string[]
    props: string[]
    tags: string[]
}

export interface Settings {
    version: number

    folder: string

    templates: {
        default: string
        folder: string
    }

    pack: {
        folder: string
    }

    heading: FeatureSetting
    aliases: FeatureSetting

    assets: {
        enable: boolean
        folder: string
    }

    archive: {
        enable: boolean
        folder: string
        tag: string
    }
}

export const DEFAULT_SETTINGS: Settings = {
    version: 0,

    folder: "store",

    templates: {
        default: "",
        folder: "",
    },

    pack: {
        folder: "pack",
    },

    heading: {
        enable: true,
        exclude: {
            paths: [],
            props: ["excalidraw-plugin", "kanban-plugin"],
            tags: [],
        },
    },

    aliases: {
        enable: true,
        exclude: {
            paths: [],
            props: ["excalidraw-plugin", "kanban-plugin"],
            tags: [],
        },
    },

    assets: {
        enable: true,
        folder: "assets",
    },

    archive: {
        enable: true,
        folder: "archive",
        tag: "archive",
    },
}

export function defaultSettings(): Settings {
    const settings = {} as Settings
    Object.assign(settings, DEFAULT_SETTINGS)
    Object.assign(settings.templates, DEFAULT_SETTINGS.templates)
    Object.assign(settings.pack, DEFAULT_SETTINGS.pack)
    Object.assign(settings.heading, DEFAULT_SETTINGS.heading)
    Object.assign(settings.heading.exclude, DEFAULT_SETTINGS.heading.exclude)
    Object.assign(settings.aliases, DEFAULT_SETTINGS.aliases)
    Object.assign(settings.aliases.exclude, DEFAULT_SETTINGS.aliases.exclude)
    Object.assign(settings.assets, DEFAULT_SETTINGS.assets)
    Object.assign(settings.archive, DEFAULT_SETTINGS.archive)
    return settings
}

function normalizeOrDefault(custom: string, defaults: string): string {
    if (!custom) {
        return defaults
    } else {
        return normalizePath(custom)
    }
}

// TODO: support for undefined settings
export function normalize(settings: Settings): Settings {
    settings.folder = normalizeOrDefault(
        settings.folder,
        DEFAULT_SETTINGS.folder,
    )

    settings.templates.folder = normalizeOrDefault(
        settings.templates.folder,
        DEFAULT_SETTINGS.templates.folder,
    )

    settings.pack.folder = normalizeOrDefault(
        settings.pack.folder,
        DEFAULT_SETTINGS.pack.folder,
    )

    settings.assets.folder = normalizeOrDefault(
        settings.assets.folder,
        DEFAULT_SETTINGS.assets.folder,
    )

    settings.archive.folder = normalizeOrDefault(
        settings.archive.folder,
        DEFAULT_SETTINGS.archive.folder,
    )

    if (!settings.archive.tag) {
        settings.archive.tag = DEFAULT_SETTINGS.archive.tag
    }

    return settings
}
