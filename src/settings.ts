import { normalizePath } from "obsidian"

export interface Settings {
    version: number

    folder: string

    templatesDefault: string
    templatesFolder: string

    packFolder: string

    h1Enabled: boolean
    h1ExcludeProps: string[]

    aliasesEnabled: boolean
    aliasesExcludeProps: string[]

    assetsEnabled: boolean
    assetsFolder: string

    archiveEnabled: boolean
    archiveFolder: string
    archiveTag: string

    tagmeAdditionEnabled: boolean
    tagmeDeletionEnabled: boolean
    tagmeTag: string
}

export const DEFAULT_SETTINGS: Settings = {
    version: 0,

    folder: "store",

    templatesDefault: "",
    templatesFolder: "",

    packFolder: "pack",

    h1Enabled: true,
    h1ExcludeProps: ["excalidraw-plugin", "kanban-plugin"],

    aliasesEnabled: true,
    aliasesExcludeProps: ["excalidraw-plugin", "kanban-plugin"],

    assetsEnabled: true,
    assetsFolder: "assets",

    archiveEnabled: true,
    archiveFolder: "archive",
    archiveTag: "archive",

    tagmeAdditionEnabled: true,
    tagmeDeletionEnabled: true,
    tagmeTag: "tagme",
}

export function defaultSettings(): Settings {
    const settings = {} as Settings
    Object.assign(settings, DEFAULT_SETTINGS)
    return settings
}

function normalizeOrDefault(custom: string, defaults: string): string {
    if (!custom) {
        return defaults
    } else {
        return normalizePath(custom)
    }
}

// NOTE: https://obsidian.md/help/tags#Tag+format
// no emojis or other symbols, however
export const tagRegExp = /^[-_a-z0-9//]*[-_a-z][-_a-z0-9//]*$/i

// TODO: support for undefined settings
export function normalize(settings: Settings): Settings {
    settings.folder = normalizeOrDefault(
        settings.folder,
        DEFAULT_SETTINGS.folder,
    )

    settings.templatesFolder = normalizeOrDefault(
        settings.templatesFolder,
        DEFAULT_SETTINGS.templatesFolder,
    )

    settings.packFolder = normalizeOrDefault(
        settings.packFolder,
        DEFAULT_SETTINGS.packFolder,
    )

    settings.assetsFolder = normalizeOrDefault(
        settings.assetsFolder,
        DEFAULT_SETTINGS.assetsFolder,
    )

    settings.archiveFolder = normalizeOrDefault(
        settings.archiveFolder,
        DEFAULT_SETTINGS.archiveFolder,
    )

    if (!settings.archiveTag || !tagRegExp.test(settings.archiveTag)) {
        settings.archiveTag = DEFAULT_SETTINGS.archiveTag
    }

    if (!settings.tagmeTag || !tagRegExp.test(settings.tagmeTag)) {
        settings.tagmeTag = DEFAULT_SETTINGS.tagmeTag
    }

    return settings
}
