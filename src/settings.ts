import { normalizePath } from "obsidian"

export interface Settings {
    version: number

    folders: {
        notes: string
        assets: string
        archive: string
        pack: string
    }

    notes: {
        template: string
        templates: string
        heading: boolean
        aliases: boolean
    }

    assets: {
        enable: boolean
    }

    archive: {
        enable: boolean
        tag: string
    }
}

export const DEFAULT_SETTINGS: Settings = {
    version: 0,

    folders: {
        notes: "notes",
        assets: "assets",
        archive: "archive",
        pack: "pack",
    },

    notes: {
        template: "",
        templates: "",
        heading: true,
        aliases: true,
    },

    assets: {
        enable: true,
    },

    archive: {
        enable: true,
        tag: "archive",
    },
}

export function defaultSettings() {
    const settings = {} as Settings
    Object.assign(settings, DEFAULT_SETTINGS)
    Object.assign(settings.folders, DEFAULT_SETTINGS.folders)
    Object.assign(settings.notes, DEFAULT_SETTINGS.notes)
    Object.assign(settings.assets, DEFAULT_SETTINGS.assets)
    Object.assign(settings.archive, DEFAULT_SETTINGS.archive)
    return settings
}

function normalizeOrDefault(custom: string, defaults: string) {
    if (!custom) {
        return defaults
    } else {
        return normalizePath(custom)
    }
}

// TODO: support for undefined settings
export function normalize(settings: Settings) {
    settings.folders.notes = normalizeOrDefault(
        settings.folders.notes,
        DEFAULT_SETTINGS.folders.notes,
    )

    settings.folders.assets = normalizeOrDefault(
        settings.folders.assets,
        DEFAULT_SETTINGS.folders.assets,
    )

    settings.folders.archive = normalizeOrDefault(
        settings.folders.archive,
        DEFAULT_SETTINGS.folders.archive,
    )

    settings.folders.pack = normalizeOrDefault(
        settings.folders.pack,
        DEFAULT_SETTINGS.folders.pack,
    )

    settings.notes.template = normalizeOrDefault(
        settings.notes.template,
        DEFAULT_SETTINGS.notes.template,
    )

    settings.notes.templates = normalizeOrDefault(
        settings.notes.templates,
        DEFAULT_SETTINGS.notes.templates,
    )

    if (!settings.archive.tag) {
        settings.archive.tag = DEFAULT_SETTINGS.archive.tag
    }

    return settings
}
