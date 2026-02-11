import { normalizePath } from "obsidian"

export interface Settings {
    version: number
    folder: string
    template: string
    pack: string

    archive: {
        folder: string
        tag: string
    }
}

const DEFAULT_SETTINGS: Settings = {
    version: 0,
    folder: "store",
    template: "",
    pack: "pack",

    archive: {
        folder: "archive",
        tag: "archive",
    },
}

export function defaultSettings() {
    const settings = {} as Settings
    Object.assign(settings, DEFAULT_SETTINGS)
    Object.assign(settings.archive, DEFAULT_SETTINGS.archive)
    return settings
}

// TODO: support for undefined settings
export function normalize(settings: Settings) {
    if (!settings.folder) {
        settings.folder = DEFAULT_SETTINGS.folder
    } else {
        settings.folder = normalizePath(settings.folder)
    }

    if (!settings.template) {
        settings.template = DEFAULT_SETTINGS.template
    } else {
        settings.template = normalizePath(settings.template)
    }

    if (!settings.pack) {
        settings.pack = DEFAULT_SETTINGS.pack
    } else {
        settings.pack = normalizePath(settings.pack)
    }

    if (!settings.archive.folder) {
        settings.archive.folder = DEFAULT_SETTINGS.archive.folder
    } else {
        settings.archive.folder = normalizePath(settings.archive.folder)
    }

    if (!settings.archive.tag) {
        settings.archive.tag = DEFAULT_SETTINGS.archive.tag
    }

    return settings
}
